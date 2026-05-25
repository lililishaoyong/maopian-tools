import { clsx } from "clsx";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "neutral" | "brand" | "amber" | "danger";
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "neutral" && "bg-stone-100 text-stone-600",
        tone === "brand" && "bg-brand-50 text-brand-700",
        tone === "amber" && "bg-amber-50 text-amber-700",
        tone === "danger" && "bg-rose-50 text-rose-700"
      )}
    >
      {children}
    </span>
  );
}
