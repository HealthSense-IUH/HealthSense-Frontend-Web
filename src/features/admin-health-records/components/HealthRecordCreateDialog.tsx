import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { adminHealthRecordApi } from "../services"
import type { CreateHealthRecordDto, HealthRecordStatus, PredictionLabel } from "../types"

interface HealthRecordCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const DEFAULT_HRV_JSON = `{
  "HR_mean": 47.46528898934453,
  "Mean_NN": 1264.0816326530612,
  "SDNN": 440.4302743120779,
  "RMSSD": 556.5874444625331,
  "pNN50": 66.66666666666666,
  "NN50": 32.0,
  "CV": 34.84191708313177,
  "LF": 0.029800441994053888,
  "HF": 0.3003213839764191,
  "LF_HF_Ratio": 0.09922850514165779,
  "LF_norm": 9.027104435293932,
  "HF_norm": 90.97289556470606,
  "Total_Power": 0.330121825970473
}`

export function HealthRecordCreateDialog({ open, onOpenChange, onSuccess }: HealthRecordCreateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [memberId, setMemberId] = useState("")
  const [fileName, setFileName] = useState("")
  const [status, setStatus] = useState<HealthRecordStatus>("COMPLETED")
  const [predictionLabel, setPredictionLabel] = useState<PredictionLabel>("UNCERTAIN")
  const [confidence, setConfidence] = useState("0.78")
  const [hrvFeaturesJson, setHrvFeaturesJson] = useState(DEFAULT_HRV_JSON)

  useEffect(() => {
    if (open) {
      setMemberId("")
      setFileName("")
      setStatus("COMPLETED")
      setPredictionLabel("UNCERTAIN")
      setConfidence("0.78")
      setHrvFeaturesJson(DEFAULT_HRV_JSON)
      setError(null)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!memberId) {
      setError("Member ID is required")
      return
    }

    if (hrvFeaturesJson) {
      try {
        JSON.parse(hrvFeaturesJson)
      } catch (e) {
        setError("HRV features must be valid JSON")
        return
      }
    }

    setIsSubmitting(true)
    try {
      const payload: CreateHealthRecordDto = {
        memberId,
        fileName: fileName || undefined,
        status,
        predictionLabel,
        confidence: confidence ? parseFloat(confidence) : undefined,
        hrvFeaturesJson: hrvFeaturesJson || undefined,
      }
      
      await adminHealthRecordApi.createHealthRecord(payload)
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || "Failed to create health record")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Health Record</DialogTitle>
          <DialogDescription>
            Create a mock health record for a member.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && <div className="p-3 bg-red-100 text-red-600 text-sm rounded-md">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="memberId">Member ID *</Label>
              <Input 
                id="memberId" 
                placeholder="e.g. 208019534288613376" 
                value={memberId} 
                onChange={(e) => setMemberId(e.target.value)} 
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fileName">File Name</Label>
              <Input 
                id="fileName" 
                placeholder="sample-hrv.csv" 
                value={fileName} 
                onChange={(e) => setFileName(e.target.value)} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v: HealthRecordStatus) => setStatus(v)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING_UPLOAD">PENDING_UPLOAD</SelectItem>
                  <SelectItem value="PROCESSING">PROCESSING</SelectItem>
                  <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                  <SelectItem value="FAILED">FAILED</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="predictionLabel">Prediction</Label>
              <Select value={predictionLabel} onValueChange={(v: PredictionLabel) => setPredictionLabel(v)}>
                <SelectTrigger id="predictionLabel">
                  <SelectValue placeholder="Select prediction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NORMAL">NORMAL</SelectItem>
                  <SelectItem value="AFIB">AFIB</SelectItem>
                  <SelectItem value="UNCERTAIN">UNCERTAIN</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confidence">Confidence (0-1)</Label>
              <Input 
                id="confidence" 
                type="number" 
                step="0.01" 
                min="0" 
                max="1"
                placeholder="0.78"
                value={confidence} 
                onChange={(e) => setConfidence(e.target.value)} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hrvFeaturesJson">HRV Features (JSON)</Label>
            <Textarea 
              id="hrvFeaturesJson" 
              className="font-mono text-xs" 
              rows={12}
              value={hrvFeaturesJson}
              onChange={(e) => setHrvFeaturesJson(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
