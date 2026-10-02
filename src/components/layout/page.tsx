import { Fragment, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"

import { useDocumentTitle } from "@/hooks/use-document-title"
import { cn } from "@/lib/utils"

/*
 * Bố cục thống nhất cho mọi trang trong app. MainLayout lo sidebar + topbar + khoảng đệm; mỗi trang chỉ dựng:
 *
 *   <Page>
 *     <PageHeader title="..." description="..." actions={...} />   tiêu đề
 *     <PageBody>                                                    nội dung, chia phần bằng
 *       <PageSection title="..." description="...">...</PageSection>
 *     </PageBody>
 *     <PageFooter>...</PageFooter>                                  chân trang (tùy chọn): phân trang, nguồn, lưu ý
 *   </Page>
 */

interface PageProps {
  children: ReactNode
  /**
   * Trang kiểu ứng dụng cao đúng bằng phần màn hình còn lại (chat, workspace): PageBody co giãn và tự cuộn bên
   * trong, header và footer luôn hiện. Mặc định trang cao theo nội dung và cả cửa sổ cuộn.
   */
  fill?: boolean
  /**
   * Tràn hết vùng nội dung, bỏ khoảng đệm của <main> (chat, workspace): trang dính sát topbar và sidebar, cao đúng
   * phần màn hình còn lại. Dùng kèm `fill`; header và body tự lo khoảng đệm bên trong.
   */
  bleed?: boolean
  className?: string
}

/** Mọi trang trải hết chiều rộng vùng nội dung; khoảng đệm quanh trang do MainLayout quyết định (--app-page-pad). */
export function Page({ children, fill = false, bleed = false, className }: PageProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        bleed ? "w-auto -m-(--app-page-pad)" : "w-full",
        bleed
          ? "h-[calc(100dvh_-_var(--app-topbar-h))] min-h-[32rem] gap-0"
          : // Chiều cao còn lại = màn hình - topbar - khoảng đệm trên dưới của <main> (biến đặt ở MainLayout)
            fill
            ? "h-[calc(100dvh_-_var(--app-topbar-h)_-_2*var(--app-page-pad))] min-h-[32rem]"
            : "flex-1",
        className
      )}
    >
      {children}
    </div>
  )
}

export interface PageBreadcrumbItem {
  label: ReactNode
  /** Có `to` hoặc `onClick` thì là liên kết; mục cuối là trang hiện tại */
  to?: string
  onClick?: () => void
}

export function PageBreadcrumb({ items, className }: { items: PageBreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-muted-foreground", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        const linkClass = "font-medium hover:text-primary transition-colors cursor-pointer"
        return (
          <Fragment key={index}>
            {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
            {isLast && !item.to && !item.onClick ? (
              <span aria-current="page" className="font-semibold text-slate-900 line-clamp-1">
                {item.label}
              </span>
            ) : item.to ? (
              <Link to={item.to} className={linkClass}>
                {item.label}
              </Link>
            ) : item.onClick ? (
              <button type="button" onClick={item.onClick} className={linkClass}>
                {item.label}
              </button>
            ) : (
              <span>{item.label}</span>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}

interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  /** Icon trong ô vuông màu nhạt bên trái tiêu đề, ví dụ <Heart className="w-5 h-5" /> */
  icon?: ReactNode
  /** Nhãn nhỏ phía trên tiêu đề (nhóm, phân hệ) */
  eyebrow?: ReactNode
  breadcrumbs?: PageBreadcrumbItem[]
  /** Nút thao tác bên phải */
  actions?: ReactNode
  /** Badge, chip, thông tin phụ dưới mô tả */
  meta?: ReactNode
  /** Tiêu đề nhỏ hơn, dùng cho trang workspace cần nhường chỗ cho nội dung */
  compact?: boolean
  /**
   * Tiêu đề tab trình duyệt (cũng là tên file mặc định khi in / lưu PDF). Mặc định lấy `title` nếu là chuỗi;
   * truyền riêng khi `title` là JSX.
   */
  documentTitle?: string
  className?: string
}

export function PageHeader({
  title,
  description,
  icon,
  eyebrow,
  breadcrumbs,
  actions,
  meta,
  compact = false,
  documentTitle,
  className,
}: PageHeaderProps) {
  useDocumentTitle(documentTitle ?? (typeof title === "string" ? title : undefined))
  return (
    <header className={cn("flex flex-col gap-3 shrink-0", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && <PageBreadcrumb items={breadcrumbs} />}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          {icon && (
            <div className={cn("rounded-xl bg-primary/10 text-primary shrink-0", compact ? "p-2" : "p-2.5")}>{icon}</div>
          )}
          <div className="min-w-0 space-y-1">
            {eyebrow && <div className="text-xs font-semibold text-primary">{eyebrow}</div>}
            <h1
              className={cn(
                "font-bold tracking-tight text-slate-900 break-words",
                compact ? "text-lg sm:text-xl" : "text-2xl sm:text-3xl"
              )}
            >
              {title}
            </h1>
            {description && (
              <div className="text-sm text-muted-foreground leading-relaxed max-w-3xl">{description}</div>
            )}
            {meta && <div className="flex flex-wrap items-center gap-2 pt-1">{meta}</div>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </header>
  )
}

/** Nội dung chính. Trong trang `fill`, phần này chiếm chỗ còn lại; phần tử con tự lo cuộn. */
export function PageBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex-1 min-h-0 min-w-0 flex flex-col gap-4", className)}>{children}</div>
}

interface PageSectionProps {
  title: ReactNode
  description?: ReactNode
  /** Nút thao tác bên phải tiêu đề */
  actions?: ReactNode
  children?: ReactNode
  className?: string
}

/** Một phần trong PageBody: tiêu đề + mô tả cùng một kiểu ở mọi trang, nội dung bên dưới. */
export function PageSection({ title, description, actions, children, className }: PageSectionProps) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
      </div>
      {children}
    </section>
  )
}

/** Chân trang: phân trang, nguồn dữ liệu, lưu ý y khoa, liên kết liên quan. Luôn nằm cuối trang. */
export function PageFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <footer
      className={cn(
        "shrink-0 flex flex-col gap-3 border-t border-border pt-3 text-xs text-muted-foreground leading-relaxed",
        className
      )}
    >
      {children}
    </footer>
  )
}
