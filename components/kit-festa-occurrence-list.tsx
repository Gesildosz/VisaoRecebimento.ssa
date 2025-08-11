'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OccurrenceDetail } from '@/types/occurrence'
import { AlertTriangle } from 'lucide-react'

interface KitFestaOccurrenceListProps {
  occurrences: OccurrenceDetail[];
}

export function KitFestaOccurrenceList({ occurrences }: KitFestaOccurrenceListProps) {
  return (
    <div className="grid gap-4">
      {occurrences.length === 0 ? (
        <p className="text-center py-4 text-muted-foreground">
          Nenhuma ocorrência registrada para veículos Kit Festa.
        </p>
      ) : (
        occurrences.map((occ) => (
          <Card key={occ.id} className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Ocorrência: {occ.tipoOcorrencia}
              </CardTitle>
              <p className="text-sm text-muted-foreground">Placa: {occ.placa} | Nº: {occ.numeroOcorrencia}</p>
            </CardHeader>
            <CardContent className="flex-grow text-sm">
              <p><strong>Produto:</strong> {occ.descricaoProduto} ({occ.quantidade})</p>
              <p><strong>Classe:</strong> {occ.classe}</p> {/* Adicionado */}
              <p><strong>Peso:</strong> {occ.peso} kg</p>
              <p><strong>Validade:</strong> {occ.validade}</p>
              <p className="mt-2"><strong>Descrição:</strong> {occ.descricaoGeralOcorrencia}</p>
              <p className="text-xs text-muted-foreground mt-2">Registrado em: {occ.timestamp}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
