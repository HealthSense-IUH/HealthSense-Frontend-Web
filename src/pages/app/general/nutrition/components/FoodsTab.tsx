import { Link } from "react-router-dom"
import {
  Apple,
  ArrowRight,
  Beef,
  Carrot,
  Coffee,
  Database,
  Fish,
  Milk,
  Nut,
  Sparkles,
  Wine,
} from "lucide-react"

import { FoodSearchBar } from "./FoodSearchBar"
import { ReferenceFoodBrowser } from "./ReferenceFoodBrowser"
import { getFoodsByCategoryId, mockCategories } from "@/data/mock-nutrition"
import type { FoodCategory } from "@/types/nutrition"

const categoryIcons: Record<string, React.ReactNode> = {
  dairy: <Milk className="w-5 h-5 text-primary-500" />,
  "fish-seafood": <Fish className="w-5 h-5 text-primary-600" />,
  vegetables: <Carrot className="w-5 h-5 text-success-600" />,
  fruits: <Apple className="w-5 h-5 text-warning-500" />,
  "legumes-nuts": <Nut className="w-5 h-5 text-warning-700" />,
  "beverages-caution": <Coffee className="w-5 h-5 text-warning-600" />,
  "beverages-alcohol": <Wine className="w-5 h-5 text-primary-600" />,
  "processed-foods": <Beef className="w-5 h-5 text-danger-600" />,
}

/** Combines the restored curated guidance catalogue with the new API-backed reference database. */
export function FoodsTab() {
  return (
    <div className="space-y-8">
      <div className="max-w-xl">
        <FoodSearchBar />
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Khám phá theo nhóm thực phẩm
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Duyệt danh mục lớn, chọn nhóm thực phẩm và xem chi tiết từng biến thể cùng khuyến nghị.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockCategories.map((category: FoodCategory) => {
            const count = getFoodsByCategoryId(category.id).length
            return (
              <Link
                key={category.id}
                to={`/app/general/nutrition/category/${category.id}`}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-slate-100 group-hover:bg-primary/10 transition-colors">
                      {categoryIcons[category.slug] || <Sparkles className="w-5 h-5 text-primary" />}
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                      {count} món ăn
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-primary transition-colors text-base">
                      {category.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-primary font-medium">
                  <span>Khám phá các loại</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="space-y-4 border-t border-border pt-8">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Cơ sở dữ liệu dinh dưỡng
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-relaxed">
              Tra cứu dữ liệu thực phẩm Việt Nam và USDA FNDDS từ API mới.
            </p>
          </div>
        </div>

        <ReferenceFoodBrowser />
      </section>
    </div>
  )
}
