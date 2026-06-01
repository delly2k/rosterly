import Link from "next/link";
import { clsx } from "clsx";

const base =
  "inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const variants = {
  primary: "btn-portal-primary",
  secondary: "btn-portal-secondary",
  success: "btn-portal-primary",
  urgency: "btn-portal-secondary",
  ghost: "btn-portal-secondary bg-transparent",
  safety: "btn-portal-danger",
};

const sizes = {
  sm: "min-h-[40px] px-4 text-sm",
  md: "min-h-[44px] px-6 text-sm",
  lg: "min-h-[48px] px-8 text-base",
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
