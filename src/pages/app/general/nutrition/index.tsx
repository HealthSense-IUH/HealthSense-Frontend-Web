import { Link } from "react-router-dom"
import {
  Apple,
  ArrowRight,
  Beef,
  Carrot,
  Coffee,
  Fish,
  Heart,
  Info,
  Milk,
  Nut,
  Sparkles,
  Wine,
} from "lucide-react"

import { FoodSearchBar } from "./components/FoodSearchBar"
import {
  mockCategories,
  getFoodsByCategoryId,
} from "@/data/mock-nutrition"
import type { FoodCategory } from "@/types/nutrition"

export default function NutritionHomePage() {
  const categoryIcons: Record<string, React.ReactNode> = {
    dairy: <Milk className="w-5 h-5 text-sky-500" />,
    "fish-seafood": <Fish className="w-5 h-5 text-cyan-600" />,
    vegetables: <Carrot className="w-5 h-5 text-emerald-600" />,
    fruits: <Apple className="w-5 h-5 text-amber-500" />,
    "legumes-nuts": <Nut className="w-5 h-5 text-amber-700" />,
    "beverages-caution": <Coffee className="w-5 h-5 text-orange-600" />,
    "beverages-alcohol": <Wine className="w-5 h-5 text-purple-600" />,
    "processed-foods": <Beef className="w-5 h-5 text-rose-600" />,
  }

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto px-1 sm:px-2">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 sm:p-8 border border-primary/10">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <Heart className="w-3.5 h-3.5 fill-primary text-primary" />
            <span>Chế độ ăn & Tim mạch</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-foreground">
            Ăn uống & Dinh dưỡng
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Gợi ý lựa chọn thực phẩm hỗ trợ sức khỏe tim mạch và người có triệu chứng rung nhĩ (AF).
            Thông tin mang tính định hướng thói quen lành mạnh, không thay thế chỉ định y khoa.
          </p>
        </div>

        {/* Prominent Search Bar */}
        <div className="mt-6 max-w-xl">
          <FoodSearchBar />
        </div>
      </div>

      {/* SECTION: KHÁM PHÁ THEO NHÓM THỰC PHẨM (BROWSE BY CATEGORY) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-foreground">
            Khám phá theo nhóm thực phẩm
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Duyệt danh mục lớn, chọn nhóm thực phẩm (food name) và xem chi tiết từng loại biến thể (food name specific).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockCategories.map((cat: FoodCategory) => {
            const count = getFoodsByCategoryId(cat.id).length
            return (
              <Link
                key={cat.id}
                to={`/app/general/nutrition/category/${cat.id}`}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-primary/50 hover:shadow-md dark:border-border dark:bg-card"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-slate-100 group-hover:bg-primary/10 transition-colors dark:bg-muted">
                      {categoryIcons[cat.id] || <Sparkles className="w-5 h-5 text-primary" />}
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground bg-slate-50 dark:bg-muted/40 px-2 py-0.5 rounded-md border border-slate-100 dark:border-muted">
                      {count} món ăn
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-foreground group-hover:text-primary transition-colors text-base">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-100 dark:border-border/60 flex items-center justify-between text-xs text-primary font-medium">
                  <span>Khám phá các loại</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Clinical Disclaimer Note */}
      <div className="rounded-2xl bg-slate-50 dark:bg-muted/30 p-4 border border-slate-200/70 dark:border-border flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Lưu ý y khoa:</strong> Các khuyến cáo dinh dưỡng trên HealthSense được tham khảo từ hướng dẫn lâm sàng của Hội Tim mạch Hoa Kỳ (ACC/AHA) và các tổng quan hệ thống y khoa. Không có thực phẩm nào tự chữa khỏi hoặc hoàn toàn ngăn ngừa rung nhĩ. Mọi thay đổi lớn về chế độ ăn hoặc sử dụng chất bổ sung cần có sự tư vấn của bác sĩ điều trị.
        </p>
      </div>
    </div>
  )
}
