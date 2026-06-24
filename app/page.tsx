"use client"

import { useEffect, useState, useCallback } from "react"
import { Sidebar } from "@/components/sidebar"
import { ChatPanel } from "@/components/chat-panel"
import { format, isSameDay, parseISO } from "date-fns"
import { CalendarDays, CheckCircle2, FileText, Sparkles } from "lucide-react"
import Link from "next/link"

interface Task { id: string; title: string; status: string; priority: string; due_date: string | null }
interface Note { id: string; title: string; updated_at: string }
interface Event { id: string; title: string; date: string }

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [chatOpen, setChatOpen] = useState(false)

  const fetchAll = useCallback(() => {
    fetch("/api/tasks").then((r) => r.json()).then(setTasks)
    fetch("/api/notes").then((r) => r.json()).then(setNotes)
    fetch("/api/events").then((r) => r.json()).then(setEvents)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const todayEvents = events.filter((e) => isSameDay(parseISO(e.date), new Date()))
  const upcomingTasks = tasks
    .filter((t) => t.status !== "done")
    .sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    })
    .slice(0, 5)
  const recentNotes = notes.slice(0, 3)

  const priorityBadge = (p: string) => {
    const map: Record<string, string> = {
      high: "bg-gold text-background border border-[#d4af37]",
      medium: "bg-[#422006] text-[#fcd34d] border border-[#78350f]",
      low: "bg-[#1c1917] text-[#a8a29e] border border-[#44403c]",
    }
    return map[p] ?? map.medium
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-serif font-semibold tracking-[-0.02em]">Dashboard</h1>
              <p className="font-serif italic text-[20px] text-foreground/70 mt-1">
                {format(new Date(), "EEEE, MMMM d")}
              </p>
            </div>
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg bg-gold text-background hover:translate-y-[-3px] hover:scale-105 hover:shadow-[0_8px_24px_rgba(201,169,78,0.35),0_0_0_4px_rgba(201,169,78,0.08)] active:translate-y-[-1px] active:scale-[1.02] transition-all duration-250 relative overflow-hidden"
            >
              <Sparkles size={14} />
              Ask AI
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-[2fr_1fr] mb-4">
            {/* Hero card */}
            <div className="group border border-border rounded-xl bg-card p-6 transition-all duration-300 hover:border-gold/45 hover:-translate-y-1 hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.4),0_0_0_1px_rgba(201,169,78,0.12)] relative overflow-hidden">
              <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_50%_50%,rgba(201,169,78,0.08),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-light mb-2">Today at a Glance</div>
              <div className="font-serif italic text-xl text-gold mb-5">A productive {format(new Date(), "EEEE")} awaits</div>
              <div className="flex gap-8">
                <div><span className="font-mono text-3xl font-medium text-foreground group-hover:text-gold transition-colors">3</span><div className="text-[10px] uppercase tracking-[0.05em] text-muted-foreground font-light mt-1">Tasks due</div></div>
                <div><span className="font-mono text-3xl font-medium text-foreground group-hover:text-gold transition-colors">2</span><div className="text-[10px] uppercase tracking-[0.05em] text-muted-foreground font-light mt-1">Events today</div></div>
                <div><span className="font-mono text-3xl font-medium text-foreground group-hover:text-gold transition-colors">5</span><div className="text-[10px] uppercase tracking-[0.05em] text-muted-foreground font-light mt-1">Notes</div></div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="group border border-border rounded-xl bg-card p-6 transition-all duration-300 hover:border-gold/45 hover:-translate-y-1 hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.4),0_0_0_1px_rgba(201,169,78,0.12)] relative overflow-hidden">
              <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_var(--mx,50%)_var(--my,50%),rgba(201,169,78,0.08),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" onMouseMove={(e) => { e.currentTarget.style.setProperty("--mx", `${e.nativeEvent.offsetX}px`); e.currentTarget.style.setProperty("--my", `${e.nativeEvent.offsetY}px`) }} />
              <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-light mb-3">Quick Stats</div>
              <div className="flex flex-col">
                <div className="flex flex-col gap-1 px-3 py-3.5 rounded-lg hover:bg-foreground/[0.03] transition-colors mb-0.5">
                  <span className="text-[13px] text-foreground">Tasks completed</span>
                  <span className="font-mono text-[22px] font-medium text-gold">7 / 10</span>
                </div>
                <div className="flex flex-col gap-1 px-3 py-3.5 rounded-lg hover:bg-foreground/[0.03] transition-colors mb-0.5">
                  <span className="text-[13px] text-foreground">Notes this week</span>
                  <span className="font-mono text-[22px] font-medium text-gold">12</span>
                </div>
                <div className="flex flex-col gap-1 px-3 py-3.5 rounded-lg hover:bg-foreground/[0.03] transition-colors">
                  <span className="text-[13px] text-foreground">Events upcoming</span>
                  <span className="font-mono text-[22px] font-medium text-gold">4</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Notes */}
            <div className="group border border-border rounded-xl bg-card p-6 transition-all duration-300 hover:border-gold/45 hover:-translate-y-1 hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.4),0_0_0_1px_rgba(201,169,78,0.12)] relative overflow-hidden">
              <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_var(--mx,50%)_var(--my,50%),rgba(201,169,78,0.08),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" onMouseMove={(e) => { e.currentTarget.style.setProperty("--mx", `${e.nativeEvent.offsetX}px`); e.currentTarget.style.setProperty("--my", `${e.nativeEvent.offsetY}px`) }} />
              <h2 className="font-serif text-lg font-semibold text-gold mb-4">Recent Notes</h2>
              {recentNotes.length > 0 ? (
                <>
                  {recentNotes.map((n) => (
                    <div key={n.id} className="flex justify-between items-center py-2 border-b border-border last:border-0 group-hover:translate-x-[3px] transition-transform">
                      <span className="text-[13px]">{n.title}</span>
                      <span className="text-[11px] text-muted-foreground ml-3 shrink-0">{format(new Date(n.updated_at), "MMM d")}</span>
                    </div>
                  ))}
                  <Link href="/notes" className="inline-block text-[11px] text-gold mt-4 hover:translate-x-1 transition-transform">View all →</Link>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground py-2">No notes yet</p>
                  <Link href="/notes" className="inline-block text-[11px] text-gold mt-4 hover:translate-x-1 transition-transform">View all →</Link>
                </>
              )}
            </div>

            {/* Upcoming Tasks */}
            <div className="group border border-border rounded-xl bg-card p-6 transition-all duration-300 hover:border-gold/45 hover:-translate-y-1 hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.4),0_0_0_1px_rgba(201,169,78,0.12)] relative overflow-hidden">
              <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_var(--mx,50%)_var(--my,50%),rgba(201,169,78,0.08),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" onMouseMove={(e) => { e.currentTarget.style.setProperty("--mx", `${e.nativeEvent.offsetX}px`); e.currentTarget.style.setProperty("--my", `${e.nativeEvent.offsetY}px`) }} />
              <h2 className="font-serif text-lg font-semibold text-gold mb-4">Upcoming Tasks</h2>
              {upcomingTasks.length > 0 ? (
                <>
                  {upcomingTasks.map((t) => (
                    <div key={t.id} className="flex justify-between items-center py-2 border-b border-border last:border-0 group-hover:translate-x-[3px] transition-transform">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-4 h-4 rounded border border-gold/30 shrink-0" />
                        <span className="text-[13px] truncate">{t.title}</span>
                      </div>
                      <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-[5px] text-[10px] font-semibold uppercase tracking-[0.06em] min-w-[36px] shrink-0 ml-2 ${priorityBadge(t.priority)}`}>
                        {t.priority === "high" ? "High" : t.priority === "low" ? "Low" : "Med"}
                      </span>
                    </div>
                  ))}
                  <Link href="/tasks" className="inline-block text-[11px] text-gold mt-4 hover:translate-x-1 transition-transform">View all →</Link>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground py-2">No upcoming tasks</p>
                  <Link href="/tasks" className="inline-block text-[11px] text-gold mt-4 hover:translate-x-1 transition-transform">View all →</Link>
                </>
              )}
            </div>
          </div>
        </div>

        {chatOpen && (
          <div className="fixed bottom-4 right-4 w-[420px] h-[560px] border border-gold/30 rounded-2xl shadow-2xl bg-card z-50 overflow-hidden">
            <ChatPanel onDataChanged={fetchAll} />
          </div>
        )}
      </main>
    </div>
  )
}
