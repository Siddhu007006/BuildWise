'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';

interface CostBreakdownProps {
  costBreakdown: {
    materialCost: number;
    labourCost: number;
    overheadCost: number;
    totalCost: number;
  };
}

export function CostBreakdownSection({ costBreakdown }: CostBreakdownProps) {
  const chartData = [
    { name: 'Material Cost', value: costBreakdown.materialCost },
    { name: 'Labour Cost', value: costBreakdown.labourCost },
    { name: 'Overhead Cost', value: costBreakdown.overheadCost },
  ];

  const COLORS = ['oklch(0.7 0.18 170)', 'oklch(0.65 0.15 150)', 'oklch(0.6 0.1 200)'];

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">Cost Breakdown</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <div className="space-y-4">
          {[
            { label: 'Material Cost', value: costBreakdown.materialCost },
            { label: 'Labour Cost', value: costBreakdown.labourCost },
            { label: 'Overhead Cost', value: costBreakdown.overheadCost },
          ].map((item, index) => (
            <div key={item.label} className="flex items-center justify-between p-4 rounded-lg bg-secondary">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                <span className="font-medium">{item.label}</span>
              </div>
              <span className="font-bold">₹{item.value.toLocaleString()}</span>
            </div>
          ))}

          <Card className="p-4 bg-primary/10 border-primary/20">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">Total Project Cost</span>
              <span className="text-2xl font-bold text-primary">₹{costBreakdown.totalCost.toLocaleString()}</span>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
