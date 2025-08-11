'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VehicleData } from '@/types/vehicle'
import { DriverData } from '@/types/driver'
import { Button } from "@/components/ui/button"
import { DownloadIcon, PrinterIcon, Trash2 } from 'lucide-react'
import jsPDF from 'jspdf'
// @ts-ignore
if (typeof window !== 'undefined') {
  window.jsPDF = jsPDF;
}
import 'jspdf-autotable'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { UserRole } from '@/types/user' // Adicionado

interface KitFestaVehicleCardListProps {
  vehicles: VehicleData[];
  onRemoveVehicle: (id: string, placa: string) => void;
  drivers: DriverData[];
  userRole: UserRole; // Adicionado
}

export function KitFestaVehicleCardList({ vehicles, onRemoveVehicle, drivers, userRole }: KitFestaVehicleCardListProps) {

  const getDriverInfo = (driverId?: string) => {
    if (!driverId) return null;
    return drivers.find(d => d.id === driverId);
  };

  const generatePdfForVehicle = (vehicle: VehicleData) => {
    const doc = new jsPDF();
    let yOffset = 20;

    doc.setFontSize(18);
    doc.text(`Detalhes do Veículo Kit Festa - Placa: ${vehicle.placa}`, 14, yOffset);
    yOffset += 10;
    doc.setFontSize(12);
    doc.text(`Data de Geração: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}`, 14, yOffset);
    yOffset += 15;

    const driver = getDriverInfo(vehicle.driverId);

    const data = [
      ["Doca:", vehicle.doca],
      ["Carga:", vehicle.carga],
      ["Placa:", vehicle.placa],
      ["Temperatura:", vehicle.temperatura],
      ["Lacre:", vehicle.lacre],
      ["Status:", vehicle.status],
      ["Ocorrência:", vehicle.ocorrencia],
      ["Perfil:", vehicle.perfil],
      ["Tipo:", vehicle.tipo],
      ["Chegada:", vehicle.dataChegada || 'N/A'],
      ["Agendamento:", vehicle.dataAgendamento || 'N/A'],
    ];

    if (vehicle.containerNumber) { // Adicionado
      data.push(["Contêiner:", vehicle.containerNumber]);
    }

    if (driver) {
      data.push(["Motorista:", driver.fullName || 'N/A']);
      data.push(["Whatsapp:", driver.whatsapp || 'N/A']);
      data.push(["Estado:", driver.state || 'N/A']);
      data.push(["Cidade:", driver.city || 'N/A']);
      data.push(["Transportadora:", driver.carrier || 'N/A']);
    }

    // @ts-ignore
    doc.autoTable({
      startY: yOffset,
      body: data,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 2, overflow: 'linebreak' },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } },
      margin: { top: 10, left: 14, right: 14, bottom: 10 },
    });

    doc.save(`kit_festa_veiculo_${vehicle.placa}.pdf`);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {vehicles.length === 0 ? (
        <p className="col-span-full text-center py-8 text-muted-foreground">
          Nenhum veículo Kit Festa registrado ainda.
        </p>
      ) : (
        vehicles.map((vehicle) => {
          const driver = getDriverInfo(vehicle.driverId);
          return (
            <Card key={vehicle.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">Placa: {vehicle.placa}</CardTitle>
                <p className="text-sm text-muted-foreground">Doca: {vehicle.doca} | Carga: {vehicle.carga}</p>
              </CardHeader>
              <CardContent className="flex-grow text-sm">
                <p><strong>Temperatura:</strong> {vehicle.temperatura}</p>
                <p><strong>Lacre:</strong> {vehicle.lacre}</p>
                <p><strong>Status:</strong> {vehicle.status}</p>
                <p><strong>Ocorrência:</strong>
                  {vehicle.status === 'Pátio' || userRole === 'viewer' ? ( // Desabilitar link para Pátio e viewer
                    <span className="text-muted-foreground">
                      {vehicle.status === 'Pátio' ? 'Pátio' : vehicle.ocorrencia}
                    </span>
                  ) : (
                    <Link
                      href={`/dashboard/ocorrencia/${vehicle.placa}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer text-blue-600 hover:underline ml-1"
                    >
                      {vehicle.ocorrencia}
                    </Link>
                  )}
                </p>
                <p><strong>Perfil:</strong> {vehicle.perfil}</p>
                {vehicle.containerNumber && <p><strong>Contêiner:</strong> {vehicle.containerNumber}</p>} {/* Adicionado */}
                <p><strong>Chegada:</strong> {vehicle.dataChegada || 'N/A'}</p>
                <p><strong>Agendamento:</strong> {vehicle.dataAgendamento || 'N/A'}</p>
                {driver && (
                  <>
                    <p className="mt-2 text-base font-semibold">Dados do Motorista:</p>
                    <p><strong>Nome:</strong> {driver.fullName}</p>
                    <p><strong>Whatsapp:</strong> {driver.whatsapp}</p>
                    <p><strong>Transportadora:</strong> {driver.carrier}</p>
                  </>
                )}
              </CardContent>
              <div className="p-4 pt-0 flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generatePdfForVehicle(vehicle)}
                  title="Baixar PDF deste veículo"
                >
                  <DownloadIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generatePdfForVehicle(vehicle).output('dataurlnewwindow')}
                  title="Imprimir este veículo"
                >
                  <PrinterIcon className="h-4 w-4" />
                </Button>
                {(userRole === 'admin' || userRole === 'manager') && ( // Apenas admin e manager podem remover
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onRemoveVehicle(vehicle.id, vehicle.placa)}
                    title={`Remover veículo ${vehicle.placa}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          );
        })
      )}
    </div>
  )
}
