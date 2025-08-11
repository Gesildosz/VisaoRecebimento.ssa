// Este arquivo será removido, pois normalizeString foi movido para lib/utils.ts
// Deixando-o aqui temporariamente para evitar erros de compilação durante a transição.
export function normalizeString(str: string): string {
  return str
    .normalize("NFD") // Decompõe caracteres acentuados em caracteres base + diacríticos
    .replace(/[\u0300-\u036f]/g, "") // Remove os diacríticos
    .toLowerCase() // Converte para minúsculas
    .trim(); // Remove espaços em branco no início e no fim
}
