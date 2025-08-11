'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, Snowflake, Thermometer, PartyPopper, ParkingSquare, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { DashboardHeader } from '@/components/dashboard-header'
import { VehicleTable } from '@/components/vehicle-table'
import { AddVehicleForm } from '@/components/add-vehicle-form'
import { VehicleData } from '@/types/vehicle'
import { DriverData } from '@/types/driver'
import { OccurrenceDetail } from '@/types/occurrence'
import { toast } from "@/hooks/use-toast"
import { normalizeString } from '@/lib/utils' // Importar de lib/utils
import { isToday, parse } from 'date-fns'
import { useUserRole } from '@/components/user-role-context' // Adicionado

export default function DashboardPage() {
const initialVehicles: VehicleData[] = [
  {
    id: "1",
    doca: "Doca 01",
    carga: "Carga A",
    placa: "ABC1234",
    temperatura: "Mista",
    lacre: "L123",
    status: "Em-Descarga",
    ocorrencia: "Nenhuma",
    perfil: "Normal",
    tipo: "Abastecimento CD",
    driverId: "driver-1", // Referência ao motorista
    dataChegada: "01/01/2024 10:00:00",
    dataAgendamento: "01/01/2024 09:00:00",
    containerNumber: undefined,
  },
  {
    id: "2",
    doca: "Doca 02",
    carga: "Carga B",
    placa: "DEF5678",
    temperatura: "Congelado",
    lacre: "L456",
    status: "Pátio",
    ocorrencia: "Nenhuma",
    perfil: "Urgente",
    tipo: "Abastecimento CD",
    driverId: "driver-2",
    dataChegada: "02/01/2024 11:00:00",
    dataAgendamento: "02/01/2024 10:00:00",
    containerNumber: undefined,
  },
  {
    id: "3",
    doca: "Doca 03",
    carga: "Carga C",
    placa: "GHI9012",
    temperatura: "Resfriado",
    lacre: "L789",
    status: "Finalizado",
    ocorrencia: "Nenhuma",
    perfil: "Normal",
    tipo: "Abastecimento CD",
    driverId: "driver-3",
    dataChegada: "03/01/2024 12:00:00",
    dataAgendamento: "03/01/2024 11:00:00",
    containerNumber: undefined,
  },
  {
    id: "4",
    doca: "Doca 04",
    carga: "Carga D",
    placa: "JKL3456",
    temperatura: "Congelado",
    lacre: "L101",
    status: "Pátio",
    ocorrencia: "Nenhuma",
    perfil: "Normal",
    tipo: "Abastecimento CD",
    driverId: "driver-4",
    dataChegada: "04/01/2024 13:00:00",
    dataAgendamento: "04/01/2024 12:00:00",
    containerNumber: undefined,
  },
  {
    id: "5",
    doca: "Doca 05",
    carga: "Carga E",
    placa: "MNO7890",
    temperatura: "Resfriado",
    lacre: "L112",
    status: "Em-Descarga",
    ocorrencia: "Nenhuma",
    perfil: "Normal",
    tipo: "Abastecimento CD",
    driverId: "driver-5",
    dataChegada: "05/01/2024 14:00:00",
    dataAgendamento: "05/01/2024 13:00:00",
    containerNumber: undefined,
  },
  {
    id: "6",
    doca: "Doca 06",
    carga: "Carga F",
    placa: "PQR1234",
    temperatura: "Seca",
    lacre: "L131",
    status: "Pátio",
    ocorrencia: "Nenhuma",
    perfil: "Kit Festa",
    tipo: "Kit Festa",
    driverId: "driver-6",
    dataChegada: "06/01/2024 15:00:00",
    dataAgendamento: "06/01/2024 14:00:00",
    containerNumber: undefined,
  },
  {
    id: "7",
    doca: "Doca 07",
    carga: "Carga G",
    placa: "XYZ9876",
    temperatura: "Congelado",
    lacre: "L142",
    status: "Em-Descarga",
    ocorrencia: "Nenhuma",
    perfil: "Conteiner",
    tipo: "Abastecimento CD",
    driverId: "driver-7",
    dataChegada: "07/01/2024 16:00:00",
    dataAgendamento: "07/01/2024 15:00:00",
    containerNumber: "CONT001",
  },
];

const initialDrivers: DriverData[] = [
  {
    id: "driver-1",
    fullName: "John Doe",
    whatsapp: "11999999999",
    state: "SP",
    city: "São Paulo",
    carrier: "Transportadora X",
  },
  {
    id: "driver-2",
    fullName: "Jane Smith",
    whatsapp: "21988888888",
    state: "RJ",
    city: "Rio de Janeiro",
    carrier: "Transportadora Y",
  },
  {
    id: "driver-3",
    fullName: "Robert Jones",
    whatsapp: "31977777777",
    state: "MG",
    city: "Belo Horizonte",
    carrier: "Transportadora Z",
  },
  {
    id: "driver-4",
    fullName: "Emily Brown",
    whatsapp: "41966666666",
    state: "PR",
    city: "Curitiba",
    carrier: "Transportadora W",
  },
  {
    id: "driver-5",
    fullName: "Michael Davis",
    whatsapp: "51955555555",
    state: "RS",
    city: "Porto Alegre",
    carrier: "Transportadora V",
  },
  {
    id: "driver-6",
    fullName: "Jessica Wilson",
    whatsapp: "61944444444",
    state: "DF",
    city: "Brasília",
    carrier: "Transportadora U",
  },
  {
    id: "driver-7",
    fullName: "Carlos Alberto",
    whatsapp: "71933333333",
    state: "BA",
    city: "Salvador",
    carrier: "Transportadora Alfa",
  },
];


const [vehicles, setVehicles] = useState<VehicleData[]>([]);
const [drivers, setDrivers] = useState<DriverData[]>([]);
const [activeOccurrencesCount, setActiveOccurrencesCount] = useState(0);
const { role } = useUserRole(); // Adicionado

// Carregar veículos e motoristas do localStorage na montagem
useEffect(() => {
  const storedVehiclesString = localStorage.getItem('vehicles_data');
  const storedDriversString = localStorage.getItem('drivers_data');
  const storedOccurrencesString = localStorage.getItem('occurrences_data');

  let loadedVehicles: VehicleData[] = storedVehiclesString ? JSON.parse(storedVehiclesString) : initialVehicles;
  let loadedDrivers: DriverData[] = storedDriversString ? JSON.parse(storedDriversString) : initialDrivers;
  const loadedOccurrences: OccurrenceDetail[] = storedOccurrencesString ? JSON.parse(storedOccurrencesString) : [];

  // Atualizar o status de ocorrência dos veículos com base nas ocorrências salvas
  const vehiclesWithOccurrenceStatus = loadedVehicles.map(vehicle => {
    const hasOccurrence = loadedOccurrences.some(occ => occ.placa === vehicle.placa);
    return {
      ...vehicle,
      ocorrencia: hasOccurrence ? "Registrada" : "Nenhuma"
    };
  });

  setVehicles(vehiclesWithOccurrenceStatus);
  setDrivers(loadedDrivers);

  // Contar apenas as ocorrências do dia atual para o dashboard
  const today = new Date();
  const currentDayOccurrences = loadedOccurrences.filter(occ => {
    const occDate = parse(occ.timestamp, 'dd/MM/yyyy HH:mm:ss', new Date());
    return isToday(occDate);
  });
  setActiveOccurrencesCount(currentDayOccurrences.length);

}, []);

// Salvar veículos no localStorage sempre que o estado 'vehicles' mudar
useEffect(() => {
  if (vehicles.length > 0) {
    localStorage.setItem('vehicles_data', JSON.stringify(vehicles));
  }
}, [vehicles]);

// Salvar motoristas no localStorage sempre que o estado 'drivers' mudar
useEffect(() => {
  if (drivers.length > 0) {
    localStorage.setItem('drivers_data', JSON.stringify(drivers));
  }
}, [drivers]);


const counts = useMemo(() => {
  const initialCounts = {
    descarga: 0,
    congelado: 0,
    resfriado: 0,
    kitFesta: 0,
    emDescargaStatus: 0,
    patioStatus: 0,
    finalizadoStatus: 0,
  };

  initialCounts.descarga = vehicles.length;

  return vehicles.reduce((acc, vehicle) => {
    if (normalizeString(vehicle.temperatura || '') === normalizeString("Congelado")) {
      acc.congelado += 1;
    }
    if (normalizeString(vehicle.temperatura || '') === normalizeString("Resfriado")) {
      acc.resfriado += 1;
    }
    if (normalizeString(vehicle.tipo || '') === normalizeString("Kit Festa")) {
      acc.kitFesta += 1;
    }

    if (normalizeString(vehicle.status || '') === normalizeString("Em-Descarga")) {
      acc.emDescargaStatus += 1;
    }
    if (normalizeString(vehicle.status || '') === normalizeString("Pátio")) {
      acc.patioStatus += 1;
    }
    if (normalizeString(vehicle.status || '') === normalizeString("Finalizado")) {
      acc.finalizadoStatus += 1;
    }
    return acc;
  }, initialCounts);
}, [vehicles]);

const handleAddVehicle = (
  newVehicleData: Omit<VehicleData, 'id' | 'status' | 'ocorrencia' | 'driverId'> & { dataChegada: string, dataAgendamento: string, containerNumber?: string },
  newDriverData?: Omit<DriverData, 'id'>
) => {
  let driverId: string | undefined = undefined;

  if (newDriverData && (newDriverData.fullName || newDriverData.whatsapp || newDriverData.state || newDriverData.city || newDriverData.carrier)) {
    const newDriver: DriverData = {
      id: `driver-${Date.now()}`,
      fullName: newDriverData.fullName || '',
      whatsapp: newDriverData.whatsapp || '',
      state: newDriverData.state || '',
      city: newDriverData.city || '',
      carrier: newDriverData.carrier || '',
    };
    setDrivers((prevDrivers) => [...prevDrivers, newDriver]);
    driverId = newDriver.id;
  }

  const newVehicle: VehicleData = {
    id: String(Date.now()),
    doca: newVehicleData.doca,
    carga: newVehicleData.carga,
    placa: newVehicleData.placa,
    temperatura: newVehicleData.temperatura,
    lacre: newVehicleData.lacre,
    status: "Pátio",
    ocorrencia: "Nenhuma",
    perfil: newVehicleData.perfil,
    tipo: newVehicleData.tipo,
    driverId: driverId,
    dataChegada: newVehicleData.dataChegada,
    dataAgendamento: newVehicleData.dataAgendamento,
    containerNumber: newVehicleData.containerNumber, // Adicionado
  }
  setVehicles((prevVehicles) => [...prevVehicles, newVehicle])
  toast({
    title: "Veículo Adicionado!",
    description: `Placa: ${newVehicle.placa} - Doca: ${newVehicle.doca}`,
  })
}

const handleRemoveVehicle = (id: string, placa: string) => {
  if (role === 'viewer') { // Adicionado
    toast({
      title: "Acesso Negado",
      description: "Você não tem permissão para remover veículos.",
      variant: "destructive"
    });
    return;
  }
  setVehicles((prevVehicles) => prevVehicles.filter(vehicle => vehicle.id !== id));
  toast({
    title: "Veículo Removido!",
    description: `O veículo de placa ${placa} foi removido com sucesso.`,
    variant: "destructive"
  });
};

return (
  <div className="flex flex-col gap-6 p-4 md:p-6">
    <DashboardHeader />

    <section>
      <h2 className="text-xl font-semibold mb-4 text-center">Visão do Recebimento CD</h2>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Link href="/dashboard/recebimento/descarga" className="cursor-pointer">
          <Card className="bg-amber-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Descarga</CardTitle>
              <Truck className="h-6 w-6 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{counts.descarga}</div>
              <p className="text-xs text-white">Veículos registrados</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/temperatura/congelado" className="cursor-pointer">
          <Card className="bg-blue-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Congelado</CardTitle>
              <Snowflake className="h-6 w-6 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{counts.congelado}</div>
              <p className="text-xs text-white">Veículos</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/temperatura/resfriado" className="cursor-pointer">
          <Card className="bg-green-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Resfriado</CardTitle>
              <Thermometer className="h-6 w-6 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{counts.resfriado}</div>
              <p className="text-xs text-white">Veículos</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/tipo/kit-festa" className="cursor-pointer">
          <Card className="bg-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Kit Festa / Festivo</CardTitle>
              <PartyPopper className="h-6 w-6 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{counts.kitFesta}</div>
              <p className="text-xs text-white">Pedidos especiais</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </section>

    <section>
      <h2 className="text-xl font-semibold mb-4 text-center">Status dos Veículos</h2>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Link href="/dashboard/status/em-descarga" className="cursor-pointer">
          <Card className="bg-green-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Em-Descarga</CardTitle>
              <Truck className="h-6 w-6 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.emDescargaStatus}</div>
              <p className="text-xs text-white">Veículos atualmente</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/status/patio" className="cursor-pointer">
          <Card className="bg-red-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Pátio</CardTitle>
              <ParkingSquare className="h-6 w-6 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.patioStatus}</div>
              <p className="text-xs text-white">Veículos aguardando</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/status/finalizado" className="cursor-pointer">
          <Card className="bg-lime-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Finalizado</CardTitle>
              <CheckCircle className="h-6 w-6 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.finalizadoStatus}</div>
              <p className="text-xs text-white">Veículos hoje</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/status/ocorrencia/list" className="cursor-pointer">
          <Card className="bg-purple-900 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Ocorrência</CardTitle>
              <AlertTriangle className="h-6 w-6 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeOccurrencesCount}</div>
              <p className="text-xs text-white">Eventos registrados</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </section>

    <section>
      <h2 className="text-xl font-semibold mb-4 text-center">Recebimento & Expedição</h2>
      <VehicleTable vehicles={vehicles} setVehicles={setVehicles} onRemoveVehicle={handleRemoveVehicle} drivers={drivers} userRole={role} /> {/* Passando userRole */}
    </section>

    {(role === 'admin' || role === 'manager') && ( // Condicionalmente visível
      <section>
        <h2 className="text-xl font-semibold mb-4 text-center">Adicionar Veículo</h2>
        <AddVehicleForm onAddVehicle={handleAddVehicle} />
      </section>
    )}
    <footer className="mt-8 text-center text-sm text-muted-foreground">
      <p>Recebimento e Expedição, Tel. (71) 9-8523-2835</p>
      <p>Salvador Bahia CD 910</p>
    </footer>
  </div>
)
}
