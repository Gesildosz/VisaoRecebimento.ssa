'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { OccurrenceDetail } from '@/types/occurrence'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { DownloadIcon } from 'lucide-react'

interface VehicleOccurrenceDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  occurrences: OccurrenceDetail[];
  placa: string;
}

export function VehicleOccurrenceDetailDialog({ isOpen, onClose, occurrences, placa }: VehicleOccurrenceDetailDialogProps) {

  const handleDownloadPdf = (occurrence: OccurrenceDetail) => {
    const doc = new jsPDF();

    const imgData = '/jbs-logo.png'; // Certifique-se de que o logo está em public/jbs-logo.png
    const imgWidth = 30;
    const imgHeight = 30;
    const imgX = 14;
    const imgY = 14;
    doc.addImage(imgData, 'PNG', imgX, imgY, imgWidth, imgHeight);

    doc.setFontSize(22);
    doc.text('Relatório de Ocorrência', 105, 25, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Placa do Veículo: ${occurrence.placa}`, 105, 32, { align: 'center' });
    doc.text(`Número da Ocorrência: ${occurrence.numeroOcorrencia}`, 105, 38, { align: 'center' });
    doc.text(`Data de Registro: ${occurrence.timestamp}`, 105, 44, { align: 'center' });

    let yOffset = 60;

    doc.setFontSize(16);
    doc.text('Detalhes da Ocorrência', 14, yOffset);
    yOffset += 8;

    const tableData = [
      ['Cód:', occurrence.cod],
      ['Descrição do Produto:', occurrence.descricaoProduto],
      ['Classe:', occurrence.classe],
      ['Quantidade:', occurrence.quantidade],
      ['Validade:', occurrence.validade],
      ['Tipo de Ocorrência:', occurrence.tipoOcorrencia],
      ['Peso Total:', `${occurrence.peso} kg`],
    ];

    // @ts-ignore
    doc.autoTable({
      startY: yOffset,
      body: tableData,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 2, overflow: 'linebreak' },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 'auto' }
      },
      margin: { top: 0, left: 14, right: 14 },
      didDrawPage: function (data) {
        let pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.text('Página ' + doc.internal.getCurrentPageInfo().pageNumber + ' de ' + pageCount, data.settings.margin.left, doc.internal.pageSize.height - 10);
      }
    });

    yOffset = (doc.autoTable as any).previous.finalY + 10;

    doc.setFontSize(16);
    doc.text('Descrição Detalhada da Ocorrência:', 14, yOffset);
    yOffset += 8;
    doc.setFontSize(12);
    const splitDescription = doc.splitTextToSize(occurrence.descricaoGeralOcorrencia, 180);
    doc.text(splitDescription, 14, yOffset);

    doc.save(`ocorrencia_${occurrence.placa}_${occurrence.numeroOcorrencia}.pdf`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ocorrências para o Veículo: {placa}</DialogTitle>
          <DialogDescription>
            Detalhes de todas as ocorrências registradas para esta placa.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {occurrences.length > 0 ? (
            occurrences.map((occ) => (
              <Card key={occ.id} className="mb-4">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Ocorrência #{occ.numeroOcorrencia}
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => handleDownloadPdf(occ)}>
                    <DownloadIcon className="mr-2 h-4 w-4" /> Baixar PDF
                  </Button>
                </CardHeader>
                <CardContent className="text-sm">
                  <p><strong>Data:</strong> {occ.timestamp}</p>
                  <p><strong>Cód:</strong> {occ.cod}</p>
                  <p><strong>Produto:</strong> {occ.descricaoProduto}</p>
                  <p><strong>Classe:</strong> {occ.classe}</p>
                  <p><strong>Quantidade:</strong> {occ.quantidade}</p>
                  <p><strong>Validade:</strong> {occ.validade}</p>
                  <p><strong>Tipo:</strong> {occ.tipoOcorrencia}</p>
                  <p><strong>Peso:</strong> {occ.peso} kg</p>
                  <p className="mt-2"><strong>Descrição:</strong> {occ.descricaoGeralOcorrencia}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center text-muted-foreground">Nenhuma ocorrência encontrada para este veículo.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
