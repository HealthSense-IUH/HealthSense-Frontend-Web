import type { SVGProps } from "react"

import { cn } from "@/lib/utils"

/*
 * Bộ minh hoạ SVG của HealthSense: cùng bảng màu với mascot Cara (xanh primary, navy, hồng san hô, xanh mint, vàng
 * nhấn), nét phẳng, bóng mềm. Dùng cho empty state, trang đăng nhập, banner và trang trí. Mỗi hình là một component
 * nhận className để chỉnh kích thước; màu là hằng số để hình giống nhau ở mọi nền.
 */
const C = {
  sky100: "#e0f2fe",
  sky200: "#bae6fd",
  sky300: "#7dd3fc",
  sky400: "#38bdf8",
  sky500: "#0ea5e9",
  sky600: "#0284c7",
  navy: "#0b132b",
  navy2: "#1e3a5f",
  coral: "#fb7185",
  mint: "#34d399",
  mint2: "#a7f3d0",
  amber: "#fbbf24",
  slate100: "#f1f5f9",
  slate200: "#e2e8f0",
  white: "#ffffff",
}

type IllustrationProps = SVGProps<SVGSVGElement> & { className?: string; title?: string }

function Svg({ className, title, children, viewBox = "0 0 240 180", ...rest }: IllustrationProps) {
  return (
    <svg
      viewBox={viewBox}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={cn("h-auto w-full", className)}
      {...rest}
    >
      {children}
    </svg>
  )
}

const HEART = "M60 54 C44 44 34 34 34 22 C34 14 40 8 48 8 C53 8 57 11 60 16 C63 11 67 8 72 8 C80 8 86 14 86 22 C86 34 76 44 60 54 Z"

/** Bóng mờ dưới vật thể */
function Shadow({ cx = 120, cy = 160, rx = 70 }: { cx?: number; cy?: number; rx?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry="7" fill={C.navy} opacity="0.07" />
}

function Sparkle({ x, y, s = 1, color = C.amber }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8 Z"
      fill={color}
    />
  )
}

/** Đường điện tim; `animated` = nét chạy liên tục (dùng cho banner) */
export function EcgLine({
  className,
  color = "currentColor",
  animated = false,
  strokeWidth = 2.5,
}: {
  className?: string
  color?: string
  animated?: boolean
  strokeWidth?: number
}) {
  const d =
    "M0 30 H70 L82 30 L90 12 L100 48 L110 22 L118 30 H190 L202 30 L210 14 L220 46 L230 24 L238 30 H310 L322 30 L330 10 L340 50 L350 20 L358 30 H430 L442 30 L450 14 L460 46 L470 24 L478 30 H600"
  return (
    <svg viewBox="0 0 600 60" preserveAspectRatio="none" className={cn("h-10 w-full", className)} aria-hidden="true">
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animated ? "ecg-draw" : undefined}
        pathLength={100}
      />
    </svg>
  )
}

/** Trái tim lớn với điện tim và vòng sóng: hero, "chưa có lần đo" */
export function HeartPulseIllustration(props: IllustrationProps) {
  return (
    <Svg {...props}>
      <defs>
        <linearGradient id="hp-heart" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.sky300} />
          <stop offset="1" stopColor={C.sky500} />
        </linearGradient>
      </defs>
      <circle cx="120" cy="88" r="76" fill={C.sky100} opacity="0.6" />
      <circle cx="120" cy="88" r="56" fill="none" stroke={C.sky200} strokeWidth="2" strokeDasharray="4 6" />
      <Shadow cy={164} rx={58} />
      <g transform="translate(60 48)">
        <path d={HEART} fill="url(#hp-heart)" stroke={C.white} strokeWidth="5" strokeLinejoin="round" />
        <path d={HEART} fill="none" stroke={C.sky600} strokeWidth="1.8" strokeLinejoin="round" />
        <ellipse cx="48" cy="20" rx="7" ry="4" fill={C.white} opacity="0.4" transform="rotate(-25 48 20)" />
        <path d="M40 34 H50 L54 26 L59 42 L63 34 H80" fill="none" stroke={C.white} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <path d="M18 120 H60 L68 108 L76 134 L84 120 H110" fill="none" stroke={C.coral} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      <path d="M130 120 H160 L168 108 L176 134 L184 120 H222" fill="none" stroke={C.coral} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      <Sparkle x={180} y={40} />
      <Sparkle x={52} y={52} s={0.7} color={C.sky400} />
      <Sparkle x={196} y={128} s={0.6} color={C.mint} />
    </Svg>
  )
}

