import { useEffect, useMemo, useRef, useState } from "react"
import { Client, type IMessage } from "@stomp/stompjs"
import SockJS from "sockjs-client"

import { env } from "@/config"
import { useAuthStore } from "@/features/auth/auth-store"
import type { ApiResponse } from "@/types/base"
import type { ConsultationMessageItem, SendConsultationMessagePayload } from "@/types/consultation"

type SocketStatus = "idle" | "connecting" | "connected" | "error"

export function useConsultationSocket(
  sessionId: string | number | null,
  onMessage: (message: ConsultationMessageItem) => void
) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const [connectionStatus, setConnectionStatus] = useState<SocketStatus>("connecting")
  const clientRef = useRef<Client | null>(null)

  useEffect(() => {
    if (!sessionId || !accessToken) {
      return
    }

    const stompClient = new Client({
      reconnectDelay: 4000,
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      webSocketFactory: () => new SockJS(`${env.API_BASE_URL}/ws/consultations`),
      onConnect: () => {
        setConnectionStatus("connected")
        stompClient.subscribe(`/topic/consultation-sessions/${sessionId}`, (frame: IMessage) => {
          const parsed = JSON.parse(frame.body) as ApiResponse<ConsultationMessageItem>
          if (parsed.data) {
            onMessage(parsed.data)
          }
        })
      },
      onStompError: () => setConnectionStatus("error"),
      onWebSocketError: () => setConnectionStatus("error"),
    })

    clientRef.current = stompClient
    stompClient.activate()

    return () => {
      clientRef.current = null
      void stompClient.deactivate()
    }
  }, [accessToken, onMessage, sessionId])

  const sendSocketMessage = useMemo(
    () => (payload: SendConsultationMessagePayload) => {
      const client = clientRef.current
      if (!client?.connected || !sessionId) {
        return false
      }

      client.publish({
        destination: `/app/consultation-sessions/${sessionId}/messages`,
        body: JSON.stringify(payload),
      })
      return true
    },
    [sessionId]
  )

  const status = sessionId && accessToken ? connectionStatus : "idle"

  return { status, sendSocketMessage }
}
