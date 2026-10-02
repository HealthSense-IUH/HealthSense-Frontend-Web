import { Link } from "react-router-dom"
import { ArrowRight, RefreshCw } from "lucide-react"

import { PageSection } from "@/components/layout/page"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { FoodSearchBar } from "./FoodSearchBar"
import { FoodGroupIcon } from "../group-icons"
import { useNutritionGroups } from "../hooks/use-nutrition"
import type { FoodGroup } from "@/types/nutrition"

const numberFormat = new Intl.NumberFormat("vi-VN")

/** Thẻ một nhóm thực phẩm (dữ liệu thật từ /api/nutrition/groups); bấm vào để xem các loại trong nhóm. */
function FoodGroupCard({ group }: { group: FoodGroup }) {
  const guidanceCount = group.guidanceFoodCount ?? 0
  return (
    <Link
      to={`/app/general/nutrition/category/${encodeURIComponent(group.slug || group.id)}`}
      className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-primary-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="p-2.5 rounded-xl bg-slate-100 group-hover:bg-primary-50 transition-colors">
          <FoodGroupIcon icon={group.icon} />
        </div>
        <span className="text-[11px] font-medium text-muted-foreground bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100 whitespace-nowrap">
          {numberFormat.format(group.foodCount ?? 0)} thực phẩm
        </span>
      </div>

      <h3 className="mt-4 text-base font-semibold text-foreground group-hover:text-primary transition-colors">
        {group.name}
      </h3>
      <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
        {group.description ||
          (guidanceCount > 0 ? `${guidanceCount} món có khuyến nghị cho tim mạch.` : "Tra cứu số liệu dinh dưỡng của nhóm.")}
      </p>

      <div className="mt-auto pt-4">
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-primary">
          <span>{guidanceCount > 0 ? `Khám phá các loại · ${guidanceCount} có khuyến nghị` : "Khám phá các loại"}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  )
}

function FoodGroupGrid() {
  const { data: groups = [], isLoading, isError, refetch } = useNutritionGroups()

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">Không tải được danh sách nhóm thực phẩm.</p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          <RefreshCw /> Thử lại
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {isLoading
        ? Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)
        : groups.map((group) => <FoodGroupCard key={group.id} group={group} />)}
    </div>
  )
}

/** Tab "Tra cứu thực phẩm": tìm nhanh và duyệt theo nhóm thực phẩm (mỗi nhóm có danh sách đầy đủ ở trang nhóm). */
export function FoodsTab() {
  return (
    <div className="space-y-6">
      <FoodSearchBar />

      <PageSection
        title="Khám phá theo nhóm thực phẩm"
        description="Chọn một nhóm để xem các loại thực phẩm, biến thể và khuyến nghị cho tim mạch."
      >
        <FoodGroupGrid />
      </PageSection>
    </div>
  )
}
