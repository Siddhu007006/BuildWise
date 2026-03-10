'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Room {
  name: string;
  width: number;
  depth: number;
  x: number;
  y: number;
  area?: number;
}

interface FloorPlan {
  floor: number;
  rooms: Room[];
}

interface BlueprintProps {
  floorPlans: FloorPlan[];
}

const COLOR_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/80', text: 'text-emerald-400' },
  sky: { bg: 'bg-sky-500/10', border: 'border-sky-500/80', text: 'text-sky-400' },
  violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/80', text: 'text-violet-400' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/80', text: 'text-amber-400' },
  rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/80', text: 'text-rose-400' },
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/80', text: 'text-cyan-400' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/80', text: 'text-orange-400' },
  indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/80', text: 'text-indigo-400' },
  slate: { bg: 'bg-slate-500/10', border: 'border-slate-500/80', text: 'text-slate-400' },
  yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/80', text: 'text-yellow-400' },
};

const ROOM_COLORS: Record<string, string> = {
  'master bedroom': 'emerald',
  'bedroom 2': 'sky',
  'bathroom': 'violet',
  'living room': 'amber',
  'kitchen': 'rose',
  'balcony': 'cyan',
  'dining room': 'orange',
  'study room': 'indigo',
  'store room': 'slate',
  'pooja room': 'yellow',
};

const FALLBACK_COLORS = ['emerald', 'sky', 'violet', 'amber', 'rose', 'cyan', 'orange', 'indigo'];

// Scale factor: 1ft = 12px for visual display mapping
const SCALE = 8;

export function BlueprintSection({ floorPlans }: BlueprintProps) {
  const [selectedFloor, setSelectedFloor] = useState(0);
  const currentFloor = floorPlans[selectedFloor];

  // Calculate the total bounding box needed to render the grid container correctly
  const { maxWidth, maxHeight } = useMemo(() => {
    let maxW = 0;
    let maxH = 0;
    currentFloor.rooms.forEach((room) => {
      maxW = Math.max(maxW, room.x + room.width);
      maxH = Math.max(maxH, room.y + room.depth);
    });
    // Add some padding to the bounding box
    return { maxWidth: maxW + 2, maxHeight: maxH + 2 };
  }, [currentFloor]);

  const getStyles = (roomName: string, index: number) => {
    const key = Object.keys(ROOM_COLORS).find(k => k === roomName.toLowerCase());
    const colorName = key ? ROOM_COLORS[key] : FALLBACK_COLORS[index % FALLBACK_COLORS.length];
    return COLOR_STYLES[colorName];
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Architectural Blueprint</h2>
        <div className="flex gap-2">
          {floorPlans.map((plan) => (
            <Button
              key={plan.floor}
              variant={selectedFloor === plan.floor - 1 ? 'default' : 'outline'}
              onClick={() => setSelectedFloor(plan.floor - 1)}
            >
              Floor {plan.floor}
            </Button>
          ))}
        </div>
      </div>

      <Card className="p-6 md:p-8 bg-secondary/30 overflow-x-auto">
        <div className="flex justify-center min-w-max">
          {/* Main Blueprint Grid Container */}
          <div
            className="relative border-4 border-foreground/20 bg-background/80 shadow-2xl rounded-sm overflow-hidden"
            style={{
              width: `${maxWidth * SCALE}px`,
              height: `${maxHeight * SCALE}px`,
              // Render a faint grid background where each square is SCALE x SCALE pixels
              backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
              backgroundSize: `${SCALE}px ${SCALE}px`
            }}
          >
            {/* 10x10 darker grid lines representing 10ft markers */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: `${SCALE * 5}px ${SCALE * 5}px`
              }}
            />

            {/* Render each room based on coordinates */}
            {currentFloor.rooms.map((room, index) => {
              const styles = getStyles(room.name, index);

              return (
                <div
                  key={room.name}
                  className={`absolute ${styles.bg} ${styles.border} border-2 flex flex-col items-center justify-center text-center transition-all duration-300 hover:z-10 hover:shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-sm group`}
                  style={{
                    left: `${room.x * SCALE}px`,
                    top: `${room.y * SCALE}px`,
                    width: `${room.width * SCALE}px`,
                    height: `${room.depth * SCALE}px`,
                  }}
                >
                  <div className="opacity-90 group-hover:opacity-100 transition-opacity p-2">
                    <p className={`font-bold text-[10px] md:text-sm tracking-widest uppercase shadow-black drop-shadow-md ${styles.text}`}>
                      {room.name}
                    </p>
                    <p className="text-[10px] md:text-xs text-muted-foreground/90 font-mono mt-0.5 shadow-black drop-shadow-md hidden md:block">
                      {room.width} ft × {room.depth} ft
                    </p>
                    <p className="text-[9px] md:text-[11px] text-muted-foreground/70 font-mono mt-0.5 shadow-black drop-shadow-md">
                      {room.area ?? Math.round(room.width * room.depth)} sqft
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 pt-4 border-t border-border/30 flex flex-wrap gap-4 justify-center">
          {currentFloor.rooms.map((room, index) => {
            const styles = getStyles(room.name, index);
            return (
              <div key={room.name} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-sm ${styles.bg} ${styles.border} border`} />
                <span className="text-xs text-muted-foreground uppercase">{room.name}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex justify-center text-xs text-muted-foreground font-mono">
          <span>SCALE: 1 Square = 1 ft</span>
        </div>
      </Card>
    </section>
  );
}
