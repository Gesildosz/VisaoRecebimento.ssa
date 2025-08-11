'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OccurrenceDetail } from '@/types/occurrence'
import { normalizeString } from '@/lib/string-utils'

interface TopVehiclesOccurrenceBarChartProps {
  occurrences: OccurrenceDetail[];
  onBarClick: (placa: string) => void;
}

export function TopVehiclesOccurrenceBarChart({ occurrences, onBarClick }: TopVehiclesOccurrenceBarChartProps) {
  const data = React.useMemo(() => {
    const vehicleCounts: { [key: string]: number } = {}
    occurrences.forEach(occ => {
      const normalizedPlaca = normalizeString(occ.placa)
      vehicleCounts[normalizedPlaca] = (vehicleCounts[normalizedPlaca] || 0) + 1
    })

    return Object.keys(vehicleCounts).map(placa => ({
      name: placa.toUpperCase(), // Exibir placa em maiúsculas
      count: vehicleCounts[placa],
    })).sort((a, b) => b.count - a.count).slice(0, 5) // Top 5 veículos
  }, [occurrences])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Veículos com Maior Incidência de Ocorrências</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#82ca9d" cursor="pointer" onClick={(data) => onBarClick(data.name)} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
