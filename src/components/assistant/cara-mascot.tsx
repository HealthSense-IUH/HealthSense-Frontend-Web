import { useId } from "react"

import { cn } from "@/lib/utils"

export type CaraMood = "happy" | "thinking"

const HEART =
  "M60 106 C30 86 10 66 10 42 C10 26 22 14 38 14 C48 14 56 20 60 30 C64 20 72 14 82 14 C98 14 110 26 110 42 C110 66 90 86 60 106 Z"

/**
 * Cara: linh vật của trợ lý HealthSense. Trái tim màu xanh chủ đạo, viền trắng kiểu sticker để nổi trên mọi nền,
 * đường điện tim ngang ngực (gợi tính năng theo dõi rung nhĩ) và tia sáng nhỏ gợi ý AI.
 * Vẽ bằng SVG inline để co giãn sắc nét; mắt tự chớp, khi `mood="thinking"` mắt nhìn lên và điện tim chạy.
 */
export function CaraMascot({
  size = 40,
  mood = "happy",
  className,
  title = "Cara",
}: {
  size?: number
  mood?: CaraMood
  className?: string
  title?: string
}) {
  const gradientId = `cara-body-${useId().replace(/:/g, "")}`
  const thinking = mood === "thinking"

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>

      {/* Thân: viền trắng dày phía dưới, viền xanh đậm mảnh phía trên */}
      <path d={HEART} fill={`url(#${gradientId})`} stroke="#ffffff" strokeWidth="7" strokeLinejoin="round" />
      <path d={HEART} fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinejoin="round" />
      <ellipse cx="38" cy="32" rx="9" ry="5" fill="#ffffff" opacity="0.35" transform="rotate(-25 38 32)" />

      {/* Má hồng */}
      <ellipse cx="36" cy="60" rx="6" ry="3.5" fill="#fb7185" opacity="0.55" />
      <ellipse cx="84" cy="60" rx="6" ry="3.5" fill="#fb7185" opacity="0.55" />

      {/* Mắt: chớp định kỳ; khi suy nghĩ thì ánh mắt nhìn lên */}
      {[46, 74].map((x) => (
        <g key={x} transform={`translate(${x} 50)`}>
          <g>
            <animateTransform
              attributeName="transform"
              type="scale"
              values="1 1;1 1;1 0.1;1 1;1 1"
              keyTimes="0;0.9;0.93;0.96;1"
              dur="4.5s"
              repeatCount="indefinite"
            />
            <circle r="5.5" fill="#0c4a6e" />
            <circle cx={thinking ? 2 : -1.8} cy={thinking ? -2.6 : -1.8} r="1.9" fill="#ffffff" />
          </g>
        </g>
      ))}

      {/* Miệng */}
      {thinking ? (
        <ellipse cx="60" cy="69" rx="3.6" ry="4.2" fill="#0c4a6e" />
      ) : (
        <path d="M50 65 Q60 76 70 65" fill="none" stroke="#0c4a6e" strokeWidth="3" strokeLinecap="round" />
      )}

      {/* Đường điện tim; chạy khi đang suy nghĩ */}
      <path
        d="M45 86 H52 L55 78 L59 94 L62 86 H75"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={thinking ? "72" : undefined}
      >
        {thinking && <animate attributeName="stroke-dashoffset" values="72;0" dur="1.1s" repeatCount="indefinite" />}
      </path>

      {/* Tia sáng AI */}
      <path d="M104 2 L106.5 9.5 L114 12 L106.5 14.5 L104 22 L101.5 14.5 L94 12 L101.5 9.5 Z" fill="#fbbf24" />
    </svg>
  )
}
