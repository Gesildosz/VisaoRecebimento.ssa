'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon, Truck, Snowflake, Thermometer, PartyPopper, ParkingSquare, CheckCircle, AlertTriangle, Gauge, Package, Factory, CalendarDays } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { VehicleData } from '@/types/vehicle'
import { OccurrenceDetail } from '@/types/occurrence'
import { normalizeString } from '@/lib/utils' // Importar de lib/utils
import { isToday, parse } from 'date-fns'

export default function KpiPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<VehicleData[]>([])
  const [occurrences, setOccurrences] = useState<OccurrenceDetail[]>([])

  // Função para carregar dados do localStorage
  const loadData = () => {
    const storedVehiclesString = localStorage.getItem('vehicles_data');
    const storedOccurrencesString = localStorage.getItem('occurrences_data');
    setVehicles(storedVehiclesString ? JSON.parse(storedVehiclesString) : []);
    setOccurrences(storedOccurrencesString ? JSON.parse(storedOccurrencesString) : []);
  };

  useEffect(() => {
    loadData(); // Carrega dados na montagem inicial

    // Adiciona um listener para o evento 'storage' para atualizações em tempo real
    // Isso é útil se o localStorage for modificado por outra aba/janela
    window.addEventListener('storage', loadData);

    return () => {
      window.removeEventListener('storage', loadData);
    };
  }, []);

  const kpis = useMemo(() => {
    const totalVehicles = vehicles.length;

    const vehiclesByStatus = vehicles.reduce((acc, vehicle) => {
      const status = normalizeString(vehicle.status || '');
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const vehiclesByTemperature = vehicles.reduce((acc, vehicle) => {
      const temp = normalizeString(vehicle.temperatura || '');
      acc[temp] = (acc[temp] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const vehiclesByType = vehicles.reduce((acc, vehicle) => {
      const type = normalizeString(vehicle.tipo || '');
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const activeOccurrences = occurrences.filter(occ => {
      const occDate = parse(occ.timestamp, 'dd/MM/yyyy HH:mm:ss', new Date());
      return isToday(occDate);
    });
    const totalActiveOccurrences = activeOccurrences.length;

    const occurrencesByType = activeOccurrences.reduce((acc, occ) => {
      const type = normalizeString(occ.tipoOcorrencia || '');
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const vehiclesWithActiveOccurrence = new Set(activeOccurrences.map(occ => occ.placa)).size;
    const percentageVehiclesWithOccurrence = totalVehicles > 0
      ? ((vehiclesWithActiveOccurrence / totalVehicles) * 100).toFixed(2)
      : '0.00';

    return {
      totalVehicles,
      vehiclesByStatus,
      vehiclesByTemperature,
      vehiclesByType,
      totalActiveOccurrences,
      occurrencesByType,
      vehiclesWithActiveOccurrence,
      percentageVehiclesWithOccurrence,
    };
  }, [vehicles, occurrences]);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-6xl mx-auto">
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
          <h1 className="text-2xl font-bold text-center">KPIs de Recebimento & Expedição</h1>
        </div>
      </div>
      <p className="text-center text-muted-foreground">Indicadores chave de performance atualizados em tempo real.</p>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total de Veículos</CardTitle>
            <Truck className="h-6 w-6 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalVehicles}</div>
            <p className="text-xs text-white">Veículos registrados no sistema</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Ocorrências Ativas (Hoje)</CardTitle>
            <AlertTriangle className="h-6 w-6 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalActiveOccurrences}</div>
            <p className="text-xs text-white">Ocorrências registradas hoje</p>
          </CardContent>
        </Card>

        <Card className="bg-orange-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Veículos com Ocorrência (%)</CardTitle>
            <Gauge className="h-6 w-6 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.percentageVehiclesWithOccurrence}%</div>
            <p className="text-xs text-white">{kpis.vehiclesWithActiveOccurrence} de {kpis.totalVehicles} veículos com ocorrência ativa</p>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 text-center">Veículos por Status</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Em Descarga</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.vehiclesByStatus['em-descarga'] || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pátio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.vehiclesByStatus['patio'] || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Finalizado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.vehiclesByStatus['finalizado'] || 0}</div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 text-center">Veículos por Temperatura</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Congelado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.vehiclesByTemperature['congelado'] || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Resfriado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.vehiclesByTemperature['resfriado'] || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Mista</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.vehiclesByTemperature['mista'] || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Seca</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.vehiclesByTemperature['seca'] || 0}</div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 text-center">Veículos por Tipo de Carga</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Abastecimento CD</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.vehiclesByType['abastecimento cd'] || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Abastecimento + T/NF</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.vehiclesByType['abastecimento + t/nf'] || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Abastecimento + V/D</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.vehiclesByType['abastecimento + v/d'] || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Kit Festa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.vehiclesByType['kit festa'] || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Outros Tipos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.vehiclesByType['outros'] || 0}</div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 text-center">Ocorrências Ativas por Tipo</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avaria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.occurrencesByType['avaria'] || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Falta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.occurrencesByType['falta'] || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sobra</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.occurrencesByType['sobra'] || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Shelf Life</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.occurrencesByType['shelf life'] || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Outros Tipos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.occurrencesByType['outros'] || 0}</div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
