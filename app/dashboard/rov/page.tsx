'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OccurrenceDetail } from '@/types/occurrence'
import { OccurrenceTypeBarChart } from '@/components/occurrence-type-bar-chart'
import { TopVehiclesOccurrenceBarChart } from '@/components/top-vehicles-occurrence-bar-chart'
import { VehicleOccurrenceDetailDialog } from '@/components/vehicle-occurrence-detail-dialog'
import { normalizeString } from '@/lib/string-utils'

export default function ROVPage() {
  const [allOccurrences, setAllOccurrences] = useState<OccurrenceDetail[]>([])
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedVehicleOccurrences, setSelectedVehicleOccurrences] = useState<OccurrenceDetail[]>([])
  const [selectedVehiclePlaca, setSelectedVehiclePlaca] = useState('')

  useEffect(() => {
    const storedOccurrencesString = localStorage.getItem('occurrences_data')
    const loadedOccurrences: OccurrenceDetail[] = storedOccurrencesString ? JSON.parse(storedOccurrencesString) : []
    setAllOccurrences(loadedOccurrences)
  }, [])

  const handleBarClick = (placa: string) => {
    const occurrencesForVehicle = allOccurrences.filter(occ => normalizeString(occ.placa) === normalizeString(placa))
    setSelectedVehicleOccurrences(occurrencesForVehicle)
    setSelectedVehiclePlaca(placa)
    setIsDetailDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Registro de Ocorrência de Veículos (ROV)</h1>

      {allOccurrences.length === 0 ? (
        <Card className="w-full max-w-2xl mx-auto text-center py-8">
          <CardContent>
            <p className="text-muted-foreground">Nenhuma ocorrência registrada ainda. Registre algumas ocorrências para ver os dados aqui.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OccurrenceTypeBarChart occurrences={allOccurrences} />
          <TopVehiclesOccurrenceBarChart occurrences={allOccurrences} onBarClick={handleBarClick} />
        </div>
      )}

      <VehicleOccurrenceDetailDialog
        isOpen={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
        occurrences={selectedVehicleOccurrences}
        placa={selectedVehiclePlaca}
      />
    </div>
  )
}
