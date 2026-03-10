import { Card } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface TimelineSectionProps {
  schedule: Array<{
    name: string;
    weeks: number;
  }>;
}

export function TimelineSection({ schedule }: TimelineSectionProps) {
  const totalWeeks = schedule.reduce((sum, phase) => sum + phase.weeks, 0);

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">Construction Schedule</h2>

      <div className="space-y-4">
        {schedule.map((phase, index) => {
          const percentage = (phase.weeks / totalWeeks) * 100;

          return (
            <div key={phase.name}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="font-medium">{phase.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{phase.weeks} weeks</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <Card className="p-6 mt-6 bg-secondary/30">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Total Duration</p>
            <p className="text-2xl font-bold">{totalWeeks} weeks</p>
            <p className="text-xs text-muted-foreground mt-1">~{Math.round(totalWeeks / 4.3)} months</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Number of Phases</p>
            <p className="text-2xl font-bold">{schedule.length}</p>
          </div>
        </div>
      </Card>
    </section>
  );
}
