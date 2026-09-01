import { useEffect, useMemo, useRef, useState } from "react"
import { Client, type IMessage } from "@stomp/stompjs"
import SockJS from "sockjs-client"

import { env } from "@/config"
import { useAuthStore } from "@/stores/auth-store"
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
    // If no sessionId or accessToken, ensure any existing client is disconnected
    if (!sessionId || !accessToken) {
      if (clientRef.current) {
        void clientRef.current.deactivate()
        clientRef.current = null
      }
      setConnectionStatus("idle")
      return
    }

    // Clean up any previously connected instance before creating a new one
    if (clientRef.current) {
      void clientRef.current.deactivate()
      clientRef.current = null
    }

    setConnectionStatus("connecting")

    const stompClient = new Client({
      reconnectDelay: 4000,
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      webSocketFactory: () => new SockJS(`${env.API_BASE_URL}/ws/consultations`),
      onConnect: () => {
        setConnectionStatus("connected")
        stompClient.subscribe(`/topic/consultation-sessions/${sessionId}`, (frame: IMessage) => {
          try {
            const parsed = JSON.parse(frame.body) as ApiResponse<ConsultationMessageItem> & ConsultationMessageItem
            // Support both wrapped ApiResponse { code: 1000, data: { ... } } and raw ConsultationMessageItem
            const messageData: ConsultationMessageItem | undefined = parsed?.data
              ? parsed.data
              : parsed?.id && parsed?.sessionId
                ? parsed
                : undefined

            if (messageData) {
              onMessage(messageData)
            } else {
              if (import.meta.env.DEV) {
                console.warn(
                  "[WebSocket] Received frame body that does not match expected ApiResponse or ConsultationMessageItem shape:",
                  frame.body
                )
              }
            }
          } catch (e) {
            if (import.meta.env.DEV) {
              console.error("[WebSocket] Failed to parse message frame body:", e, frame.body)
            }
          }
        })
      },
      onStompError: (frame) => {
        if (import.meta.env.DEV) {
          console.warn("[WebSocket] STOMP error frame:", frame)
        }
        setConnectionStatus("error")
      },
      onWebSocketError: (event) => {
        if (import.meta.env.DEV) {
          console.warn("[WebSocket] Transport error:", event)
        }
        setConnectionStatus("error")
      },
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
