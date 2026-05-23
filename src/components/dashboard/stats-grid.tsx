"use client"

import { AlertTriangle, Boxes, FolderOpen, Tags } from "lucide-react"

import { StatCard } from "@/components/dashboard/stat-card"

const stats = [
  {
    title: "إجمالي المنتجات",
    value: "١٢٤",
    hint: "كل العناصر المسجّلة في المخزون",
    icon: Boxes,
  },
  {
    title: "المنتجات المفتوحة",
    value: "١٨",
    hint: "قيد الاستخدام حالياً",
    icon: FolderOpen,
  },
  {
    title: "المنتجات الناقصة",
    value: "٩",
    hint: "تحتاج إعادة تموين قريباً",
    icon: AlertTriangle,
  },
  {
    title: "الفئات",
    value: "١٤",
    hint: "تنظيم وتصنيف المخزون",
    icon: Tags,
  },
] as const

export function StatsGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard key={stat.title} {...stat} index={index} />
      ))}
    </div>
  )
}
