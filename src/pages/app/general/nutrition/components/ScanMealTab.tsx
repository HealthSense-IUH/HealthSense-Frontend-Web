import { useEffect, useRef, useState } from "react"
import {
  AlertTriangle,
  Camera,
  Check,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Plus,
  ShieldAlert,
  Sparkles,
  Trash2,
  UtensilsCrossed,
} from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { nutritionApi } from "@/services/nutrition.service"
import { cn } from "@/lib/utils"
import type { MealEstimate } from "@/types/nutrition"
import { useNutritionNav } from "../nutrition-nav"
import { useFoodLogStore } from "../food-log-store"
import { DailyFoodLogCard } from "./DailyFoodLogCard"

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"])

export function ScanMealTab() {
  const { t } = useTranslation("nutrition")
  const { toast } = useToast()
  const nav = useNutritionNav()
  const addEntry = useFoodLogStore((s) => s.addEntry)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<MealEstimate | null>(null)
  const [loggedCurrent, setLoggedCurrent] = useState(false)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleSelectFile = (file: File | null | undefined) => {
    if (!file) return
    if (!ALLOWED_TYPES.has(file.type.toLowerCase())) {
      setError(t("scanMeal.errors.invalidType"))
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(t("scanMeal.errors.tooLarge"))
      return
    }
    setError(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const clearImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setImageFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleAnalyze = async () => {
    if (!imageFile && !description.trim()) {
      setError(t("scanMeal.errors.emptyInput"))
      return
    }
    setError(null)
    setLoading(true)
    setLoggedCurrent(false)
    try {
      const res = await nutritionApi.estimateMeal({
        image: imageFile,
        description: description.trim(),
      })
      if (res?.data) {
        setResult(res.data)
      } else {
        setError(t("scanMeal.errors.failed"))
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
          ?.message ||
        (err as { message?: string })?.message ||
        t("scanMeal.errors.failed")
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleLogMeal = () => {
    if (!result) return
    addEntry({
      name: result.mealName,
      grams: result.totalGrams || 100,
      energyKcal: result.energyKcal,
      proteinG: result.proteinG,
      carbohydrateG: result.carbohydrateG,
      fatTotalG: result.fatTotalG,
      sodiumMg: result.sodiumMg,
      potassiumMg: result.potassiumMg,
      sugarsG: result.sugarsG,
      source: "scan",
    })
    setLoggedCurrent(true)
    toast({
      title: t("foodLog.addedTitle"),
      description: t("foodLog.addedDescription", {
        name: result.mealName,
        kcal: Math.round(result.energyKcal),
      }),
    })
  }

  const examples = [
    t("scanMeal.examples.pho"),
    t("scanMeal.examples.salmonRice"),
    t("scanMeal.examples.banhMi"),
  ]

  const cardiacStyle =
    result?.cardiacLevel === "LIMIT"
      ? {
          box: "bg-danger-50/80 border-danger-200 text-danger-800",
          Icon: ShieldAlert,
        }
      : result?.cardiacLevel === "CAUTION"
        ? {
            box: "bg-warning-50/80 border-warning-200 text-warning-800",
            Icon: AlertTriangle,
          }
        : result?.cardiacLevel === "GOOD"
          ? {
              box: "bg-success-50/80 border-success-200 text-success-800",
              Icon: CheckCircle2,
            }
          : {
              box: "bg-slate-50 border-slate-200 text-slate-700",
              Icon: Sparkles,
            }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form (Photo + Text Description) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{t("scanMeal.title")}</h2>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {t("scanMeal.subtitle")}
              </p>
            </div>
          </div>

          {/* Image Upload Zone */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              onChange={(e) => handleSelectFile(e.target.files?.[0])}
              className="hidden"
            />
            {previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                <img
                  src={previewUrl}
                  alt={t("scanMeal.previewAlt")}
                  className="w-full h-52 object-cover"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-black/65 text-white text-xs font-medium hover:bg-black/80 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t("scanMeal.removePhoto")}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-2xl border-2 border-dashed border-slate-200 hover:border-primary/60 bg-slate-50/70 hover:bg-primary/5 transition-colors p-6 flex flex-col items-center justify-center text-center gap-2 cursor-pointer"
              >
                <div className="h-11 w-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-primary shadow-2xs">
                  <ImagePlus className="w-5 h-5" />
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  {t("scanMeal.uploadPrompt")}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {t("scanMeal.uploadHint")}
                </div>
              </button>
            )}
          </div>

          {/* Text Description / Portion Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              {t("scanMeal.descriptionLabel")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder={t("scanMeal.descriptionPlaceholder")}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {examples.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setDescription(ex)}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 hover:bg-primary/10 text-slate-600 hover:text-primary transition-colors cursor-pointer"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-danger-50 border border-danger-200 px-3.5 py-2.5 text-xs font-medium text-danger-700">
              {error}
            </div>
          )}

          <Button
            type="button"
            disabled={loading || (!imageFile && !description.trim())}
            onClick={() => void handleAnalyze()}
            className="w-full h-11 rounded-xl font-semibold text-sm cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("scanMeal.analyzing")}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {t("scanMeal.analyzeButton")}
              </>
            )}
          </Button>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {t("home.scan.note")}
          </p>
        </div>

        {/* Right: Structured AI Estimation Results */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          {!result ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-4 space-y-3">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <UtensilsCrossed className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {t("scanMeal.emptyTitle")}
              </h3>
              <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
                {t("scanMeal.emptyDescription")}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Header + Log CTA */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-extrabold text-slate-900">{result.mealName}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                      ~{Math.round(result.totalGrams)} g
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary">
                      {t(`scanMeal.confidence.${result.confidence}`)}
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant={loggedCurrent ? "outline" : "default"}
                  onClick={handleLogMeal}
                  className="rounded-xl h-9 px-3.5 text-xs font-semibold cursor-pointer"
                >
                  {loggedCurrent ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1.5 text-success-600" />
                      {t("foodLog.loggedButton")}
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      {t("foodLog.addButton")}
                    </>
                  )}
                </Button>
              </div>

              {/* Cardiac Assessment Banner */}
              <div className={cn("rounded-2xl border p-3.5 flex items-start gap-2.5", cardiacStyle.box)}>
                <cardiacStyle.Icon className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <div className="font-bold mb-0.5">
                    {t(`dietAdvice.level.${result.cardiacLevel}`)}
                  </div>
                  <p>{result.cardiacNote}</p>
                </div>
              </div>

              {/* 4 Main Macro / Electrolyte Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3.5">
                  <span className="text-[11px] text-muted-foreground font-medium block">
                    {t("foodLog.caloriesLabel")}
                  </span>
                  <div className="text-xl font-extrabold text-slate-900 mt-0.5 tabular-nums">
                    {Math.round(result.energyKcal)}{" "}
                    <span className="text-xs font-semibold text-slate-500">kcal</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3.5">
                  <span className="text-[11px] text-muted-foreground font-medium block">
                    {t("nutrientShort.sodium")}
                  </span>
                  <div
                    className={cn(
                      "text-xl font-extrabold mt-0.5 tabular-nums",
                      result.sodiumMg >= 1000
                        ? "text-danger-600"
                        : result.sodiumMg >= 650
                          ? "text-warning-600"
                          : "text-slate-900"
                    )}
                  >
                    {Math.round(result.sodiumMg)}{" "}
                    <span className="text-xs font-semibold text-slate-500">mg</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3.5">
                  <span className="text-[11px] text-muted-foreground font-medium block">
                    {t("nutrientShort.potassium")}
                  </span>
                  <div className="text-xl font-extrabold text-emerald-700 mt-0.5 tabular-nums">
                    {Math.round(result.potassiumMg)}{" "}
                    <span className="text-xs font-semibold text-slate-500">mg</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3.5">
                  <span className="text-[11px] text-muted-foreground font-medium block">
                    {t("foodLog.protein")}
                  </span>
                  <div className="text-xl font-extrabold text-slate-900 mt-0.5 tabular-nums">
                    {result.proteinG.toFixed(1)}{" "}
                    <span className="text-xs font-semibold text-slate-500">g</span>
                  </div>
                </div>
              </div>

              {/* Secondary Macros */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 tabular-nums">
                  {t("foodLog.carbs")}: <strong>{result.carbohydrateG.toFixed(1)} g</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 tabular-nums">
                  {t("foodLog.fat")}: <strong>{result.fatTotalG.toFixed(1)} g</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 tabular-nums">
                  {t("nutrientShort.fatSaturated")}: <strong>{result.fatSaturatedG.toFixed(1)} g</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 tabular-nums">
                  {t("nutrientShort.sugars")}: <strong>{result.sugarsG.toFixed(1)} g</strong>
                </span>
              </div>

              {/* Itemized Breakdown */}
              {result.items.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {t("scanMeal.itemsBreakdown")}
                  </h4>
                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 overflow-hidden">
                    {result.items.map((item, idx) => (
                      <div
                        key={`${item.name}-${idx}`}
                        className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-slate-50/40 text-xs"
                      >
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-800">{item.name}</span>
                          <span className="text-muted-foreground ml-1.5">
                            (~{Math.round(item.estimatedGrams)} g)
                          </span>
                        </div>
                        <div className="text-right tabular-nums shrink-0 text-slate-700 font-medium">
                          {Math.round(item.energyKcal)} kcal • Na {Math.round(item.sodiumMg)} mg
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Reference Database Foods */}
              {result.matchedFoods && result.matchedFoods.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {t("scanMeal.matchedFoods")}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.matchedFoods.map((food) => (
                      <button
                        key={food.id}
                        type="button"
                        onClick={() => nav.openReference(food.id)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-primary/50 hover:bg-primary/5 text-xs font-medium text-slate-800 transition-colors cursor-pointer"
                      >
                        {food.displayName}
                        {food.energyKcal != null ? (
                          <span className="text-muted-foreground ml-1.5">
                            ({Math.round(food.energyKcal)} kcal/100g)
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Live Daily Food Log Card right below for instant feedback */}
      <DailyFoodLogCard />
    </div>
  )
}
