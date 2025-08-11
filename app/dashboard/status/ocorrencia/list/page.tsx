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
import { ArrowLeftIcon, PrinterIcon, DownloadIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { OccurrenceDetail } from '@/types/occurrence'
import Image from 'next/image'
import jsPDF from 'jspdf'
// @ts-ignore
if (typeof window !== 'undefined') {
  window.jsPDF = jsPDF;
}
import 'jspdf-autotable'
import { format, isToday, parse, isBefore } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { OccurrenceCardList } from '@/components/occurrence-card-list'
import { toast } from "@/hooks/use-toast" // Importar toast

export default function OccurrenceListPage() {
  const router = useRouter()
  const [occurrences, setOccurrences] = useState<OccurrenceDetail[]>([])
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const storedOccurrencesString = localStorage.getItem('occurrences_data');
    const storedArchivedOccurrencesString = localStorage.getItem('archived_occurrences_data');
    const lastArchivedDateString = localStorage.getItem('last_archived_date');

    let loadedOccurrences: OccurrenceDetail[] = storedOccurrencesString ? JSON.parse(storedOccurrencesString) : [];
    let loadedArchivedOccurrences: OccurrenceDetail[] = storedArchivedOccurrencesString ? JSON.parse(storedArchivedOccurrencesString) : [];

    const today = new Date();
    const todayFormatted = format(today, 'yyyy-MM-dd');

    // Verifica se a data da última arquivamento é diferente de hoje
    if (lastArchivedDateString !== todayFormatted) {
      const occurrencesToArchive: OccurrenceDetail[] = [];
      const currentDayOccurrences: OccurrenceDetail[] = [];

      loadedOccurrences.forEach(occ => {
        const occDate = parse(occ.timestamp, 'dd/MM/yyyy HH:mm:ss', new Date());
        
        // Se a ocorrência não é de hoje, move para o arquivo
        if (!isToday(occDate)) {
          occurrencesToArchive.push(occ);
        } else {
          currentDayOccurrences.push(occ);
        }
      });

      if (occurrencesToArchive.length > 0) {
        loadedArchivedOccurrences = [...loadedArchivedOccurrences, ...occurrencesToArchive];
        localStorage.setItem('archived_occurrences_data', JSON.stringify(loadedArchivedOccurrences));
        localStorage.setItem('occurrences_data', JSON.stringify(currentDayOccurrences));
        localStorage.setItem('last_archived_date', todayFormatted);
        toast({
          title: "Ocorrências Arquivadas!",
          description: `${occurrencesToArchive.length} ocorrência(s) do dia anterior foram movidas para o arquivo.`,
          variant: "default"
        });
      } else {
        // Se não há ocorrências para arquivar, apenas atualiza a data de arquivamento
        localStorage.setItem('last_archived_date', todayFormatted);
      }
      setOccurrences(currentDayOccurrences);
    } else {
      setOccurrences(loadedOccurrences);
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

    let y = 60;
    const addField = (label: string, value: string) => {
      doc.text(`${label}: ${value}`, 14, y);
      y += 7;
    };

    addField('Cód', occ.cod);
    addField('Descrição do Produto', occ.descricaoProduto);
    addField('Classe', occ.classe); // Adicionado
    addField('Quantidade', occ.quantidade);
    addField('Validade', occ.validade);
    addField('Tipo de Ocorrência', occ.tipoOcorrencia);
    addField('Peso Total', `${occ.peso} kg`);

    y += 5;
    doc.setFontSize(14);
    doc.text('Descrição Detalhada da Ocorrência:', 14, y);
    y += 7;
    doc.setFontSize(12);
    const splitDescription = doc.splitTextToSize(occ.descricaoGeralOcorrencia, 180);
    doc.text(splitDescription, 14, y);

    if (isIndividual) {
      doc.save(`ocorrencia_${occ.placa}_${occ.numeroOcorrencia}.pdf`);
    }
    return doc;
  };

  const handleDownloadAllPdf = () => {
    if (occurrences.length === 0) {
      alert("Não há ocorrências para baixar.");
      return;
    }

    const doc = new jsPDF();
    let currentPage = 1;
    let yOffset = 20;

    occurrences.forEach((occ, index) => {
      if (index > 0) {
        doc.addPage();
        yOffset = 20;
      }

      doc.setFontSize(18);
      doc.text(`Ocorrência ${index + 1}/${occurrences.length}`, 14, yOffset);
      yOffset += 10;
      doc.setFontSize(16);
      doc.text(`Placa: ${occ.placa}`, 14, yOffset);
      yOffset += 8;
      doc.setFontSize(12);
      doc.text(`Número da Ocorrência: ${occ.numeroOcorrencia}`, 14, yOffset);
      yOffset += 7;
      doc.text(`Data de Registro: ${occ.timestamp}`, 14, yOffset);
      yOffset += 10;

      const addField = (label: string, value: string) => {
        doc.text(`${label}: ${value}`, 14, yOffset);
        yOffset += 7;
      };

      addField('Cód', occ.cod);
      addField('Descrição do Produto', occ.descricaoProduto);
      addField('Classe', occ.classe); // Adicionado
      addField('Quantidade', occ.quantidade);
      addField('Validade', occ.validade);
      addField('Tipo de Ocorrência', occ.tipoOcorrencia);
      addField('Peso Total', `${occ.peso} kg`);

      yOffset += 5;
      doc.setFontSize(14);
      doc.text('Descrição Detalhada da Ocorrência:', 14, yOffset);
      yOffset += 7;
      doc.setFontSize(12);
      const splitDescription = doc.splitTextToSize(occ.descricaoGeralOcorrencia, 180);
      doc.text(splitDescription, 14, yOffset);
      yOffset += splitDescription.length * 7 + 10;
    });

    doc.save(`todas_ocorrencias_${format(new Date(), 'ddMMyyyy_HHmmss')}.pdf`);
  };

  const handlePrintAll = () => {
    if (occurrences.length === 0) {
      alert("Não há ocorrências para imprimir.");
      return;
    }
    const doc = new jsPDF();
    let yOffset = 20;

    occurrences.forEach((occ, index) => {
      if (index > 0) {
        doc.addPage();
        yOffset = 20;
      }

      doc.setFontSize(18);
      doc.text(`Ocorrência ${index + 1}/${occurrences.length}`, 14, yOffset);
      yOffset += 10;
      doc.setFontSize(16);
      doc.text(`Placa: ${occ.placa}`, 14, yOffset);
      yOffset += 8;
      doc.setFontSize(12);
      doc.text(`Número da Ocorrência: ${occ.numeroOcorrencia}`, 14, yOffset);
      yOffset += 7;
      doc.text(`Data de Registro: ${occ.timestamp}`, 14, yOffset);
      yOffset += 10;

      const addField = (label: string, value: string) => {
        doc.text(`${label}: ${value}`, 14, yOffset);
        yOffset += 7;
      };

      addField('Cód', occ.cod);
      addField('Descrição do Produto', occ.descricaoProduto);
      addField('Classe', occ.classe); // Adicionado
      addField('Quantidade', occ.quantidade);
      addField('Validade', occ.validade);
      addField('Tipo de Ocorrência', occ.tipoOcorrencia);
      addField('Peso Total', `${occ.peso} kg`);

      yOffset += 5;
      doc.setFontSize(14);
      doc.text('Descrição Detalhada da Ocorrência:', 14, yOffset);
      yOffset += 7;
      doc.setFontSize(12);
      const splitDescription = doc.splitTextToSize(occ.descricaoGeralOcorrencia, 180);
      doc.text(splitDescription, 14, yOffset);
      yOffset += splitDescription.length * 7 + 10;
    });

    doc.output('dataurlnewwindow');
  };


  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
        <Button variant="outline" onClick={() => router.push('/dashboard')} className="w-full sm:w-auto">
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
          <h1 className="text-2xl font-bold text-center">Todas as Ocorrências Registradas</h1>
        </div>
      </div>
      <p className="text-center text-muted-foreground">Lista completa de todas as ocorrências registradas no sistema.</p>

      <div className="flex justify-end gap-2 mb-4">
        <Button onClick={handlePrintAll} variant="outline">
          <PrinterIcon className="mr-2 h-4 w-4" />
          Imprimir Todas
        </Button>
        <Button onClick={handleDownloadAllPdf} variant="outline">
          <DownloadIcon className="mr-2 h-4 w-4" />
          Baixar Todas em PDF
        </Button>
      </div>

      {isMobile ? (
        <OccurrenceCardList occurrences={occurrences} />
      ) : (
        <div className="w-full overflow-x-auto border rounded-lg shadow-sm">
          <Table>
            <TableCaption>Detalhes de todas as ocorrências.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Ocorrência</TableHead><TableHead>Placa</TableHead><TableHead>Cód. Produto</TableHead><TableHead>Descrição Produto</TableHead><TableHead>Classe</TableHead><TableHead>Quant.</TableHead><TableHead>Validade</TableHead><TableHead>Tipo</TableHead><TableHead>Peso</TableHead><TableHead>Descrição Geral</TableHead><TableHead>Data Registro</TableHead><TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {occurrences.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                    Nenhuma ocorrência registrada ainda.
                  </TableCell>
                </TableRow>
              ) : (
                occurrences.map((occ) => (
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
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
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
                    </TableCell>
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
