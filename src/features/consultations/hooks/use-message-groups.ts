import { useMemo } from "react"
import type { ConsultationMessageItem } from "../types"

export interface MessageGroup {
  id: string
  senderId: string | number | null
  senderRole: string
  messages: ConsultationMessageItem[]
  date: string
}

const GROUPING_THRESHOLD_MS = 2 * 60 * 1000 // 2 minutes

export function useMessageGroups(messages: ConsultationMessageItem[]) {
  return useMemo(() => {
    const groups: MessageGroup[] = []
    let currentGroup: MessageGroup | null = null

    for (const msg of messages) {
      const msgDate = new Date(msg.createdAt || 0)
      const dateStr = msgDate.toDateString()
      const timeMs = msgDate.getTime()

      if (!currentGroup) {
        currentGroup = {
          id: `group-${msg.id}`,
          senderId: msg.senderId || null,
          senderRole: msg.senderRole,
          date: dateStr,
          messages: [msg],
        }
        groups.push(currentGroup)
        continue
      }

      const lastMsg = currentGroup.messages[currentGroup.messages.length - 1]
      const lastTimeMs = new Date(lastMsg.createdAt || 0).getTime()
      
      const isSameSender = 
        (msg.senderId && currentGroup.senderId && String(msg.senderId) === String(currentGroup.senderId)) ||
        (!msg.senderId && !currentGroup.senderId && msg.senderRole === currentGroup.senderRole) ||
        (msg.senderRole === currentGroup.senderRole) // Fallback for robust role-based grouping if id is missing

      const isSameDay = currentGroup.date === dateStr
      const isWithinThreshold = timeMs - lastTimeMs < GROUPING_THRESHOLD_MS
      const isSystem = msg.senderRole === "SYSTEM"

      if (isSameSender && isSameDay && isWithinThreshold && !isSystem && currentGroup.senderRole !== "SYSTEM") {
        currentGroup.messages.push(msg)
      } else {
        currentGroup = {
          id: `group-${msg.id}`,
          senderId: msg.senderId || null,
          senderRole: msg.senderRole,
          date: dateStr,
          messages: [msg],
        }
        groups.push(currentGroup)
      }
    }
    return groups
  }, [messages])
}
