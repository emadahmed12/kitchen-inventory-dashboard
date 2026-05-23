import { cn } from "@/lib/utils"

export function ShimmerSkeleton({
  className,
}: {
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-muted/60",
        className
      )}
    >
      <div className="shimmer absolute inset-0 -translate-x-full" />
    </div>
  )
}
