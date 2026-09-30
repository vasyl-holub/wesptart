import { cn } from "@/lib/cn";

/**
 * Кнопки за макетом: радіус 8, висота 48, текст 16/1.5 semibold.
 * Основна дія — суцільна синя, вторинна — контурна, що на ховері
 * заливається тим самим синім.
 */
export type ButtonVariant =
  "primary" | "outline" | "accent" | "ghost" | "subtle" | "inverse";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[8px] " +
  "font-semibold transition-colors " +
  "disabled:pointer-events-none disabled:opacity-50 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-blue-300 text-white hover:bg-blue-700",
  outline:
    "border border-blue-300 bg-white text-blue-300 hover:bg-blue-300 hover:text-white",
  /* Жовтий з макета — для дії «в один клік», щоб не змагалася з основною */
  accent: "bg-yellow-300 text-black-900 hover:opacity-90",
  ghost: "text-grey-700 hover:bg-grey-100 hover:text-black-900",
  subtle: "bg-blue-25 text-blue-300 hover:bg-blue-50 hover:text-blue-700",
  /* Для темних секцій: біла кнопка на синьому тлі */
  inverse: "bg-white text-blue-700 hover:opacity-90",
};

/* leading тримаємо тут, а не в base: tailwind-merge вважає, що text-*
   може задавати міжрядковий, і викидає попередній leading-* */
const sizes: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-[14px] leading-[1.5]",
  md: "h-12 px-5 text-[16px] leading-[1.5]",
  lg: "h-14 px-6 text-[16px] leading-[1.5]",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant,
  size,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      className={buttonClasses({ variant, size, className })}
      {...props}
    />
  );
}
