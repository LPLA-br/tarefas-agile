/* DESCRIÇÃO: Entidade em modelo não anêmico para representação informacional de Tarefas.
 * NOTA: Limitações da transpilação do typescript mais
 * typeorm impedem definição private para atributos
 * encapsulados. Acesso direto aos atributos é
 * desencorajado e repudiado.
 * */
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

import type { TypeTarefa } from "../types/TypeTarefa.js";

@Entity("tarefas")
export class Tarefa
{

  @PrimaryGeneratedColumn()
  public identificador!: number;

  @Column({type: "varchar", length: 13})
  public timestampCriacao: string;

  @Column({type: "varchar", length: 13})
  public timestampUltimaModificacao: string;

  @Column({type: "boolean"})
  public prioritario: boolean;

  @Column({type: "boolean"})
  public concluido: boolean;

  @Column({type: "varchar", length: 128})
  public titulo: string;

  @Column({type: "varchar", length: 2048})
  public corpo: string;

  constructor( tarefa?: TypeTarefa )
  {
    /*TypeORM: argumentos de construtor devem ser opcionais pois
    * typeorm, ao criar instâncias, não liga para argumentos de construtor.*/
    if ( typeof tarefa !== "object" )
    {
      this.timestampCriacao = new Date().getTime().toString();
      this.timestampUltimaModificacao = new Date().getTime().toString();
      this.prioritario = false;
      this.concluido = false;
      this.titulo = "";
      this.corpo = "";
      return;
    }

    this.timestampCriacao = ( tarefa.timestampCriacao !== undefined ) ? tarefa.timestampCriacao : this.gerarTimestampDeCriacao();
    this.timestampUltimaModificacao = ( tarefa.timestampUltimaModificacao !== undefined ) ? tarefa.timestampUltimaModificacao : this.atualizarTimestampDeModificacao();
  
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

  //MÉTODOS NUCLEARES

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

  private gerarTimestampDeCriacao(): string
  {
    return new Date().getTime().toString();
  }

  private atualizarTimestampDeModificacao(): string
  {
    return new Date().getTime().toString();
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

