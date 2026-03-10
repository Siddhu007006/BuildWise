import { Card } from '@/components/ui/card';
import { Users, Hammer, Wrench, HardHat, Shield } from 'lucide-react';

interface WorkersSectionProps {
  workers: {
    masons: number;
    helpers: number;
    steelWorkers: number;
    carpenters: number;
    supervisors: number;
    totalWorkers: number;
    estimatedLabourCost: number;
  };
}

export function WorkersSection({ workers }: WorkersSectionProps) {
  const workerTypes = [
    { icon: Hammer, name: 'Masons', count: workers.masons },
    { icon: Users, name: 'Helpers', count: workers.helpers },
    { icon: Wrench, name: 'Steel Workers', count: workers.steelWorkers },
    { icon: HardHat, name: 'Carpenters', count: workers.carpenters },
    { icon: Shield, name: 'Supervisors', count: workers.supervisors },
  ];

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">Workers & Labor</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {workerTypes.map(({ icon: Icon, name, count }) => (
          <Card key={name} className="p-6 flex flex-col items-center text-center">
            <Icon className="w-8 h-8 text-primary mb-3" />
            <p className="text-2xl font-bold mb-1">{count}</p>
            <p className="text-sm text-muted-foreground">{name}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Total Workers</p>
          <p className="text-3xl font-bold">{workers.totalWorkers}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-2">Estimated Labour Cost</p>
          <p className="text-3xl font-bold text-primary">₹{workers.estimatedLabourCost.toLocaleString()}</p>
        </div>
      </Card>
    </section>
  );
}
