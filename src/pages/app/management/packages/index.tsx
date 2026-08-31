import { useEffect, useState, useCallback } from "react"
import { Package, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

import { consultationApi } from "@/services"
import type { CareServicePackage, CareServicePackageStatus } from "@/types/consultation"

import { CreatePackageDialog } from "@/features/care-service-packages/components/create-package-dialog"
import { EditPackageDialog } from "@/features/care-service-packages/components/edit-package-dialog"
import { PackageActions } from "@/features/care-service-packages/components/package-actions"

export default function AdminPackagesPage() {
  const { toast } = useToast()
  const [packages, setPackages] = useState<CareServicePackage[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<CareServicePackage | null>(null)

  const loadPackages = useCallback(async () => {
    setLoading(true)
    try {
      const response = await consultationApi.listAdminCareServicePackages({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        page: 1,
        size: 50,
      })
      setPackages(response.data.content)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "Failed to load packages",
      })
    } finally {
      setLoading(false)
    }
  }, [statusFilter, toast])

  useEffect(() => {
    void loadPackages()
  }, [loadPackages])

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency || 'VND' }).format(amount)
  }

  const getStatusBadge = (status: CareServicePackageStatus) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">Active</Badge>
      case "INACTIVE":
        return <Badge variant="secondary" className="bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200">Inactive</Badge>
      case "RETIRED":
        return <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">Retired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="w-full space-y-6 p-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Care Service Packages</h1>
          <p className="text-muted-foreground mt-1">
            Manage care service packages, pricing, and availability.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Package
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Packages</CardTitle>
              <CardDescription>View and manage all service packages.</CardDescription>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="RETIRED">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Renewable</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Loading packages...
                    </TableCell>
                  </TableRow>
                ) : packages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <Package className="w-8 h-8 mx-auto mb-3 opacity-20" />
                      No packages found.
                    </TableCell>
                  </TableRow>
                ) : (
                  packages.map((pkg) => (
                    <TableRow key={pkg.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setEditingPackage(pkg)}>
                      <TableCell className="font-mono text-xs">{pkg.code}</TableCell>
                      <TableCell className="font-medium">{pkg.name}</TableCell>
                      <TableCell>{formatCurrency(pkg.priceAmount, pkg.currency)}</TableCell>
                      <TableCell>{pkg.durationDays} ngày</TableCell>
                      <TableCell>{pkg.renewable ? "Có" : "Không"}</TableCell>
                      <TableCell>{getStatusBadge(pkg.status)}</TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <PackageActions 
                          pkg={pkg} 
                          onUpdated={loadPackages} 
                          onEdit={() => setEditingPackage(pkg)} 
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CreatePackageDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
        onSuccess={loadPackages} 
      />

      {editingPackage && (
        <EditPackageDialog 
          pkg={editingPackage} 
          open={!!editingPackage} 
          onOpenChange={(open) => !open && setEditingPackage(null)} 
          onSuccess={loadPackages} 
        />
      )}
    </div>
  )
}
