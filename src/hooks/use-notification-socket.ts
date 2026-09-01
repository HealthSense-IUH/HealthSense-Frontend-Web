import { useEffect, useRef, useState } from "react"
import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"

import { env } from "@/config"
import { useAuthStore } from "@/stores/auth-store"

/**
 * Kênh realtime cho chuông thông báo.
 *
 * Server đẩy "ping" (chỉ chứa loại thông báo, không kèm nội dung) vào:
 * - /queue/notifications/{userId}        — thông báo đích danh
 * - /topic/notifications/roles/{ROLE}    — thông báo theo vai
 * (cả hai đích được server gác quyền subscribe theo đúng user/role)
 *
 * Nhận ping thì gọi onPing — chuông tự refetch số chưa đọc qua REST.
 * Trả về `connected` để chuông biết lúc nào cần bật polling dự phòng.
 */
export function useNotificationSocket(onPing: () => void) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const userSession = useAuthStore((state) => state.userSession)
  const [connected, setConnected] = useState(false)
  const onPingRef = useRef(onPing)

  useEffect(() => {
    onPingRef.current = onPing
  }, [onPing])

  const userId = userSession?.userId
  const role = userSession?.role

  useEffect(() => {
    if (!accessToken || !userId || !role) {
      setConnected(false)
      return
    }

    const stompClient = new Client({
      reconnectDelay: 5000,
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      webSocketFactory: () => new SockJS(`${env.API_BASE_URL}/ws/consultations`),
      onConnect: () => {
        setConnected(true)
        stompClient.subscribe(`/queue/notifications/${userId}`, () => onPingRef.current())
        stompClient.subscribe(`/topic/notifications/roles/${role}`, () => onPingRef.current())
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
      onWebSocketError: () => setConnected(false),
    })

    stompClient.activate()

    return () => {
      setConnected(false)
      void stompClient.deactivate()
    }
  }, [accessToken, userId, role])

  return { connected }
}
