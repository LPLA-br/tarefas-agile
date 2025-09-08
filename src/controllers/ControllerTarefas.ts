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

      await this.tarefaRepo.save(instancia);
    }
    catch (err)
    {
      this.emitirErroPadronizado( err );
    }
  }

  public async modificarTextualTarefa( identificador: number | undefined, tarefa: Pick<Tarefa, "titulo" | "corpo"> ): Promise<void>
  {
    try
    {
      if ( typeof identificador !== "number" ) throw new Error("identificador de Tarefa não numérico");

      if ( typeof tarefa.titulo === "string" && typeof tarefa.corpo === "string" )
      {
        await this.alterarTituloEOuCorpoTarefaArmazenamento( identificador, tarefa.titulo, tarefa.corpo );
        return;
      }

      throw new Error( `modificarTarefa esperava titulo, recebeu ${tarefa.titulo} e esperava corpo, recebeu ${tarefa.corpo}.` );
    }
    catch (err)
    {
      this.emitirErroPadronizado( err );
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
      this.emitirErroPadronizado( err );
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
      this.emitirErroPadronizado( err );
    }
  }

  public async eliminarTarefa( identificador: number | undefined ): Promise<void>
  {
    try
    {
      if ( !(typeof identificador === "number" ) ) throw new Error( `${this.constructor.name}: identificador indefinido` ); 

      await this.eliminarTarefaArmazenamento( identificador );
    }
    catch (err)
    {
      this.emitirErroPadronizado( err );
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
      this.emitirErroPadronizado( err );
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
      this.emitirErroPadronizado( err );
    }
  }

  public async obterTituloIdentificadorUmaTarefa( identificador: number | undefined ): Promise< Pick<Tarefa, "identificador" | "titulo" > | null>
  {
    try
    {
      if ( !(typeof identificador === "number" ) ) throw new Error( `${this.constructor.name}: identificador indefinido` ); 

      return await this.obterParTituloIdentificadorTarefaArmazenamento( identificador );
    }
    catch ( err )
    {
      this.emitirErroPadronizado( err );
      return null;
    }
  }

  public async obterTituloIdentificadorTodasTarefas():
    Promise< Pick<Tarefa, "identificador" | "titulo" >[] | Pick<Tarefa, "identificador" | "titulo" > | null>
  {
    try
    {
      return await this.obterParesTitulosIdentificadoresTarefasArmazenamento();
    }
    catch ( err )
    {
      this.emitirErroPadronizado( err );
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
      this.emitirErroPadronizado( err );
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
      this.emitirErroPadronizado( err );
      return null;
    }
    
  }

  // ----------------------------------------------------------------------
  // Warning: Possible Single Reponsibility Issue
  // Warning: Possible Anemic Classes With Unrestricted Data Manipulation

  // Alterar para estado informado.
  private async alterarPrioridadeArmazenamento( identificador: number, estado: boolean ): Promise<void>
  {
    let tarefa: Tarefa | null = await this.obterTodosDadosDumaTarefaArmazenamento( identificador );

    if ( !this.saoValidosObjetoEEstadoDeTarefa( tarefa, estado ) ) return;

    if ( estado )
    {
      tarefa?.definirPrioritario();
      //@ts-ignore
      await this.tarefaRepo.save( tarefa );
      return;
    }
    tarefa?.desdefinirPrioritario();
    //@ts-ignore
    await this.tarefaRepo.save( tarefa );
  }

  private async alterarConclusaoArmazenamento( identificador: number, estado: boolean ): Promise<void>
  {
    let tarefa: Tarefa | null = await this.obterTodosDadosDumaTarefaArmazenamento( identificador );

    if ( !this.saoValidosObjetoEEstadoDeTarefa( tarefa, estado ) ) return;

    if ( estado )
    {
      tarefa?.concluirTarefa();
      //@ts-ignore
      await this.tarefaRepo.save( tarefa );
      return;
    }
    tarefa?.reverterConclusaoTarefa();
    //@ts-ignore
    await this.tarefaRepo.save( tarefa );
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

    await this.tarefaRepo.save( tarefa );
  }

  private async eliminarTarefaArmazenamento( identificador: number ): Promise<void>
  {
    await this.tarefaRepo.delete({identificador: identificador})
  }

  private async obterTodosDadosDumaTarefaArmazenamento( identificador: number ): Promise< Tarefa | null>
  {
    return await this.tarefaRepo.findOneBy({identificador: identificador});
  }

  private async obterParTituloIdentificadorTarefaArmazenamento( identificador: number ): Promise< Pick<Tarefa, "identificador" | "titulo"> | null >
  {
    const tarefa: Tarefa | null = await this.tarefaRepo.findOneBy({ identificador: identificador });

    if ( tarefa !== null )
    {
      const objeto: Pick< Tarefa, "identificador" | "titulo" > | null =
      { identificador: tarefa.identificador, titulo: tarefa.titulo };

      return objeto;
    }
    return null;
  }

  private async obterParesTitulosIdentificadoresTarefasArmazenamento():
    Promise< Pick<Tarefa, "identificador" | "titulo">[] | Promise< Pick<Tarefa, "identificador" | "titulo"> > | null >
  {
    const objetos: Pick<Tarefa, "identificador" | "titulo">[] | Pick<Tarefa, "identificador" | "titulo"> | null
    = await this.tarefaRepo.find();

    if ( Array.isArray( objetos ) )
    {
      let subPartesTarefasLista: Pick<Tarefa, "identificador" | "titulo">[] = [];

      for ( let i = 0; i < objetos.length; i++ )
      {
        //@ts-ignore
        subPartesTarefasLista.push( { identificador: objetos[i]["identificador"] , titulo: objetos[i]["titulo"] } );
      }

      return subPartesTarefasLista;
    }
    else if ( objetos !== null )
    {
      let subParteTarefa: Pick<Tarefa, "identificador" | "titulo"> = objetos;
      return subParteTarefa;
    }
    
    return null;
  }

  private async obterTodosDadosTodasTarefasArmazenamento(): Promise<Tarefa[] | Tarefa | null>
  {
    return await this.tarefaRepo
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

  // Warning: Single responsibility violation (maintain)

  private emitirErroPadronizado( err: any, mensagemProgramador?: string ): void
  {
    if ( err instanceof Error )
    {
      console.error( `CLASSE: ${this.constructor.name}:\n ${err.message} \n ${err.stack}\n ${mensagemProgramador && ""}` );
      return;
    }
    console.error(err);
  }

}

