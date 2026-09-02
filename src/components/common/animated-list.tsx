import { Children } from "react";

type AnimatedListProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Items rise in as they scroll into view. Purely CSS (`.reveal` uses a scroll-driven
 * animation timeline), so it renders on the server, costs no JavaScript, and is
 * automatically disabled under `prefers-reduced-motion`.
 */
export function AnimatedList({ children, className }: AnimatedListProps) {
  return (
    <div className={className}>
      {Children.map(children, (child) => (
        <div className="reveal">{child}</div>
      ))}
    </div>
  );
}
