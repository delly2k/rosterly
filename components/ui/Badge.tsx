import { clsx } from "clsx";

export type BadgeVariant =
  | "success"
  | "pending"
  | "warning"
  | "inactive"
  | "pink"
  | "teal"
  | "lime";

const variantStyles: Record<BadgeVariant, string> = {
  success: "pill-green",
  pending: "pill-warning",
  warning: "pill-warning",
  inactive: "pill-gray",
  pink: "pill-gold",
  teal: "pill-green",
  lime: "pill-green",
};

export function Badge({
  children,
  variant = "inactive",
  className,
  ...rest
}: React.ComponentProps<"span"> & { variant?: BadgeVariant }) {
  return (
    <span className={clsx("inline-flex", variantStyles[variant], className)} {...rest}>
      {children}
    </span>
  );
}
