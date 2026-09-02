import { cn } from "@/lib/utils";

type HeadingPart = {
  text: string;
  /** `accent` is the brass reserved for the Vault/game; `muted` recedes. */
  tone?: "default" | "primary" | "secondary" | "accent" | "muted";
};

const toneClasses: Record<NonNullable<HeadingPart["tone"]>, string> = {
  default: "text-foreground",
  primary: "text-foreground",
  secondary: "text-secondary",
  accent: "text-accent",
  muted: "text-muted-foreground"
};

/**
 * Museum wall text: a mono eyebrow, a serif display title, and a measured description.
 */
export function PageHeading({
  eyebrow,
  title,
  description,
  align = "left",
  as: Tag = "h1",
  size = "default"
}: {
  eyebrow?: string;
  title: HeadingPart[] | string;
  description?: string;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  size?: "default" | "large";
}) {
  const parts = typeof title === "string" ? [{ text: title }] : title;

  return (
    <div className={cn("space-y-4", align === "center" && "text-center")}>
      {eyebrow ? <p className={cn("eyebrow", align === "center" && "mx-auto")}>{eyebrow}</p> : null}
      <Tag
        className={cn(
          "font-display text-balance leading-[1.02]",
          size === "large" ? "text-5xl sm:text-6xl lg:text-7xl" : "text-4xl sm:text-5xl"
        )}
      >
        {parts.map((part, index) => (
          <span key={`${part.text}-${index}`} className={toneClasses[part.tone ?? "default"]}>
            {index > 0 ? " " : null}
            {part.text}
          </span>
        ))}
      </Tag>
      {description ? (
        <p
          className={cn(
            "max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8",
            align === "center" && "mx-auto"
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
