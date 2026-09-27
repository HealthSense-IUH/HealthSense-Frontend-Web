import { Database, Info } from "lucide-react"

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
