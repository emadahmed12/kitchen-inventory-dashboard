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
  title: string
  href: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { title: "نظرة عامة", href: "/", icon: LayoutDashboard },
  { title: "المخزون", href: "/inventory", icon: Package },
  { title: "قائمة التسوق", href: "/shopping", icon: ShoppingCart },
  { title: "أماكن التخزين", href: "/storage", icon: Warehouse },
  { title: "التحليلات", href: "/analytics", icon: BarChart3 },
  { title: "الإعدادات", href: "/settings", icon: Settings },
]
