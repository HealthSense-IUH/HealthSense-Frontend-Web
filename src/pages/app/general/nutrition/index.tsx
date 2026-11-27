import { useSearchParams } from "react-router-dom"
import { Trans, useTranslation } from "react-i18next"
import { Camera, ClipboardList, Info, Search } from "lucide-react"

import { HsNutritionBowlIcon } from "@/components/icons/health-icons"
import { Page, PageBody, PageFooter, PageHeader } from "@/components/layout/page"
import { LifestyleStripBanner } from "@/components/illustrations/lifestyle"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DietPrescriptionTab } from "./components/DietPrescriptionTab"
import { FoodsTab } from "./components/FoodsTab"
import { GuidanceFoodDialog } from "./components/GuidanceFoodDialog"
import { ReferenceFoodDialog } from "./components/ReferenceFoodDialog"
import { ScanMealTab } from "./components/ScanMealTab"

const NUTRITION_TABS = ["foods", "diet", "scan"] as const
type NutritionTab = (typeof NUTRITION_TABS)[number]

/** Trang dinh dưỡng (route duy nhất): tab qua ?tab, nhóm qua ?category, chi tiết món mở popup qua ?food / ?ref. */
export default function NutritionHomePage() {
  const { t } = useTranslation("nutrition")
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get("tab")
  const activeTab: NutritionTab = NUTRITION_TABS.includes(tabParam as NutritionTab)
    ? (tabParam as NutritionTab)
    : "foods"

  return (
    <Page>
      <PageHeader
        icon={<HsNutritionBowlIcon className="w-5 h-5" />}
        title={t("home.title")}
        description={t("home.description")}
      />

      <PageBody>
        <LifestyleStripBanner
          art="familyMeal"
          tone="success"
          eyebrow={t("common:lifestyle.banners.nutrition.eyebrow")}
          title={t("common:lifestyle.banners.nutrition.title")}
          description={t("common:lifestyle.banners.nutrition.description")}
        />

        <Tabs
          value={activeTab}
          onValueChange={(val) => setSearchParams(val === "foods" ? {} : { tab: val })}
          className="space-y-6"
        >
          <div className="overflow-x-auto pb-1">
            <TabsList className="h-10 bg-muted/60 p-1 rounded-xl">
              <TabsTrigger value="foods" className="rounded-lg text-xs sm:text-sm font-semibold gap-1.5 px-3">
                <Search className="w-3.5 h-3.5" />
                <span>{t("home.tabs.foods")}</span>
              </TabsTrigger>
              <TabsTrigger value="diet" className="rounded-lg text-xs sm:text-sm font-semibold gap-1.5 px-3">
                <ClipboardList className="w-3.5 h-3.5" />
                <span>{t("home.tabs.diet")}</span>
              </TabsTrigger>
              <TabsTrigger value="scan" className="rounded-lg text-xs sm:text-sm font-semibold gap-1.5 px-3">
                <Camera className="w-3.5 h-3.5" />
                <span>{t("home.tabs.scan")}</span>
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
            <ScanMealTab />
          </TabsContent>
        </Tabs>
      </PageBody>

      <PageFooter>
        <p className="flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
          <span>
            <Trans t={t} i18nKey="home.disclaimer" components={{ strong: <strong className="text-slate-600" /> }} />
          </span>
        </p>
      </PageFooter>

      <GuidanceFoodDialog />
      <ReferenceFoodDialog />
    </Page>
  )
}
