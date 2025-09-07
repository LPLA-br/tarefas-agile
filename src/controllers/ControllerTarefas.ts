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

  public async modificarTextualTarefa( identificador: number | undefined, tarefa: Partial<TypeTarefa> ): Promise<void>
  {
    try
    {

      if ( typeof identificador !== "number" ) throw new Error("identificador de Tarefa não numérico");

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

  public async priorizarTarefa( identificador: number | undefined ): Promise<void>
  {
    try
    {
      if ( !(typeof identificador === "number" ) ) throw new Error( `${this.constructor.name}: identificador indefinido` ); 

      await this.alterarPrioridadeArmazenamento( identificador, true );
    }
    catch (err)
    {
      console.error( `${this.constructor.name}: ${err}` );
    }
  }

  public async despriorizarTarefa( identificador: number | undefined ): Promise<void>
  {
    try
    {
      if ( !(typeof identificador === "number" ) ) throw new Error( `${this.constructor.name}: identificador indefinido` ); 

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

  public async concluirTarefa( identificador: number | undefined ): Promise<void>
  {
    try
    {
      if ( !(typeof identificador === "number" ) ) throw new Error( `${this.constructor.name}: identificador indefinido` ); 

      await this.alterarConclusaoArmazenamento( identificador, true );
    }
    catch (err)
    {
      console.error( `${this.constructor.name}: ${err}` );
    }
  }

  public async desconcluirTarefa( identificador: number | undefined ): Promise<void>
  {
    try
    {
      if ( !(typeof identificador === "number" ) ) throw new Error( `${this.constructor.name}: identificador indefinido` ); 

      await this.alterarConclusaoArmazenamento( identificador, false );
    }
    catch (err)
    {
      console.error( `${this.constructor.name}: ${err}` );
    }
  }

  public async obterCampoEspecificoUmaTarefa( identificador: number | undefined, campo: keyof TypeTarefa ): Promise<Tarefa[] | Tarefa | null>
  {
    try
    {
      if ( !(typeof identificador === "number" ) ) throw new Error( `${this.constructor.name}: identificador indefinido` ); 

      return await this.obterCampoEspecificoDumaTarefaArmazenamento( identificador, campo );
    }
    catch ( err )
    {
      console.error( `${this.constructor.name}: ${err}` );
      return null;
    }
  }

  public async obterCampoEspecificoTodasTarefas( campo: keyof TypeTarefa ): Promise<Tarefa[] | Tarefa | null>
  {
    try
    {
      return await this.obterCampoEspecificoTodasTarefas( campo );
    }
    catch ( err )
    {
      console.error( `${this.constructor.name}: ${err}` );
      return null;
    }
  }

  public async obterTarefa( identificador: number | undefined ): Promise<Tarefa | null>
  {
    try
    {
      if ( !(typeof identificador === "number" ) ) throw new Error( `${this.constructor.name}: identificador indefinido` ); 

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
      return await this.obterTodosDadosTodasTarefasArmazenamento();
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
    let tarefa: Tarefa | null = await this.obterTodosDadosDumaTarefaArmazenamento( identificador );

    if ( !this.saoValidosObjetoEEstadoDeTarefa( tarefa, estado ) ) return;

    if ( estado )
    {
      tarefa?.definirPrioritario();
      //@ts-ignore
      this.tarefaRepo.save( tarefa );
      return;
    }
    tarefa?.desdefinirPrioritario();
    //@ts-ignore
    this.tarefaRepo.save( tarefa );
  }

  private async alterarConclusaoArmazenamento( identificador: number, estado: boolean ): Promise<void>
  {
    let tarefa: Tarefa | null = await this.obterTodosDadosDumaTarefaArmazenamento( identificador );

    if ( !this.saoValidosObjetoEEstadoDeTarefa( tarefa, estado ) ) return;

    if ( estado )
    {
      tarefa?.concluirTarefa();
      //@ts-ignore
      this.tarefaRepo.save( tarefa );
      return;
    }
    tarefa?.reverterConclusaoTarefa();
    //@ts-ignore
    this.tarefaRepo.save( tarefa );
  }

  private async alterarTituloEOuCorpoTarefaArmazenamento( identificador: number, titulo?: string, corpo?: string ): Promise<void>
  {
    let tarefa: Tarefa | null = await this.obterTodosDadosDumaTarefaArmazenamento( identificador );

    if ( tarefa === null ) throw new Error("alteração de titulo e ou corpo de tarefa falhou por registro inexistente.");
    
    switch( true )
    {
      case (typeof titulo === "string"):
        tarefa?.definirTitulo( titulo );
      case (typeof corpo === "string"):
        //@ts-ignore
        tarefa?.definirCorpo( corpo );
        break;
    }

    this.tarefaRepo.save( tarefa );
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

  private async obterCampoEspecificoTodasTarefasArmazenamento( campo: keyof TypeTarefa ): Promise< Tarefa[] | Tarefa | null >
  {
    return await this.tarefaRepo
    .createQueryBuilder()
    .select( campo )
    .from(Tarefa, "tarefa")
    .getMany();
  }

  private async obterTodosDadosTodasTarefasArmazenamento(): Promise<Tarefa[] | Tarefa | null>
  {
    return this.tarefaRepo
    .createQueryBuilder()
    .select("*")
    .from(Tarefa, "tarefa")
    .getMany();
  }

  //validações reutilizáveis

  private saoValidosObjetoEEstadoDeTarefa( tarefa: Tarefa | null, estado: boolean ): boolean
  {
    if ( tarefa === null )
    {
      console.error( `${this.constructor.name}: obtenção de todos os dados de uma tarefa falhou.` );
      return false;
    }

    if ( tarefa?.concluido === estado )
    {
      console.error( `${this.constructor.name}: alteracao de estado desnecessaria por valor desejado já atribuido.` );
      return false;
    }

    return true;
  }

}

