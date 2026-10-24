export type AssistantConversation = {
  id: string
  title: string | null
  createdAt: string
  updatedAt: string
}

export type AssistantRole = "user" | "assistant"

export type AssistantMessage = {
  id: string
  role: AssistantRole
  content: string
  /** Đang nhận từng mẩu chữ qua SSE, chưa kết thúc. */
  streaming?: boolean
  /** Lượt này kết thúc bằng lỗi từ máy chủ. */
  error?: boolean
}

/** Sự kiện SSE từ POST /api/assistant/conversations/{id}/stream */
export type AssistantStreamEvent =
  | { event: "delta"; text: string }
  | { event: "done" }
  | { event: "error"; message: string }
