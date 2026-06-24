"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { LayoutDashboard, ListChecks, StickyNote, Calendar, Plus, LogOut } from "lucide-react"

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/tasks", icon: ListChecks, label: "Tasks" },
  { href: "/notes", icon: StickyNote, label: "Notes" },
  { href: "/calendar", icon: Calendar, label: "Calendar" },
]

export function Sidebar() {
  const pathname = usePathname()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  const isChat = pathname === "/chat"

  return (
    <aside className="w-60 min-h-screen flex flex-col border-r border-border bg-background shrink-0">
      <div className="p-4">
        <h1 className="font-serif text-[13px] font-semibold tracking-widest text-gold uppercase">
          Productivity
        </h1>
      </div>

      <div className="px-2 mb-4">
        <Link
          href="/chat"
          className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-all duration-250 font-medium ${
            isChat
              ? "bg-accent text-accent-foreground"
              : "border border-gold/30 text-gold hover:bg-gold hover:text-background hover:translate-x-0.5 hover:shadow-[0_4px_12px_rgba(201,169,78,0.2)]"
          }`}
        >
          <Plus size={15} />
          New chat
        </Link>
      </div>

      <nav className="flex-1 px-2 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all duration-200 border-l-2 ${
                isActive
                  ? "border-gold text-foreground font-medium bg-gold-dim"
                  : "border-transparent text-foreground/60 hover:border-gold hover:text-foreground hover:pl-4"
              }`}
            >
              <item.icon size={17} className={isActive ? "text-gold" : "opacity-60"} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-2 border-t border-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <LogOut size={17} />
          Log out
        </button>
      </div>
    </aside>
  )
}
