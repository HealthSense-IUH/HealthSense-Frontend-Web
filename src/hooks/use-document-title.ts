import { useEffect } from "react"

export const APP_NAME = "HealthSense"

/** Tiêu đề tab theo trang, ví dụ "Cá hồi nướng | HealthSense". */
export function formatDocumentTitle(title: string) {
  return `${title} | ${APP_NAME}`
}

/**
 * Đặt tiêu đề tab trình duyệt cho trang hiện tại và trả lại tiêu đề cũ khi rời trang.
 * Trình duyệt dùng tiêu đề này làm tên file mặc định khi in / lưu PDF, nên mỗi trang cần tiêu đề riêng.
 */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    if (!title) return
    const previous = document.title
    document.title = formatDocumentTitle(title)
    return () => {
      document.title = previous
    }
  }, [title])
}
