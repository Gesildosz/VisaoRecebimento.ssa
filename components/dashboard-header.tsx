'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from 'next/image'
import { SidebarTrigger } from '@/components/ui/sidebar' // Re-importar SidebarTrigger
import { PanelRight } from 'lucide-react' // Usar PanelRight para indicar que abre para a direita

export function DashboardHeader() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formattedDate = currentDateTime.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const formattedTime = currentDateTime.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <Card className="mb-6 bg-sky-600 text-white">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Recebimento e Expedição</CardTitle>
        <div className="flex items-center gap-4">
          <Image
            src="/jbs-logo.png"
            alt="JBS Logo"
            width={100}
            height={100}
            className="object-contain mr-4"
          />
          <div className="text-sm text-white flex flex-col items-start md:items-end">
            <span>{formattedDate}</span>
            <span className="font-semibold text-lg">{formattedTime}</span>
          </div>
          {/* Sidebar Trigger - Posicionado à direita do cabeçalho */}
          <SidebarTrigger className="ml-4">
            <PanelRight className="text-sky-200" /> {/* Ícone para indicar que abre para a direita */}
            <span className="sr-only">Toggle Sidebar</span>
          </SidebarTrigger>
        </div>
      </CardHeader>
    </Card>
  )
}
