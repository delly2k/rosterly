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
  success: "bg-[#FDE047] text-black border-black",
  pending: "bg-[#F97316] text-black border-black",
  warning: "bg-[#F97316] text-black border-black",
  inactive: "bg-gray-200 text-black border-black",
  pink: "bg-[#EC4899] text-black border-black",
  teal: "bg-[#06B6D4] text-black border-black",
  lime: "bg-[#84CC16] text-black border-black",
};

export function Badge({
  children,
  variant = "inactive",
  className,
  ...rest
}: React.ComponentProps<"span"> & { variant?: BadgeVariant }) {
  return (
    <span
      className={clsx(
        "inline-flex border-[2px] px-2.5 py-1 text-xs font-bold rounded-[4px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        variantStyles[variant],
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
