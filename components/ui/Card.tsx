import { clsx } from "clsx";

const cardBase = "surface-card p-6";

export function Card({
  children,
  className,
  ...rest
}: React.ComponentProps<"div">) {
  return (
    <div className={clsx(cardBase, className)} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
  ...rest
}: React.ComponentProps<"h2">) {
  return (
    <h2
      className={clsx("portal-section-title text-lg md:text-xl", className)}
      {...rest}
    >
      {children}
    </h2>
  );
}

export function CardDescription({
  children,
  className,
  ...rest
}: React.ComponentProps<"p">) {
  return (
    <p
      className={clsx("mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]", className)}
      {...rest}
    >
      {children}
    </p>
  );
}
