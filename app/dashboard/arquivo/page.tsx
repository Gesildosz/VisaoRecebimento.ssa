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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { ArrowLeftIcon, PrinterIcon, DownloadIcon, SearchIcon, CalendarIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { OccurrenceDetail } from '@/types/occurrence'
import Image from 'next/image'
import jsPDF from 'jspdf'
// @ts-ignore
if (typeof window !== 'undefined') {
  window.jsPDF = jsPDF;
}
import 'jspdf-autotable'
import { format, parseISO, isSameDay, isValid, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { OccurrenceCardList } from '@/components/occurrence-card-list'
import { cn, normalizeString } from '@/lib/utils' // Importar normalizeString de lib/utils

export default function ArchivedOccurrencesPage() {
  const router = useRouter()
  const [archivedOccurrences, setArchivedOccurrences] = useState<OccurrenceDetail[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const storedArchivedOccurrencesString = localStorage.getItem('archived_occurrences_data');
    if (storedArchivedOccurrencesString) {
      setArchivedOccurrences(JSON.parse(storedArchivedOccurrencesString));
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredOccurrences = useMemo(() => {
    let filtered = archivedOccurrences;

    if (searchTerm) {
      const normalizedSearchTerm = normalizeString(searchTerm);
      filtered = filtered.filter(occ =>
        normalizeString(occ.placa).includes(normalizedSearchTerm) ||
        normalizeString(occ.numeroOcorrencia).includes(normalizedSearchTerm) ||
        normalizeString(occ.descricaoProduto).includes(normalizedSearchTerm)
      );
    }

    if (filterDate) {
      filtered = filtered.filter(occ => {
        const occDate = parse(occ.timestamp, 'dd/MM/yyyy HH:mm:ss', new Date());
        return isValid(occDate) && isSameDay(occDate, filterDate);
      });
    }

    return filtered;
  }, [archivedOccurrences, searchTerm, filterDate]);

  const generatePdfForOccurrence = (occ: OccurrenceDetail, isIndividual: boolean = true) => {
    const doc = new jsPDF();

    const imgData = '/jbs-logo.png';
    const imgWidth = 30;
    const imgHeight = 30;
    const imgX = 14;
    const imgY = 14;
    doc.addImage(imgData, 'PNG', imgX, imgY, imgWidth, imgHeight);

    doc.setFontSize(22);
    doc.text('Relatório de Ocorrência Arquivada', 105, 25, { align: 'center' });

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
      doc.save(`ocorrencia_arquivada_${occ.placa}_${occ.numeroOcorrencia}.pdf`);
    }
    return doc;
  };

  const handleDownloadAllPdf = () => {
    if (filteredOccurrences.length === 0) {
      alert("Não há ocorrências arquivadas para baixar com os filtros atuais.");
      return;
    }

    const doc = new jsPDF();
    let yOffset = 20;

    filteredOccurrences.forEach((occ, index) => {
      if (index > 0) {
        doc.addPage();
        yOffset = 20;
      }

      doc.setFontSize(18);
      doc.text(`Ocorrência Arquivada ${index + 1}/${filteredOccurrences.length}`, 14, yOffset);
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

    doc.save(`ocorrencias_arquivadas_${format(new Date(), 'ddMMyyyy_HHmmss')}.pdf`);
  };

  const handlePrintAll = () => {
    if (filteredOccurrences.length === 0) {
      alert("Não há ocorrências arquivadas para imprimir com os filtros atuais.");
      return;
    }
    const doc = new jsPDF();
    let yOffset = 20;

    filteredOccurrences.forEach((occ, index) => {
      if (index > 0) {
        doc.addPage();
        yOffset = 20;
      }

      doc.setFontSize(18);
      doc.text(`Ocorrência Arquivada ${index + 1}/${filteredOccurrences.length}`, 14, yOffset);
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
          <h1 className="text-2xl font-bold text-center">Arquivo RCB & EXP</h1>
        </div>
      </div>
      <p className="text-center text-muted-foreground">Consulte ocorrências arquivadas por placa ou data.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="col-span-1 md:col-span-2">
          <Label htmlFor="search-term">Buscar por Placa, Nº Ocorrência ou Descrição:</Label>
          <div className="relative">
            <Input
              id="search-term"
              type="text"
              placeholder="Ex: ABC1234, 01012023123, Produto X"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
            <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <div>
          <Label htmlFor="filter-date">Filtrar por Data:</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filterDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filterDate ? format(filterDate, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filterDate}
                onSelect={setFilterDate}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex justify-end gap-2 mb-4">
        <Button onClick={handlePrintAll} variant="outline">
          <PrinterIcon className="mr-2 h-4 w-4" />
          Imprimir Filtrados
        </Button>
        <Button onClick={handleDownloadAllPdf} variant="outline">
          <DownloadIcon className="mr-2 h-4 w-4" />
          Baixar Filtrados em PDF
        </Button>
      </div>

      {isMobile ? (
        <OccurrenceCardList occurrences={filteredOccurrences} />
      ) : (
        <div className="w-full overflow-x-auto border rounded-lg shadow-sm">
          <Table>
            <TableCaption>Ocorrências arquivadas.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Ocorrência</TableHead><TableHead>Placa</TableHead><TableHead>Cód. Produto</TableHead><TableHead>Descrição Produto</TableHead><TableHead>Classe</TableHead><TableHead>Quant.</TableHead><TableHead>Validade</TableHead><TableHead>Tipo</TableHead><TableHead>Peso</TableHead><TableHead>Descrição Geral</TableHead><TableHead>Data Registro</TableHead><TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOccurrences.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                    Nenhuma ocorrência arquivada encontrada com os filtros atuais.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOccurrences.map((occ) => (
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
