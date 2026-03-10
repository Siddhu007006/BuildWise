import { Card } from '@/components/ui/card';

interface ProjectDetailsProps {
  data: {
    builtUpArea: number;
    numberOfFloors: number;
    areaPerFloor: number;
    estimatedTimeline: number;
    estimatedBudget: number;
  };
}

export function ProjectDetailsSection({ data }: ProjectDetailsProps) {
  const stats = [
    { label: 'Built-up Area', value: `${data.builtUpArea.toLocaleString()} sq yards` },
    { label: 'Number of Floors', value: data.numberOfFloors },
    { label: 'Area per Floor', value: `${data.areaPerFloor.toLocaleString()} sq yards` },
    { label: 'Estimated Timeline', value: `${data.estimatedTimeline} months` },
  ];

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">Project Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6">
            <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-primary/5 border-primary/20">
        <p className="text-sm text-muted-foreground mb-2">Estimated Total Budget</p>
        <p className="text-4xl font-bold text-primary">₹{data.estimatedBudget.toLocaleString()}</p>
      </Card>
    </section>
  );
}
