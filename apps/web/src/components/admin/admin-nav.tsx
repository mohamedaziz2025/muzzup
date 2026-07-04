import {
  LayoutDashboard,
  Users,
  Store,
  ShieldCheck,
  ArrowLeftRight,
  MessageSquare,
  Flag,
  FileText,
  Settings,
  ScrollText,
  BarChart3,
} from "lucide-react";
import type { SidebarItem } from "@/components/dashboard/sidebar-shell";

/** Shared nav for every /admin/** page — keeps hrefs/icons consistent across the back-office. */
export const ADMIN_SIDEBAR_ITEMS: SidebarItem[] = [
  { href: "/admin", label: "Tableau de bord", icon: <LayoutDashboard className="size-4" /> },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: <Users className="size-4" /> },
  { href: "/admin/annonces", label: "Annonces", icon: <Store className="size-4" /> },
  { href: "/admin/sharia", label: "Sharia", icon: <ShieldCheck className="size-4" /> },
  { href: "/admin/transactions", label: "Transactions", icon: <ArrowLeftRight className="size-4" /> },
  { href: "/admin/messages", label: "Messages", icon: <MessageSquare className="size-4" /> },
  { href: "/admin/signalements", label: "Signalements", icon: <Flag className="size-4" /> },
  { href: "/admin/cms", label: "CMS", icon: <FileText className="size-4" /> },
  { href: "/admin/parametres", label: "Paramètres", icon: <Settings className="size-4" /> },
  { href: "/admin/logs", label: "Logs", icon: <ScrollText className="size-4" /> },
  { href: "/admin/analytics", label: "Analytics", icon: <BarChart3 className="size-4" /> },
];
