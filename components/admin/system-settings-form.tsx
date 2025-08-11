'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/hooks/use-toast'

interface SystemSettings {
  maxVehiclesAllowed: number
  defaultTemperatureUnit: 'C' | 'F'
  enableNotifications: boolean
}

export function SystemSettingsForm() {
  const [settings, setSettings] = React.useState<SystemSettings>({
    maxVehiclesAllowed: 100,
    defaultTemperatureUnit: 'C',
    enableNotifications: true,
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    // Aqui você faria a chamada API para salvar as configurações
    console.log('Salvando configurações:', settings)
    toast({
      title: 'Configurações Salvas',
      description: 'As configurações do sistema foram atualizadas com sucesso.',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do Sistema</CardTitle>
        <CardDescription>Gerencie os parâmetros globais da aplicação.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="maxVehicles">Máximo de Veículos Permitidos</Label>
            <Input
              id="maxVehicles"
              type="number"
              value={settings.maxVehiclesAllowed}
              onChange={(e) => setSettings({ ...settings, maxVehiclesAllowed: parseInt(e.target.value) })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tempUnit">Unidade de Temperatura Padrão</Label>
            <Select
              value={settings.defaultTemperatureUnit}
              onValueChange={(value: 'C' | 'F') => setSettings({ ...settings, defaultTemperatureUnit: value })}
            >
              <SelectTrigger id="tempUnit">
                <SelectValue placeholder="Selecione a unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="C">Celsius (°C)</SelectItem>
                <SelectItem value="F">Fahrenheit (°F)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="enableNotifications">Habilitar Notificações</Label>
            <Switch
              id="enableNotifications"
              checked={settings.enableNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, enableNotifications: checked })}
            />
          </div>
          <Button type="submit">Salvar Configurações</Button>
        </form>
      </CardContent>
    </Card>
  )
}
