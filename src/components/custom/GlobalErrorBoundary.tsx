import { AlertTriangle, RefreshCcw } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useRouteError } from "react-router-dom"

import { Button } from "@/components/ui/button"

export function GlobalErrorBoundary() {
  const { t } = useTranslation()
  const routeError = useRouteError() as Error | undefined
  const errorText = routeError?.message ?? String(routeError ?? "")
  const isChunkLoadError =
    routeError?.name === "ChunkLoadError" ||
    errorText.includes("Failed to fetch dynamically imported module") ||
    errorText.includes("dynamically imported module")

  if (isChunkLoadError) {
    const hasReloaded = window.sessionStorage.getItem("chunk_reload_attempted")
    if (!hasReloaded) {
      window.sessionStorage.setItem("chunk_reload_attempted", "true")
      window.location.reload()
      return null
    }
  }

  window.sessionStorage.removeItem("chunk_reload_attempted")

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background px-4 text-foreground">
      <section className="flex w-full max-w-md flex-col items-center gap-6 rounded-lg border bg-card p-6 text-center shadow-sm">
        <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">
            {isChunkLoadError ? t("errorBoundary.updatedTitle") : t("errorBoundary.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isChunkLoadError
              ? t("errorBoundary.updatedDescription")
              : routeError?.message || t("errorBoundary.description")}
          </p>
        </div>
        <div className="flex gap-3">
          <Button type="button" onClick={() => window.location.reload()}>
            <RefreshCcw data-icon="inline-start" />
            {t("errorBoundary.reload")}
          </Button>
          {!isChunkLoadError && (
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              {t("errorBoundary.goBack")}
            </Button>
          )}
        </div>
      </section>
    </main>
  )
}
