'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/landing/navigation';
import { ProjectDetailsSection } from '@/components/dashboard/project-details';
import { WorkersSection } from '@/components/dashboard/workers-section';
import { CostBreakdownSection } from '@/components/dashboard/cost-breakdown';
import { MaterialsSection } from '@/components/dashboard/materials-section';
import { BlueprintSection } from '@/components/dashboard/blueprint-section';
import { TimelineSection } from '@/components/dashboard/timeline-section';
import { AssumptionsPanel } from '@/components/dashboard/assumptions-panel';
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
        }>;
    }>;
    assumptions: {
        daysPerMonth: number;
        costPerSqYard: number;
        dailyWorkerWage: number;
        overheadPercentage: number;
    };
}

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [data, setData] = useState<PlanData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (params.id) {
            fetchProject(params.id as string);
        }
    }, [params.id]);

    const fetchProject = async (id: string) => {
        try {
            const response = await fetch(`/api/projects/${id}`);
            if (!response.ok) throw new Error('Project not found');
            const result = await response.json();
            const project = result.project;

            // The plan_data field contains the full dashboard data
            if (project?.plan_data) {
                setData(project.plan_data);
            } else {
                throw new Error('No plan data found for this project');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load project');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navigation />
                <main className="min-h-screen flex items-center justify-center">
                    <Spinner className="h-12 w-12" />
                </main>
            </>
        );
    }

    if (error || !data) {
        return (
            <>
                <Navigation />
                <main className="min-h-screen flex flex-col items-center justify-center gap-4">
                    <p className="text-muted-foreground">{error || 'Project not found'}</p>
                    <Button variant="outline" onClick={() => router.push('/dashboard')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
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
                            onClick={() => router.push('/dashboard')}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                        <h1 className="text-4xl font-bold mb-2">Project Plan</h1>
                        <p className="text-muted-foreground">
                            Project #{(params.id as string)?.slice(0, 8)} — Saved construction plan details
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
