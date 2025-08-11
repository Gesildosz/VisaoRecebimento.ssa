'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { OccurrenceDetail } from '@/types/occurrence'
import { mockProductBase, ProductBase } from '@/types/product-base' // Importar mockProductBase
import { normalizeString } from '@/lib/string-utils'
import { format, isToday, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { OccurrenceCardList } from '@/components/occurrence-card-list'
import { ArrowLeftIcon } from 'lucide-react'
import Image from 'next/image'

export default function RegisterOccurrencePage() {
  const params = useParams()
  const router = useRouter()
  const placa = params.placa as string

  const [cod, setCod] = useState('')
  const [descricaoProduto, setDescricaoProduto] = useState('')
  const [classe, setClasse] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [validade, setValidade] = useState('')
  const [tipoOcorrencia, setTipoOcorrencia] = useState('')
  const [peso, setPeso] = useState('')
  const [descricaoGeralOcorrencia, setDescricaoGeralOcorrencia] = useState('')
  const [allOccurrences, setAllOccurrences] = useState<OccurrenceDetail[]>([])

  useEffect(() => {
    const storedOccurrencesString = localStorage.getItem('occurrences_data')
    const loadedOccurrences: OccurrenceDetail[] = storedOccurrencesString ? JSON.parse(storedOccurrencesString) : []
    setAllOccurrences(loadedOccurrences)
  }, [])

  useEffect(() => {
    if (cod.length >= 3) { // Começa a buscar após 3 caracteres
      const normalizedCod = normalizeString(cod)
      console.log("Código digitado (cod):", cod);
      console.log("Código normalizado para busca:", normalizedCod);

      const foundProduct = mockProductBase.find(product =>
        normalizeString(product.codigoProduto).includes(normalizedCod)
      )

      if (foundProduct) {
        console.log("Produto encontrado (após normalização):", foundProduct);
        setDescricaoProduto(foundProduct.descricao)
        setClasse(foundProduct.categoria) // Usar 'categoria' conforme ProductBase
      } else {
        console.log("Nenhum produto encontrado para o código:", cod);
        setDescricaoProduto('')
        setClasse('')
      }
    } else {
      setDescricaoProduto('')
      setClasse('')
    }
  }, [cod])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!cod || !descricaoProduto || !quantidade || !validade || !tipoOcorrencia || !peso || !descricaoGeralOcorrencia) {
      toast({
        title: "Erro no Registro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    const newOccurrence: OccurrenceDetail = {
      id: String(Date.now()),
      placa: placa,
      numeroOcorrencia: `OCC-${Date.now().toString().slice(-6)}`, // Exemplo de número de ocorrência
      cod,
      descricaoProduto,
      quantidade,
      validade,
      tipoOcorrencia,
      peso,
      descricaoGeralOcorrencia,
      timestamp: format(new Date(), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }),
      classe,
    }

    const updatedOccurrences = [...allOccurrences, newOccurrence]
    localStorage.setItem('occurrences_data', JSON.stringify(updatedOccurrences))
    setAllOccurrences(updatedOccurrences)

    // Atualizar o status de ocorrência do veículo no localStorage
    const storedVehiclesString = localStorage.getItem('vehicles_data');
    if (storedVehiclesString) {
      let loadedVehicles = JSON.parse(storedVehiclesString);
      const vehicleIndex = loadedVehicles.findIndex((v: { placa: string }) => v.placa === placa);
      if (vehicleIndex !== -1) {
        loadedVehicles[vehicleIndex] = {
          ...loadedVehicles[vehicleIndex],
          ocorrencia: "Registrada"
        };
        localStorage.setItem('vehicles_data', JSON.stringify(loadedVehicles));
      }
    }

    toast({
      title: "Ocorrência Registrada!",
      description: `Ocorrência ${newOccurrence.numeroOcorrencia} para a placa ${placa} registrada com sucesso.`,
    })

    // Limpar formulário
    setCod('')
    setDescricaoProduto('')
    setClasse('')
    setQuantidade('')
    setValidade('')
    setTipoOcorrencia('')
    setPeso('')
    setDescricaoGeralOcorrencia('')
  }

  const occurrencesForPlaca = useMemo(() => {
    return allOccurrences
      .filter(occ => occ.placa === placa)
      .sort((a, b) => parse(b.timestamp, 'dd/MM/yyyy HH:mm:ss', new Date()).getTime() - parse(a.timestamp, 'dd/MM/yyyy HH:mm:ss', new Date()).getTime());
  }, [allOccurrences, placa]);

  const todayOccurrences = useMemo(() => {
    return occurrencesForPlaca.filter(occ => {
      const occDate = parse(occ.timestamp, 'dd/MM/yyyy HH:mm:ss', new Date());
      return isToday(occDate);
    });
  }, [occurrencesForPlaca]);

  const previousOccurrences = useMemo(() => {
    return occurrencesForPlaca.filter(occ => {
      const occDate = parse(occ.timestamp, 'dd/MM/yyyy HH:mm:ss', new Date());
      return !isToday(occDate);
    });
  }, [occurrencesForPlaca]);


  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-start mb-4">
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Voltar para o Dashboard
        </Button>
      </div>
      <div className="flex items-center justify-center sm:justify-end gap-4 flex-grow mb-4">
        <Image
          src="/jbs-logo.png"
          alt="JBS Logo"
          width={60}
          height={60}
          className="object-contain"
        />
        <h1 className="text-2xl font-bold text-center">Registrar Nova Ocorrência para Placa: {placa}</h1>
      </div>

      {occurrencesForPlaca.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xl font-semibold mb-4 text-center">Histórico de Ocorrências para {placa}</h2>
          {todayOccurrences.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Ocorrências de Hoje</h3>
              <OccurrenceCardList occurrences={todayOccurrences} />
            </div>
          )}
          {previousOccurrences.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Ocorrências Anteriores</h3>
              <OccurrenceCardList occurrences={previousOccurrences} />
            </div>
          )}
          {todayOccurrences.length === 0 && previousOccurrences.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">Nenhuma ocorrência registrada para esta placa ainda.</p>
          )}
        </section>
      )}

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">Novo Registro</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="cod" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Cód:</label>
              <Input id="cod" value={cod} onChange={(e) => setCod(e.target.value)} placeholder="Código do Produto" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="descricaoProduto" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Descrição do Produto:</label>
              <Input id="descricaoProduto" value={descricaoProduto} onChange={(e) => setDescricaoProduto(e.target.value)} placeholder="Descrição detalhada do produto" required readOnly />
            </div>
            <div className="space-y-2">
              <label htmlFor="classe" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Classe:</label>
              <Input id="classe" value={classe} onChange={(e) => setClasse(e.target.value)} placeholder="Classe do Produto" required readOnly />
            </div>
            <div className="space-y-2">
              <label htmlFor="quantidade" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Quant.:</label>
              <Input id="quantidade" type="number" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} placeholder="Quantidade da Ocorrência" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="validade" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Validade:</label>
              <Input id="validade" type="date" value={validade} onChange={(e) => setValidade(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label htmlFor="tipoOcorrencia" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Tipo de Ocorrência:</label>
              <Select value={tipoOcorrencia} onValueChange={setTipoOcorrencia} required>
                <SelectTrigger id="tipoOcorrencia">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Avaria">Avaria</SelectItem>
                  <SelectItem value="Falta">Falta</SelectItem>
                  <SelectItem value="Sobra">Sobra</SelectItem>
                  <SelectItem value="Shelf">Shelf</SelectItem>
                  <SelectItem value="Inversão">Inversão</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="peso" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Peso Total (kg):</label>
              <Input id="peso" type="number" step="0.01" value={peso} onChange={(e) => setPeso(e.target.value)} placeholder="Peso em kg" required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="descricaoGeralOcorrencia" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Descrição Geral da Ocorrência:</label>
              <Textarea id="descricaoGeralOcorrencia" value={descricaoGeralOcorrencia} onChange={(e) => setDescricaoGeralOcorrencia(e.target.value)} placeholder="Descreva detalhadamente a ocorrência" required />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit">Registrar Ocorrência</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>Recebimento e Expedição, Tel. (71) 9-8523-2835</p>
        <p>Salvador Bahia CD 910</p>
      </footer>
    </div>
  )
}
