"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface NoteEditorProps { note?: { id: string; title: string; content: string } | null; onSaved: () => void; children?: React.ReactNode }

export function NoteEditor({ note, onSaved, children }: NoteEditorProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(note?.title ?? "")
  const [content, setContent] = useState(note?.content ?? "")

  useEffect(() => { if (open) { setTitle(note?.title ?? ""); setContent(note?.content ?? "") } }, [open, note])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = note ? "PATCH" : "POST"
    const body = note ? { id: note.id, title, content } : { title, content }
    await fetch("/api/notes", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    setOpen(false)
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <span onClick={() => setOpen(true)} className="cursor-pointer contents">
        {children ?? <Button variant="outline">{note ? "Edit" : "New Note"}</Button>}
      </span>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader><DialogTitle>{note ? "Edit Note" : "New Note"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Note title" value={title} onChange={(e) => setTitle(e.target.value)} required className="rounded-xl bg-input" />
          <Textarea placeholder="Write your note here..." value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[200px] rounded-xl bg-input" />
          <Button type="submit" className="w-full rounded-xl bg-gold text-background hover:bg-gold/90">{note ? "Save Changes" : "Create Note"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
