'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import { VehicleData } from '@/types/vehicle'
import { DriverData } from '@/types/driver' // Importar DriverData

interface AddVehicleFormProps {
  onAddVehicle: (
    newVehicle: Omit<VehicleData, 'id' | 'status' | 'ocorrencia' | 'driverId'> & { dataChegada: string, dataAgendamento: string, containerNumber?: string },
    newDriver?: Omit<DriverData, 'id'> // Driver data is optional
  ) => void;
}

export function AddVehicleForm({ onAddVehicle }: AddVehicleFormProps) {
  const [doca, setDoca] = useState<string>('')
  const [carga, setCarga] = useState<string>('')
  const [placa, setPlaca] = useState<string>('')
  const [temperatura, setTemperatura] = useState<string>('')
  const [lacre, setLacre] = useState<string>('')
  const [perfil, setPerfil] = useState<string>('')
  const [tipo, setTipo] = useState<string>('')
  const [dataChegada, setDataChegada] = useState<Date | undefined>(undefined)
  const [dataAgendamento, setDataAgendamento] = useState<Date | undefined>(undefined)

  // Novos estados para o formulário de Motorista
  const [driverName, setDriverName] = useState<string>('')
  const [driverWhatsapp, setDriverWhatsapp] = useState<string>('')
  const [driverState, setDriverState] = useState<string>('')
  const [driverCity, setDriverCity] = useState<string>('')
  const [carrier, setCarrier] = useState<string>('')

  // Novo estado para o número do contêiner
  const [containerNumber, setContainerNumber] = useState<string>('')

  const docaOptions = Array.from({ length: 50 }, (_, i) => String(i + 1).padStart(2, '0'))
  const temperaturaOptions = ["Congelado", "Resfriado", "Mista", "Seca"]
  const perfilOptions = ["Carreta", "Conteiner", "Bi-trem", "Toco", "Truck", "Medio", "Outro"]
  const tipoOptions = ["Abastecimento CD", "Abastecimento + T/NF", "Abastecimento + V/D", "Kit Festa", "Outros"]

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    const vehicleDataToSend = {
      doca,
      carga,
      placa,
      temperatura,
      lacre,
      perfil,
      tipo,
      dataChegada: dataChegada ? format(dataChegada, 'dd/MM/yyyy') : '',
      dataAgendamento: dataAgendamento ? format(dataAgendamento, 'dd/MM/yyyy') : '',
      containerNumber: perfil === 'Conteiner' ? containerNumber : undefined, // Incluir containerNumber se o perfil for Contêiner
    }

    let driverDataToSend: Omit<DriverData, 'id'> | undefined = undefined;
    if (driverName || driverWhatsapp || driverState || driverCity || carrier) {
      driverDataToSend = {
        fullName: driverName,
        whatsapp: driverWhatsapp,
        state: driverState,
        city: driverCity,
        carrier: carrier,
      };
    }

    onAddVehicle(vehicleDataToSend, driverDataToSend);

    toast({
      title: "Veículo Adicionado!",
      description: `Placa: ${placa} - Doca: ${doca}${containerNumber ? ` - Contêiner: ${containerNumber}` : ''}`,
    })

    // Limpar os campos do formulário após o envio
    setDoca('')
    setCarga('')
    setPlaca('')
    setTemperatura('')
    setLacre('')
    setPerfil('')
    setTipo('')
    setDataChegada(undefined)
    setDataAgendamento(undefined)
    setDriverName('')
    setDriverWhatsapp('')
    setDriverState('')
    setDriverCity('')
    setCarrier('')
    setContainerNumber('') // Limpar o campo do contêiner
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 p-4 border rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Dados do Veículo</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Doca */}
        <div>
          <Label htmlFor="doca">Doca</Label>
          <Select value={doca} onValueChange={setDoca}>
            <SelectTrigger id="doca">
              <SelectValue placeholder="Selecione a Doca" />
            </SelectTrigger>
            <SelectContent>
              {docaOptions.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Carga */}
        <div>
          <Label htmlFor="carga">Carga</Label>
          <Input
            type="text"
            id="carga"
            value={carga}
            onChange={(e) => setCarga(e.target.value)}
            placeholder="Número da Carga"
            required
          />
        </div>

        {/* Placa */}
        <div>
          <Label htmlFor="placa">Placa</Label>
          <Input
            type="text"
            id="placa"
            value={placa}
            onChange={(e) => setPlaca(e.target.value)}
            placeholder="Ex: ABC1234"
            required
          />
        </div>

        {/* Temperatura */}
        <div>
          <Label htmlFor="temperatura">Temperatura</Label>
          <Select value={temperatura} onValueChange={setTemperatura}>
            <SelectTrigger id="temperatura">
              <SelectValue placeholder="Selecione a Temperatura" />
            </SelectTrigger>
            <SelectContent>
              {temperaturaOptions.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* N° Lacre */}
        <div>
          <Label htmlFor="lacre">N° Lacre</Label>
          <Input
            type="text"
            id="lacre"
            value={lacre}
            onChange={(e) => setLacre(e.target.value)}
            placeholder="Número do Lacre"
          />
        </div>

        {/* Perfil */}
        <div>
          <Label htmlFor="perfil">Perfil</Label>
          <Select value={perfil} onValueChange={setPerfil}>
            <SelectTrigger id="perfil">
              <SelectValue placeholder="Selecione o Perfil" />
            </SelectTrigger>
            <SelectContent>
              {perfilOptions.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tipo */}
        <div>
          <Label htmlFor="tipo">Tipo</Label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger id="tipo">
              <SelectValue placeholder="Selecione o Tipo" />
            </SelectTrigger>
            <SelectContent>
              {tipoOptions.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Data Chegada */}
        <div>
          <Label htmlFor="dataChegada">Data Chegada</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dataChegada && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dataChegada ? format(dataChegada, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dataChegada}
                onSelect={setDataChegada}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Data Agendamento */}
        <div>
          <Label htmlFor="dataAgendamento">Data Agendamento</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dataAgendamento && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dataAgendamento ? format(dataAgendamento, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dataAgendamento}
                onSelect={setDataAgendamento}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {perfil === 'Conteiner' && (
        <div className="grid gap-6 p-4 border rounded-lg shadow-sm mt-6">
          <h3 className="text-lg font-semibold mb-2">Dados do Contêiner</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* N° Contêiner */}
            <div>
              <Label htmlFor="containerNumber">N° Contêiner</Label>
              <Input
                type="text"
                id="containerNumber"
                value={containerNumber}
                onChange={(e) => setContainerNumber(e.target.value)}
                placeholder="Número do Contêiner"
                required={perfil === 'Conteiner'} // Torna o campo obrigatório se o perfil for Contêiner
              />
            </div>
          </div>
          <Button type="button" className="w-full md:w-auto mt-4">Confirmar</Button>
        </div>
      )}

      <h3 className="text-lg font-semibold mt-6 mb-2">Dados do Motorista</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Nome Completo */}
        <div>
          <Label htmlFor="driverName">Nome Completo</Label>
          <Input
            type="text"
            id="driverName"
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            placeholder="Nome completo do motorista"
          />
        </div>

        {/* Whatsapp */}
        <div>
          <Label htmlFor="driverWhatsapp">Whatsapp</Label>
          <Input
            type="tel"
            id="driverWhatsapp"
            value={driverWhatsapp}
            onChange={(e) => setDriverWhatsapp(e.target.value)}
            placeholder="Ex: (XX) XXXXX-XXXX"
          />
        </div>

        {/* Estado */}
        <div>
          <Label htmlFor="driverState">Estado</Label>
          <Input
            type="text"
            id="driverState"
            value={driverState}
            onChange={(e) => setDriverState(e.target.value)}
            placeholder="Ex: SP"
          />
        </div>

        {/* Cidade */}
        <div>
          <Label htmlFor="driverCity">Cidade</Label>
          <Input
            type="text"
            id="driverCity"
            value={driverCity}
            onChange={(e) => setDriverCity(e.target.value)}
            placeholder="Ex: São Paulo"
          />
        </div>

        {/* Transportadora */}
        <div>
          <Label htmlFor="carrier">Transportadora</Label>
          <Input
            type="text"
            id="carrier"
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            placeholder="Nome da Transportadora"
          />
        </div>
      </div>

      <Button type="submit" className="w-full md:w-auto mt-6">Adicionar Veículo e Motorista</Button>
    </form>
  )
}
