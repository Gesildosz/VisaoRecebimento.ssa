'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VehicleData } from '@/types/vehicle'
import { OccurrenceDetail } from '@/types/occurrence'

interface DriverHistoryEntry {
  id: string;
  placa: string;
  dataChegada: string;
  doca: string;
  carga: string;
  teveOcorrencia: string;
  tipoOcorrencia: string;
  temperatura: string;
  tipoCarga: string;
  perfil: string;
  lacre: string;
  containerNumber?: string; // Adicionado
}

interface DriverHistoryCardListProps {
  history: DriverHistoryEntry[];
}

export function DriverHistoryCardList({ history }: DriverHistoryCardListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {history.length === 0 ? (
        <p className="col-span-full text-center py-8 text-muted-foreground">
          Nenhum registro de veículo encontrado para este motorista.
        </p>
      ) : (
        history.map((entry) => (
          <Card key={entry.id} className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">Placa: {entry.placa}</CardTitle>
              <p className="text-sm text-muted-foreground">Chegada: {entry.dataChegada}</p>
            </CardHeader>
            <CardContent className="flex-grow text-sm">
              <p><strong>Doca:</strong> {entry.doca}</p>
              <p><strong>Carga:</strong> {entry.carga}</p>
              <p><strong>Ocorrência:</strong> {entry.teveOcorrencia} {entry.teveOcorrencia === 'Sim' && `(${entry.tipoOcorrencia})`}</p>
              <p><strong>Temperatura:</strong> {entry.temperatura}</p>
              <p><strong>Tipo Carga:</strong> {entry.tipoCarga}</p>
              <p><strong>Perfil:</strong> {entry.perfil}</p>
              {entry.containerNumber && <p><strong>Contêiner:</strong> {entry.containerNumber}</p>} {/* Exibir contêiner */}
              <p><strong>Lacre:</strong> {entry.lacre}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
