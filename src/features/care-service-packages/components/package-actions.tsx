import { useState } from "react"
import { MoreHorizontal, Play, Pause, Trash2, Edit } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

import { consultationApi } from "@/features/consultations/services/consultation-api"
import type { CareServicePackage } from "@/features/consultations/types"

interface PackageActionsProps {
  pkg: CareServicePackage
  onUpdated: () => void
  onEdit: () => void
}

export function PackageActions({ pkg, onUpdated, onEdit }: PackageActionsProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  // Retire Confirmation Dialog state
  const [isRetireConfirmOpen, setIsRetireConfirmOpen] = useState(false)

  const handleAction = async (actionType: "ACTIVATE" | "DEACTIVATE" | "RETIRE") => {
    setLoading(true)
    try {
      if (actionType === "ACTIVATE") {
        await consultationApi.activateCareServicePackage(pkg.id)
        toast({ title: "Success", description: "Package activated successfully." })
      } else if (actionType === "DEACTIVATE") {
        await consultationApi.deactivateCareServicePackage(pkg.id)
        toast({ title: "Success", description: "Package deactivated successfully." })
      } else if (actionType === "RETIRE") {
        await consultationApi.retireCareServicePackage(pkg.id)
        toast({ title: "Success", description: "Package retired successfully." })
      }
      onUpdated()
    } catch (error: any) {
      let msg = error.response?.data?.message || `Failed to ${actionType.toLowerCase()} package`
      if (error.response?.data?.code === 409 || msg.includes("INVALID_CARE_SERVICE_PACKAGE_STATUS")) {
        msg = "Trạng thái gói không hợp lệ hoặc gói đã RETIRED."
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: msg,
      })
    } finally {
      setLoading(false)
      setIsRetireConfirmOpen(false)
    }
  }

  const isRetired = pkg.status === "RETIRED"

  if (isRetired) {
    return (
      <Button variant="ghost" className="h-8 w-8 p-0" onClick={onEdit}>
        <Edit className="h-4 w-4" />
        <span className="sr-only">View</span>
      </Button>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        } />
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Package
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            
            {pkg.status === "INACTIVE" && (
              <DropdownMenuItem onClick={() => handleAction("ACTIVATE")}>
                <Play className="mr-2 h-4 w-4" />
                Activate
              </DropdownMenuItem>
            )}

            {pkg.status === "ACTIVE" && (
              <DropdownMenuItem onClick={() => handleAction("DEACTIVATE")}>
                <Pause className="mr-2 h-4 w-4" />
                Deactivate
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600 focus:text-red-600 focus:bg-red-50" 
              onClick={() => setIsRetireConfirmOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Retire Package
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isRetireConfirmOpen} onOpenChange={setIsRetireConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn ngừng vĩnh viễn gói này? Gói RETIRED không thể bật lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault()
                handleAction("RETIRE")
              }}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={loading}
            >
              {loading ? "Retiring..." : "Retire"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
