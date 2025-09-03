/* DESCRIÇÃO: representação atributal de uma tarefa
* */

export type TypeTarefa = {
  identificador: number;

  timestampCriacao?: string;
  timestampUltimaModificacao?: string;

  prioritario: boolean;
  concluido: boolean;

  titulo: string;
  corpo: string;
};

