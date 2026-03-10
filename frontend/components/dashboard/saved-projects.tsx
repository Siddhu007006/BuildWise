'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Building2, Calendar, Layers, IndianRupee, Clock } from 'lucide-react';

const LOCAL_PROJECTS_KEY = 'buildwise_saved_projects';

interface SavedProject {
    id: string | number;
    plot_area: number;
    floors: number;
    timeline_months: number;
    total_cost: number;
    created_at: string;
    plan_data: any;
}

/** Save a project to localStorage */
export function saveProjectLocally(project: Omit<SavedProject, 'id' | 'created_at'> & { id?: string; created_at?: string }) {
    try {
        const existing = JSON.parse(localStorage.getItem(LOCAL_PROJECTS_KEY) || '[]');
        const newProject: SavedProject = {
            id: project.id || crypto.randomUUID(),
            plot_area: project.plot_area,
            floors: project.floors,
            timeline_months: project.timeline_months,
            total_cost: project.total_cost,
            created_at: project.created_at || new Date().toISOString(),
            plan_data: project.plan_data,
        };
        existing.unshift(newProject);
        localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(existing));
        return newProject;
    } catch (e) {
        console.error('Failed to save project locally:', e);
        return null;
    }
}

/** Get a single project from localStorage by ID */
export function getLocalProject(id: string | number): SavedProject | null {
    try {
        const existing: SavedProject[] = JSON.parse(localStorage.getItem(LOCAL_PROJECTS_KEY) || '[]');
        return existing.find(p => String(p.id) === String(id)) || null;
    } catch {
        return null;
    }
}

function ProjectCardSkeleton() {
    return (
        <Card className="p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-4" />
            <div className="space-y-3">
                <div className="h-3 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
            </div>
        </Card>
    );
}

interface SavedProjectsSectionProps {
    onSelectProject?: (id: string | number) => void;
}

export function SavedProjectsSection({ onSelectProject }: SavedProjectsSectionProps) {
    const router = useRouter();
    const [projects, setProjects] = useState<SavedProject[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await fetch('/api/projects');
            if (response.ok) {
                const data = await response.json();
                const apiProjects = data.projects || [];
                if (apiProjects.length > 0) {
                    setProjects(apiProjects);
                    setLoading(false);
                    return;
                }
            }
        } catch (error) {
            console.error('Error fetching projects from API:', error);
        }

        // Fallback: load from localStorage
        try {
            const local: SavedProject[] = JSON.parse(localStorage.getItem(LOCAL_PROJECTS_KEY) || '[]');
            setProjects(local);
        } catch {
            setProjects([]);
        }
        setLoading(false);
    };

    const formatCost = (cost: number | null | undefined) => {
        if (!cost) return '₹0';
        if (cost >= 10000000) return `₹${(cost / 10000000).toFixed(1)} Cr`;
        if (cost >= 100000) return `₹${(cost / 100000).toFixed(1)} L`;
        return `₹${cost.toLocaleString('en-IN')}`;
    };

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return 'Unknown';
        try {
            return new Date(dateStr).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return 'Unknown';
        }
    };

    if (loading) {
        return (
            <section>
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold">Saved Construction Plans</h2>
                    <p className="text-muted-foreground text-sm mt-1">Your previously generated project plans</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <ProjectCardSkeleton key={i} />
                    ))}
                </div>
            </section>
        );
    }

    if (projects.length === 0) {
        return (
            <section>
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold">Saved Construction Plans</h2>
                    <p className="text-muted-foreground text-sm mt-1">Your previously generated project plans</p>
                </div>
                <Card className="p-12 text-center">
                    <Building2 className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No saved plans yet</h3>
                    <p className="text-muted-foreground text-sm">
                        Generate a construction plan from the{' '}
                        <span
                            className="text-primary cursor-pointer hover:underline"
                            onClick={() => router.push('/planner')}
                        >
                            Planner page
                        </span>{' '}
                        to see it here.
                    </p>
                </Card>
            </section>
        );
    }

    return (
        <section>
            <div className="mb-6">
                <h2 className="text-2xl font-semibold">Saved Construction Plans</h2>
                <p className="text-muted-foreground text-sm mt-1">
                    {projects.length} project{projects.length !== 1 ? 's' : ''} saved
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                    <Card
                        key={project.id}
                        className="p-6 cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
                        onClick={() => onSelectProject ? onSelectProject(project.id) : router.push(`/projects/${project.id}`)}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-mono text-muted-foreground/60">
                                #{String(project.id).slice(0, 8)}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(project.created_at)}
                            </span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Building2 className="w-4 h-4 text-primary" />
                                <div>
                                    <p className="text-sm font-medium">{project.plot_area} sq yards</p>
                                    <p className="text-xs text-muted-foreground">Plot Area</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Layers className="w-4 h-4 text-primary" />
                                <div>
                                    <p className="text-sm font-medium">{project.floors} Floor{project.floors !== 1 ? 's' : ''}</p>
                                    <p className="text-xs text-muted-foreground">Building Height</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-primary" />
                                <div>
                                    <p className="text-sm font-medium">{project.timeline_months} Months</p>
                                    <p className="text-xs text-muted-foreground">Timeline</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <IndianRupee className="w-4 h-4 text-primary" />
                                <div>
                                    <p className="text-sm font-medium">{formatCost(project.total_cost)}</p>
                                    <p className="text-xs text-muted-foreground">Estimated Cost</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-border">
                            <p className="text-xs text-primary font-medium">View Full Plan →</p>
                        </div>
                    </Card>
                ))}
            </div>
        </section>
    );
}
