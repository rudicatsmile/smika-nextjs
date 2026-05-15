"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, Users, Database, Settings, FileText,
  ChevronLeft, ChevronRight, BookOpen, Building2, Briefcase, Award, DropletIcon, Heart
} from "lucide-react"
import { canViewLogs, canManageMasterData, canManageUsers } from "@/lib/rbac"
import { Role } from "@/app/generated/prisma/enums"

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  children?: { href: string; label: string; icon: React.ElementType }[]
}

function buildNavItems(role?: Role): NavItem[] {
  const items: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/pegawai", label: "Data Pegawai", icon: Users },
  ]

  if (role && canManageMasterData(role)) {
    items.push({
      href: "/master",
      label: "Master Data",
      icon: Database,
      children: [
        { href: "/master/departemen", label: "Departemen", icon: Building2 },
        { href: "/master/jabatan", label: "Jabatan", icon: Briefcase },
        { href: "/master/status-kepegawaian", label: "Status Kepegawaian", icon: Award },
        { href: "/master/agama", label: "Agama", icon: BookOpen },
        { href: "/master/golongan-darah", label: "Golongan Darah", icon: DropletIcon },
      ],
    })
  }

  if (role && canManageUsers(role)) {
    items.push({ href: "/akun", label: "Manajemen Akun", icon: Settings })
  }

  if (role && canViewLogs(role)) {
    items.push({ href: "/log-aktivitas", label: "Log Aktivitas", icon: FileText })
  }

  return items
}

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = session?.user?.role as Role | undefined
  const navItems = buildNavItems(role)

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center border-b border-sidebar-border", collapsed ? "justify-center p-4" : "gap-3 p-5")}>
        <div className="w-9 h-9 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
          <span className="text-accent font-bold text-lg">ع</span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-bold text-sm leading-tight text-sidebar-foreground">SIMKA</p>
            <p className="text-sidebar-foreground/60 text-xs leading-tight truncate">Al Wathoniyah 9</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {navItems.map((item) => (
          <NavItemComponent key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span className="ml-2 text-xs">Tutup Panel</span>}
        </button>
      </div>
    </aside>
  )
}

function NavItemComponent({
  item,
  pathname,
  collapsed,
}: {
  item: NavItem
  pathname: string
  collapsed: boolean
}) {
  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
  const hasChildren = item.children && item.children.length > 0
  const Icon = item.icon

  if (hasChildren && !collapsed) {
    return (
      <div>
        <div className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
        )}>
          <Icon className="h-4 w-4 flex-shrink-0" />
          <span>{item.label}</span>
        </div>
        <div className="ml-4 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-3">
          {item.children!.map((child) => {
            const ChildIcon = child.icon
            const childActive = pathname === child.href || pathname.startsWith(child.href)
            return (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors",
                  childActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <ChildIcon className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{child.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center rounded-lg text-sm font-medium transition-colors",
        collapsed ? "justify-center p-2" : "gap-3 px-3 py-2",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
      )}
      title={collapsed ? item.label : undefined}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  )
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = session?.user?.role as Role | undefined
  const navItems = buildNavItems(role)

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />
      )}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar flex flex-col transition-transform duration-300",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center gap-3 p-5 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
            <span className="text-accent font-bold text-lg">ع</span>
          </div>
          <div>
            <p className="font-bold text-sm text-sidebar-foreground">SIMKA</p>
            <p className="text-sidebar-foreground/60 text-xs">Al Wathoniyah 9</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map((item) => (
            <NavItemComponent key={item.href} item={item} pathname={pathname} collapsed={false} />
          ))}
        </nav>
      </aside>
    </>
  )
}
