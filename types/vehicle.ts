export interface VehicleData {
  id: string;
  doca: string;
  carga: string;
  placa: string;
  temperatura: string;
  lacre: string;
  status: string;
  ocorrencia: string;
  perfil: string;
  tipo: string;

  // Referência ao motorista, não os dados completos
  driverId?: string;
  dataChegada?: string; // Adicionado
  dataAgendamento?: string; // Adicionado
  containerNumber?: string; // Novo campo para número do contêiner
}
