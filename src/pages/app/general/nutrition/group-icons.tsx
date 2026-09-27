import {
  Apple,
  Beef,
  Candy,
  Carrot,
  CookingPot,
  CupSoda,
  Droplet,
  Egg,
  Fish,
  type LucideIcon,
  Milk,
  Nut,
  Package,
  Soup,
  Sprout,
  Utensils,
  Wheat,
} from "lucide-react"

import { cn } from "@/lib/utils"

/** Icon của nhóm thực phẩm: backend trả tên icon lucide (cột nutrition_food_groups.icon). */
const GROUP_ICONS: Record<string, { icon: LucideIcon; color: string }> = {
  Wheat: { icon: Wheat, color: "text-amber-600" },
  Sprout: { icon: Sprout, color: "text-lime-600" },
  Nut: { icon: Nut, color: "text-amber-700" },
  Carrot: { icon: Carrot, color: "text-emerald-600" },
  Apple: { icon: Apple, color: "text-rose-500" },
  Beef: { icon: Beef, color: "text-rose-600" },
  Fish: { icon: Fish, color: "text-cyan-600" },
  Egg: { icon: Egg, color: "text-yellow-600" },
  Milk: { icon: Milk, color: "text-sky-500" },
  Droplet: { icon: Droplet, color: "text-yellow-500" },
  Candy: { icon: Candy, color: "text-pink-500" },
  Soup: { icon: Soup, color: "text-orange-600" },
  CupSoda: { icon: CupSoda, color: "text-indigo-500" },
  CookingPot: { icon: CookingPot, color: "text-slate-600" },
  Package: { icon: Package, color: "text-slate-500" },
}

export function FoodGroupIcon({ icon, className }: { icon?: string; className?: string }) {
  const entry = icon ? GROUP_ICONS[icon] : undefined
  const Icon = entry?.icon ?? Utensils
  return <Icon className={cn("w-5 h-5", entry?.color ?? "text-primary", className)} />
}