/** Hộp mở trống với vài hạt sáng bay ra: chưa có dữ liệu */
export function EmptyBoxIllustration(props: IllustrationProps) {
  return (
    <Svg {...props}>
      <Shadow cy={162} rx={62} />
      <path d="M58 88 L120 112 L182 88 L182 142 L120 166 L58 142 Z" fill={C.sky100} />
      <path d="M120 112 L182 88 L182 142 L120 166 Z" fill={C.sky200} />
      <path d="M58 88 L120 112 L120 166 L58 142 Z" fill={C.sky300} opacity="0.55" />
      <path d="M58 88 L96 64 L158 88 L120 112 Z" fill={C.sky200} />
      <path d="M58 88 L30 70 L92 46 L96 64 Z" fill={C.sky300} />
      <path d="M182 88 L210 70 L148 46 L158 88 Z" fill={C.sky400} />
      <path d="M58 88 L120 112 L182 88" fill="none" stroke={C.sky600} strokeWidth="1.5" opacity="0.5" />
      <circle cx="104" cy="44" r="3" fill={C.coral} />
      <circle cx="132" cy="30" r="2.5" fill={C.mint} />
      <circle cx="150" cy="22" r="2" fill={C.sky400} />
      <Sparkle x={84} y={24} s={0.8} />
      <path d="M112 78 H118 L121 72 L125 86 L128 78 H134" fill="none" stroke={C.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

/** Kính lúp trên tờ giấy: không tìm thấy kết quả */
export function NoResultsIllustration(props: IllustrationProps) {
  return (
    <Svg {...props}>
      <Shadow cy={164} rx={60} />
      <rect x="62" y="26" width="104" height="128" rx="12" fill={C.white} stroke={C.slate200} strokeWidth="2" />
      <rect x="78" y="46" width="52" height="8" rx="4" fill={C.slate200} />
      <rect x="78" y="64" width="72" height="6" rx="3" fill={C.slate100} />
      <rect x="78" y="78" width="60" height="6" rx="3" fill={C.slate100} />
      <rect x="78" y="92" width="68" height="6" rx="3" fill={C.slate100} />
      <circle cx="146" cy="110" r="26" fill={C.sky100} stroke={C.sky500} strokeWidth="5" />
      <circle cx="146" cy="110" r="18" fill={C.white} opacity="0.5" />
      <path d="M165 129 L188 152" stroke={C.sky600} strokeWidth="8" strokeLinecap="round" />
      <path d="M138 104 L154 118 M154 104 L138 118" stroke={C.coral} strokeWidth="3" strokeLinecap="round" />
      <Sparkle x={52} y={34} s={0.7} />
      <Sparkle x={186} y={48} s={0.6} color={C.mint} />
    </Svg>
  )
}

/** Chồng tài liệu có dấu bookmark và tia sáng: kho tri thức */
export function DocumentsIllustration(props: IllustrationProps) {
  return (
    <Svg {...props}>
      <Shadow cy={164} rx={64} />
      <rect x="44" y="40" width="96" height="120" rx="10" fill={C.sky200} transform="rotate(-8 92 100)" />
      <rect x="62" y="34" width="96" height="120" rx="10" fill={C.sky300} transform="rotate(-3 110 94)" />
      <rect x="80" y="30" width="100" height="124" rx="10" fill={C.white} stroke={C.slate200} strokeWidth="2" />
      <rect x="96" y="50" width="44" height="8" rx="4" fill={C.sky500} />
      <rect x="96" y="68" width="68" height="6" rx="3" fill={C.slate200} />
      <rect x="96" y="82" width="60" height="6" rx="3" fill={C.slate200} />
      <rect x="96" y="96" width="66" height="6" rx="3" fill={C.slate200} />
      <rect x="96" y="110" width="40" height="6" rx="3" fill={C.slate200} />
      <path d="M156 30 V62 L164 55 L172 62 V30 Z" fill={C.coral} />
      <path d="M100 134 H108 L111 128 L115 140 L118 134 H126" fill="none" stroke={C.mint} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <Sparkle x={196} y={44} />
      <Sparkle x={34} y={140} s={0.7} color={C.sky400} />
    </Svg>
  )
}

/** Hai bong bóng chat với trái tim và ống nghe: tư vấn, trò chuyện */
export function ConsultationIllustration(props: IllustrationProps) {
  return (
    <Svg {...props}>
      <Shadow cy={164} rx={66} />
      <path d="M36 54 C36 42 46 34 58 34 H118 C130 34 140 42 140 54 V80 C140 92 130 100 118 100 H70 L48 118 V100 C41 100 36 92 36 80 Z" fill={C.sky500} />
      <path d="M100 86 C100 74 110 66 122 66 H182 C194 66 204 74 204 86 V112 C204 124 194 132 182 132 H166 L190 150 V132 H122 C110 132 100 124 100 112 Z" fill={C.white} stroke={C.slate200} strokeWidth="2" />
      <path d="M58 66 H70 L75 58 L81 76 L86 66 H118" fill="none" stroke={C.white} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <g transform="translate(118 82) scale(0.55)">
        <path d={HEART} fill={C.coral} />
      </g>
      <rect x="152" y="86" width="36" height="6" rx="3" fill={C.slate200} />
      <rect x="152" y="100" width="28" height="6" rx="3" fill={C.slate200} />
      <rect x="152" y="114" width="40" height="6" rx="3" fill={C.slate200} />
      <path d="M160 26 V40 C160 50 168 56 176 56 C184 56 192 50 192 40 V26" fill="none" stroke={C.navy2} strokeWidth="3" strokeLinecap="round" />
      <circle cx="160" cy="24" r="3" fill={C.navy2} />
      <circle cx="192" cy="24" r="3" fill={C.navy2} />
      <path d="M176 56 V64 C176 70 182 74 196 74 C208 74 214 68 214 60" fill="none" stroke={C.navy2} strokeWidth="3" strokeLinecap="round" />
      <circle cx="214" cy="56" r="6" fill={C.mint} stroke={C.navy2} strokeWidth="3" />
      <Sparkle x={26} y={30} s={0.7} />
    </Svg>
  )
}

/** Bát salad với lá và quả: dinh dưỡng */
export function NutritionIllustration(props: IllustrationProps) {
  return (
    <Svg {...props}>
      <Shadow cy={164} rx={66} />
      <path d="M44 92 H196 C196 128 164 152 120 152 C76 152 44 128 44 92 Z" fill={C.sky500} />
      <path d="M44 92 H196 C196 100 188 106 176 108 H64 C52 106 44 100 44 92 Z" fill={C.sky600} opacity="0.5" />
      <ellipse cx="120" cy="92" rx="76" ry="10" fill={C.sky300} />
      <path d="M84 84 C84 60 100 48 122 48 C118 64 110 78 92 88 Z" fill={C.mint} />
      <path d="M86 86 C96 74 106 62 120 52" fill="none" stroke={C.white} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <circle cx="140" cy="76" r="14" fill={C.coral} />
      <circle cx="136" cy="72" r="4" fill={C.white} opacity="0.5" />
      <path d="M140 62 C142 56 146 54 150 54" fill="none" stroke={C.mint} strokeWidth="3" strokeLinecap="round" />
      <circle cx="108" cy="80" r="7" fill={C.amber} />
      <circle cx="160" cy="84" r="6" fill={C.mint2} stroke={C.mint} strokeWidth="2" />
      <Sparkle x={200} y={48} />
      <Sparkle x={40} y={56} s={0.7} color={C.sky400} />
    </Svg>
  )
}

/** Cột và đường xu hướng đi lên: thống kê, báo cáo */
export function ChartIllustration(props: IllustrationProps) {
  return (
    <Svg {...props}>
      <Shadow cy={164} rx={70} />
      <rect x="40" y="30" width="160" height="120" rx="14" fill={C.white} stroke={C.slate200} strokeWidth="2" />
      <path d="M56 126 H184" stroke={C.slate200} strokeWidth="2" strokeLinecap="round" />
      <rect x="64" y="94" width="20" height="32" rx="5" fill={C.sky200} />
      <rect x="96" y="76" width="20" height="50" rx="5" fill={C.sky300} />
      <rect x="128" y="86" width="20" height="40" rx="5" fill={C.sky400} />
      <rect x="160" y="58" width="20" height="68" rx="5" fill={C.sky500} />
      <path d="M62 92 C90 78 110 94 130 70 C146 52 160 56 182 44" fill="none" stroke={C.coral} strokeWidth="3" strokeLinecap="round" />
      <circle cx="182" cy="44" r="5" fill={C.white} stroke={C.coral} strokeWidth="3" />
      <Sparkle x={212} y={36} />
      <Sparkle x={28} y={60} s={0.7} color={C.mint} />
    </Svg>
  )
}

/** Đám mây với dấu cảnh báo: lỗi tải dữ liệu, mất kết nối */
export function ErrorIllustration(props: IllustrationProps) {
  return (
    <Svg {...props}>
      <Shadow cy={162} rx={60} />
      <path d="M72 128 H164 C182 128 196 114 196 96 C196 78 182 66 166 66 C160 46 142 34 122 34 C98 34 80 50 76 72 C58 74 44 88 44 104 C44 118 56 128 72 128 Z" fill={C.sky100} stroke={C.sky300} strokeWidth="2" />
      <circle cx="120" cy="104" r="26" fill={C.coral} />
      <path d="M120 90 V108" stroke={C.white} strokeWidth="5" strokeLinecap="round" />
      <circle cx="120" cy="118" r="3.2" fill={C.white} />
      <path d="M64 150 L70 142 M84 156 L88 148 M152 156 L148 148 M174 150 L168 142" stroke={C.sky400} strokeWidth="3" strokeLinecap="round" />
      <Sparkle x={200} y={40} s={0.8} />
    </Svg>
  )
}

/** Vòng đeo đo PPG với trái tim và sóng tín hiệu: trang đăng nhập, giới thiệu thiết bị */
export function WearableIllustration(props: IllustrationProps) {
  return (
    <Svg viewBox="0 0 260 260" {...props}>
      <defs>
        <linearGradient id="wb-screen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={C.navy2} />
          <stop offset="1" stopColor={C.navy} />
        </linearGradient>
        <linearGradient id="wb-heart" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.sky300} />
          <stop offset="1" stopColor={C.sky500} />
        </linearGradient>
      </defs>
      <circle cx="130" cy="130" r="118" fill={C.sky100} opacity="0.5" />
      <circle cx="130" cy="130" r="96" fill="none" stroke={C.sky200} strokeWidth="2" strokeDasharray="5 8" />
      <rect x="104" y="18" width="52" height="60" rx="14" fill={C.sky500} />
      <rect x="104" y="182" width="52" height="60" rx="14" fill={C.sky500} />
      <rect x="112" y="30" width="36" height="6" rx="3" fill={C.sky300} opacity="0.7" />
      <rect x="112" y="222" width="36" height="6" rx="3" fill={C.sky300} opacity="0.7" />
      <rect x="78" y="64" width="104" height="132" rx="28" fill={C.sky600} />
      <rect x="86" y="72" width="88" height="116" rx="22" fill="url(#wb-screen)" />
      <rect x="184" y="112" width="8" height="26" rx="4" fill={C.sky600} />
      <g transform="translate(94 86) scale(0.6)">
        <path d={HEART} fill="url(#wb-heart)" />
      </g>
      <path d="M96 142 H112 L118 130 L126 156 L134 142 H164" fill="none" stroke={C.mint} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="100" y="160" width="40" height="6" rx="3" fill={C.sky300} opacity="0.6" />
      <rect x="100" y="172" width="24" height="6" rx="3" fill={C.sky300} opacity="0.35" />
      <text x="150" y="104" fill={C.white} fontSize="13" fontWeight="700" fontFamily="inherit">72</text>
      <text x="150" y="116" fill={C.sky300} fontSize="8" fontWeight="600" fontFamily="inherit">BPM</text>
      <path d="M204 92 C216 104 216 156 204 168" fill="none" stroke={C.sky400} strokeWidth="3" strokeLinecap="round" />
      <path d="M220 78 C238 100 238 160 220 182" fill="none" stroke={C.sky300} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      <path d="M56 92 C44 104 44 156 56 168" fill="none" stroke={C.sky400} strokeWidth="3" strokeLinecap="round" />
      <path d="M40 78 C22 100 22 160 40 182" fill="none" stroke={C.sky300} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      <Sparkle x={212} y={52} />
      <Sparkle x={44} y={214} s={0.8} color={C.coral} />
      <Sparkle x={222} y={212} s={0.7} color={C.mint} />
    </Svg>
  )
}

/** Người dùng với tấm chắn: quản trị, bảo mật, tài khoản */
export function ShieldUserIllustration(props: IllustrationProps) {
  return (
    <Svg {...props}>
      <Shadow cy={164} rx={56} />
      <path d="M120 22 L182 44 V92 C182 128 156 152 120 164 C84 152 58 128 58 92 V44 Z" fill={C.sky500} />
      <path d="M120 34 L170 52 V92 C170 120 150 140 120 150 C90 140 70 120 70 92 V52 Z" fill={C.sky100} />
      <circle cx="120" cy="80" r="18" fill={C.sky400} />
      <path d="M88 130 C92 108 106 100 120 100 C134 100 148 108 152 130 C142 140 131 146 120 148 C109 146 98 140 88 130 Z" fill={C.sky400} />
      <circle cx="162" cy="126" r="12" fill={C.mint} stroke={C.white} strokeWidth="3" />
      <path d="M156 126 L160 130 L168 121" fill="none" stroke={C.white} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <Sparkle x={200} y={40} />
      <Sparkle x={42} y={60} s={0.7} color={C.coral} />
    </Svg>
  )
}
