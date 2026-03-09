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
  title,
  description,
  align = "left"
}: {
  title: HeadingPart[];
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("space-y-4", align === "center" && "text-center")}>
      <h1 className="flex flex-wrap gap-x-3 gap-y-1 text-3xl font-semibold tracking-[0.12em] sm:text-4xl">
        {title.map((part) => (
          <span key={`${part.text}-${part.tone ?? "default"}`} className={toneClasses[part.tone ?? "default"]}>
            {part.text}
          </span>
        ))}
      </h1>
      {description ? (
        <p className={cn("max-w-3xl text-base leading-7 text-muted-foreground", align === "center" && "mx-auto")}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
