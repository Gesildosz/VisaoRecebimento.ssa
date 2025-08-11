'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OccurrenceDetail } from '@/types/occurrence'
import { Button } from "@/components/ui/button"
import { DownloadIcon, PrinterIcon } from 'lucide-react'
import jsPDF from 'jspdf'
// @ts-ignore
if (typeof window !== 'undefined') {
  window.jsPDF = jsPDF;
}
import 'jspdf-autotable'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface OccurrenceCardListProps {
  occurrences: OccurrenceDetail[];
}

export function OccurrenceCardList({ occurrences }: OccurrenceCardListProps) {

  const generatePdfForOccurrence = (occ: OccurrenceDetail, isIndividual: boolean = true) => {
    const doc = new jsPDF();

    const imgData = '/jbs-logo.png';
    const imgWidth = 30;
    const imgHeight = 30;
    const imgX = 14;
    const imgY = 14;
    doc.addImage(imgData, 'PNG', imgX, imgY, imgWidth, imgHeight);

    doc.setFontSize(22);
    doc.text('Relatório de Ocorrência', 105, 25, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Placa do Veículo: ${occ.placa}`, 105, 32, { align: 'center' });
    doc.text(`Número da Ocorrência: ${occ.numeroOcorrencia}`, 105, 38, { align: 'center' });
    doc.text(`Data de Registro: ${occ.timestamp}`, 105, 44, { align: 'center' });

    let yOffset = 60;

    doc.setFontSize(16);
    doc.text('Detalhes da Ocorrência', 14, yOffset);
    yOffset += 8;

    const tableData = [
      ['Cód:', occ.cod],
      ['Descrição do Produto:', occ.descricaoProduto],
      ['Classe:', occ.classe], // Adicionado
      ['Quantidade:', occ.quantidade],
      ['Validade:', occ.validade],
      ['Tipo de Ocorrência:', occ.tipoOcorrencia],
      ['Peso Total:', `${occ.peso} kg`],
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
    const splitDescription = doc.splitTextToSize(occ.descricaoGeralOcorrencia, 180);
    doc.text(splitDescription, 14, yOffset);

    if (isIndividual) {
      doc.save(`ocorrencia_${occ.placa}_${occ.numeroOcorrencia}.pdf`);
    }
    return doc;
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {occurrences.length === 0 ? (
        <p className="col-span-full text-center py-8 text-muted-foreground">
          Nenhuma ocorrência registrada ainda.
        </p>
      ) : (
        occurrences.map((occ) => (
          <Card key={occ.id} className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">Ocorrência Nº {occ.numeroOcorrencia}</CardTitle>
              <p className="text-sm text-muted-foreground">Placa: {occ.placa}</p>
            </CardHeader>
            <CardContent className="flex-grow text-sm">
              <p><strong>Cód. Produto:</strong> {occ.cod}</p>
              <p><strong>Descrição:</strong> {occ.descricaoProduto}</p>
              <p><strong>Classe:</strong> {occ.classe}</p> {/* Adicionado */}
              <p><strong>Quant.:</strong> {occ.quantidade}</p>
              <p><strong>Validade:</strong> {occ.validade}</p>
              <p><strong>Tipo:</strong> {occ.tipoOcorrencia}</p>
              <p><strong>Peso:</strong> {occ.peso} kg</p>
              <p className="mt-2"><strong>Descrição Geral:</strong> {occ.descricaoGeralOcorrencia}</p>
              <p className="text-xs text-muted-foreground mt-2">Registrado em: {occ.timestamp}</p>
            </CardContent>
            <div className="p-4 pt-0 flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => generatePdfForOccurrence(occ)}
                title="Baixar PDF desta ocorrência"
              >
                <DownloadIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generatePdfForOccurrence(occ).output('dataurlnewwindow')}
                title="Imprimir esta ocorrência"
              >
                <PrinterIcon className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}
