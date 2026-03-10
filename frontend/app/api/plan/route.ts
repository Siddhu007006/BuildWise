import { NextRequest, NextResponse } from 'next/server';

const FLASK_BACKEND_URL = process.env.FLASK_BACKEND_URL || 'http://127.0.0.1:5000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      builtUpArea,
      numberOfFloors,
      constructionTimeline,
      dailyWorkerWage,
      costPerSqYard,
    } = body;

    // Convert frontend fields to Flask backend's expected format
    const flaskPayload = {
      built_up_area: builtUpArea,
      floors: numberOfFloors,
      days: constructionTimeline ? constructionTimeline * 30 : null,
      daily_wage: dailyWorkerWage || 500,
      cost_per_sq_yard: costPerSqYard || 1500,
    };

    // Call Flask backend
    const flaskResponse = await fetch(`${FLASK_BACKEND_URL}/api/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flaskPayload),
    });

    if (!flaskResponse.ok) {
      const errorData = await flaskResponse.json().catch(() => ({}));
      throw new Error(errorData.error || 'Flask backend returned an error');
    }

    const result = await flaskResponse.json();

    // Transform Flask response to match the dashboard's expected data shape
    const totalDays = result.timeline.days;
    const totalMonths = result.timeline.months;

    // Map blueprint data to floor plans format expected by dashboard
    const floorPlans = (result.blueprint || []).map((floor: any, index: number) => ({
      floor: index + 1,
      rooms: (floor.rooms || []).map((room: any) => ({
        name: room.name,
        width: Math.round(room.width),
        depth: Math.round(room.height),
        x: Math.round(room.x),
        y: Math.round(room.y),
        area: Math.round(room.area),
      })),
    }));

    // Map schedule to construction phases format
    const totalWeeks = result.timeline.weeks;
    const constructionSchedule = (result.weekly_plan || []).map((phase: any) => {
      const nextPhase = result.weekly_plan[result.weekly_plan.indexOf(phase) + 1];
      const phaseWeeks = nextPhase ? nextPhase.week - phase.week : Math.max(1, totalWeeks - phase.week + 1);
      return {
        name: phase.phase,
        weeks: Math.max(1, phaseWeeks),
      };
    });

    const planResult = {
      projectDetails: {
        builtUpArea,
        numberOfFloors: result.input.num_floors,
        areaPerFloor: Math.round((builtUpArea / result.input.num_floors) * 100) / 100,
        estimatedTimeline: totalMonths,
        estimatedBudget: Math.round(result.costs.total_cost),
      },
      workers: {
        masons: result.workers.masons,
        helpers: result.workers.helpers,
        steelWorkers: result.workers.steel_workers,
        carpenters: result.workers.carpenters,
        supervisors: result.workers.supervisors,
        totalWorkers: result.workers.total_workers,
        estimatedLabourCost: Math.round(result.costs.labor_cost),
      },
      costBreakdown: {
        materialCost: Math.round(result.costs.material_cost),
        labourCost: Math.round(result.costs.labor_cost),
        overheadCost: Math.round(result.costs.overhead),
        totalCost: Math.round(result.costs.total_cost),
      },
      materials: {
        cementBags: result.materials.cement_bags,
        steelTons: result.materials.steel_tons,
        sandUnits: result.materials.sand_tons,
        waterLiters: result.materials.water_liters,
      },
      constructionSchedule,
      floorPlans,
      assumptions: {
        daysPerMonth: 30,
        costPerSqYard: result.assumptions.cost_per_sq_yard,
        dailyWorkerWage: result.assumptions.daily_wage,
        overheadPercentage: result.assumptions.overhead_percentage,
      },
    };

    // Save to Supabase via Flask backend
    try {
      await fetch(`${FLASK_BACKEND_URL}/api/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plot_area: builtUpArea,
          floors: result.input.num_floors,
          timeline_months: totalMonths,
          worker_wage: result.assumptions.daily_wage,
          cost_per_sqyard: result.assumptions.cost_per_sq_yard,
          total_cost: Math.round(result.costs.total_cost),
          plan_data: planResult,
        }),
      });
    } catch (saveError) {
      console.error('Failed to save to Supabase (non-blocking):', saveError);
    }

    return NextResponse.json(planResult);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process plan' },
      { status: 500 }
    );
  }
}

