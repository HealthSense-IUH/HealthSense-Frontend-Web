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
import type { UpdateHealthRecordDto, HealthRecord, HealthRecordStatus, PredictionLabel } from "../types"

interface HealthRecordEditDialogProps {
  record: HealthRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function HealthRecordEditDialog({ record, open, onOpenChange, onSuccess }: HealthRecordEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [fileName, setFileName] = useState("")
  const [status, setStatus] = useState<HealthRecordStatus>("COMPLETED")
  const [predictionLabel, setPredictionLabel] = useState<PredictionLabel>("UNCERTAIN")
  const [confidence, setConfidence] = useState("")
  const [hrvFeaturesJson, setHrvFeaturesJson] = useState("")

  useEffect(() => {
    if (open && record) {
      setFileName(record.fileName || "")
      setStatus(record.status)
      setPredictionLabel(record.predictionLabel || "UNCERTAIN")
      setConfidence(record.confidence !== null && record.confidence !== undefined ? String(record.confidence) : "")
      setHrvFeaturesJson(record.hrvFeatures ? JSON.stringify(record.hrvFeatures, null, 2) : "")
      setError(null)
    }
  }, [open, record])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!record) return
    setError(null)

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
      const payload: UpdateHealthRecordDto = {
        fileName: fileName || undefined,
        status,
        predictionLabel,
        confidence: confidence ? parseFloat(confidence) : undefined,
        hrvFeaturesJson: hrvFeaturesJson || undefined,
      }
      
      await adminHealthRecordApi.updateHealthRecord(record.id, payload)
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || "Failed to update health record")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Health Record</DialogTitle>
          <DialogDescription>
            Update details for record ID: {record?.id}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && <div className="p-3 bg-red-100 text-red-600 text-sm rounded-md">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-fileName">File Name</Label>
              <Input 
                id="edit-fileName" 
                value={fileName} 
                onChange={(e) => setFileName(e.target.value)} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={status} onValueChange={(v: HealthRecordStatus) => setStatus(v)}>
                <SelectTrigger id="edit-status">
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
              <Label htmlFor="edit-predictionLabel">Prediction</Label>
              <Select value={predictionLabel} onValueChange={(v: PredictionLabel) => setPredictionLabel(v)}>
                <SelectTrigger id="edit-predictionLabel">
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
              <Label htmlFor="edit-confidence">Confidence (0-1)</Label>
              <Input 
                id="edit-confidence" 
                type="number" 
                step="0.01" 
                min="0" 
                max="1"
                value={confidence} 
                onChange={(e) => setConfidence(e.target.value)} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-hrvFeaturesJson">HRV Features (JSON)</Label>
            <Textarea 
              id="edit-hrvFeaturesJson" 
              className="font-mono text-xs" 
              rows={12}
              value={hrvFeaturesJson}
              onChange={(e) => setHrvFeaturesJson(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
