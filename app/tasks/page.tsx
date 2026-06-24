"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TaskList } from "@/components/task-list"
import { TaskForm } from "@/components/task-form"

export default function TasksPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-serif text-2xl font-semibold tracking-[-0.02em]">Tasks</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Manage your to-do list</p>
            </div>
            <TaskForm task={null} onSaved={() => setRefreshKey((k) => k + 1)} />
          </div>
          <TaskList refreshKey={refreshKey} />
        </div>
      </main>
    </div>
  )
}
