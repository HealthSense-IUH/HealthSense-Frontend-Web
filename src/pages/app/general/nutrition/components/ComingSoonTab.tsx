import type { LucideIcon } from "lucide-react"
import { Clock } from "lucide-react"

interface ComingSoonTabProps {
  icon: LucideIcon
  title: string
  description: string
  highlights: string[]
  note?: string
}

/** Nội dung tạm cho tab chưa phát triển: giới thiệu tính năng sẽ làm gì, không giả lập dữ liệu. */
export function ComingSoonTab({ icon: Icon, title, description, highlights, note }: ComingSoonTabProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 sm:p-6 text-center space-y-5">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
        <Icon className="w-7 h-7" />
      </div>
      <div className="space-y-2 max-w-xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-warning-50 text-warning-700 border border-warning-200 text-[11px] font-medium">
          <Clock className="w-3 h-3" />
          Sắp ra mắt
        </span>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
      <ul className="max-w-md mx-auto text-left space-y-2">
        {highlights.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {note && <p className="text-xs text-muted-foreground italic max-w-md mx-auto">{note}</p>}
    </div>
  )
}
