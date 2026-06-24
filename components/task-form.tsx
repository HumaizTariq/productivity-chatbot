"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Pencil } from "lucide-react"

interface Task {
  id: string; title: string; description: string | null; status: string; priority: string; due_date: string | null
}

interface TaskFormProps {
  task?: Task | null
  onSaved: () => void
}

export function TaskForm({ task, onSaved }: TaskFormProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(task?.title ?? "")
  const [description, setDescription] = useState(task?.description ?? "")
  const [priority, setPriority] = useState(task?.priority ?? "medium")
  const [dueDate, setDueDate] = useState(task?.due_date ?? "")

  useEffect(() => {
    if (open) {
      setTitle(task?.title ?? "")
      setDescription(task?.description ?? "")
      setPriority(task?.priority ?? "medium")
      setDueDate(task?.due_date ?? "")
    }
  }, [open, task])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = task ? "PATCH" : "POST"
    const body = task
      ? { id: task.id, title, description, priority, due_date: dueDate || null }
      : { title, description, priority, due_date: dueDate || null }
    await fetch("/api/tasks", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    setTitle(""); setDescription(""); setPriority("medium"); setDueDate("")
    setOpen(false)
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={`inline-flex items-center gap-1.5 text-sm font-medium rounded-xl bg-gold text-background hover:bg-gold/90 transition-colors cursor-pointer border-0 ${task ? "h-7 w-7 justify-center" : "px-3 py-1.5"}`}>
        {task ? <Pencil size={13} /> : <><Plus size={15} /> Add Task</>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{task ? "Edit Task" : "New Task"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} required className="rounded-xl bg-input" />
          <Textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-xl bg-input" />
          <Select value={priority} onValueChange={(v) => { if (v) setPriority(v) }}>
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="rounded-xl bg-input" />
          <Button type="submit" className="w-full rounded-xl bg-gold text-background hover:bg-gold/90">{task ? "Save Changes" : "Create Task"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
