"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { CalendarView } from "@/components/calendar-view"

export default function CalendarPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="font-serif text-2xl font-semibold tracking-[-0.02em]">Calendar</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Your schedule at a glance</p>
          </div>
          <CalendarView refreshKey={refreshKey} />
        </div>
      </main>
    </div>
  )
}
