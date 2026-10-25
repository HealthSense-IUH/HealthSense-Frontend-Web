import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ArrowLeft, Home } from "lucide-react"

import { CaraMascot } from "@/components/assistant/cara-mascot"
import { NoResultsIllustration } from "@/components/illustrations"
import { Button } from "@/components/ui/button"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { getDefaultRouteForRole } from "@/constants"
import { useAuthStore } from "@/stores/auth-store"

/** Trang 404: minh hoạ, mã lỗi gradient, Cara nói đỡ một câu, nút về trang chủ / quay lại. */
export default function NotFoundPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const role = useAuthStore((state) => state.userSession?.role)
  const accessToken = useAuthStore((state) => state.accessToken)
  useDocumentTitle(t("notFound.title"))

  const homeTo = accessToken ? getDefaultRouteForRole(role) : "/"

  return (
    <div className="app-canvas relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-primary-200/50 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-danger-200/40 blur-3xl" aria-hidden="true" />

      <div className="relative z-10 grid w-full max-w-4xl items-center gap-10 md:grid-cols-2">
        <div className="order-2 md:order-1">
          <p className="text-gradient-brand text-7xl font-extrabold tracking-tight sm:text-8xl">404</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{t("notFound.title")}</h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{t("notFound.description")}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to={homeTo}>
                <Home className="h-4 w-4" />
                {t("notFound.home")}
              </Link>
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
              {t("notFound.back")}
            </Button>
          </div>

          <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-card">
            <CaraMascot size={40} mood="thinking" />
            <p className="text-xs text-muted-foreground">{t("notFound.caraQuip")}</p>
          </div>
        </div>

        <div className="order-1 mx-auto w-64 motion-safe:animate-float sm:w-80 md:order-2">
          <NoResultsIllustration title="404" />
        </div>
      </div>
    </div>
  )
}
