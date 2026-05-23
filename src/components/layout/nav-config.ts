import {
  BarChart3,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Warehouse,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  /** Translation key within the "nav" namespace */
  titleKey: "dashboard" | "inventory" | "shopping" | "storage" | "analytics" | "settings"
  href: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { titleKey: "dashboard", href: "/", icon: LayoutDashboard },
  { titleKey: "inventory", href: "/inventory", icon: Package },
  { titleKey: "shopping", href: "/shopping", icon: ShoppingCart },
  { titleKey: "storage", href: "/storage", icon: Warehouse },
  { titleKey: "analytics", href: "/analytics", icon: BarChart3 },
  { titleKey: "settings", href: "/settings", icon: Settings },
]
