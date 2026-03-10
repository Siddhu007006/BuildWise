'use client';

import { useEffect, useState } from 'react';
import { Navigation } from '@/components/landing/navigation';
import { ProjectDetailsSection } from '@/components/dashboard/project-details';
import { WorkersSection } from '@/components/dashboard/workers-section';
import { CostBreakdownSection } from '@/components/dashboard/cost-breakdown';
import { MaterialsSection } from '@/components/dashboard/materials-section';
import { BlueprintSection } from '@/components/dashboard/blueprint-section';
import { TimelineSection } from '@/components/dashboard/timeline-section';
import { AssumptionsPanel } from '@/components/dashboard/assumptions-panel';
import { SavedProjectsSection } from '@/components/dashboard/saved-projects';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface PlanData {
  projectDetails: {
    builtUpArea: number;
    numberOfFloors: number;
    areaPerFloor: number;
    estimatedTimeline: number;
    estimatedBudget: number;
  };
  workers: {
    masons: number;
    helpers: number;
    steelWorkers: number;
    carpenters: number;
    supervisors: number;
    totalWorkers: number;
    estimatedLabourCost: number;
  };
  costBreakdown: {
    materialCost: number;
    labourCost: number;
    overheadCost: number;
    totalCost: number;
  };
  materials: {
    cementBags: number;
    steelTons: number;
    sandUnits: number;
    waterLiters: number;
  };
  constructionSchedule: Array<{
    name: string;
    weeks: number;
  }>;
  floorPlans: Array<{
    floor: number;
    rooms: Array<{
      name: string;
      width: number;
      depth: number;
      x: number;
      y: number;
      area?: number;
    }>;
  }>;
  assumptions: {
    daysPerMonth: number;
    costPerSqYard: number;
    dailyWorkerWage: number;
    overheadPercentage: number;
  };
}

export default function DashboardPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | number | null>(null);
  const [data, setData] = useState<PlanData | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    // Clear any leftover localStorage plan data so dashboard always shows the card list
    localStorage.removeItem('planResults');
  }, []);

  const handleSelectProject = async (projectId: string | number) => {
    setSelectedProjectId(projectId);
    setLoadingDetail(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.project?.plan_data) {
          setData(result.project.plan_data);
        } else {
          setData(null);
        }
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
      setData(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleBack = () => {
    setSelectedProjectId(null);
    setData(null);
    localStorage.removeItem('planResults');
  };

  // Detail View
  if (selectedProjectId !== null) {
    if (loadingDetail) {
      return (
        <>
          <Navigation />
          <main className="min-h-screen flex items-center justify-center">
            <Spinner className="h-12 w-12" />
          </main>
        </>
      );
    }

    if (!data) {
      return (
        <>
          <Navigation />
          <main className="min-h-screen bg-background pt-24 pb-20">
            <div className="max-w-6xl mx-auto px-6 lg:px-8">
              <Button
                variant="ghost"
                size="sm"
                className="mb-4 text-muted-foreground hover:text-foreground"
                onClick={handleBack}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Saved Projects
              </Button>
              <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">No plan data found for this project.</p>
              </div>
            </div>
          </main>
        </>
      );
    }

    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-background pt-24 pb-20">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="mb-12">
              <Button
                variant="ghost"
                size="sm"
                className="mb-4 text-muted-foreground hover:text-foreground"
                onClick={handleBack}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Saved Projects
              </Button>
              <h1 className="text-4xl font-bold mb-2">Construction Plan Results</h1>
              <p className="text-muted-foreground">
                Project #{String(selectedProjectId).slice(0, 8)} — AI-generated planning details
              </p>
            </div>

            <div className="space-y-12">
              <ProjectDetailsSection data={data.projectDetails} />
              <WorkersSection workers={data.workers} />
              <CostBreakdownSection costBreakdown={data.costBreakdown} />
              <MaterialsSection materials={data.materials} />
              <BlueprintSection floorPlans={data.floorPlans} />
              <TimelineSection schedule={data.constructionSchedule} />
              <AssumptionsPanel assumptions={data.assumptions} projectDetails={data.projectDetails} />
            </div>
          </div>
        </main>
      </>
    );
  }

  // Default: Saved Projects List
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Your saved construction plans</p>
          </div>

          <SavedProjectsSection onSelectProject={handleSelectProject} />
        </div>
      </main>
    </>
  );
}
