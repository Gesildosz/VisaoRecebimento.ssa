'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'

interface TemperatureThresholds {
  minTemperature: number
  maxTemperature: number
  unit: 'C' | 'F'
}

export function TemperatureThresholdSettings() {
  const [thresholds, setThresholds] = React.useState<TemperatureThresholds>({
    minTemperature: -5,
    maxTemperature: 25,
    unit: 'C',
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (thresholds.minTemperature >= thresholds.maxTemperature) {
      toast({
        title: 'Erro de Validação',
        description: 'A temperatura mínima deve ser menor que a temperatura máxima.',
        variant: 'destructive',
      })
      return
    }
    // Aqui você faria a chamada API para salvar os limites de temperatura
    console.log('Salvando limites de temperatura:', thresholds)
    toast({
      title: 'Limites Salvos',
      description: 'Os limites de temperatura foram atualizados com sucesso.',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Limites de Temperatura</CardTitle>
        <CardDescription>Defina os limites mínimo e máximo para monitoramento de temperatura.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="minTemp">Temperatura Mínima</Label>
              <Input
                id="minTemp"
                type="number"
                value={thresholds.minTemperature}
                onChange={(e) => setThresholds({ ...thresholds, minTemperature: parseFloat(e.target.value) })}
                step="0.1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="maxTemp">Temperatura Máxima</Label>
              <Input
                id="maxTemp"
                type="number"
                value={thresholds.maxTemperature}
                onChange={(e) => setThresholds({ ...thresholds, maxTemperature: parseFloat(e.target.value) })}
                step="0.1"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tempUnitSelect">Unidade de Temperatura</Label>
            <Select
              value={thresholds.unit}
              onValueChange={(value: 'C' | 'F') => setThresholds({ ...thresholds, unit: value })}
            >
              <SelectTrigger id="tempUnitSelect">
                <SelectValue placeholder="Selecione a unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="C">Celsius (°C)</SelectItem>
                <SelectItem value="F">Fahrenheit (°F)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit">Salvar Limites</Button>
        </form>
      </CardContent>
    </Card>
  )
}
