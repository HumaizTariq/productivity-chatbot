"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { NoteEditor } from "@/components/note-editor"
import { format } from "date-fns"
import { Plus, Trash2, Pencil } from "lucide-react"

interface Note { id: string; title: string; content: string; tags: string[]; updated_at: string }

export function NoteList({ refreshKey }: { refreshKey: number }) {
  const [notes, setNotes] = useState<Note[]>([])
  const router = useRouter()

  const fetchNotes = async () => {
    const res = await fetch("/api/notes")
    if (!res.ok) { if (res.status === 401) router.push("/login"); return }
    const data = await res.json()
    if (Array.isArray(data)) setNotes(data)
  }

  useEffect(() => { fetchNotes() }, [refreshKey])

  const deleteNote = async (id: string) => {
    try {
      const res = await fetch(`/api/notes?id=${id}`, { method: "DELETE" })
      if (!res.ok) { const err = await res.json().catch(() => ({ error: "Failed to delete note" })); alert(err.error); return }
    } catch { alert("Network error — please check your connection."); return }
    fetchNotes()
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      <NoteEditor onSaved={fetchNotes}>
        <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center min-h-[160px] cursor-pointer hover:bg-secondary/50 transition-colors gap-2">
          <Plus size={20} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-medium">New Note</span>
        </div>
      </NoteEditor>
      {notes.map((note) => (
        <div key={note.id} className="border border-border rounded-xl bg-card p-4 min-h-[160px] flex flex-col group hover:border-gold/45 hover:-translate-y-0.5 transition-all duration-200 hover:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.3)]">
          <div className="flex-1">
            <h3 className="font-serif text-sm font-semibold text-gold mb-1.5">{note.title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-4 leading-relaxed">{note.content}</p>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border text-[11px] text-muted-foreground">
            <span>{format(new Date(note.updated_at), "MMM d, yyyy")}</span>
            <div className="flex gap-1">
              <NoteEditor note={note} onSaved={fetchNotes}>
                <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil size={13} /></Button>
              </NoteEditor>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteNote(note.id)}><Trash2 size={13} /></Button>
            </div>
          </div>
        </div>
      ))}
      {notes.length === 0 && <p className="text-muted-foreground col-span-full text-center py-16 text-sm">No notes yet</p>}
    </div>
  )
}
