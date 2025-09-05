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

      await this.salvarNovaTarefaArmazenamento( instancia );
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
        await this.alterarTituloEOuCorpoTarefaArmazenamento( identificador, tarefa.titulo, tarefa.corpo );
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

  public async obterCampoEspecificoUmaTarefa( identificador: number, campo: keyof TypeTarefa ): Promise<Tarefa[] | Tarefa | null>
  {
    try
    {
      return await this.obterCampoEspecificoDumaTarefaArmazenamento( identificador, campo );
    }
    catch ( err )
    {
      console.error( `${this.constructor.name}: ${err}` );
      return null;
    }
  }

  public async obterTarefa( identificador: number ): Promise<Tarefa | null>
  {
    try
    {
      return await this.obterTodosDadosDumaTarefaArmazenamento( identificador );
    }
    catch ( err )
    {
      console.error( `${this.constructor.name}: ${err}` );
      return null;
    }
  }

  public async obterTodasTarefas(): Promise<Tarefa[] | Tarefa | null>
  {
    try
    {
      return await this.obterTodasTarefas();
    }
    catch ( err )
    {
      console.error( `${this.constructor.name}: ${err}` );
      return null;
    }
    
  }

  // ----------------------------------------------------------------------
  // Warning: Possible Single Reponsibility Issue
  // Warning: Possible Anemic Classes With Unrestricted Data Manipulation

  private async salvarNovaTarefaArmazenamento( instancia: Tarefa ): Promise<void>
  {
    await this.tarefaRepo
    .createQueryBuilder()
    .insert()
    .into(Tarefa)
    .values(instancia)
    .execute();
  }

  // Alterar para estado informado.
  private async alterarPrioridadeArmazenamento( identificador: number, estado: boolean ): Promise<void>
  {
    const tarefa: Tarefa | null = await this.obterTodosDadosDumaTarefaArmazenamento( identificador );

    if ( tarefa === null )
    {
      throw new Error("obtenção de todos os dados de uma tarefa falhou.");
    }

    if ( tarefa?.prioritario === estado )
    {
      return;
    }

    if ( estado )
    {
      tarefa?.desdefinirPrioritario();
      this.tarefaRepo.save( tarefa, {reload:false});
      return;
    }
    tarefa?.definirPrioritario();
    this.tarefaRepo.save( tarefa, {reload:false});
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

  private async alterarTituloEOuCorpoTarefaArmazenamento( identificador: number, titulo: string, corpo: string ): Promise<void>
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

  private async obterTodosDadosDumaTarefaArmazenamento( identificador: number ): Promise< Tarefa | null>
  {
    return await this.tarefaRepo
    .createQueryBuilder()
    .select("*")
    .from(Tarefa, "tarefa")
    .where("tarefa.identificador = :identificador", {identificador: identificador})
    .getOne();
  }

  private async obterCampoEspecificoDumaTarefaArmazenamento( identificador: number, campo: keyof TypeTarefa ): Promise<Tarefa[] | Tarefa | null>
  {
    return await this.tarefaRepo
    .createQueryBuilder()
    .select( campo )
    .from(Tarefa, "tarefa")
    .where("tarefa.identificador = :identificador", {identificador: identificador})
    .getOne();
  }

  private async obterTodosDadosTodasTarefasArmazenamento(): Promise<Tarefa[] | Tarefa | null>
  {
    return this.tarefaRepo
    .createQueryBuilder()
    .select("*")
    .from(Tarefa, "tarefa")
    .getMany();
  }

}

