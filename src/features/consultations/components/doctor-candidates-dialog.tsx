import { useEffect, useState, useCallback } from "react"
import { Search, Stethoscope, Star, AlertTriangle, UserCog } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

import { consultationApi } from "../services/consultation-api"
import type { DoctorCandidateResponse } from "../types"

export function DoctorCandidatesDialog({
  requestId,
  open,
  onOpenChange,
  onReserveDoctor,
  onOpenCareProfile,
}: {
  requestId: number | string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onReserveDoctor: (doctorId: number) => void
  onOpenCareProfile: (doctorId: number) => void
}) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [candidates, setCandidates] = useState<DoctorCandidateResponse[]>([])
  
  const [keyword, setKeyword] = useState("")
  const [specialty, setSpecialty] = useState<string>("ALL")
  const [eligibleOnly, setEligibleOnly] = useState(true)

  const fetchCandidates = useCallback(() => {
    if (!requestId || !open) return
    setLoading(true)
    consultationApi.listDoctorCandidates(requestId, {
      keyword: keyword.trim() || undefined,
      specialty: specialty === "ALL" ? undefined : specialty,
      eligibleOnly: eligibleOnly || undefined,
      page: 1,
      size: 10, // Avoid too large size in case backend throws 500
    })
      .then(res => setCandidates(res.data?.content || []))
      .catch(err => toast({ variant: "destructive", description: "Failed to load doctor candidates." }))
      .finally(() => setLoading(false))
  }, [requestId, open, keyword, specialty, eligibleOnly, toast])

  useEffect(() => {
    fetchCandidates()
  }, [fetchCandidates])

  // Handle Enter to search
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchCandidates()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Doctor for Request #{requestId}</DialogTitle>
          <DialogDescription>
            Search and assign an eligible doctor for this consultation.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 py-2 border-b">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or email..." 
              className="pl-8" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Select value={specialty} onValueChange={setSpecialty}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Specialties</SelectItem>
              <SelectItem value="GENERAL_PRACTICE">General Practice</SelectItem>
              <SelectItem value="CARDIOLOGY">Cardiology</SelectItem>
              <SelectItem value="INTERNAL_MEDICINE">Internal Medicine</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="eligibleOnly" 
              checked={eligibleOnly} 
              onCheckedChange={(c) => setEligibleOnly(!!c)} 
            />
            <label htmlFor="eligibleOnly" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Eligible Only
            </label>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchCandidates} disabled={loading}>
            Search
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 pr-2 space-y-3">
          {loading ? (
            <div className="text-center text-sm text-muted-foreground py-8">Loading candidates...</div>
          ) : candidates.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">No candidates found.</div>
          ) : (
            candidates.map((doctor) => (
              <div key={doctor.doctorId} className={`flex flex-col sm:flex-row gap-4 p-4 border rounded-lg ${doctor.preferredByMember ? 'border-primary/50 bg-primary/5' : ''} ${!doctor.eligible ? 'opacity-80' : ''}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">{doctor.displayName}</span>
                    {doctor.preferredByMember && (
                      <Badge variant="default" className="bg-primary/20 text-primary hover:bg-primary/30">
                        <Star className="w-3 h-3 mr-1" /> Preferred
                      </Badge>
                    )}
                    {!doctor.eligible && (
                      <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">
                        Not Eligible
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 flex flex-col gap-0.5">
                    <span>{doctor.email} &bull; {doctor.phone || "No phone"}</span>
                    <span>Specialty: {doctor.specialty || "None"} &bull; Timezone: {doctor.timezone || "Not set"}</span>
                    <span>Load: {doctor.effectiveLoad} / {doctor.maxActiveConsultations != null ? doctor.maxActiveConsultations : "Not configured"}</span>
                  </div>
                  
                  {!doctor.eligible && Array.isArray(doctor.ineligibleReasons) && doctor.ineligibleReasons.length > 0 && (
                    <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded flex gap-1.5 items-start">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <ul className="list-disc list-inside">
                        {doctor.ineligibleReasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {doctor.declaredSupportSchedule && doctor.eligible && (
                    <div className="mt-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded font-mono">
                      Schedule preview available
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col gap-2 justify-start sm:justify-start">
                  <Button 
                    size="sm" 
                    disabled={!doctor.eligible}
                    onClick={() => onReserveDoctor(doctor.doctorId)}
                  >
                    Reserve Doctor
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onOpenCareProfile(doctor.doctorId)}
                  >
                    <UserCog className="w-4 h-4 mr-2" />
                    Care Profile
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
