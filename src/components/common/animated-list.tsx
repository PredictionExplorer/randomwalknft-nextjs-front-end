"use client";

import { Children, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type AnimatedListProps = {
  children: React.ReactNode;
  className?: string;
  staggerMs?: number;
};

export function AnimatedList({ children, className, staggerMs = 60 }: AnimatedListProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {Children.map(children, (child, index) => (
        <div
          className={cn(
            "transition-all duration-500",
            visible
              ? "translate-y-0 opacity-100"
              : "translate-y-3 opacity-0"
          )}
          style={{
            transitionDelay: visible ? `${index * staggerMs}ms` : "0ms"
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
