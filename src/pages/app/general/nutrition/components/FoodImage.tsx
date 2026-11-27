import { useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface FoodImageProps {
  src?: string
  alt: string
  className?: string
  imgClassName?: string
  fallback?: ReactNode
  children?: ReactNode
}

/** Ảnh thực phẩm có lazy-load và tự ẩn/fallback gọn gàng nếu đường dẫn ảnh lỗi hoặc mất mạng. */
export function FoodImage({ src, alt, className, imgClassName, fallback = null, children }: FoodImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  if (!src || failedSrc === src) {
    return <>{fallback}</>
  }

  return (
    <div className={cn("relative overflow-hidden bg-slate-100", className)}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setFailedSrc(src)}
        className={cn("h-full w-full object-cover transition-transform duration-300", imgClassName)}
      />
      {children}
    </div>
  )
}
