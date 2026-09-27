import { useSearchParams } from "react-router-dom"
import { Camera, Heart, Salad, Search } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ComingSoonTab } from "./components/ComingSoonTab"
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
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="relative rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 sm:p-8 border border-primary/10">
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
      </div>

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
              <Salad className="w-3.5 h-3.5" />
              <span>Chế độ ăn</span>
              {comingSoonBadge}
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
          <ComingSoonTab
            icon={Salad}
            title="Chế độ ăn cho tim mạch"
            description="Gợi ý mục tiêu dinh dưỡng và bữa ăn hằng ngày phù hợp với người có bệnh tim mạch và rung nhĩ."
            highlights={[
              "Mục tiêu năng lượng, natri và kali mỗi ngày",
              "Gợi ý bữa ăn từ các thực phẩm nên ưu tiên",
              "Lưu ý khi dùng thuốc, ví dụ vitamin K với thuốc chống đông warfarin",
            ]}
            note="Chế độ ăn cá nhân cần được bác sĩ điều trị xem xét trước khi áp dụng."
          />
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
    </div>
  )
}
