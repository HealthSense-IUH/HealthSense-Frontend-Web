import { useSearchParams } from "react-router-dom"
import { Trans, useTranslation } from "react-i18next"
import { Camera, ClipboardList, Heart, Info, Search } from "lucide-react"

import { Page, PageBody, PageFooter, PageHeader } from "@/components/layout/page"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ComingSoonTab } from "./components/ComingSoonTab"
import { DietPrescriptionTab } from "./components/DietPrescriptionTab"
import { FoodsTab } from "./components/FoodsTab"
import { GuidanceFoodDialog } from "./components/GuidanceFoodDialog"
import { ReferenceFoodDialog } from "./components/ReferenceFoodDialog"

const NUTRITION_TABS = ["foods", "diet", "scan"] as const
type NutritionTab = (typeof NUTRITION_TABS)[number]

/** Trang dinh dưỡng (route duy nhất): tab qua ?tab, nhóm qua ?category, chi tiết món mở popup qua ?food / ?ref. */
export default function NutritionHomePage() {
  const { t } = useTranslation("nutrition")
  const comingSoonBadge = (
    <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-warning-100 text-warning-700 font-semibold">
      {t("common.comingSoon")}
    </span>
  )
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get("tab")
  const activeTab: NutritionTab = NUTRITION_TABS.includes(tabParam as NutritionTab)
    ? (tabParam as NutritionTab)
    : "foods"

  return (
    <Page>
      <PageHeader
        icon={<Heart className="w-5 h-5" />}
        title={t("home.title")}
        description={t("home.description")}
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
                <span>{t("home.tabs.foods")}</span>
              </TabsTrigger>
              <TabsTrigger value="diet" className="rounded-lg text-xs sm:text-sm font-semibold gap-1.5 px-3">
                <ClipboardList className="w-3.5 h-3.5" />
                <span>{t("home.tabs.diet")}</span>
              </TabsTrigger>
              <TabsTrigger value="scan" className="rounded-lg text-xs sm:text-sm font-semibold gap-1.5 px-3">
                <Camera className="w-3.5 h-3.5" />
                <span>{t("home.tabs.scan")}</span>
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
              title={t("home.scan.title")}
              description={t("home.scan.description")}
              highlights={[t("home.scan.highlights.recognize"), t("home.scan.highlights.portion"), t("home.scan.highlights.calculate")]}
              note={t("home.scan.note")}
            />
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
