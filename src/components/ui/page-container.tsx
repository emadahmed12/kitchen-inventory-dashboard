import { cn } from "@/lib/utils"

type PageContainerProps = {
  children: React.ReactNode
  className?: string
  size?: "default" | "wide" | "full"
}

const sizes = {
  default: "max-w-6xl",
  wide: "max-w-7xl",
  full: "max-w-[90rem]",
}

export function PageContainer({
  children,
  className,
  size = "default",
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-0",
        sizes[size],
        "pb-20 md:pb-8",
        className
      )}
    >
      {children}
    </div>
  )
}
