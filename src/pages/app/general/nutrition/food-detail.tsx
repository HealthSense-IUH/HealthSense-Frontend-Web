import { useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Heart,
  Info,
  Pill,
  Scale,
  Sparkles,
  Zap,
  Image as ImageIcon,
} from "lucide-react"

import { Page, PageBody, PageFooter, PageHeader } from "@/components/layout/page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { GuidanceBadge } from "./components/GuidanceBadge"
import { useNutritionFood } from "./hooks/use-nutrition"
import type { EvidenceSourceType, NutrientValue } from "@/types/nutrition"
import { cn } from "@/lib/utils"

export default function FoodDetailPage() {
  const { foodId } = useParams<{ foodId: string }>()
  const navigate = useNavigate()
  const [showAllNutrients, setShowAllNutrients] = useState(false)

  const { data: food, isLoading } = useNutritionFood(foodId)

  if (isLoading) {
    return (
      <Page>
        <Skeleton className="h-5 w-64" />
        <Skeleton className="aspect-[21/9] sm:aspect-[24/8] w-full rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </Page>
    )
  }

  if (!food) {
    return (
      <div className="max-w-md mx-auto p-6 text-center space-y-4">
        <h2 className="text-xl font-bold">Không tìm thấy món ăn</h2>
        <p className="text-muted-foreground text-sm">
          Món ăn bạn đang tìm kiếm không tồn tại hoặc đã được cập nhật.
        </p>
        <Button onClick={() => navigate("/app/general/nutrition")}>
          Quay lại trang Dinh dưỡng
        </Button>
      </div>
    )
  }

  const guidanceType = food.guidance

  // Split nutrients into Key vs Others
  const keyNutrientCodes = [
    "energy",
    "protein",
    "carbohydrate",
    "fat_total",
    "fat_saturated",
    "sodium",
    "potassium",
    "magnesium",
  ]
  const keyNutrients = food.nutrients.filter((n) => keyNutrientCodes.includes(n.nutrientCode))
  const otherNutrients = food.nutrients.filter((n) => !keyNutrientCodes.includes(n.nutrientCode))

  const sourceTypeLabels: Record<EvidenceSourceType, { label: string; cls: string }> = {
    GUIDELINE: {
      label: "Hướng dẫn lâm sàng (Guideline)",
      cls: "bg-primary-50 text-primary-700 border-primary-200",
    },
    SYSTEMATIC_REVIEW: {
      label: "Tổng quan hệ thống (Systematic Review)",
      cls: "bg-primary-50 text-primary-700 border-primary-200",
    },
    META_ANALYSIS: {
      label: "Phân tích gộp (Meta-analysis)",
      cls: "bg-primary-50 text-primary-700 border-primary-200",
    },
    RCT: {
      label: "Thử nghiệm đối chứng ngẫu nhiên (RCT)",
      cls: "bg-success-50 text-success-700 border-success-200",
    },
    OTHER: {
      label: "Khuyến cáo chuyên khoa (Clinical Review)",
      cls: "bg-slate-50 text-slate-700 border-slate-200",
    },
  }

  return (
    <Page>
      <PageHeader
        breadcrumbs={[
          { label: "Dinh dưỡng", to: "/app/general/nutrition" },
          { label: food.groupName, to: `/app/general/nutrition/category/${food.group}` },
          { label: food.foodNameSpecific },
        ]}
        title={food.foodNameSpecific}
        description={food.sourceDescription ? `Nguồn tham chiếu FNDDS: ${food.sourceDescription}` : undefined}
        meta={
          <>
            <Link
              to={`/app/general/nutrition/category/${food.group}`}
              className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md hover:bg-primary/15 transition-colors"
            >
              {food.groupName}
            </Link>
            {food.foodName !== food.foodNameSpecific && (
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                Loại: {food.foodName}
              </span>
            )}
            {guidanceType && <GuidanceBadge type={guidanceType} size="md" />}
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
              <Scale className="w-3 h-3 text-primary" />
              Định lượng chuẩn: 100 g
            </span>
          </>
        }
      />

      <PageBody>

        {/* Food Image Banner / Placeholder */}
        <div className="relative aspect-[21/9] sm:aspect-[24/8] w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-200/80 shadow-xs">
          {food.imageUrl ? (
            <img
              src={food.imageUrl}
              alt={food.foodNameSpecific}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col sm:flex-row items-center justify-center text-slate-400 gap-3 p-4 select-none bg-gradient-to-r from-slate-50 via-slate-100/70 to-slate-50">
              <div className="p-3 rounded-2xl bg-white shadow-2xs text-slate-400 border border-slate-200/60">
                <ImageIcon className="w-6 h-6 stroke-[1.5]" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs font-semibold text-slate-700">
                  Hình ảnh thực phẩm
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Khu vực hiển thị ảnh đại diện khi tích hợp dữ liệu hình ảnh
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Basic Info Card: mô tả + tóm tắt khuyến nghị */}
        {(food.description || food.guidanceTitle || food.guidanceReason) && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-6 shadow-xs space-y-4">
          {/* Member-Friendly Description */}
          {food.description && (
            <p className="text-sm text-slate-600 leading-relaxed">
              {food.description}
            </p>
          )}

          {/* Guidance Summary Callout */}
          {(food.guidanceTitle || food.guidanceReason) && (
            <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-primary/5 p-4 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>{food.guidanceTitle}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {food.guidanceReason}
              </p>
            </div>
          )}
        </div>
        )}

        {/* Section: Key Nutrition (Bảng thành phần dinh dưỡng) */}
        <Card className="rounded-2xl border-slate-200/80 shadow-xs overflow-hidden">
          <CardHeader className="bg-slate-50/60 border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Thành phần dinh dưỡng</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tính trên mỗi 100g thực phẩm (chuẩn cơ sở dữ liệu USDA FNDDS 2021-2023)
                </p>
              </div>
              <span className="text-xs font-medium text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                Per 100g
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Key Nutrients Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {keyNutrients.map((item: NutrientValue) => (
                <div
                  key={item.nutrientCode}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between"
                >
                  <span className="text-xs text-muted-foreground font-normal line-clamp-1">
                    {item.name}
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-xl font-bold text-slate-900">
                      {item.amount}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {item.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Expandable Other Nutrients */}
            {otherNutrients.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllNutrients(!showAllNutrients)}
                  className="w-full text-xs text-primary font-medium hover:bg-primary/5 flex items-center justify-center gap-1.5 h-9"
                >
                  <span>
                    {showAllNutrients
                      ? "Thu gọn thành phần vi lượng"
                      : `Xem thêm ${otherNutrients.length} thành phần dinh dưỡng chi tiết`}
                  </span>
                  {showAllNutrients ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>

                {showAllNutrients && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 animate-in fade-in duration-200">
                    {otherNutrients.map((item: NutrientValue) => (
                      <div
                        key={item.nutrientCode}
                        className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs"
                      >
                        <span className="text-muted-foreground">{item.name}</span>
                        <span className="font-semibold text-slate-800">
                          {item.amount} {item.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section: Why This Matters (Ý nghĩa đối với sức khỏe) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-danger-500 fill-danger-500" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Ý nghĩa đối với sức khỏe của bạn
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Cardiovascular Health */}
            {food.cardiovascularContext && (
              <Card className="rounded-2xl border-danger-100 bg-gradient-to-br from-danger-50/40 to-transparent">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm sm:text-base font-semibold text-danger-900 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-danger-600" />
                    <span>Sức khỏe tim mạch & Huyết áp</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {food.cardiovascularContext}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Card 2: AF / Atrial Fibrillation Context */}
            {food.afContext && (
              <Card className="rounded-2xl border-warning-100 bg-gradient-to-br from-warning-50/40 to-transparent">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm sm:text-base font-semibold text-warning-900 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-warning-600" />
                    <span>Rung tâm nhĩ & Nhịp tim</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {food.afContext}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Card 3: Medication Context (e.g. Warfarin / Vitamin K) */}
            {food.medicationContext && (
              <Card className="rounded-2xl border-primary-100 bg-gradient-to-br from-primary-50/40 to-transparent md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm sm:text-base font-semibold text-primary-900 flex items-center gap-2">
                    <Pill className="w-4 h-4 text-primary-600" />
                    <span>Lưu ý khi sử dụng thuốc điều trị</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {food.medicationContext}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Section: Evidence Sources (Cơ sở nghiên cứu & Hướng dẫn y khoa) */}
        {food.evidenceSources && food.evidenceSources.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-200/60">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-slate-900">
                Cơ sở tham khảo & Bằng chứng y học
              </h2>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">
              Các khuyến nghị dinh dưỡng trên được đối chiếu từ tài liệu hướng dẫn lâm sàng và thử nghiệm y khoa chính thống.
            </p>

            <div className="space-y-3">
              {food.evidenceSources.map((source) => {
                const meta = sourceTypeLabels[source.sourceType] || sourceTypeLabels.OTHER
                return (
                  <div
                    key={source.id}
                    className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={cn(
                          "text-[11px] font-medium px-2.5 py-0.5 rounded-full border",
                          meta.cls
                        )}
                      >
                        {meta.label}
                      </span>
                      {source.year && (
                        <span className="text-xs text-muted-foreground">Năm {source.year}</span>
                      )}
                    </div>

                    <h3 className="font-semibold text-xs sm:text-sm text-slate-900 leading-snug">
                      {source.title}
                    </h3>

                    {(source.authors || source.journal) && (
                      <p className="text-xs text-muted-foreground">
                        {source.authors && <span>{source.authors}</span>}
                        {source.journal && (
                          <span className="font-medium italic text-slate-600">
                            {" "}
                            — {source.journal}
                          </span>
                        )}
                      </p>
                    )}

                    {source.summary && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                        {source.summary}
                      </p>
                    )}

                    {source.url && (
                      <div className="pt-1">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
                        >
                          <span>Xem tài liệu gốc</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </PageBody>

      <PageFooter>
        <p className="flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
          <span>
            Dữ liệu dinh dưỡng được trích xuất từ cơ sở dữ liệu USDA Food and Nutrient Database for Dietary Studies
            (FNDDS 2021-2023). Các thông tin về rung nhĩ và tim mạch chỉ mang tính giáo dục sức khỏe, không thay thế chẩn
            đoán hoặc phác đồ từ bác sĩ chuyên khoa tim mạch.
          </span>
        </p>
      </PageFooter>
    </Page>
  )
}
