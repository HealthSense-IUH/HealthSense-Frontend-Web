import { Fragment, type ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"
import { ChevronRight, Home } from "lucide-react"
import { useTranslation } from "react-i18next"

import { getDefaultGeneralRouteForRole, getDefaultRouteForRole } from "@/constants"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"
import { allNavigationGroups, isManagementPath } from "./nav-config"

/*
 * Bố cục thống nhất cho mọi trang trong app. MainLayout lo sidebar + topbar + khoảng đệm; mỗi trang chỉ dựng:
 *
 *   <Page>
 *     <PageHeader title="..." description="..." actions={...} />   tiêu đề (+ breadcrumb tự suy từ đường dẫn)
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
        "flex flex-col gap-4 motion-safe:animate-fade-up",
        bleed ? "w-auto -m-(--app-page-pad)" : "w-full",
        // Khi fill: chiều cao còn lại = màn hình - topbar - khoảng đệm trên dưới của <main> (biến đặt ở MainLayout)
        bleed
          ? "h-[calc(100dvh_-_var(--app-topbar-h))] min-h-[32rem] gap-0"
          : fill
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
  const { t } = useTranslation()
  return (
    <nav
      aria-label={t("common.breadcrumb")}
      className={cn("flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground sm:text-[13px]", className)}
    >
      <Home className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        const linkClass = "font-medium transition-colors hover:text-primary cursor-pointer"
        return (
          <Fragment key={index}>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
            {isLast && !item.to && !item.onClick ? (
              <span aria-current="page" className="line-clamp-1 font-semibold text-slate-900">
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

/**
 * Breadcrumb tự suy từ đường dẫn: Phân hệ (Cá nhân / Quản trị) › mục điều hướng khớp dài nhất › trang hiện tại
 * (chỉ thêm khi đường dẫn sâu hơn mục đó, ví dụ chi tiết người dùng). Trang nào cần khác thì truyền `breadcrumbs`.
 */
function useAutoBreadcrumbs(title: ReactNode): PageBreadcrumbItem[] {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const role = useAuthStore((state) => state.userSession?.role)

  const inManagement = isManagementPath(pathname)
  const crumbs: PageBreadcrumbItem[] = [
    {
      label: t(inManagement ? "areaSwitch.management" : "areaSwitch.general"),
      to: inManagement ? getDefaultRouteForRole(role) : getDefaultGeneralRouteForRole(role),
    },
  ]

  const match = allNavigationGroups
    .flatMap((group) => group.items)
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]

  if (match) {
    const label = t(`nav.item.${match.id}`, { defaultValue: match.title ?? match.id })
    const deeper = pathname !== match.href
    crumbs.push(deeper ? { label, to: match.href } : { label })
    // Đường dẫn sâu hơn mục điều hướng (chi tiết, tab con): thêm trang hiện tại, trừ khi trùng nhãn mục
    if (deeper && title && !(typeof title === "string" && title === label)) crumbs.push({ label: title })
  } else if (title) {
    crumbs.push({ label: title })
  }
  return crumbs
}

interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  /** Icon trong ô vuông gradient bên trái tiêu đề, ví dụ <Heart className="w-5 h-5" /> */
  icon?: ReactNode
  /** Nhãn nhỏ phía trên tiêu đề (nhóm, phân hệ) */
  eyebrow?: ReactNode
  /** Truyền để thay breadcrumb tự động; mảng rỗng để ẩn */
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
  const autoCrumbs = useAutoBreadcrumbs(title)
  const crumbs = breadcrumbs ?? autoCrumbs

  return (
    <header className={cn("flex shrink-0 flex-col gap-3", className)}>
      {crumbs.length > 0 && <PageBreadcrumb items={crumbs} />}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3.5">
          {icon && (
            <div
              className={cn(
                "flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md shadow-primary-600/25 [&_svg]:text-white",
                compact ? "h-10 w-10" : "h-12 w-12"
              )}
            >
              {icon}
            </div>
          )}
          <div className="min-w-0 space-y-1">
            {eyebrow && <div className="text-xs font-bold uppercase tracking-wider text-primary">{eyebrow}</div>}
            <h1
              className={cn(
                "break-words font-extrabold tracking-tight text-slate-900",
                compact ? "text-lg sm:text-xl" : "text-2xl sm:text-3xl"
              )}
            >
              {title}
            </h1>
            {description && <div className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{description}</div>}
            {meta && <div className="flex flex-wrap items-center gap-2 pt-1">{meta}</div>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}

/** Nội dung chính. Trong trang `fill`, phần này chiếm chỗ còn lại; phần tử con tự lo cuộn. */
export function PageBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col gap-4", className)}>{children}</div>
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
          <h2 className="text-lg font-bold tracking-tight text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
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
        "flex shrink-0 flex-col gap-3 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground",
        className
      )}
    >
      {children}
    </footer>
  )
}
