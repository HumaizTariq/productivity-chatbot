"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { TaskForm } from "@/components/task-form"
import { format } from "date-fns"
import { Trash2 } from "lucide-react"

interface Task { id: string; title: string; description: string | null; status: string; priority: string; due_date: string | null; created_at: string }

const priorityConfig: Record<string, { label: string; className: string }> = {
  high: { label: "High", className: "bg-gold text-background border border-[#d4af37]" },
  medium: { label: "Med", className: "bg-[#422006] text-[#fcd34d] border border-[#78350f]" },
  low: { label: "Low", className: "bg-[#1c1917] text-[#a8a29e] border border-[#44403c]" },
}

export function TaskList({ refreshKey }: { refreshKey: number }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const router = useRouter()

  const fetchTasks = async () => {
    const res = await fetch("/api/tasks")
    if (!res.ok) { if (res.status === 401) router.push("/login"); return }
    const data = await res.json()
    if (Array.isArray(data)) setTasks(data)
  }

  useEffect(() => { fetchTasks() }, [refreshKey])

  const toggleStatus = async (task: Task) => {
    const newStatus = task.status === "done" ? "todo" : "done"
    try {
      const res = await fetch("/api/tasks", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: task.id, status: newStatus }) })
      if (!res.ok) { const err = await res.json().catch(() => ({ error: "Failed to update task" })); alert(err.error); return }
    } catch { alert("Network error — please check your connection."); return }
    fetchTasks()
  }

  const deleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks?id=${id}`, { method: "DELETE" })
      if (!res.ok) { const err = await res.json().catch(() => ({ error: "Failed to delete task" })); alert(err.error); return }
    } catch { alert("Network error — please check your connection."); return }
    fetchTasks()
  }

  if (tasks.length === 0) return (
    <div className="text-center py-16">
      <p className="text-muted-foreground text-sm">No tasks yet</p>
      <p className="text-muted-foreground/60 text-xs mt-1">Create one with the button above</p>
    </div>
  )

  return (
    <div className="space-y-1.5">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors group">
          <Checkbox checked={task.status === "done"} onCheckedChange={() => toggleStatus(task)} className="mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>{task.title}</p>
            {task.description && <p className="text-xs text-muted-foreground truncate mt-0.5">{task.description}</p>}
            <div className="flex items-center gap-2 mt-1.5">
              <Badge className={`text-[11px] px-1.5 py-0 font-normal rounded-[5px] font-semibold uppercase tracking-[0.06em] ${priorityConfig[task.priority]?.className ?? ""}`}>{priorityConfig[task.priority]?.label ?? task.priority}</Badge>
              {task.due_date && <span className="text-[11px] text-muted-foreground">Due {format(new Date(task.due_date), "MMM d")}</span>}
            </div>
          </div>
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <TaskForm task={task} onSaved={fetchTasks} />
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteTask(task.id)}>
              <Trash2 size={13} className="text-muted-foreground" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
