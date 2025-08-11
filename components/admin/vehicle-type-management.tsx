'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface VehicleType {
id: string
name: string
description?: string
}

export function VehicleTypeManagement() {
const [vehicleTypes, setVehicleTypes] = React.useState<VehicleType[]>([
  { id: '1', name: 'Caminhão', description: 'Veículo de grande porte para transporte de carga' },
  { id: '2', name: 'Carreta', description: 'Conjunto de cavalo mecânico e semirreboque' },
  { id: '3', name: 'Van', description: 'Veículo utilitário para transporte de pequenas cargas ou pessoas' },
  { id: '4', name: 'Bi-trem', description: 'Combinação de dois semirreboques' },
  { id: '5', name: 'Toco', description: 'Caminhão com um eixo traseiro' },
  { id: '6', name: 'Truck', description: 'Caminhão com dois eixos traseiros' },
  { id: '7', name: 'Conteiner', description: 'Veículo para transporte de contêineres' },
  { id: '8', name: 'Outro', description: 'Outros tipos de veículos não listados' },
])
const [newTypeName, setNewTypeName] = React.useState('')
const [newTypeDescription, setNewTypeDescription] = React.useState('')

const handleAddType = (e: React.FormEvent) => {
  e.preventDefault()
  if (!newTypeName.trim()) {
    toast({
      title: 'Erro',
      description: 'O nome do tipo de veículo não pode ser vazio.',
      variant: 'destructive',
    })
    return
  }
  const newId = (vehicleTypes.length + 1).toString()
  setVehicleTypes([...vehicleTypes, { id: newId, name: newTypeName, description: newTypeDescription }])
  setNewTypeName('')
  setNewTypeDescription('')
  toast({
    title: 'Tipo de Veículo Adicionado',
    description: `"${newTypeName}" foi adicionado com sucesso.`,
  })
}

const handleDeleteType = (id: string) => {
  setVehicleTypes(vehicleTypes.filter((type) => type.id !== id))
  toast({
    title: 'Tipo de Veículo Excluído',
    description: 'O tipo de veículo foi removido.',
    variant: 'destructive',
  })
}

return (
  <Card>
    <CardHeader>
      <CardTitle>Gerenciamento de Tipos de Veículos</CardTitle>
      <CardDescription>Defina e gerencie os tipos de veículos aceitos no sistema.</CardDescription>
    </CardHeader>
    <CardContent>
      <form onSubmit={handleAddType} className="grid gap-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="newTypeName">Nome do Tipo</Label>
            <Input
              id="newTypeName"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              placeholder="Ex: Caminhão, Carreta"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="newTypeDescription">Descrição (Opcional)</Label>
            <Input
              id="newTypeDescription"
              value={newTypeDescription}
              onChange={(e) => setNewTypeDescription(e.target.value)}
              placeholder="Breve descrição do tipo de veículo"
            />
          </div>
        </div>
        <Button type="submit" className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Adicionar Tipo
        </Button>
      </form>

      <h3 className="text-lg font-semibold mb-2">Tipos Existentes</h3>
      <div className="w-full overflow-x-auto border rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicleTypes.map((type) => (
              <TableRow key={type.id}>
                <TableCell className="font-medium">{type.name}</TableCell>
                <TableCell>{type.description || '-'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteType(type.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span className="sr-only">Excluir tipo</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
)
}
