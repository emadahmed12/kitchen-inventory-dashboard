import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "مطبخي — إدارة المخزون",
    short_name: "مطبخي",
    description: "تطبيق ذكي لإدارة مخزون مطبخك. تتبع المنتجات وتنبيهات نفاد المخزون.",
    start_url: "/",
    id: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f9f8f5",
    theme_color: "#1e1c30",
    categories: ["productivity", "utilities"],
    lang: "ar",
    dir: "rtl",
    icons: [
      {
        src: "/icons/icon-96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "المخزون",
        short_name: "المخزون",
        url: "/inventory",
        description: "عرض وإدارة مخزون المطبخ",
        icons: [{ src: "/icons/icon-96.png", sizes: "96x96" }],
      },
      {
        name: "لوحة التحكم",
        short_name: "الرئيسية",
        url: "/",
        description: "لوحة تحكم مطبخي",
        icons: [{ src: "/icons/icon-96.png", sizes: "96x96" }],
      },
    ],
    screenshots: [],
  }
}
