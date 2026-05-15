"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Plus, Edit, Trash2, Loader2, GraduationCap } from "lucide-react"
import { toast } from "sonner"
import { createEducationHistory, updateEducationHistory, deleteEducationHistory } from "@/server/actions/education-history"

interface EducationOption {
  id: string
  name: string
  level: string
}

interface EducationHistoryItem {
  id: string
  educationId: string
  education: { id: string; name: string; level: string }
  institutionName?: string
  major?: string
  graduationYear?: number
  startDate?: string
  endDate?: string
  gpa?: number
  isGraduated: boolean
}

interface EducationHistoryTableProps {
  employeeId: string
  initialData: EducationHistoryItem[]
  educationOptions: EducationOption[]
}

export function EducationHistoryTable({ employeeId, initialData, educationOptions }: EducationHistoryTableProps) {
  const [data, setData] = useState<EducationHistoryItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<EducationHistoryItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<{
    educationId: string
    institutionName: string
    major: string
    graduationYear: string
    startDate: string
    endDate: string
    gpa: string
    isGraduated: boolean
  }>({
    educationId: "",
    institutionName: "",
    major: "",
    graduationYear: "",
    startDate: "",
    endDate: "",
    gpa: "",
    isGraduated: true,
  })
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    setData(initialData)
    setMounted(true)
  }, [initialData])

  if (!mounted) return null

  const handleSubmit = async () => {
    if (!form.educationId) {
      toast.error("Education level is required")
      return
    }
    setIsPending(true)
    try {
      if (editItem) {
        const result = await updateEducationHistory(editItem.id, {
          educationId: form.educationId,
          institutionName: form.institutionName || undefined,
          major: form.major || undefined,
          graduationYear: form.graduationYear ? parseInt(form.graduationYear) : undefined,
          startDate: form.startDate || undefined,
          endDate: form.endDate || undefined,
          gpa: form.gpa ? parseFloat(form.gpa) : undefined,
          isGraduated: form.isGraduated,
        })
        if (result.success) {
          setData(data.map((item) => (item.id === editItem.id ? { 
            ...item, 
            educationId: form.educationId,
            education: educationOptions.find(e => e.id === form.educationId)!,
            institutionName: form.institutionName || undefined,
            major: form.major || undefined,
            graduationYear: form.graduationYear ? parseInt(form.graduationYear) : undefined,
            startDate: form.startDate || undefined,
            endDate: form.endDate || undefined,
            gpa: form.gpa ? parseFloat(form.gpa) : undefined,
            isGraduated: form.isGraduated,
          } : item)))
          toast.success("Education history updated successfully")
          setDialogOpen(false)
          setEditItem(null)
        } else {
          toast.error(result.error || "Failed to update")
        }
      } else {
        const result = await createEducationHistory({
          employeeId,
          educationId: form.educationId,
          institutionName: form.institutionName || undefined,
          major: form.major || undefined,
          graduationYear: form.graduationYear ? parseInt(form.graduationYear) : undefined,
          startDate: form.startDate || undefined,
          endDate: form.endDate || undefined,
          gpa: form.gpa ? parseFloat(form.gpa) : undefined,
          isGraduated: form.isGraduated,
        })
        if (result.success) {
          const newItem: EducationHistoryItem = {
            id: result.id,
            educationId: form.educationId,
            education: educationOptions.find(e => e.id === form.educationId)!,
            institutionName: form.institutionName || undefined,
            major: form.major || undefined,
            graduationYear: form.graduationYear ? parseInt(form.graduationYear) : undefined,
            startDate: form.startDate || undefined,
            endDate: form.endDate || undefined,
            gpa: form.gpa ? parseFloat(form.gpa) : undefined,
            isGraduated: form.isGraduated,
          }
          setData([...data, newItem])
          toast.success("Education history added successfully")
          setDialogOpen(false)
        } else {
          toast.error(result.error || "Failed to create")
        }
      }
    } finally {
      setIsPending(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsPending(true)
    try {
      const result = await deleteEducationHistory(deleteId)
      if (result.success) {
        setData(data.filter((item) => item.id !== deleteId))
        toast.success("Education history deleted successfully")
        setDeleteId(null)
      } else {
        toast.error(result.error || "Failed to delete")
      }
    } finally {
      setIsPending(false)
    }
  }

  const openDialog = (item?: EducationHistoryItem) => {
    if (item) {
      setEditItem(item)
      setForm({
        educationId: item.educationId,
        institutionName: item.institutionName || "",
        major: item.major || "",
        graduationYear: item.graduationYear?.toString() || "",
        startDate: item.startDate || "",
        endDate: item.endDate || "",
        gpa: item.gpa?.toString() || "",
        isGraduated: item.isGraduated,
      })
    } else {
      setEditItem(null)
      setForm({
        educationId: "",
        institutionName: "",
        major: "",
        graduationYear: "",
        startDate: "",
        endDate: "",
        gpa: "",
        isGraduated: true,
      })
    }
    setDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Education History
          </CardTitle>
          <Button onClick={() => openDialog()} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No education history recorded
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{item.education.name}</div>
                    <div className="text-sm text-muted-foreground">{item.education.level}</div>
                    {item.institutionName && (
                      <div className="text-sm mt-1">{item.institutionName}</div>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
                      {item.major && <div>Major: {item.major}</div>}
                      {item.graduationYear && <div>Year: {item.graduationYear}</div>}
                      {item.gpa && <div>GPA: {item.gpa}</div>}
                      {!item.isGraduated && <div className="text-amber-600">In Progress</div>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openDialog(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Education History" : "Add Education History"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="educationId">Education Level</Label>
              <Select value={form.educationId} onValueChange={(v) => setForm({ ...form, educationId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  {educationOptions.map((edu) => (
                    <SelectItem key={edu.id} value={edu.id}>{edu.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="institutionName">Institution Name</Label>
              <Input
                id="institutionName"
                value={form.institutionName}
                onChange={(e) => setForm({ ...form, institutionName: e.target.value })}
                placeholder="University / School name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="major">Major / Field of Study</Label>
              <Input
                id="major"
                value={form.major}
                onChange={(e) => setForm({ ...form, major: e.target.value })}
                placeholder="Computer Science, etc."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="graduationYear">Graduation Year</Label>
                <Input
                  id="graduationYear"
                  type="number"
                  value={form.graduationYear}
                  onChange={(e) => setForm({ ...form, graduationYear: e.target.value })}
                  placeholder="2020"
                  min={1950}
                  max={2099}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gpa">GPA</Label>
                <Input
                  id="gpa"
                  type="number"
                  step="0.01"
                  value={form.gpa}
                  onChange={(e) => setForm({ ...form, gpa: e.target.value })}
                  placeholder="3.5"
                  min={0}
                  max={4}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isGraduated"
                checked={form.isGraduated}
                onCheckedChange={(checked) => setForm({ ...form, isGraduated: checked })}
              />
              <Label htmlFor="isGraduated">Graduated</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editItem ? "Save Changes" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Education History</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this education history? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
