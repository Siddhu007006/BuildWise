'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Navigation } from '@/components/landing/navigation';
import { Spinner } from '@/components/ui/spinner';

export default function PlannerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    plotArea: '',
    floors: '',
    timeline: '',
    workerWage: '',
    costPerSqYard: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          builtUpArea: parseFloat(formData.plotArea),
          numberOfFloors: parseInt(formData.floors),
          constructionTimeline: parseInt(formData.timeline),
          dailyWorkerWage: parseFloat(formData.workerWage),
          costPerSqYard: parseFloat(formData.costPerSqYard),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        localStorage.setItem('planResults', JSON.stringify(result));
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error submitting plan:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-32 pb-20">
        <div className="max-w-md mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-3">Construction Planner</h1>
            <p className="text-muted-foreground">Enter your project details to get an AI-powered construction plan</p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Built-up Area (sq yards)</label>
                <Input
                  type="number"
                  name="plotArea"
                  placeholder="e.g., 5000"
                  value={formData.plotArea}
                  onChange={handleChange}
                  required
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Number of Floors</label>
                <Input
                  type="number"
                  name="floors"
                  placeholder="e.g., 3"
                  value={formData.floors}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Construction Timeline (months)</label>
                <Input
                  type="number"
                  name="timeline"
                  placeholder="e.g., 12"
                  value={formData.timeline}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Daily Worker Wage (₹)</label>
                <Input
                  type="number"
                  name="workerWage"
                  placeholder="e.g., 500"
                  value={formData.workerWage}
                  onChange={handleChange}
                  required
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cost Per Sq Yard (₹)</label>
                <Input
                  type="number"
                  name="costPerSqYard"
                  placeholder="e.g., 1500"
                  value={formData.costPerSqYard}
                  onChange={handleChange}
                  required
                  step="0.01"
                />
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Calculating Project...
                  </>
                ) : (
                  'Calculate Project'
                )}
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </>
  );
}
