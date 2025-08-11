export interface OccurrenceDetail {
  id: string; // ID único da ocorrência
  placa: string;
  numeroOcorrencia: string;
  cod: string;
  descricaoProduto: string;
  quantidade: string;
  validade: string; // Data formatada como string
  tipoOcorrencia: string;
  peso: string;
  descricaoGeralOcorrencia: string;
  timestamp: string; // Data e hora do registro
  classe: string; // NOVO: Classe do produto
}
