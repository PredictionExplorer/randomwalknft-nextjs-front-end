import { cn } from "@/lib/utils";

type HeadingPart = {
  text: string;
  tone?: "default" | "primary" | "secondary";
};

const toneClasses: Record<NonNullable<HeadingPart["tone"]>, string> = {
  default: "text-foreground",
  primary: "text-primary",
  secondary: "text-secondary"
};

export function PageHeading({
  eyebrow,
  title,
  description,
  align = "left",
  as: Tag = "h1"
}: {
  eyebrow?: string;
  title: HeadingPart[];
  description?: string;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div className={cn("space-y-4", align === "center" && "text-center")}>
      {eyebrow ? (
        <p className={cn("text-xs uppercase tracking-[0.32em] text-secondary/80", align === "center" && "mx-auto")}>
          {eyebrow}
        </p>
      ) : null}
      <Tag className="flex flex-wrap gap-x-3 gap-y-1 text-3xl font-semibold tracking-[0.12em] sm:text-4xl">
        {title.map((part) => (
          <span key={`${part.text}-${part.tone ?? "default"}`} className={toneClasses[part.tone ?? "default"]}>
            {part.text}
          </span>
        ))}
      </Tag>
      {description ? (
        <p className={cn("max-w-3xl text-base leading-7 text-muted-foreground", align === "center" && "mx-auto")}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
