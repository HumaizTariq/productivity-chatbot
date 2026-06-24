"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react"

interface Event { id: string; title: string; description: string | null; date: string; time: string | null; all_day: boolean }
interface Task { id: string; title: string; due_date: string | null; status: string }

export function CalendarView({ refreshKey }: { refreshKey: number }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [newTitle, setNewTitle] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const router = useRouter()

  const fetchEvents = async () => {
    const res = await fetch("/api/events")
    if (!res.ok) { if (res.status === 401) router.push("/login"); return }
    const data = await res.json()
    if (Array.isArray(data)) setEvents(data)
  }

  const fetchTasks = async () => {
    const res = await fetch("/api/tasks")
    if (!res.ok) { if (res.status === 401) router.push("/login"); return }
    const data = await res.json()
    if (Array.isArray(data)) setTasks(data.filter((t: Task) => t.due_date && t.status !== "done"))
  }

  useEffect(() => { fetchEvents(); fetchTasks() }, [refreshKey])

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) })
  const startDay = getDay(startOfMonth(currentMonth))

  const addEvent = async () => {
    if (!selectedDate || !newTitle) return
    await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: newTitle, date: format(selectedDate, "yyyy-MM-dd") }) })
    setNewTitle(""); setSelectedDate(null); fetchEvents()
  }

  const updateEvent = async (id: string) => {
    if (!editTitle.trim()) return
    await fetch("/api/events", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, title: editTitle }) })
    setEditingId(null); setEditTitle(""); fetchEvents()
  }

  return (
    <div className="border border-border rounded-xl bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-sm font-semibold text-gold">{format(currentMonth, "MMMM yyyy")}</h2>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft size={15} /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight size={15} /></Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden text-center">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="bg-secondary p-2 text-[11px] font-medium text-muted-foreground">{d}</div>
        ))}
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-card p-2 min-h-[80px]" />
        ))}
        {days.map((day) => {
          const dayEvents = events.filter((e) => isSameDay(new Date(e.date), day))
          const dayTasks = tasks.filter((t) => t.due_date && isSameDay(new Date(t.due_date), day))
          const totalItems = dayEvents.length + dayTasks.length
          return (
            <Dialog key={day.toISOString()}>
              <DialogTrigger onClick={() => setSelectedDate(day)} className="bg-card p-2 min-h-[80px] text-left hover:bg-secondary/70 hover:shadow-[0_0_8px_rgba(201,169,78,0.1)] transition-all text-sm w-full border-0 cursor-pointer">
                <span className={`text-xs font-medium ${isSameMonth(day, currentMonth) ? "" : "text-muted-foreground/40"}`}>{format(day, "d")}</span>
                {dayEvents.slice(0, 2).map((e) => (
                  <p key={e.id} className="text-[10px] truncate bg-gold/10 text-gold rounded px-1 py-0.5 mt-1">{e.title}</p>
                ))}
                {dayTasks.slice(0, 2 - dayEvents.slice(0, 2).length).map((t) => (
                  <p key={t.id} className="text-[10px] truncate bg-accent text-accent-foreground rounded px-1 py-0.5 mt-1">{t.title}</p>
                ))}
                {totalItems > 2 && <p className="text-[10px] text-muted-foreground">+{totalItems - 2} more</p>}
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader><DialogTitle className="text-sm">{format(day, "MMMM d, yyyy")}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input placeholder="Event title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="rounded-xl bg-input h-9 text-sm" />
                    <Button size="sm" onClick={addEvent} className="rounded-xl bg-gold text-background hover:bg-gold/90">Add</Button>
                  </div>
                  {dayEvents.map((e) => (
                    <div key={e.id} className="flex justify-between items-center p-2.5 border border-border rounded-xl bg-secondary/50">
                      <div className="min-w-0 flex-1">
                        {editingId === e.id ? (
                          <Input value={editTitle} onChange={(ev) => setEditTitle(ev.target.value)} onKeyDown={(ev) => ev.key === "Enter" && updateEvent(e.id)} onBlur={() => updateEvent(e.id)} className="rounded-lg bg-input h-8 text-sm" autoFocus />
                        ) : (
                          <>
                            <p className="text-sm font-medium truncate">{e.title}</p>
                            {e.time && <p className="text-xs text-muted-foreground">{e.time}</p>}
                          </>
                        )}
                      </div>
                      <div className="flex gap-0.5 shrink-0 ml-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingId(e.id); setEditTitle(e.title) }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={async () => { await fetch(`/api/events?id=${e.id}`, { method: "DELETE" }); fetchEvents() }}>
                          <Trash2 size={13} className="text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {dayTasks.map((t) => (
                    <div key={t.id} className="flex justify-between items-center p-2.5 border border-border rounded-xl bg-accent/30">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{t.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Task</p>
                      </div>
                    </div>
                  ))}
                  {dayEvents.length === 0 && dayTasks.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">No events or tasks</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )
        })}
        {Array.from({ length: (7 - ((startDay + days.length) % 7)) % 7 }).map((_, i) => (
          <div key={`trailing-empty-${i}`} className="bg-card p-2 min-h-[80px]" />
        ))}
      </div>
    </div>
  )
}
