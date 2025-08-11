'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeftIcon, SearchIcon, UserRound } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DriverData } from '@/types/driver'
import { VehicleData } from '@/types/vehicle'
import Image from 'next/image'
import { normalizeString } from '@/lib/utils' // Importar de lib/utils
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DriverListPage() {
  const router = useRouter()
  const [drivers, setDrivers] = useState<DriverData[]>([])
  const [vehicles, setVehicles] = useState<VehicleData[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const storedDriversString = localStorage.getItem('drivers_data');
    const storedVehiclesString = localStorage.getItem('vehicles_data');
    if (storedDriversString) {
      setDrivers(JSON.parse(storedDriversString));
    }
    if (storedVehiclesString) {
      setVehicles(JSON.parse(storedVehiclesString));
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredDriversWithPlates = useMemo(() => {
    const driversWithAssociatedPlates = drivers.map(driver => {
      const associatedPlacas = vehicles
        .filter(vehicle => vehicle.driverId === driver.id)
        .map(vehicle => vehicle.placa);
      
      return {
        ...driver,
        associatedPlacas: associatedPlacas.length > 0 ? associatedPlacas.join(', ') : 'N/A'
      };
    });

    let filtered = driversWithAssociatedPlates;

    if (searchTerm) {
      const normalizedSearchTerm = normalizeString(searchTerm);
      filtered = filtered.filter(d =>
        normalizeString(d.fullName || '').includes(normalizedSearchTerm) ||
        normalizeString(d.whatsapp || '').includes(normalizedSearchTerm) ||
        normalizeString(d.carrier || '').includes(normalizedSearchTerm) ||
        normalizeString(d.city || '').includes(normalizedSearchTerm) ||
        normalizeString(d.state || '').includes(normalizedSearchTerm) ||
        normalizeString(d.associatedPlacas || '').includes(normalizedSearchTerm)
      );
    }
    return filtered;
  }, [drivers, vehicles, searchTerm]);

  const handleRowClick = (driverId: string) => {
    router.push(`/dashboard/motorista/${driverId}`);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
        <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div className="flex items-center justify-center sm:justify-end gap-4 flex-grow">
          <Image
            src="/jbs-logo.png"
            alt="JBS Logo"
            width={60}
            height={60}
            className="object-contain"
          />
          <h1 className="text-2xl font-bold text-center">Cadastro de Motoristas</h1>
        </div>
      </div>
      <p className="text-center text-muted-foreground">Lista de motoristas registrados.</p>

      <div className="mb-4">
        <Label htmlFor="search-driver">Buscar Motorista:</Label>
        <div className="relative">
          <Input
            id="search-driver"
            type="text"
            placeholder="Buscar por nome, whatsapp, transportadora, cidade, estado ou placa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
          <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {isMobile ? (
        <div className="grid gap-4">
          {filteredDriversWithPlates.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Nenhum motorista encontrado com os filtros atuais.</p>
          ) : (
            filteredDriversWithPlates.map((driver) => (
              <Card key={driver.id} className="flex flex-col cursor-pointer hover:bg-gray-50" onClick={() => handleRowClick(driver.id)}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold">Motorista: {driver.fullName || 'N/A'}</CardTitle>
                  <p className="text-sm text-muted-foreground">Transportadora: {driver.carrier || 'N/A'}</p>
                </CardHeader>
                <CardContent className="flex-grow text-sm">
                  <p><strong>Whatsapp:</strong> {driver.whatsapp || 'N/A'}</p>
                  <p><strong>Local:</strong> {driver.city || 'N/A'}, {driver.state || 'N/A'}</p>
                  <p><strong>Placas Associadas:</strong> {driver.associatedPlacas}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="w-full overflow-x-auto border rounded-lg shadow-sm">
          <Table>
            <TableCaption>Detalhes dos motoristas registrados.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Nome Completo</TableHead><TableHead>Whatsapp</TableHead><TableHead>Estado</TableHead><TableHead>Cidade</TableHead><TableHead>Transportadora</TableHead><TableHead>Placas Associadas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDriversWithPlates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum motorista encontrado com os filtros atuais.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDriversWithPlates.map((driver) => (
                  <TableRow key={driver.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleRowClick(driver.id)}>
                    <TableCell className="font-medium">{driver.fullName || 'N/A'}</TableCell>
                    <TableCell>{driver.whatsapp || 'N/A'}</TableCell>
                    <TableCell>{driver.state || 'N/A'}</TableCell>
                    <TableCell>{driver.city || 'N/A'}</TableCell>
                    <TableCell>{driver.carrier || 'N/A'}</TableCell>
                    <TableCell>{driver.associatedPlacas}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
