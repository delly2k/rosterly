import Link from "next/link";
import { clsx } from "clsx";

const base =
  "inline-flex items-center justify-center border-[3px] border-black font-semibold transition-all duration-75 ease-out brutal-press focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:disabled:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] will-change-transform";

const shadow =
  "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]";

const variants = {
  primary:
    "bg-[#1D4ED8] text-white " + shadow + " hover:bg-[#1e40af] active:bg-[#1e40af]",
  secondary:
    "bg-white text-black " + shadow + " hover:bg-gray-100 active:bg-gray-100",
  success:
    "bg-[#FDE047] text-black " + shadow + " hover:bg-[#facc15] active:bg-[#facc15]",
  urgency:
    "bg-[#F97316] text-black " + shadow + " hover:bg-[#ea580c] active:bg-[#ea580c]",
  ghost:
    "bg-transparent text-black border-black " + shadow + " hover:bg-gray-100 active:bg-gray-100",
  safety:
    "bg-[#dc2626] text-white " + shadow + " hover:bg-[#b91c1c] active:bg-[#b91c1c]",
};

const sizes = {
  sm: "h-12 px-4 text-sm min-h-[48px]",
  md: "h-12 px-6 text-sm min-h-[48px]",
  lg: "h-14 px-8 text-base min-h-[56px]",
};

type ButtonVariant = keyof typeof variants;
type ButtonSize = keyof typeof sizes;

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...rest
}: ButtonProps) {
  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      {...rest}
    />
  );
}

type ButtonLinkProps = React.ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      className={clsx(base, variants[variant], sizes[size], className)}
      {...rest}
    />
  );
}
