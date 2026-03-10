"use client";

import { useEffect, useRef, useState } from "react";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";

const steps = [
  {
    number: "01",
    title: "Enter Project Details",
    description: "Provide project specifications including plot area, number of floors, timeline, and budget parameters.",
    code: `const project = {
  area: 5000,
  floors: 3,
  timeline: 12,
  wage: 500
}`,
  },
  {
    number: "02",
    title: "AI Analysis",
    description: "Our Granite AI engine analyzes the data and generates estimations using advanced algorithms.",
    code: `const plan = await granite.analyze(
  projectData,
  { 
    model: 'construction-v1',
    precision: 'high'
  }
)`,
  },
  {
    number: "03",
    title: "Generate Plan",
    description: "Receive detailed construction plan with workforce, materials, timeline, and budget breakdown.",
    code: `const result = {
  workers: 45,
  materials: {...},
  schedule: {...},
  budget: 750000
}`,
  },
  {
    number: "04",
    title: "Execute & Monitor",
    description: "Use the dashboard to monitor project progress and adjust plans in real-time.",
    code: `dashboard.trackProgress(
  projectId,
  { tracking: true }
) // Live updates`,
  },
];

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-cycle through steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative py-32 overflow-hidden bg-secondary/30"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-20">
          <p className="text-sm font-mono text-primary mb-3">// WORKFLOW</p>
          <h2
            className={`text-3xl lg:text-5xl font-semibold tracking-tight mb-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            style={{ fontFamily: 'var(--font-geist-pixel-line), monospace' }}
          >
            <div className="flex flex-col">
              <TypewriterEffect
                words={["Four-step construction planning process."]}
                className="text-balance text-left inline-block"
                typingSpeed={50}
                pauseDuration={10000}
              />
            </div>
          </h2>
        </div>

        {/* Main content */}
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Steps list */}
          <div className="space-y-2">
            {steps.map((step, index) => (
              <button
                key={step.number}
                type="button"
                onClick={() => setActiveStep(index)}
                className={`w-full text-left p-6 rounded-xl border transition-all duration-300 ${activeStep === index
                  ? "bg-card border-primary/50 card-shadow"
                  : "bg-transparent border-transparent hover:bg-card/50"
                  }`}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`font-mono text-sm transition-colors ${activeStep === index ? "text-primary" : "text-muted-foreground"
                      }`}
                  >
                    {step.number}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
                    <p
                      className={`text-sm leading-relaxed transition-colors ${activeStep === index ? "text-muted-foreground" : "text-muted-foreground/60"
                        }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                {activeStep === index && (
                  <div className="mt-4 ml-8">
                    <div className="h-0.5 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full animate-[progress_4s_linear]"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Code display */}
          <div className="lg:sticky lg:top-32">
            <div className="rounded-xl overflow-hidden bg-card border border-border card-shadow">
              {/* Window chrome */}
              <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-secondary/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
                </div>
                <span className="text-xs font-mono text-muted-foreground">workflow.ts</span>
              </div>

              {/* Code content */}
              <div className="p-6 font-mono text-sm min-h-[200px]">
                <pre className="text-muted-foreground whitespace-pre-wrap break-words">
                  {steps[activeStep].code.split('\n').map((line, i) => (
                    <div
                      key={`${activeStep}-${i}`}
                      className="leading-relaxed animate-in fade-in slide-in-from-left-2"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <span className="text-muted-foreground/40 select-none w-6 inline-block">{i + 1}</span>
                      <span className="text-muted-foreground">{line}</span>
                    </div>
                  ))}
                </pre>
              </div>

              {/* Output */}
              <div className="border-t border-border p-4 bg-secondary/20 font-mono text-xs">
                <div className="flex items-center gap-2 text-green-500">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Ready
                </div>
              </div>
            </div>

            {/* ASCII decoration */}

          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}


