import { ShimmerSkeleton } from "@/components/ui/shimmer-skeleton"

/** Full-page skeleton shown while route segments are loading. */
export function PageSkeleton({ variant = "dashboard" }: { variant?: "dashboard" | "list" | "grid" | "detail" }) {
  if (variant === "list") {
    return (
      <div className="mx-auto max-w-6xl space-y-5 px-3 py-4 md:px-6 md:py-6">
        <ShimmerSkeleton className="h-10 w-56" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ShimmerSkeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (variant === "grid") {
    return (
      <div className="mx-auto max-w-7xl space-y-5 px-3 py-4 md:px-6 md:py-6">
        <ShimmerSkeleton className="h-10 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ShimmerSkeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ShimmerSkeleton key={i} className="min-h-[13.5rem] rounded-3xl" />
          ))}
        </div>
      </div>
    )
  }

  if (variant === "detail") {
    return (
      <div className="mx-auto max-w-2xl space-y-5 px-3 py-4 md:px-6 md:py-6">
        <ShimmerSkeleton className="h-10 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ShimmerSkeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  // dashboard (default)
  return (
    <div className="mx-auto max-w-7xl space-y-5 px-3 py-4 md:px-6 md:py-6">
      <ShimmerSkeleton className="h-10 w-48" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ShimmerSkeleton key={i} className="h-28" />
        ))}
      </div>
      <ShimmerSkeleton className="h-64" />
      <div className="grid gap-4 lg:grid-cols-2">
        <ShimmerSkeleton className="h-52" />
        <ShimmerSkeleton className="h-52" />
      </div>
    </div>
  )
}
