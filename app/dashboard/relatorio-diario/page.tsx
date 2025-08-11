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
import { ArrowLeftIcon, PrinterIcon, DownloadIcon, Truck, AlertTriangle, Package, CalendarDays } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { VehicleData } from '@/types/vehicle'
import { DriverData } from '@/types/driver'
import { OccurrenceDetail } from '@/types/occurrence'
import Image from 'next/image'
import jsPDF from 'jspdf'
// @ts-ignore
if (typeof window !== 'undefined') {
  window.jsPDF = jsPDF;
}
import 'jspdf-autotable'
import { format, isToday, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { normalizeString, cn } from '@/lib/utils' // Importar normalizeString de lib/utils
import { toast } from "@/hooks/use-toast"
import { VehicleCardList } from '@/components/vehicle-card-list'
import { OccurrenceCardList } from '@/components/occurrence-card-list'
import Link from 'next/link'
import { useUserRole } from '@/components/user-role-context' // Adicionado

export default function DailyReportPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<VehicleData[]>([])
  const [drivers, setDrivers] = useState<DriverData[]>([])
  const [occurrences, setOccurrences] = useState<OccurrenceDetail[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const { role: userRole } = useUserRole(); // Adicionado

  useEffect(() => {
    const storedVehiclesString = localStorage.getItem('vehicles_data');
    const storedDriversString = localStorage.getItem('drivers_data');
    const storedOccurrencesString = localStorage.getItem('occurrences_data');

    setVehicles(storedVehiclesString ? JSON.parse(storedVehiclesString) : []);
    setDrivers(storedDriversString ? JSON.parse(storedDriversString) : []);
    setOccurrences(storedOccurrencesString ? JSON.parse(storedOccurrencesString) : []);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const dailyVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      if (!vehicle.dataChegada) return false;
      const arrivalDate = parse(vehicle.dataChegada, 'dd/MM/yyyy', new Date());
      return isToday(arrivalDate);
    });
  }, [vehicles]);

  const dailyOccurrences = useMemo(() => {
    return occurrences.filter(occ => {
      const occDate = parse(occ.timestamp, 'dd/MM/yyyy HH:mm:ss', new Date());
      return isToday(occDate);
    });
  }, [occurrences]);

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

  const generateDailyReportPdf = (openInNewWindow: boolean = false) => {
    const doc = new jsPDF();
    const currentDateTime = format(new Date(), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });

    // JBS Logo
    const imgData = '/jbs-logo.png';
    const imgWidth = 30;
    const imgHeight = 30;
    const imgX = 14;
    const imgY = 14;
    doc.addImage(imgData, 'PNG', imgX, imgY, imgWidth, imgHeight);

    // Header
    doc.setFontSize(22);
    doc.text('Relatório Diário de Recebimento & Expedição', 105, 25, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Data e Hora do Relatório: ${currentDateTime}`, 105, 32, { align: 'center' });

    let yOffset = 50;

    // Summary Section
    doc.setFontSize(16);
    doc.text('Resumo do Dia', 14, yOffset);
    yOffset += 8;
    doc.setFontSize(12);
    doc.text(`Total de Veículos Chegados Hoje: ${dailyVehicles.length}`, 14, yOffset);
    yOffset += 7;
    doc.text(`Total de Ocorrências Registradas Hoje: ${dailyOccurrences.length}`, 14, yOffset);
    yOffset += 15;

    // Vehicles Table
    doc.setFontSize(16);
    doc.text('Veículos Chegados Hoje', 14, yOffset);
    yOffset += 8;

    const vehicleHeaders = ["Doca", "Carga", "Placa", "Temperatura", "Lacre", "Status", "Ocorrência", "Perfil", "Tipo", "Contêiner", "Motorista", "Transportadora", "Chegada", "Agendamento"]; // Adicionado Contêiner
    const vehicleData = dailyVehicles.map(vehicle => {
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
        vehicle.dataChegada || 'N/A',
        vehicle.dataAgendamento || 'N/A',
      ];
    });

    // @ts-ignore
    doc.autoTable({
      startY: yOffset,
      head: [vehicleHeaders],
      body: vehicleData,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 1.5, overflow: 'linebreak' },
      headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 15 }, // Doca
        1: { cellWidth: 20 }, // Carga
        2: { cellWidth: 20 }, // Placa
        3: { cellWidth: 20 }, // Temperatura
        4: { cellWidth: 15 }, // Lacre
        5: { cellWidth: 20 }, // Status
        6: { cellWidth: 20 }, // Ocorrência
        7: { cellWidth: 15 }, // Perfil
        8: { cellWidth: 25 }, // Tipo
        9: { cellWidth: 20 }, // Contêiner
        10: { cellWidth: 25 }, // Motorista
        11: { cellWidth: 25 }, // Transportadora
        12: { cellWidth: 25 }, // Chegada
        13: { cellWidth: 25 }, // Agendamento
      },
      margin: { top: 10, left: 14, right: 14, bottom: 10 },
      didDrawPage: function (data) {
        let pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.text('Página ' + doc.internal.getCurrentPageInfo().pageNumber + ' de ' + pageCount, data.settings.margin.left, doc.internal.pageSize.height - 10);
      }
    });

    yOffset = (doc.autoTable as any).previous.finalY + 15;

    // Occurrences Table
    doc.setFontSize(16);
    doc.text('Ocorrências Registradas Hoje', 14, yOffset);
    yOffset += 8;

    const occurrenceHeaders = ["Nº Ocorrência", "Placa", "Cód. Produto", "Descrição Produto", "Classe", "Quant.", "Validade", "Tipo", "Peso", "Descrição Geral", "Data Registro"]; // Adicionado Classe
    const occurrenceData = dailyOccurrences.map(occ => [
      occ.numeroOcorrencia,
      occ.placa,
      occ.cod,
      occ.descricaoProduto,
      occ.classe, // Adicionado
      occ.quantidade,
      occ.validade,
      occ.tipoOcorrencia,
      `${occ.peso} kg`,
      occ.descricaoGeralOcorrencia,
      occ.timestamp,
    ]);

    // @ts-ignore
    doc.autoTable({
      startY: yOffset,
      head: [occurrenceHeaders],
      body: occurrenceData,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 1.5, overflow: 'linebreak' },
      headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 25 }, // Nº Ocorrência
        1: { cellWidth: 20 }, // Placa
        2: { cellWidth: 20 }, // Cód. Produto
        3: { cellWidth: 30 }, // Descrição Produto
        4: { cellWidth: 20 }, // Classe
        5: { cellWidth: 15 }, // Quant.
        6: { cellWidth: 20 }, // Validade
        7: { cellWidth: 20 }, // Tipo
        8: { cellWidth: 15 }, // Peso
        9: { cellWidth: 40 }, // Descrição Geral
        10: { cellWidth: 25 }, // Data Registro
      },
      margin: { top: 10, left: 14, right: 14, bottom: 10 },
      didDrawPage: function (data) {
        let pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.text('Página ' + doc.internal.getCurrentPageInfo().pageNumber + ' de ' + pageCount, data.settings.margin.left, doc.internal.pageSize.height - 10);
      }
    });

    if (openInNewWindow) {
      doc.output('dataurlnewwindow');
    } else {
      doc.save(`relatorio_diario_${format(new Date(), 'ddMMyyyy_HHmmss')}.pdf`);
      toast({
        title: "PDF Gerado!",
        description: "Relatório diário baixado com sucesso.",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-6xl mx-auto">
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
          <h1 className="text-2xl font-bold text-center">Relatório Diário de Recebimento & Expedição</h1>
        </div>
      </div>
      <p className="text-center text-muted-foreground">
        Visão geral e detalhes de todas as atividades de recebimento e expedição para o dia de hoje ({format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Truck className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-800">Veículos Chegados Hoje</p>
              <p className="text-2xl font-bold text-blue-900">{dailyVehicles.length}</p>
            </div>
          </div>
          <CalendarDays className="h-6 w-6 text-blue-500" />
        </div>
        <div className="bg-orange-100 p-4 rounded-lg shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-orange-800">Ocorrências Registradas Hoje</p>
              <p className="text-2xl font-bold text-orange-900">{dailyOccurrences.length}</p>
            </div>
          </div>
          <Package className="h-6 w-6 text-orange-500" />
        </div>
      </div>

      <div className="flex justify-end gap-2 mb-4 flex-wrap">
        <Button onClick={() => generateDailyReportPdf(true)} variant="outline">
          <PrinterIcon className="mr-2 h-4 w-4" />
          Imprimir Relatório
        </Button>
        <Button onClick={() => generateDailyReportPdf(false)} variant="outline">
          <DownloadIcon className="mr-2 h-4 w-4" />
          Baixar Relatório em PDF
        </Button>
      </div>

      <h2 className="text-xl font-semibold mb-4 text-center">Detalhes dos Veículos Chegados Hoje</h2>
      {isMobile ? (
        <VehicleCardList vehicles={dailyVehicles} setVehicles={setVehicles} onRemoveVehicle={handleRemoveVehicle} drivers={drivers} userRole={userRole} />
      ) : (
        <div className="w-full overflow-x-auto border rounded-lg shadow-sm">
          <Table>
            <TableCaption>Lista de todos os veículos que chegaram hoje.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Doca</TableHead><TableHead>Carga</TableHead><TableHead>Placa</TableHead><TableHead>Temperatura</TableHead><TableHead>Lacre</TableHead><TableHead>Status</TableHead><TableHead>Ocorrência</TableHead><TableHead>Perfil</TableHead><TableHead>Tipo</TableHead><TableHead>Contêiner</TableHead><TableHead>Motorista</TableHead><TableHead>Transportadora</TableHead><TableHead>Chegada</TableHead><TableHead>Agendamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyVehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={14} className="text-center py-8 text-muted-foreground">
                    Nenhum veículo chegou hoje.
                  </TableCell>
                </TableRow>
              ) : (
                dailyVehicles.map((vehicle) => {
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
                      <TableCell>{vehicle.dataChegada || 'N/A'}</TableCell>
                      <TableCell>{vehicle.dataAgendamento || 'N/A'}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4 text-center mt-6">Detalhes das Ocorrências Registradas Hoje</h2>
      {isMobile ? (
        <OccurrenceCardList occurrences={dailyOccurrences} />
      ) : (
        <div className="w-full overflow-x-auto border rounded-lg shadow-sm">
          <Table>
            <TableCaption>Lista de todas as ocorrências registradas hoje.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Ocorrência</TableHead><TableHead>Placa</TableHead><TableHead>Cód. Produto</TableHead><TableHead>Descrição Produto</TableHead><TableHead>Classe</TableHead><TableHead>Quant.</TableHead><TableHead>Validade</TableHead><TableHead>Tipo</TableHead><TableHead>Peso</TableHead><TableHead>Descrição Geral</TableHead><TableHead>Data Registro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyOccurrences.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                    Nenhuma ocorrência registrada hoje.
                  </TableCell>
                </TableRow>
              ) : (
                dailyOccurrences.map((occ) => (
                  <TableRow key={occ.id}>
                    <TableCell className="font-medium">{occ.numeroOcorrencia}</TableCell>
                    <TableCell>{occ.placa}</TableCell>
                    <TableCell>{occ.cod}</TableCell>
                    <TableCell>{occ.descricaoProduto}</TableCell>
                    <TableCell>{occ.classe}</TableCell> {/* Adicionado */}
                    <TableCell>{occ.quantidade}</TableCell>
                    <TableCell>{occ.validade}</TableCell>
                    <TableCell>{occ.tipoOcorrencia}</TableCell>
                    <TableCell>{occ.peso} kg</TableCell>
                    <TableCell className="max-w-[150px] truncate">{occ.descricaoGeralOcorrencia}</TableCell>
                    <TableCell>{occ.timestamp}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>Recebimento e Expedição, Tel. (71) 9-8523-2835</p>
        <p>Salvador Bahia CD 910</p>
      </footer>
    </div>
  )
}
