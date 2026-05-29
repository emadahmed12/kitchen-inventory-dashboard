import { InventoryPage } from "@/components/inventory/inventory-page"
import { resolveStatusParam } from "@/lib/inventory/filters"

type PageProps = {
  searchParams: Promise<{ status?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  const initialStatus = resolveStatusParam(params.status)
  return <InventoryPage initialStatus={initialStatus} />
}
