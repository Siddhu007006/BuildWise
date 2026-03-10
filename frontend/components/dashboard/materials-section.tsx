import { Card } from '@/components/ui/card';
import { Package, Box, Droplet, Zap } from 'lucide-react';

interface MaterialsSectionProps {
  materials: {
    cementBags: number;
    steelTons: number;
    sandUnits: number;
    waterLiters: number;
  };
}

export function MaterialsSection({ materials }: MaterialsSectionProps) {
  const materialItems = [
    { icon: Box, name: 'Cement Bags', quantity: materials.cementBags, unit: 'bags' },
    { icon: Zap, name: 'Steel', quantity: materials.steelTons, unit: 'tons' },
    { icon: Package, name: 'Sand', quantity: materials.sandUnits, unit: 'units' },
    { icon: Droplet, name: 'Water', quantity: materials.waterLiters, unit: 'liters' },
  ];

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">Materials Required</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {materialItems.map(({ icon: Icon, name, quantity, unit }) => (
          <Card key={name} className="p-6">
            <Icon className="w-8 h-8 text-primary mb-3" />
            <p className="text-sm text-muted-foreground mb-2">{name}</p>
            <p className="text-3xl font-bold mb-1">{quantity.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{unit}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
