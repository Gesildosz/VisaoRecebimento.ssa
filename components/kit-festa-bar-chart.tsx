'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart2 } from 'lucide-react'

interface KitFestaBarChartProps {
  count: number;
}

export function KitFestaBarChart({ count }: KitFestaBarChartProps) {
  // Define uma altura máxima para a barra para escala visual
  const maxHeight = 150; // px
  // Calcula a altura da barra proporcionalmente ao número de veículos
  // Assumindo que 100 veículos seria a altura máxima para uma boa visualização
  const barHeight = Math.min(count * 5, maxHeight); // 5px por veículo, máximo 150px

  return (
    <Card className="flex flex-col items-center justify-center p-4">
      <CardHeader className="pb-2 text-center">
        <CardTitle className="text-lg font-bold flex items-center justify-center gap-2">
          <BarChart2 className="h-5 w-5" />
          Veículos Kit Festa Descarregados
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-end h-[200px] w-full">
        <div className="flex items-end h-full w-full max-w-[100px] bg-gray-200 rounded-md overflow-hidden">
          <div
            className="bg-purple-600 w-full rounded-md transition-all duration-500 ease-out"
            style={{ height: `${barHeight}px` }}
            title={`Total: ${count} veículos`}
          />
        </div>
        <div className="mt-2 text-2xl font-bold text-purple-700">{count}</div>
        <p className="text-sm text-muted-foreground">Total de veículos Kit Festa</p>
      </CardContent>
    </Card>
  )
}
