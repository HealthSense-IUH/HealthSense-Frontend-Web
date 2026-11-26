import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { ArrowUpRight } from "lucide-react"

import { cn } from "@/lib/utils"

export const LIFESTYLE_ART = {
  familyPark: "/illustrations/family-park.jpg",
  friendsJogging: "/illustrations/friends-jogging.jpg",
  familyMeal: "/illustrations/family-meal.jpg",
  kidsActive: "/illustrations/kids-active.jpg",
  doctorFamilyCare: "/illustrations/doctor-family-care.jpg",
  seniorsMorning: "/illustrations/seniors-morning.jpg",
} as const

export type LifestyleArtKey = keyof typeof LIFESTYLE_ART

const TONE_MAP = {
  primary: {
    bar: "from-primary-600 to-cyan-500",
    pill: "border-primary-200 bg-primary-50 text-primary-700",
    tint: "from-primary-50/60 via-white to-cyan-50/40 border-primary-100",
  },
  success: {
    bar: "from-success-600 to-cyan-500",
    pill: "border-success-200 bg-success-50 text-success-700",
    tint: "from-success-50/60 via-white to-cyan-50/40 border-success-100",
  },
  cyan: {
    bar: "from-cyan-600 to-primary-500",
    pill: "border-cyan-200 bg-cyan-50 text-cyan-700",
    tint: "from-cyan-50/60 via-white to-primary-50/40 border-cyan-100",
  },
  warning: {
    bar: "from-warning-500 to-danger-400",
    pill: "border-warning-200 bg-warning-50 text-warning-700",
    tint: "from-warning-50/60 via-white to-danger-50/30 border-warning-100",
  },
  danger: {
    bar: "from-danger-500 to-warning-400",
    pill: "border-danger-200 bg-danger-50 text-danger-700",
    tint: "from-danger-50/50 via-white to-warning-50/40 border-danger-100",
  },
} as const

export type LifestyleTone = keyof typeof TONE_MAP

interface LifestyleStripBannerProps {
  art: LifestyleArtKey
  eyebrow: string
  title: string
  description: string
  tone?: LifestyleTone
  action?: ReactNode
  className?: string
}

/** Banner minh hoạ nhịp sống khoẻ gọn gàng đặt trên các trang nội bộ: ấm áp, sáng rõ, không chiếm nhiều chiều cao. */
export function LifestyleStripBanner({
  art,
  eyebrow,
  title,
  description,
  tone = "primary",
  action,
  className,
}: LifestyleStripBannerProps) {
  const palette = TONE_MAP[tone]
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-gradient-to-r shadow-card",
        palette.tint,
        className
      )}
    >
      <div className={cn("absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b", palette.bar)} aria-hidden="true" />
      <div className="grid items-center gap-4 px-5 py-4 sm:grid-cols-[1fr_180px] sm:px-6 lg:grid-cols-[1fr_220px]">
        <div className="min-w-0 space-y-1.5 pl-1">
          <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider", palette.pill)}>
            {eyebrow}
          </span>
          <h3 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
            {title}
          </h3>
          <p className="max-w-2xl text-xs leading-relaxed text-slate-600 sm:text-sm">
            {description}
          </p>
          {action && <div className="pt-1">{action}</div>}
        </div>

        <div className="hidden overflow-hidden rounded-xl border border-slate-200/70 bg-white p-1.5 shadow-xs sm:block">
          <img
            src={LIFESTYLE_ART[art]}
            alt={title}
            loading="lazy"
            className="aspect-[4/3] w-full rounded-lg object-cover"
          />
        </div>
      </div>
    </div>
  )
}

interface LifestyleNavCardProps {
  art: LifestyleArtKey
  badge: string
  title: string
  description: string
  to: string
  cta: string
  tone?: LifestyleTone
}

/** Thẻ lối sống khoẻ có hình minh hoạ lớn + lối tắt chuyển trang (dùng ở Dashboard hội viên). */
export function LifestyleNavCard({
  art,
  badge,
  title,
  description,
  to,
  cta,
  tone = "primary",
}: LifestyleNavCardProps) {
  const palette = TONE_MAP[tone]
  return (
    <Link
      to={to}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary-200 hover:shadow-lg"
    >
      <div className={cn("h-1 w-full bg-gradient-to-r", palette.bar)} aria-hidden="true" />
      <div className="overflow-hidden bg-white p-3 pb-1">
        <img
          src={LIFESTYLE_ART[art]}
          alt={title}
          loading="lazy"
          className="aspect-[4/3] w-full rounded-xl object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col p-4 pt-2">
        <span className={cn("w-fit rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", palette.pill)}>
          {badge}
        </span>
        <h3 className="mt-2 text-sm font-extrabold tracking-tight text-slate-900 group-hover:text-primary-700 transition-colors">
          {title}
        </h3>
        <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-600">{description}</p>
        <div className="mt-3 flex items-center gap-1 text-xs font-bold text-primary-600 group-hover:text-primary-700">
          <span>{cta}</span>
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  )
}
