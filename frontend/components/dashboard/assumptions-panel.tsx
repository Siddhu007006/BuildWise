'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';

interface AssumptionsPanelProps {
  assumptions: {
    daysPerMonth: number;
    costPerSqYard: number;
    dailyWorkerWage: number;
    overheadPercentage: number;
  };
  projectDetails: {
    builtUpArea: number;
    numberOfFloors: number;
    areaPerFloor: number;
    estimatedTimeline: number;
    estimatedBudget: number;
  };
}

export function AssumptionsPanel({ assumptions, projectDetails }: AssumptionsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section>
      <Card
        className="p-6 cursor-pointer hover:bg-secondary/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Assumptions & Input Parameters</h2>
          <ChevronDown
            className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''
              }`}
          />
        </div>

        {isOpen && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-4 text-primary">Input Parameters</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Daily Worker Wage</p>
                  <p className="text-lg font-semibold">₹{assumptions.dailyWorkerWage.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cost Per Sq Yard</p>
                  <p className="text-lg font-semibold">₹{assumptions.costPerSqYard.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Days Per Month</p>
                  <p className="text-lg font-semibold">{assumptions.daysPerMonth}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overhead Percentage</p>
                  <p className="text-lg font-semibold">{assumptions.overheadPercentage}%</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-primary">Project Assumptions</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Built-up Area</p>
                  <p className="text-lg font-semibold">{projectDetails.builtUpArea.toLocaleString()} sq yards</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Number of Floors</p>
                  <p className="text-lg font-semibold">{projectDetails.numberOfFloors}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Construction Timeline</p>
                  <p className="text-lg font-semibold">{projectDetails.estimatedTimeline} months</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Area Per Floor</p>
                  <p className="text-lg font-semibold">{projectDetails.areaPerFloor.toLocaleString()} sq yards</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </section>
  );
}
