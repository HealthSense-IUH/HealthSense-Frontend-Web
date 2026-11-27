import { create } from "zustand"
import { useAuthStore } from "@/stores/auth-store"
import type { FoodLogEntry, NutrientValue } from "@/types/nutrition"

export const DAILY_CALORIE_TARGET = 2000
export const DAILY_SODIUM_LIMIT_MG = 2000
export const DAILY_SODIUM_CAUTION_MG = 1500
export const DAILY_POTASSIUM_TARGET_MG = 3500

export function getTodayDateKey(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function getActiveStorageKey(): string {
  const userId = useAuthStore.getState().userSession?.userId ?? "guest"
  return `healthsense.foodLog:${userId}:${getTodayDateKey()}`
}

function readEntries(key: string): FoodLogEntry[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as FoodLogEntry[]) : []
  } catch {
    return []
  }
}

function writeEntries(key: string, entries: FoodLogEntry[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(key, JSON.stringify(entries))
  } catch {
    // Ignore storage quota errors
  }
}

export function extractNutrientsForLog(nutrients: NutrientValue[], factor = 1) {
  const pick = (code: string) => {
    const found = nutrients.find((n) => n.nutrientCode === code)
    return found ? Math.round(found.amount * factor * 10) / 10 : 0
  }
  return {
    energyKcal: pick("energy"),
    proteinG: pick("protein"),
    carbohydrateG: pick("carbohydrate"),
    fatTotalG: pick("fat_total"),
    sodiumMg: pick("sodium"),
    potassiumMg: pick("potassium"),
    sugarsG: pick("sugars"),
  }
}

interface FoodLogState {
  storageKey: string
  entries: FoodLogEntry[]
  syncToday: () => void
  addEntry: (entry: Omit<FoodLogEntry, "id" | "loggedAt">) => void
  removeEntry: (id: string) => void
  clearToday: () => void
}

const initialKey = getActiveStorageKey()

export const useFoodLogStore = create<FoodLogState>((set, get) => ({
  storageKey: initialKey,
  entries: readEntries(initialKey),

  syncToday: () => {
    const key = getActiveStorageKey()
    if (key !== get().storageKey) {
      set({ storageKey: key, entries: readEntries(key) })
    }
  },

  addEntry: (entry) => {
    const key = getActiveStorageKey()
    const current = key === get().storageKey ? get().entries : readEntries(key)
    const next: FoodLogEntry[] = [
      {
        ...entry,
        id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        loggedAt: Date.now(),
      },
      ...current,
    ]
    writeEntries(key, next)
    set({ storageKey: key, entries: next })
  },

  removeEntry: (id) => {
    const key = getActiveStorageKey()
    const current = key === get().storageKey ? get().entries : readEntries(key)
    const next = current.filter((item) => item.id !== id)
    writeEntries(key, next)
    set({ storageKey: key, entries: next })
  },

  clearToday: () => {
    const key = getActiveStorageKey()
    writeEntries(key, [])
    set({ storageKey: key, entries: [] })
  },
}))
