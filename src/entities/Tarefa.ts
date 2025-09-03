
import type { TypeTarefa } from "../types/TypeTarefa.js";

export default class Tarefa
{
  private identificador: number;

  private timestampCriacao: string;
  private timestampUltimaModificacao: string;

  private prioritario: boolean;
  private concluido: boolean;

  private titulo: string;
  private corpo: string;

  constructor( tarefa: TypeTarefa )
  {
    this.identificador = tarefa.identificador ;

    this.timestampCriacao = tarefa.timestampCriacao === undefined ? new Date().getTime().toString() : tarefa.timestampCriacao ;
    this.timestampUltimaModificacao = tarefa.timestampUltimaModificacao === undefined ? new Date().getTime().toString() : tarefa.timestampUltimaModificacao ;

    this.prioritario = tarefa.prioritario;
    this.concluido = tarefa.concluido;

    this.titulo = tarefa.titulo;
    this.corpo = tarefa.corpo;
  }

  //DUMP

  public obterRepresentacao(): TypeTarefa
  {
    const objeto: TypeTarefa =
    {
      identificador : this.identificador,
      timestampCriacao : this.timestampCriacao,
      timestampUltimaModificacao : this.timestampUltimaModificacao,
      prioritario : this.prioritario,
      concluido : this.concluido,
      titulo : this.titulo,
      corpo : this.corpo,
    };

    return objeto;
  }

  //MANIPULAÇÃO DE ESTADOS BINÁRIOS
  
  public definirPrioritario(): void
  {
    this.validarAcaoModificativaSobreTarefaConcluida();

    this.prioritario = true ;
  }

  public desdefinirPrioritario(): void
  {
    this.validarAcaoModificativaSobreTarefaConcluida();

    this.prioritario = false;
  }
   
  public concluirTarefa(): void
  {
    this.prioritario = false;
    this.concluido = true;
  }

  public reverterConclusaoTarefa(): void
  {
    //Reversão não mantem prioridade.
    this.concluido = false;
  }

  //AÇÕES NUCLEARES

  public definirTitulo( titulo: string ): void
  {
    this.validarAcaoModificativaSobreTarefaConcluida();

    this.atualizarTimestampDeModificacao();
    this.titulo = titulo;
  }

  public definirCorpo( corpo: string ): void
  {
    this.validarAcaoModificativaSobreTarefaConcluida();

    this.atualizarTimestampDeModificacao();
    this.corpo = corpo;
  }

  //COMPORTAMENTOS ENCAPSULADOS

  private atualizarTimestampDeModificacao(): void
  {
    this.timestampUltimaModificacao = new Date().getTime().toString();
  }

  private validarAcaoModificativaSobreTarefaConcluida(): void
  {
    if ( this.concluido )
    {
      throw new Error( `${this.constructor.name}: Tarefas concluidas não podem ser alteradas !` );
    }
    return;
  }

}

