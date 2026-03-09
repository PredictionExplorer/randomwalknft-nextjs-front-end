"use client";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      {children}
    </div>
  );
}
