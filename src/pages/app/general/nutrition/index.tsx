import { useSearchParams } from "react-router-dom"
import { Camera, ClipboardList, Heart, Info, Search } from "lucide-react"

import { Page, PageBody, PageFooter, PageHeader } from "@/components/layout/page"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ComingSoonTab } from "./components/ComingSoonTab"
import { DietPrescriptionTab } from "./components/DietPrescriptionTab"
import { FoodsTab } from "./components/FoodsTab"

const NUTRITION_TABS = ["foods", "diet", "scan"] as const
type NutritionTab = (typeof NUTRITION_TABS)[number]

const comingSoonBadge = (
  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-700 font-semibold dark:bg-amber-950/40 dark:text-amber-300">
    Sắp ra mắt
  </span>
)

export default function NutritionHomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get("tab")
  const activeTab: NutritionTab = NUTRITION_TABS.includes(tabParam as NutritionTab)
    ? (tabParam as NutritionTab)
    : "foods"

  return (
    <Page>
      <PageHeader
        icon={<Heart className="w-5 h-5" />}
        eyebrow="Chế độ ăn & Tim mạch"
        title="Ăn uống & Dinh dưỡng"
        description="Gợi ý lựa chọn thực phẩm hỗ trợ sức khỏe tim mạch và người có triệu chứng rung nhĩ (AF). Thông tin mang tính định hướng thói quen lành mạnh, không thay thế chỉ định y khoa."
      />

      <PageBody>
        <Tabs
          value={activeTab}
          onValueChange={(val) => setSearchParams(val === "foods" ? {} : { tab: val })}
          className="space-y-6"
        >
          <div className="overflow-x-auto pb-1">
            <TabsList className="h-10 bg-muted/60 p-1 rounded-xl">
              <TabsTrigger value="foods" className="rounded-lg text-xs sm:text-sm font-semibold gap-1.5 px-3">
                <Search className="w-3.5 h-3.5" />
                <span>Tra cứu thực phẩm</span>
              </TabsTrigger>
              <TabsTrigger value="diet" className="rounded-lg text-xs sm:text-sm font-semibold gap-1.5 px-3">
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Đơn ăn uống</span>
              </TabsTrigger>
              <TabsTrigger value="scan" className="rounded-lg text-xs sm:text-sm font-semibold gap-1.5 px-3">
                <Camera className="w-3.5 h-3.5" />
                <span>Ước tính calo</span>
                {comingSoonBadge}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="foods">
            <FoodsTab />
          </TabsContent>

          <TabsContent value="diet">
            <DietPrescriptionTab />
          </TabsContent>

          <TabsContent value="scan">
            <ComingSoonTab
              icon={Camera}
              title="Chụp ảnh món ăn, ước tính calo"
              description="Chụp ảnh bữa ăn và trả lời vài câu hỏi về khẩu phần, HealthSense sẽ ước tính năng lượng và các chất dinh dưỡng chính."
              highlights={[
                "Nhận diện món ăn từ ảnh",
                "Hỏi thêm khẩu phần và cách chế biến để ước tính sát hơn",
                "Tính calo, đạm, tinh bột và chất béo từ cơ sở dữ liệu dinh dưỡng",
              ]}
              note="Kết quả chỉ là ước tính, không thay thế việc cân đo thực phẩm hay tư vấn dinh dưỡng."
            />
          </TabsContent>
        </Tabs>
      </PageBody>

      <PageFooter>
        <p className="flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
          <span>
            <strong className="text-slate-600 dark:text-slate-300">Lưu ý y khoa:</strong> Các khuyến cáo dinh dưỡng
            trên HealthSense được tham khảo từ hướng dẫn lâm sàng của Hội Tim mạch Hoa Kỳ (ACC/AHA) và các tổng quan hệ
            thống y khoa. Không có thực phẩm nào tự chữa khỏi hoặc hoàn toàn ngăn ngừa rung nhĩ. Mọi thay đổi lớn về chế
            độ ăn hoặc sử dụng chất bổ sung cần có sự tư vấn của bác sĩ điều trị.
          </span>
        </p>
      </PageFooter>
    </Page>
  )
}
