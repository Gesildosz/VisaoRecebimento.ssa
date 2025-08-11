'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Trash2 } from 'lucide-react'
import Link from 'next/link'
import { VehicleData } from '@/types/vehicle'
import { DriverData } from '@/types/driver'
import { cn, normalizeString } from '@/lib/utils' // Importar normalizeString de lib/utils
import { UserRole } from '@/types/user' // Adicionado

interface VehicleTableProps {
  vehicles: VehicleData[];
  setVehicles: React.Dispatch<React.SetStateAction<VehicleData[]>>;
  onRemoveVehicle: (id: string, placa: string) => void;
  drivers: DriverData[];
  userRole: UserRole; // Adicionado
}

export function VehicleTable({ vehicles, setVehicles, onRemoveVehicle, drivers, userRole }: VehicleTableProps) {
  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    column: keyof VehicleData;
  } | null>(null)

  const handleDoubleClick = (rowId: string, column: keyof VehicleData) => {
    if (userRole === 'viewer') return; // Desabilitar edição para viewer
    if (column !== 'ocorrencia') {
      setEditingCell({ rowId, column })
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    rowId: string,
    column: keyof VehicleData
  ) => {
    if (userRole === 'viewer') return; // Desabilitar edição para viewer
    setVehicles((prevVehicles) =>
      prevVehicles.map((vehicle) =>
        vehicle.id === rowId ? { ...vehicle, [column]: e.target.value } : vehicle
      )
    )
  }

  const handleSelectChange = (
    value: string,
    rowId: string,
    column: keyof VehicleData
  ) => {
    if (userRole === 'viewer') return; // Desabilitar edição para viewer
    setVehicles((prevVehicles) =>
      prevVehicles.map((vehicle) =>
        vehicle.id === rowId ? { ...vehicle, [column]: value } : vehicle
      )
    )
    setEditingCell(null)
  }

  const handleBlur = () => {
    setEditingCell(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, rowId: string, column: keyof VehicleData) => {
    if (e.key === 'Enter') {
      setEditingCell(null)
    }
    if (e.key === 'Escape') {
      setEditingCell(null)
    }
  }

  const statusOptions = ["Em-Descarga", "Pátio", "Finalizado", "Aguardando"]
  const perfilOptions = ["Normal", "Urgente", "Prioritário"]

  return (
    <div className="w-full overflow-x-auto border rounded-lg shadow-sm">
      <Table>
        <TableCaption>Informações detalhadas de Recebimento & Expedição.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Doca</TableHead><TableHead>Carga</TableHead><TableHead>Placa</TableHead><TableHead>Temperatura</TableHead><TableHead>Lacre</TableHead><TableHead>Status</TableHead><TableHead>Ocorrência</TableHead><TableHead>Perfil</TableHead><TableHead>Contêiner</TableHead><TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow
              key={vehicle.id}
              className={cn(
                "border-b",
                "even:bg-gray-50",
                {
                  'bg-red-50 hover:bg-red-100': vehicle.ocorrencia !== 'Nenhuma',
                },
                {
                  'bg-orange-50 hover:bg-orange-100': normalizeString(vehicle.tipo) === normalizeString('Kit Festa'),
                }
              )}
            >
              <TableCell className="font-medium">{vehicle.doca}</TableCell>
              <TableCell>{vehicle.carga}</TableCell>
              <TableCell>{vehicle.placa}</TableCell>

              {/* Temperatura */}
              <TableCell onDoubleClick={() => handleDoubleClick(vehicle.id, 'temperatura')}>
                {editingCell?.rowId === vehicle.id && editingCell.column === 'temperatura' ? (
                  <Input
                    value={vehicle.temperatura}
                    onChange={(e) => handleChange(e, vehicle.id, 'temperatura')}
                    onBlur={handleBlur}
                    onKeyDown={(e) => handleKeyDown(e, vehicle.id, 'temperatura')}
                    autoFocus
                    className="h-8"
                    disabled={userRole === 'viewer'} // Desabilitar para viewer
                  />
                ) : (
                  vehicle.temperatura
                )}
              </TableCell>

              {/* Lacre */}
              <TableCell onDoubleClick={() => handleDoubleClick(vehicle.id, 'lacre')}>
                {editingCell?.rowId === vehicle.id && editingCell.column === 'lacre' ? (
                  <Input
                    value={vehicle.lacre}
                    onChange={(e) => handleChange(e, vehicle.id, 'lacre')}
                    onBlur={handleBlur}
                    onKeyDown={(e) => handleKeyDown(e, vehicle.id, 'lacre')}
                    autoFocus
                    className="h-8"
                    disabled={userRole === 'viewer'} // Desabilitar para viewer
                  />
                ) : (
                  vehicle.lacre
                )}
              </TableCell>

              {/* Status (com Select) */}
              <TableCell onDoubleClick={() => handleDoubleClick(vehicle.id, 'status')}>
                {editingCell?.rowId === vehicle.id && editingCell.column === 'status' ? (
                  <Select
                    value={vehicle.status}
                    onValueChange={(value) => handleSelectChange(value, vehicle.id, 'status')}
                    disabled={userRole === 'viewer'} // Desabilitar para viewer
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Selecione o Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  vehicle.status
                )}
              </TableCell>

              {/* Ocorrência (agora um link condicional) */}
              <TableCell>
                {vehicle.status === 'Pátio' || userRole === 'viewer' ? ( // Desabilitar link para Pátio e viewer
                  <span className="text-muted-foreground">
                    {vehicle.status === 'Pátio' ? 'Pátio' : vehicle.ocorrencia}
                  </span>
                ) : (
                  <Link
                    href={`/dashboard/ocorrencia/${vehicle.placa}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer text-blue-600 hover:underline"
                  >
                    {vehicle.ocorrencia === 'Nenhuma' ? 'Registrar' : vehicle.ocorrencia}
                  </Link>
                )}
              </TableCell>

              {/* Perfil (com Select) */}
              <TableCell onDoubleClick={() => handleDoubleClick(vehicle.id, 'perfil')}>
                {editingCell?.rowId === vehicle.id && editingCell.column === 'perfil' ? (
                  <Select
                    value={vehicle.perfil}
                    onValueChange={(value) => handleSelectChange(value, vehicle.id, 'perfil')}
                    disabled={userRole === 'viewer'} // Desabilitar para viewer
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Selecione o Perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      {perfilOptions.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  vehicle.perfil
                )}
              </TableCell>

              {/* Contêiner */}
              <TableCell onDoubleClick={() => handleDoubleClick(vehicle.id, 'containerNumber')}>
                {editingCell?.rowId === vehicle.id && editingCell.column === 'containerNumber' ? (
                  <Input
                    value={vehicle.containerNumber || ''}
                    onChange={(e) => handleChange(e, vehicle.id, 'containerNumber')}
                    onBlur={handleBlur}
                    onKeyDown={(e) => handleKeyDown(e, vehicle.id, 'containerNumber')}
                    autoFocus
                    className="h-8"
                    disabled={userRole === 'viewer'} // Desabilitar para viewer
                  />
                ) : (
                  vehicle.containerNumber || 'N/A'
                )}
              </TableCell>

              <TableCell className="text-right">
                {(userRole === 'admin' || userRole === 'manager') && ( // Apenas admin e manager podem remover
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => onRemoveVehicle(vehicle.id, vehicle.placa)}
                    title={`Remover veículo ${vehicle.placa}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
