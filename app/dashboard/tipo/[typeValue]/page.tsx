'use client'

import { useState, useEffect } from 'react'
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
import { ArrowLeftIcon, PrinterIcon, DownloadIcon, Trash2 } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { VehicleData } from '@/types/vehicle'
import { DriverData } from '@/types/driver'
import Image from 'next/image'
import jsPDF from 'jspdf'
// @ts-ignore
if (typeof window !== 'undefined') {
  window.jsPDF = jsPDF;
}
import 'jspdf-autotable'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { normalizeString, cn } from '@/lib/utils' // Importar normalizeString de lib/utils
import { VehicleCardList } from '@/components/vehicle-card-list'
import { toast } from "@/hooks/use-toast"
import Link from 'next/link'
import { useUserRole } from '@/components/user-role-context' // Adicionado

export default function VehicleTypeListPage() {
  const router = useRouter()
  const params = useParams()
  const typeValue = (params.typeValue as string | undefined) || '';

  const [vehicles, setVehicles] = useState<VehicleData[]>([])
  const [drivers, setDrivers] = useState<DriverData[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleData[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const { role: userRole } = useUserRole(); // Adicionado

  useEffect(() => {
    const storedVehiclesString = localStorage.getItem('vehicles_data');
    const storedDriversString = localStorage.getItem('drivers_data');
    if (storedVehiclesString) {
      setVehicles(JSON.parse(storedVehiclesString));
    }
    if (storedDriversString) {
      setDrivers(JSON.parse(storedDriversString));
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [typeValue]);

  useEffect(() => {
    const filtered = vehicles.filter(vehicle =>
      normalizeString(vehicle.tipo || '') === normalizeString(typeValue)
    );
    setFilteredVehicles(filtered);
  }, [vehicles, typeValue]);

  const getTitleForType = (type: string) => {
    switch (normalizeString(type)) {
      case 'kit-festa': return 'Veículos Kit Festa / Festivo';
      case 'abastecimento-cd': return 'Veículos Abastecimento CD';
      case 'abastecimento-t-nf': return 'Veículos Abastecimento + T/NF';
      case 'abastecimento-v-d': return 'Veículos Abastecimento + V/D';
      case 'outros': return 'Outros Tipos de Veículos';
      default: return `Veículos do Tipo: ${type}`;
    }
  };

  const getDriverInfo = (driverId?: string) => {
    if (!driverId) return null;
    return drivers.find(d => d.id === driverId);
  };

  const handleRemoveVehicle = (id: string, placa: string) => {
    if (userRole === 'viewer') { // Adicionado
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para remover veículos.",
        variant: "destructive"
      });
      return;
    }
    setVehicles((prevVehicles) => {
      const updatedVehicles = prevVehicles.filter(vehicle => vehicle.id !== id);
      localStorage.setItem('vehicles_data', JSON.stringify(updatedVehicles));
      return updatedVehicles;
    });
    toast({
      title: "Veículo Removido!",
      description: `O veículo de placa ${placa} foi removido com sucesso.`,
      variant: "destructive"
    });
  };

  const handleDownloadPdf = () => {
    if (filteredVehicles.length === 0) {
      alert("Não há veículos para baixar neste tipo.");
      return;
    }

    const doc = new jsPDF();
    let yOffset = 20;

    doc.setFontSize(18);
    doc.text(getTitleForType(typeValue), 14, yOffset);
    yOffset += 10;
    doc.setFontSize(12);
    doc.text(`Data de Geração: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}`, 14, yOffset);
    yOffset += 15;

    const headers = ["Doca", "Carga", "Placa", "Temperatura", "Lacre", "Status", "Ocorrência", "Perfil", "Tipo", "Contêiner", "Motorista", "Transportadora"]; // Adicionado Contêiner
    const data = filteredVehicles.map(vehicle => {
      const driver = getDriverInfo(vehicle.driverId);
      return [
        vehicle.doca,
        vehicle.carga,
        vehicle.placa,
        vehicle.temperatura,
        vehicle.lacre,
        vehicle.status,
        vehicle.ocorrencia,
        vehicle.perfil,
        vehicle.tipo,
        vehicle.containerNumber || 'N/A', // Adicionado Contêiner
        driver?.fullName || 'N/A',
        driver?.carrier || 'N/A',
      ];
    });

    // @ts-ignore
    doc.autoTable({
      startY: yOffset,
      head: [headers],
      body: data,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
      margin: { top: 10, left: 14, right: 14, bottom: 10 },
    });

    doc.save(`${typeValue}_vehicles_${format(new Date(), 'ddMMyyyy_HHmmss')}.pdf`);
  };

  const handlePrint = () => {
    if (filteredVehicles.length === 0) {
      alert("Não há veículos para imprimir neste tipo.");
      return;
    }

    const doc = new jsPDF();
    let yOffset = 20;

    doc.setFontSize(18);
    doc.text(getTitleForType(typeValue), 14, yOffset);
    yOffset += 10;
    doc.setFontSize(12);
    doc.text(`Data de Geração: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}`, 14, yOffset);
    yOffset += 15;

    const headers = ["Doca", "Carga", "Placa", "Temperatura", "Lacre", "Status", "Ocorrência", "Perfil", "Tipo", "Contêiner", "Motorista", "Transportadora"]; // Adicionado Contêiner
    const data = filteredVehicles.map(vehicle => {
      const driver = getDriverInfo(vehicle.driverId);
      return [
        vehicle.doca,
        vehicle.carga,
        vehicle.placa,
        vehicle.temperatura,
        vehicle.lacre,
        vehicle.status,
        vehicle.ocorrencia,
        vehicle.perfil,
        vehicle.tipo,
        vehicle.containerNumber || 'N/A', // Adicionado Contêiner
        driver?.fullName || 'N/A',
        driver?.carrier || 'N/A',
      ];
    });

    // @ts-ignore
    doc.autoTable({
      startY: yOffset,
      head: [headers],
      body: data,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
      margin: { top: 10, left: 14, right: 14, bottom: 10 },
    });

    doc.output('dataurlnewwindow');
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
        <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Voltar para o Dashboard
        </Button>
        <div className="flex items-center justify-center sm:justify-end gap-4 flex-grow">
          <Image
            src="/jbs-logo.png"
            alt="JBS Logo"
            width={60}
            height={60}
            className="object-contain"
          />
          <h1 className="text-2xl font-bold text-center">{getTitleForType(typeValue)}</h1>
        </div>
      </div>
      <p className="text-center text-muted-foreground">Lista de veículos do tipo: {typeValue}.</p>

      <div className="flex justify-end gap-2 mb-4">
        <Button onClick={handlePrint} variant="outline">
          <PrinterIcon className="mr-2 h-4 w-4" />
          Imprimir Lista
        </Button>
        <Button onClick={handleDownloadPdf} variant="outline">
          <DownloadIcon className="mr-2 h-4 w-4" />
          Baixar Lista em PDF
        </Button>
      </div>

      {isMobile ? (
        <VehicleCardList vehicles={filteredVehicles} setVehicles={setVehicles} onRemoveVehicle={handleRemoveVehicle} drivers={drivers} userRole={userRole} />
      ) : (
        <div className="w-full overflow-x-auto border rounded-lg shadow-sm">
          <Table>
            <TableCaption>Detalhes dos veículos do tipo {typeValue}.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Doca</TableHead><TableHead>Carga</TableHead><TableHead>Placa</TableHead><TableHead>Temperatura</TableHead><TableHead>Lacre</TableHead><TableHead>Status</TableHead><TableHead>Ocorrência</TableHead><TableHead>Perfil</TableHead><TableHead>Tipo</TableHead><TableHead>Contêiner</TableHead><TableHead>Motorista</TableHead><TableHead>Transportadora</TableHead><TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
                    Nenhum veículo encontrado do tipo "{typeValue}".
                  </TableCell>
                </TableRow>
              ) : (
                filteredVehicles.map((vehicle) => {
                  const driver = getDriverInfo(vehicle.driverId);
                  return (
                    <TableRow
                      key={vehicle.id}
                      className={cn(
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
                      <TableCell>{vehicle.temperatura}</TableCell>
                      <TableCell>{vehicle.lacre}</TableCell>
                      <TableCell>{vehicle.status}</TableCell>
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
                            {vehicle.ocorrencia}
                          </Link>
                        )}
                      </TableCell>
                      <TableCell>{vehicle.perfil}</TableCell>
                      <TableCell>{vehicle.tipo}</TableCell>
                      <TableCell>{vehicle.containerNumber || 'N/A'}</TableCell> {/* Adicionado Contêiner */}
                      <TableCell>{driver?.fullName || 'N/A'}</TableCell>
                      <TableCell>{driver?.carrier || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        {(userRole === 'admin' || userRole === 'manager') && ( // Apenas admin e manager podem remover
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleRemoveVehicle(vehicle.id, vehicle.placa)}
                            title={`Remover veículo ${vehicle.placa}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
