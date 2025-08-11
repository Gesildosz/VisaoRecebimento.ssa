'use client'

import * as React from 'react'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, FileText, AlertTriangle, PartyPopper, BarChart2, History, Archive, Gauge, UserRound, Settings, UserCog, ClipboardList, LayoutDashboard, Truck, Package, Thermometer } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
  SidebarSeparator, // Importar SidebarSeparator
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useUserRole } from '@/components/user-role-context'

export function AppRightSidebar() { // Renomeado de volta para AppRightSidebar
  const { open, setOpen } = useSidebar();
  const { role } = useUserRole();
  const pathname = usePathname();

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (open) {
      timer = setTimeout(() => {
        setOpen(false);
      }, 5000);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [open, setOpen]);

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  return (
    <Sidebar
      side="right"
      collapsible="icon"
      className="w-64"
    >
      <SidebarContent className="bg-sky-600 text-white">
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Página Principal */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/dashboard')}>
                  <Link href="/dashboard">
                    <LayoutDashboard className="text-white group-hover:text-sky-200" />
                    <span>Página Principal</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Visão Dia - Exemplo de menu em cascata */}
              <Collapsible className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="transition-all duration-200 hover:scale-105 hover:text-sky-200">
                      <FileText className="text-white group-hover:text-sky-200" />
                      <span>Visão Dia</span>
                      <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180 text-white group-hover:text-sky-200" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild className="transition-all duration-200 hover:scale-105 hover:text-sky-200">
                          <Link href="/dashboard/relatorio-diario">Relatório Diário</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild className="transition-all duration-200 hover:scale-105 hover:text-sky-200">
                          <Link href="#">Relatório Mensal</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Ocorrência */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/dashboard/status/ocorrencia/list')}>
                  <Link href="/dashboard/status/ocorrencia/list">
                    <AlertTriangle className="text-white group-hover:text-sky-200" />
                    <span>Ocorrência</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Kit Festa */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/dashboard/recebimento/kit-festa')}>
                  <Link href="/dashboard/recebimento/kit-festa">
                    <PartyPopper className="text-white group-hover:text-sky-200" />
                    <span>Kit Festa</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* KPI */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/dashboard/kpi')}>
                  <Link href="/dashboard/kpi">
                    <Gauge className="text-white group-hover:text-sky-200" />
                    <span>KPI</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Histórico */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="#">
                    <History className="text-white group-hover:text-sky-200" />
                    <span>Histórico</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Arquivo RCB & EXP */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/dashboard/arquivo')}>
                  <Link href="/dashboard/arquivo">
                    <Archive className="text-white group-hover:text-sky-200" />
                    <span>Arquivo RCB & EXP</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Motorista */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/dashboard/motorista')}>
                  <Link href="/dashboard/motorista">
                    <UserRound className="text-white group-hover:text-sky-200" />
                    <span>Motorista</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* ROV - Registro Ocorrência Veículo */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/dashboard/rov')}>
                  <Link href="/dashboard/rov">
                    <ClipboardList className="text-white group-hover:text-sky-200" />
                    <span>ROV</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Administrador - Condicionalmente visível para admin */}
              {role === 'admin' && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/dashboard/admin')}>
                    <Link href="/dashboard/admin">
                      <UserCog className="text-white group-hover:text-sky-200" />
                      <span>Administrador</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
