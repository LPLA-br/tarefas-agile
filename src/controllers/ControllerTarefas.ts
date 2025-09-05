/* RESPONSABILIDADE: Ligar roteamento endpoint com entidadades.
* */
import { TypeormDataSource } from "../typeorm-datasource.js";
import { Repository } from "typeorm";

import { Tarefa } from "../entities/Tarefa.js";
import type { TypeTarefa } from "../types/TypeTarefa.js";

export class ControllerTarefas
{
  private tarefaRepo: Repository<Tarefa>;

  constructor()
  {
    this.tarefaRepo = TypeormDataSource.getRepository( Tarefa );
  }

  public async criarTarefa( tarefa: TypeTarefa ): Promise<void>
  {
    try
    {
      const timestampCriacao = new Date().getTime().toString();
      const timestampModific = new Date().getTime().toString();

      const instancia = new Tarefa(
      {
        identificador: -1,
        timestampCriacao: timestampCriacao,
        timestampUltimaModificacao: timestampModific,
        prioritario: tarefa.prioritario,
        concluido: tarefa.concluido,
        titulo: tarefa.titulo,
        corpo: tarefa.corpo
      });

      await this.armazenarTarefa( instancia );
    }
    catch (err)
    {
      console.error( `${this.constructor.name}: ${err}` );
    }
  }

  public async modificarTarefa( identificador: number, tarefa: Partial<TypeTarefa> ): Promise<void>
  {
    try
    {
      if ( typeof tarefa.titulo === "string" && typeof tarefa.corpo === "string" )
      {
        await this.alterarTituloEOuCorpoTarefa( identificador, tarefa.titulo, tarefa.corpo );
      }
      throw new Error( `modificarTarefa → titulo, corpo inválidos.` );
    }
    catch (err)
    {
      console.error(  `${this.constructor.name}: ${err}`  );
    }
  }

  public async priorizarTarefa( identificador: number ): Promise<void>
  {
    try
    {
      await this.alterarPrioridadeArmazenamento( identificador, true );
    }
    catch (err)
    {
      console.error( `${this.constructor.name}: ${err}` );
    }
  }

  public async despriorizarTarefa( identificador: number ): Promise<void>
  {
    try
    {
      await this.alterarPrioridadeArmazenamento( identificador, false );
    }
    catch (err)
    {
      console.error( `${this.constructor.name}: ${err}` );
    }
  }

  public async eliminarTarefa( identificador: number ): Promise<void>
  {
    try
    {
      await this.eliminarTarefaArmazenamento( identificador );
    }
    catch (err)
    {
      console.error( `${this.constructor.name}: ${err}` );
    }
  }

  public async concluirTarefa( identificador: number ): Promise<void>
  {
    try
    {
      await this.alterarConclusaoArmazenamento( identificador, true );
    }
    catch (err)
    {
      console.error( `${this.constructor.name}: ${err}` );
    }
  }

  public async desconcluirTarefa( identificador: number ): Promise<void>
  {
    try
    {
      await this.alterarConclusaoArmazenamento( identificador, false );
    }
    catch (err)
    {
      console.error( `${this.constructor.name}: ${err}` );
    }
  }

  public async obterTarefa( identificador: number ): Promise<Tarefa | null>
  {
    return this.tarefaRepo
    .createQueryBuilder()
    .select("tarefa")
    .from(Tarefa, "tarefa")
    .where("tarefa.identificador = :identificador", {identificador: identificador})
    .getOne();
  }

  public async obterTodasTarefas(): Promise<Tarefa[] | Tarefa | null>
  {
    return this.tarefaRepo
    .createQueryBuilder()
    .select("tarefa")
    .from(Tarefa, "tarefa")
    .getMany();
  }

  // Warning: Possible Single Reponsibility Issue

  private async armazenarTarefa( instancia: Tarefa ): Promise<void>
  {
    try
    {
      await this.tarefaRepo
      .createQueryBuilder()
      .insert()
      .into(Tarefa)
      .values(instancia)
      .execute();
    }
    catch ( err )
    {
      console.error( `${this.constructor.name}: ${err}` );
    }
  }

  private async alterarPrioridadeArmazenamento( identificador: number, estado: boolean ): Promise<void>
  {
    await this.tarefaRepo
    .createQueryBuilder()
    .update(Tarefa)
    .set({prioritario: estado})
    .where("identificador = :identificador", {identificador: identificador})
    .execute();
  }

  private async alterarConclusaoArmazenamento( identificador: number, estado: boolean ): Promise<void>
  {
    await this.tarefaRepo
    .createQueryBuilder()
    .update(Tarefa)
    .set({concluido: estado})
    .where("identificador = :identificador", {identificador: identificador})
    .execute();
  }

  private async alterarTituloEOuCorpoTarefa( identificador: number, titulo: string, corpo: string ): Promise<void>
  {
    await this.tarefaRepo
    .createQueryBuilder()
    .update(Tarefa)
    .set({titulo: titulo, corpo: corpo})
    .where("identificador = :identificador", {identificador: identificador})
    .execute();
  }

  private async eliminarTarefaArmazenamento( identificador: number ): Promise<void>
  {
    await this.tarefaRepo
    .createQueryBuilder()
    .delete()
    .from(Tarefa)
    .where("identificador = :identificador", { identificador: identificador })
    .execute();
  }

}

