'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2 } from 'lucide-react'
import Link from 'next/link'
import { VehicleData } from '@/types/vehicle'
import { DriverData } from '@/types/driver' // Importar DriverData
import { cn, normalizeString } from '@/lib/utils' // Importar normalizeString de lib/utils
import { UserRole } from '@/types/user' // Importar UserRole

interface VehicleCardListProps {
  vehicles: VehicleData[];
  setVehicles: React.Dispatch<React.SetStateAction<VehicleData[]>>;
  onRemoveVehicle: (id: string, placa: string) => void;
  drivers: DriverData[]; // Adicionado
  userRole: UserRole; // Adicionado
}

export function VehicleCardList({ vehicles, setVehicles, onRemoveVehicle, drivers, userRole }: VehicleCardListProps) {
  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    column: keyof VehicleData;
  } | null>(null);

  const handleDoubleClick = (rowId: string, column: keyof VehicleData) => {
    if (userRole === 'viewer') return; // Desabilitar edição para viewer
    if (column !== 'ocorrencia') {
      setEditingCell({ rowId, column });
    }
  };

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
    );
  };

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
    );
    setEditingCell(null);
  };

  const handleBlur = () => {
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, rowId: string, column: keyof VehicleData) => {
    if (e.key === 'Enter') {
      setEditingCell(null);
    }
    if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const statusOptions = ["Em-Descarga", "Pátio", "Finalizado", "Aguardando"];
  const perfilOptions = ["Normal", "Urgente", "Prioritário"];

  const getDriverInfo = (driverId?: string) => {
    if (!driverId) return null;
    return drivers.find(d => d.id === driverId);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {vehicles.map((vehicle) => {
        const driver = getDriverInfo(vehicle.driverId);
        return (
          <Card
            key={vehicle.id}
            className={cn(
              "flex flex-col",
              {
                'bg-red-50 border-red-200': vehicle.ocorrencia !== 'Nenhuma',
              },
              {
                'bg-orange-50 border-orange-200': normalizeString(vehicle.tipo) === normalizeString('Kit Festa'),
              }
            )}
          >
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Doca: {vehicle.doca}</span>
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
              </CardTitle>
              <CardDescription>Placa: {vehicle.placa}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <div>
                <strong>Carga:</strong> {vehicle.carga}
              </div>
              <div onDoubleClick={() => handleDoubleClick(vehicle.id, 'temperatura')}>
                <strong>Temperatura:</strong>{' '}
                {editingCell?.rowId === vehicle.id && editingCell.column === 'temperatura' ? (
                  <Input
                    value={vehicle.temperatura}
                    onChange={(e) => handleChange(e, vehicle.id, 'temperatura')}
                    onBlur={handleBlur}
                    onKeyDown={(e) => handleKeyDown(e, vehicle.id, 'temperatura')}
                    autoFocus
                    className="h-8 inline-block w-auto"
                    disabled={userRole === 'viewer'} // Desabilitar para viewer
                  />
                ) : (
                  vehicle.temperatura
                )}
              </div>
              <div onDoubleClick={() => handleDoubleClick(vehicle.id, 'lacre')}>
                <strong>Lacre:</strong>{' '}
                {editingCell?.rowId === vehicle.id && editingCell.column === 'lacre' ? (
                  <Input
                    value={vehicle.lacre}
                    onChange={(e) => handleChange(e, vehicle.id, 'lacre')}
                    onBlur={handleBlur}
                    onKeyDown={(e) => handleKeyDown(e, vehicle.id, 'lacre')}
                    autoFocus
                    className="h-8 inline-block w-auto"
                    disabled={userRole === 'viewer'} // Desabilitar para viewer
                  />
                ) : (
                  vehicle.lacre
                )}
              </div>
              <div onDoubleClick={() => handleDoubleClick(vehicle.id, 'status')}>
                <strong>Status:</strong>{' '}
                {editingCell?.rowId === vehicle.id && editingCell.column === 'status' ? (
                  <Select
                    value={vehicle.status}
                    onValueChange={(value) => handleSelectChange(value, vehicle.id, 'status')}
                    disabled={userRole === 'viewer'} // Desabilitar para viewer
                  >
                    <SelectTrigger className="h-8 inline-block w-auto">
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
              </div>
              <div>
                <strong>Ocorrência:</strong>{' '}
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
              </div>
              <div onDoubleClick={() => handleDoubleClick(vehicle.id, 'perfil')}>
                <strong>Perfil:</strong>{' '}
                {editingCell?.rowId === vehicle.id && editingCell.column === 'perfil' ? (
                  <Select
                    value={vehicle.perfil}
                    onValueChange={(value) => handleSelectChange(value, vehicle.id, 'perfil')}
                    disabled={userRole === 'viewer'} // Desabilitar para viewer
                  >
                    <SelectTrigger className="h-8 inline-block w-auto">
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
              </div>
              {vehicle.containerNumber && ( // Exibir número do contêiner se existir
                <div>
                  <strong>Contêiner:</strong> {vehicle.containerNumber}
                </div>
              )}
              {driver && (
                <>
                  <p className="mt-2 text-base font-semibold">Dados do Motorista:</p>
                  <p><strong>Nome:</strong> {driver.fullName}</p>
                  <p><strong>Transportadora:</strong> {driver.carrier}</p>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
