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
  Wheat: { icon: Wheat, color: "text-warning-600" },
  Sprout: { icon: Sprout, color: "text-success-600" },
  Nut: { icon: Nut, color: "text-warning-700" },
  Carrot: { icon: Carrot, color: "text-success-600" },
  Apple: { icon: Apple, color: "text-danger-500" },
  Beef: { icon: Beef, color: "text-danger-600" },
  Fish: { icon: Fish, color: "text-primary-600" },
  Egg: { icon: Egg, color: "text-warning-600" },
  Milk: { icon: Milk, color: "text-primary-500" },
  Droplet: { icon: Droplet, color: "text-warning-500" },
  Candy: { icon: Candy, color: "text-danger-500" },
  Soup: { icon: Soup, color: "text-warning-600" },
  CupSoda: { icon: CupSoda, color: "text-primary-500" },
  CookingPot: { icon: CookingPot, color: "text-slate-600" },
  Package: { icon: Package, color: "text-slate-500" },
}

export function FoodGroupIcon({ icon, className }: { icon?: string; className?: string }) {
  const entry = icon ? GROUP_ICONS[icon] : undefined
  const Icon = entry?.icon ?? Utensils
  return <Icon className={cn("w-5 h-5", entry?.color ?? "text-primary", className)} />
}
