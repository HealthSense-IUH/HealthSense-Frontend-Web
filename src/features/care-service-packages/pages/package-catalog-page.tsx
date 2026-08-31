import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Package,
  Clock,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Info,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { consultationApi } from "@/services"
import type { CareServicePackage } from "@/types/consultation"

export default function PackageCatalogPage() {
  const navigate = useNavigate()
  const [packages, setPackages] = useState<CareServicePackage[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const res = await consultationApi.listCareServicePackages()
      setPackages(res.data?.content || [])
    } catch (err) {
      console.error("Failed to load care packages", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchPackages()
  }, [])

  const handleRegister = (pkgId: number | string) => {
    navigate(`/app/general/consultations?tab=create-request&packageId=${pkgId}`)
  }

  const formatPrice = (amount: number, curr = "VND") => {
    return `${amount.toLocaleString("vi-VN")} ${curr}`
  }

  const getSpecialtyLabel = (spec?: string | null) => {
    switch (spec) {
      case "CARDIOLOGY":
        return "Tim mạch"
      case "INTERNAL_MEDICINE":
        return "Nội khoa"
      case "GENERAL_PRACTICE":
        return "Đa khoa"
      default:
        return spec || "Chuyên khoa"
    }
  }

  const getSupportPolicyLabel = (pol?: string | null) => {
    switch (pol) {
      case "ASSIGNED_DOCTOR_SUPPORT_SCHEDULE":
        return "Theo lịch làm việc của bác sĩ phụ trách"
      case "OFFICE_HOURS":
        return "Giờ hành chính (8h-17h)"
      case "BUSINESS_HOURS":
        return "Giờ làm việc mở rộng (7h-19h)"
      case "EXTENDED":
        return "Hỗ trợ linh hoạt & cuối tuần"
      case "CONTINUOUS":
        return "Theo dõi liên tục 24/7"
      default:
        return pol || "Theo lịch làm việc của bác sĩ phụ trách"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 rounded-3xl text-white shadow-md">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5" /> Gói Dịch vụ Chăm sóc Tim mạch 1-1
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Khám phá Gói Chăm sóc Sức khỏe</h1>
          <p className="text-blue-100 text-sm leading-relaxed">
            Đồng hành cùng các bác sĩ chuyên khoa hàng đầu. Đăng ký nhận tư vấn trực tiếp, đánh giá dữ liệu nhịp tim AI và phác đồ theo dõi cá nhân hóa.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchPackages} disabled={loading} className="self-start sm:self-center bg-white/10 hover:bg-white/20 border-white/30 text-white">
          <RefreshCw className="mr-2 h-4 w-4" /> Làm mới
        </Button>
      </div>

      {/* Packages Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 space-y-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
            </Card>
          ))}
        </div>
      ) : packages.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Package className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">Chưa có gói dịch vụ nào sẵn sàng</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Hiện tại các gói chăm sóc đang được cập nhật. Vui lòng quay lại sau!
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const includedList = pkg.includedServices || pkg.includedServiceTypes || []
            const policyRef = pkg.termsPolicyReference || pkg.limitations

            return (
              <Card
                key={pkg.id}
                className="flex flex-col justify-between border hover:border-primary/50 hover:shadow-lg transition-all rounded-2xl overflow-hidden"
              >
                <CardHeader className="p-6 pb-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary" className="font-semibold text-xs">
                      {getSpecialtyLabel(pkg.requiredSpecialty || pkg.specialty)}
                    </Badge>
                    {pkg.renewable && (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 text-[10px]">
                        Có thể gia hạn
                      </Badge>
                    )}
                  </div>

                  <div>
                    <CardTitle className="text-xl font-bold">{pkg.name}</CardTitle>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">#{pkg.code}</p>
                  </div>

                  <div className="flex items-baseline gap-1.5 pt-1">
                    <span className="text-3xl font-extrabold text-foreground">
                      {formatPrice(pkg.priceAmount, pkg.currency)}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">/ {pkg.durationDays} ngày</span>
                  </div>

                  {(pkg.description || pkg.shortDescription) && (
                    <CardDescription className="text-xs leading-relaxed line-clamp-3">
                      {pkg.shortDescription || pkg.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="p-6 pt-0 space-y-4 text-xs">
                  <div className="p-3 rounded-xl bg-muted/40 space-y-1.5 border border-border/50">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      Chính sách hỗ trợ:
                    </div>
                    <p className="text-muted-foreground pl-5">{getSupportPolicyLabel(pkg.supportPolicy)}</p>
                  </div>

                  {/* Included Services */}
                  {includedList.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="font-semibold text-foreground flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Dịch vụ bao gồm:
                      </p>
                      <ul className="space-y-1 pl-5 list-disc text-muted-foreground text-[11px]">
                        {includedList.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Limitations / Terms Policy */}
                  {policyRef && (
                    <div className="p-2.5 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-300 flex items-start gap-2">
                      <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>{policyRef}</span>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="p-6 pt-0 border-t mt-4 bg-muted/10">
                  <Button onClick={() => handleRegister(pkg.id)} className="w-full font-semibold shadow-sm">
                    Đăng ký tư vấn ngay <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
