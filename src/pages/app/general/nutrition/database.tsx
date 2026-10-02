import { Link } from "react-router-dom"
import { Database, Info } from "lucide-react"

import { Page, PageBody, PageFooter, PageHeader } from "@/components/layout/page"
import { ReferenceFoodBrowser } from "./components/ReferenceFoodBrowser"

/** Tra cứu toàn bộ dữ liệu dinh dưỡng tham chiếu. Từ khóa, nhóm và trang nằm trên URL để Back giữ được kết quả. */
export default function NutritionDatabasePage() {
  return (
    <Page>
      <PageHeader
        breadcrumbs={[{ label: "Dinh dưỡng", to: "/app/general/nutrition" }, { label: "Tra cứu toàn bộ dữ liệu" }]}
        icon={<Database className="w-5 h-5" />}
        eyebrow="Viện Dinh dưỡng 2007 · USDA FNDDS 2021-2023"
        title="Cơ sở dữ liệu dinh dưỡng"
        description="Tra cứu thành phần dinh dưỡng của gần 6.000 thực phẩm: 526 thực phẩm Việt Nam và 5.431 thực phẩm, món ăn USDA. Giá trị tính trên 100 g phần ăn được."
      />

      <PageBody>
        <ReferenceFoodBrowser />
      </PageBody>

      <PageFooter>
        <p className="flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
          <span>
            Nguồn: Viện Dinh dưỡng - Bộ Y tế (2007), Bảng thành phần thực phẩm Việt Nam, Nhà xuất bản Y học; và USDA
            FoodData Central, FNDDS 2021-2023. Đây là số liệu tham khảo; màu đánh giá theo đơn ăn uống bác sĩ kê (nếu có). Xem các
            khuyến nghị ở mục{" "}
            <Link to="/app/general/nutrition" className="text-primary font-medium hover:underline">
              Tra cứu thực phẩm
            </Link>
            .
          </span>
        </p>
      </PageFooter>
    </Page>
  )
}
