import { Link } from "react-router-dom"
import { Database, Info } from "lucide-react"
import { Trans, useTranslation } from "react-i18next"

import { Page, PageBody, PageFooter, PageHeader } from "@/components/layout/page"
import { ReferenceFoodBrowser } from "./components/ReferenceFoodBrowser"

/** Tra cứu toàn bộ dữ liệu dinh dưỡng tham chiếu. Từ khóa, nhóm và trang nằm trên URL để Back giữ được kết quả. */
export default function NutritionDatabasePage() {
  const { t } = useTranslation("nutrition")
  return (
    <Page>
      <PageHeader
        breadcrumbs={[{ label: t("common.breadcrumbNutrition"), to: "/app/general/nutrition" }, { label: t("database.breadcrumb") }]}
        icon={<Database className="w-5 h-5" />}
        eyebrow={t("database.eyebrow")}
        title={t("database.title")}
        description={t("database.description")}
      />

      <PageBody>
        <ReferenceFoodBrowser />
      </PageBody>

      <PageFooter>
        <p className="flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
          <span>
            <Trans
              t={t}
              i18nKey="database.footer"
              components={{
                link: <Link to="/app/general/nutrition" className="text-primary font-medium hover:underline" />,
              }}
            />
          </span>
        </p>
      </PageFooter>
    </Page>
  )
}
