import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function StatCardSkeleton() {
  return (
    <Card
      className={cn(
        "glass-card rounded-3xl border-border/30 py-0 shadow-sm"
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-4 px-5 pt-5 pb-0">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-3 w-24 rounded-lg" />
          <Skeleton className="h-9 w-16 rounded-xl" />
        </div>
        <Skeleton className="size-11 shrink-0 rounded-2xl" />
      </CardHeader>
      <CardContent className="px-5 pt-2 pb-5">
        <Skeleton className="h-3 w-32 rounded-lg" />
      </CardContent>
    </Card>
  )
}
