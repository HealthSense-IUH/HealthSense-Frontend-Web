import axiosClient, { refreshAccessToken } from "@/lib/axiosClient"
import { env } from "@/config"
import { currentLanguage } from "@/lib/i18n"
import { useAuthStore } from "@/stores/auth-store"
import type { AssistantConversation, AssistantMessage, AssistantStreamEvent } from "@/types/assistant"
import type { ApiResponse } from "@/types/base"

type HistoryMessage = Pick<AssistantMessage, "role" | "content">

export const assistantApi = {
  listConversations() {
    return axiosClient.get<ApiResponse<AssistantConversation[]>, ApiResponse<AssistantConversation[]>>(
      "/api/assistant/conversations"
    )
  },

  createConversation() {
    return axiosClient.post<ApiResponse<AssistantConversation>, ApiResponse<AssistantConversation>>(
      "/api/assistant/conversations"
    )
  },

  getMessages(conversationId: string) {
    return axiosClient.get<ApiResponse<HistoryMessage[]>, ApiResponse<HistoryMessage[]>>(
      `/api/assistant/conversations/${conversationId}/messages`
    )
  },

  deleteConversation(conversationId: string) {
    return axiosClient.delete<void, void>(`/api/assistant/conversations/${conversationId}`)
  },

  /**
   * Gửi một lượt hỏi và nhận câu trả lời theo thời gian thực (Server-Sent Events).
   * Dùng fetch thay vì EventSource vì cần gửi header Authorization và body POST.
   * Gọi onEvent cho từng sự kiện; trả về khi luồng đóng. Huỷ bằng AbortSignal.
   */
  async streamChat(
    conversationId: string,
    message: string,
    onEvent: (event: AssistantStreamEvent) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const url = `${env.API_BASE_URL}/api/assistant/conversations/${conversationId}/stream`
    const lang = currentLanguage()

    const doFetch = (token: string | null) =>
      fetch(url, {
        method: "POST",
        credentials: "include",
        signal,
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          lang,
          "Accept-Language": lang,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message }),
      })

    let response = await doFetch(useAuthStore.getState().accessToken)
    if (response.status === 401) {
      const refreshed = await refreshAccessToken()
      if (!refreshed) throw new Error("UNAUTHORIZED")
      response = await doFetch(refreshed)
    }
    if (!response.ok || !response.body) {
      throw new Error(`HTTP ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder("utf-8")
    let buffer = ""

    const dispatch = (rawEvent: string) => {
      let eventName = "message"
      const dataLines: string[] = []
      for (const line of rawEvent.split("\n")) {
        if (line.startsWith("event:")) eventName = line.slice(6).trim()
        else if (line.startsWith("data:")) dataLines.push(line.slice(5).replace(/^ /, ""))
      }
      if (dataLines.length === 0) return
      let payload: unknown
      try {
        payload = JSON.parse(dataLines.join("\n"))
      } catch {
        payload = { text: dataLines.join("\n") }
      }
      const data = payload as { text?: string; message?: string }
      if (eventName === "delta") onEvent({ event: "delta", text: data.text ?? "" })
      else if (eventName === "done") onEvent({ event: "done" })
      else if (eventName === "error") onEvent({ event: "error", message: data.message ?? "" })
    }

    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      // Mỗi sự kiện SSE kết thúc bằng một dòng trống
      let boundary = buffer.indexOf("\n\n")
      while (boundary !== -1) {
        const rawEvent = buffer.slice(0, boundary).replace(/\r/g, "")
        buffer = buffer.slice(boundary + 2)
        dispatch(rawEvent)
        boundary = buffer.indexOf("\n\n")
      }
    }
    if (buffer.trim()) dispatch(buffer.replace(/\r/g, ""))
  },
}
