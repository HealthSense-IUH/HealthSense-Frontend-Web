import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import { Link } from "react-router-dom"

import { cn } from "@/lib/utils"

/** Đường dẫn nội bộ của app (trợ lý dẫn link tới trang) thì điều hướng bằng router, không tải lại trang. */
function isInternalPath(href?: string) {
  return Boolean(href && href.startsWith("/") && !href.startsWith("//"))
}

const components: Components = {
  a({ href, children }) {
    if (isInternalPath(href)) {
      return (
        <Link to={href!} className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80">
          {children}
        </Link>
      )
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
      >
        {children}
      </a>
    )
  },
  p({ children }) {
    return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
  },
  ul({ children }) {
    return <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>
  },
  ol({ children }) {
    return <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>
  },
  strong({ children }) {
    return <strong className="font-bold text-foreground">{children}</strong>
  },
  code({ children, className }) {
    const block = Boolean(className)
    return block ? (
      <pre className="my-2 overflow-x-auto rounded-lg bg-muted p-3 text-xs">
        <code>{children}</code>
      </pre>
    ) : (
      <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">{children}</code>
    )
  },
  table({ children }) {
    return (
      <div className="my-2 overflow-x-auto">
        <table className="w-full border-collapse text-xs">{children}</table>
      </div>
    )
  },
  th({ children }) {
    return <th className="border border-border bg-muted px-2 py-1 text-left font-semibold">{children}</th>
  },
  td({ children }) {
    return <td className="border border-border px-2 py-1 align-top">{children}</td>
  },
}

export function AssistantMarkdown({ content, className }: { content: string; className?: string }) {
  return (
    <div className={cn("text-sm text-foreground/90", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
