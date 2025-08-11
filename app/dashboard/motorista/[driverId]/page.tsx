'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon, UserRound, Truck, CalendarDays, Package, Thermometer, AlertTriangle } from 'lucide-react'
import Image from 'next/image'
import { DriverData } from '@/types/driver'
import { VehicleData } from '@/types/vehicle'
import { OccurrenceDetail } from '@/types/occurrence'
import { normalizeString } from '@/lib/utils' // Importar de lib/utils
import { DriverHistoryCardList } from '@/components/driver-history-card-list'

export default function DriverDetailPage() {
  const router = useRouter()
  const params = useParams()
  const driverId = params.driverId as string

  const [driver, setDriver] = useState<DriverData | null>(null)
  const [associatedVehicles, setAssociatedVehicles] = useState<VehicleData[]>([])
  const [allOccurrences, setAllOccurrences] = useState<OccurrenceDetail[]>([])
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const storedDriversString = localStorage.getItem('drivers_data');
    const storedVehiclesString = localStorage.getItem('vehicles_data');
    const storedOccurrencesString = localStorage.getItem('occurrences_data');
    const storedArchivedOccurrencesString = localStorage.getItem('archived_occurrences_data');

    const loadedDrivers: DriverData[] = storedDriversString ? JSON.parse(storedDriversString) : [];
    const loadedVehicles: VehicleData[] = storedVehiclesString ? JSON.parse(storedVehiclesString) : [];
    const loadedOccurrences: OccurrenceDetail[] = storedOccurrencesString ? JSON.parse(storedOccurrencesString) : [];
    const loadedArchivedOccurrences: OccurrenceDetail[] = storedArchivedOccurrencesString ? JSON.parse(storedArchivedOccurrencesString) : [];

    const foundDriver = loadedDrivers.find(d => d.id === driverId);
    setDriver(foundDriver || null);

    const vehiclesForDriver = loadedVehicles.filter(v => v.driverId === driverId);
    setAssociatedVehicles(vehiclesForDriver);

    setAllOccurrences([...loadedOccurrences, ...loadedArchivedOccurrences]);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [driverId]);

  const driverHistory = useMemo(() => {
    return associatedVehicles.map(vehicle => {
      const occurrence = allOccurrences.find(occ => occ.placa === vehicle.placa && occ.timestamp);
      return {
        id: vehicle.id,
        placa: vehicle.placa,
        dataChegada: vehicle.dataChegada || 'N/A',
        doca: vehicle.doca,
        carga: vehicle.carga,
        teveOcorrencia: occurrence ? 'Sim' : 'Não',
        tipoOcorrencia: occurrence ? occurrence.tipoOcorrencia : 'Nenhuma',
        temperatura: vehicle.temperatura,
        tipoCarga: vehicle.tipo,
        perfil: vehicle.perfil,
        lacre: vehicle.lacre,
        containerNumber: vehicle.containerNumber, // Adicionado
      };
    }).sort((a, b) => {
      if (a.dataChegada && b.dataChegada) {
        const [dayA, monthA, yearA] = a.dataChegada.split('/').map(Number);
        const [dayB, monthB, yearB] = b.dataChegada.split('/').map(Number);
        const dateA = new Date(yearA, monthA - 1, dayA);
        const dateB = new Date(yearB, monthB - 1, dayB);
        return dateB.getTime() - dateA.getTime();
      }
      return 0;
    });
  }, [associatedVehicles, allOccurrences]);

  if (!driver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <h1 className="text-2xl font-bold text-center mb-4">Motorista não encontrado.</h1>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Voltar para a lista de motoristas
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
        <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Voltar para a lista de motoristas
        </Button>
        <div className="flex items-center justify-center sm:justify-end gap-4 flex-grow">
          <Image
            src="/jbs-logo.png"
            alt="JBS Logo"
            width={60}
            height={60}
            className="object-contain"
          />
          <h1 className="text-2xl font-bold text-center">Detalhes do Motorista</h1>
        </div>
      </div>
      <p className="text-center text-muted-foreground">Histórico completo de apresentações do motorista.</p>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <UserRound className="h-6 w-6" />
            {driver.fullName || 'Motorista Desconhecido'}
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Total de Apresentações: <span className="font-semibold">{driverHistory.length}</span>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <p><strong>Whatsapp:</strong> {driver.whatsapp || 'N/A'}</p>
          <p><strong>Transportadora:</strong> {driver.carrier || 'N/A'}</p>
          <p><strong>Cidade:</strong> {driver.city || 'N/A'}</p>
          <p><strong>Estado:</strong> {driver.state || 'N/A'}</p>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mb-4 text-center">Histórico de Veículos</h2>

      {isMobile ? (
        <DriverHistoryCardList history={driverHistory} />
      ) : (
        <div className="w-full overflow-x-auto border rounded-lg shadow-sm">
          <Table>
            <TableCaption>Lista detalhada de todas as apresentações de veículos deste motorista.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Placa</TableHead><TableHead>Data Chegada</TableHead><TableHead>Doca</TableHead><TableHead>Carga</TableHead><TableHead>Ocorrência</TableHead><TableHead>Tipo Ocorrência</TableHead><TableHead>Temperatura</TableHead><TableHead>Tipo Carga</TableHead><TableHead>Perfil</TableHead><TableHead>Contêiner</TableHead><TableHead>Lacre</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {driverHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                    Nenhum registro de veículo encontrado para este motorista.
                  </TableCell>
                </TableRow>
              ) : (
                driverHistory.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.placa}</TableCell>
                    <TableCell>{entry.dataChegada}</TableCell>
                    <TableCell>{entry.doca}</TableCell>
                    <TableCell>{entry.carga}</TableCell>
                    <TableCell>{entry.teveOcorrencia}</TableCell>
                    <TableCell>{entry.tipoOcorrencia}</TableCell>
                    <TableCell>{entry.temperatura}</TableCell>
                    <TableCell>{entry.tipoCarga}</TableCell>
                    <TableCell>{entry.perfil}</TableCell>
                    <TableCell>{entry.containerNumber || 'N/A'}</TableCell> {/* Exibir contêiner */}
                    <TableCell>{entry.lacre}</TableCell>
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
