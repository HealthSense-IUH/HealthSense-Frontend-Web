import { Database } from "lucide-react"

import { FoodSearchBar } from "./FoodSearchBar"
import { ReferenceFoodBrowser } from "./ReferenceFoodBrowser"

/** Tab "Tra cứu thực phẩm": tìm nhanh thực phẩm có khuyến nghị + tra cứu toàn bộ dữ liệu USDA. */
export function FoodsTab() {
  return (
    <div className="space-y-6">
      <div className="max-w-xl">
        <FoodSearchBar />
      </div>

      {/* SECTION: TRA CỨU TOÀN BỘ CƠ SỞ DỮ LIỆU */}
      <section className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-foreground">
              Cơ sở dữ liệu dinh dưỡng
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-relaxed">
              526 thực phẩm Việt Nam (Bảng thành phần thực phẩm Việt Nam, Viện Dinh dưỡng 2007) và 5.431 thực phẩm,
              món ăn từ USDA FNDDS 2021-2023. Giá trị tính trên 100 g phần ăn được. Chỉ có số liệu, không kèm khuyến
              nghị tim mạch.
            </p>
          </div>
        </div>

        <ReferenceFoodBrowser />
      </section>
    </div>
  )
}
