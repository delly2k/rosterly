import { clsx } from "clsx";

const cardBase =
  "rounded-[4px] border-[3px] border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]";

export function Card({
  children,
  className,
  ...rest
}: React.ComponentProps<"div">) {
  return (
    <div className={clsx(cardBase, "bg-white", className)} {...rest}>
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
      className={clsx("text-xl font-bold leading-tight text-black md:text-2xl", className)}
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
      className={clsx("mt-2 text-sm text-black/80 leading-relaxed", className)}
      {...rest}
    >
      {children}
    </p>
  );
}
