import { Link } from "react-router-dom"
import { ArrowLeft, ChevronRight, Database, Info } from "lucide-react"

import { ReferenceFoodBrowser } from "./components/ReferenceFoodBrowser"

/** Tra cứu toàn bộ dữ liệu dinh dưỡng USDA FNDDS. Từ khóa, nhóm và trang nằm trên URL để Back giữ được kết quả. */
export default function NutritionDatabasePage() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
        <Link to="/app/general/nutrition" className="hover:text-primary transition-colors flex items-center gap-1 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dinh dưỡng</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
        <span className="font-semibold text-slate-800 dark:text-foreground">Tra cứu toàn bộ dữ liệu</span>
      </nav>

      <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 sm:p-8 shadow-sm space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-medium">
          <Database className="w-3.5 h-3.5 text-primary" />
          <span>USDA FNDDS 2021-2023</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Cơ sở dữ liệu dinh dưỡng</h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
          Tra cứu thành phần dinh dưỡng của hơn 5.400 thực phẩm và món ăn. Giá trị tính trên 100 g; mở từng món để
          xem theo khẩu phần thường dùng.
        </p>
      </div>

      <ReferenceFoodBrowser />

      <div className="rounded-2xl bg-slate-50 dark:bg-muted/30 p-4 border border-slate-200/70 dark:border-border flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Dữ liệu từ USDA Food and Nutrient Database for Dietary Studies (FNDDS 2021-2023), là số liệu tham khảo của món
          ăn phổ biến tại Mỹ và không kèm khuyến nghị cho tim mạch. Xem các khuyến nghị ở mục{" "}
          <Link to="/app/general/nutrition" className="text-primary font-medium hover:underline">
            Tra cứu thực phẩm
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
