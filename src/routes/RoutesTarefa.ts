/* RESPONSABILIDADE: Definição de roteamento URL HTTP da aplicação demonstrativa de tarefas.
* */

import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import { param, body, validationResult, checkSchema } from "express-validator";
import type { ValidationError } from "express-validator";
import { TarefaSchema, OptionalTarefaSchema, TarefaEstadosSchema } from "../types/TarefaSchema.js";

import type { TypeTarefa } from "../types/TypeTarefa.js";
import { Tarefa } from "../entities/Tarefa.js";

import { ControllerTarefas } from "../controllers/ControllerTarefas.js";

import { log } from "../middlewares/log.js";

const RoutesTarefas = Router();
const controller = new ControllerTarefas();

function responderUniformementeAoFrontend( codigo: number, dados: any, mensagem: string, erros: ValidationError[] )
{
  if ( erros.length !== 0 )
  {
    return {
      "codigo": codigo,
      "erros": erros,
      "dados": dados
    }
  }
  return {
      "codigo": codigo,
      "mensagem": mensagem,
      "dados": dados
  }
}

RoutesTarefas.get( "/tarefas/titulos", log, (req: Request, res: Response) =>
{
  const errors = validationResult( req );

  if ( !errors.isEmpty() )
  {
    res.status(StatusCodes.BAD_REQUEST).json( responderUniformementeAoFrontend( StatusCodes.BAD_REQUEST, [], "",errors.array()) );
    return;
  }

  ( async ()=>
  {
    try
    {
      const dados: Pick<Tarefa, "identificador" | "titulo" >[] | Pick<Tarefa, "identificador" | "titulo" > | null =
        await controller.obterTituloIdentificadorTodasTarefas();

      res.status(StatusCodes.OK).json( responderUniformementeAoFrontend( StatusCodes.OK, dados,
                "titulos e respectivos ids de todas tarefas", errors.array()) );
      return;
    }
    catch ( err )
    {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
                responderUniformementeAoFrontend( StatusCodes.INTERNAL_SERVER_ERROR, [],
                "servidor não conseguiu obter dados do recurso", errors.array()) );
      return;
    }
  })();
});


RoutesTarefas.get( "/tarefas/:identificador", log, param("identificador").notEmpty().isNumeric(), (req: Request, res: Response) =>
{
  const errors = validationResult( req );

  if ( !errors.isEmpty() )
  {
    res.status(StatusCodes.BAD_REQUEST).json(
              responderUniformementeAoFrontend( StatusCodes.BAD_REQUEST, [],
              "", errors.array()) );
    return;
  }

  ( async ()=>
  {
    try
    {
      //@ts-ignore
      const dados: Tarefa | null = await controller.obterTarefa( +req.params.identificador );

      if ( typeof dados === null )
      {
        res.status(StatusCodes.NOT_FOUND).json( responderUniformementeAoFrontend( StatusCodes.NOT_FOUND, [],
                                              "recurso para deleção não existe.", errors.array()) );
        return;
      }

      res.status(StatusCodes.OK).json(
        responderUniformementeAoFrontend( StatusCodes.OK, dados, "dados de uma tarefa especifica",
        errors.array()) );
      return;
    }
    catch ( err )
    {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json( responderUniformementeAoFrontend( StatusCodes.INTERNAL_SERVER_ERROR,
                                                        [], "servidor não conseguiu obter dados do recurso", errors.array()) );
      return;
    }
  })();
});

// Warning: HTTP url param not indicate resource
RoutesTarefas.post( "/tarefas", log, checkSchema( TarefaSchema ), (req: Request, res: Response) =>
{
  const errors = validationResult( req );

  if ( !errors.isEmpty() )
  {
    res.status(StatusCodes.BAD_REQUEST).json( responderUniformementeAoFrontend( StatusCodes.BAD_REQUEST, [], "",errors.array()) );
    return;
  }

  ( async ()=>
  {
    try
    {
      //TODO: Tarefa class responsibility to offer a default state for a new object.
      const tarefa: TypeTarefa =
      {
        identificador: -1,
        prioritario: false,
        concluido: false,
        titulo: req.body.titulo,
        corpo: req.body.corpo
      };

      const dados = await controller.criarTarefa( tarefa );

      res.status(StatusCodes.CREATED).json( responderUniformementeAoFrontend( StatusCodes.CREATED, dados, "tarefa criada", errors.array()) );
      return;
    }
    catch ( err )
    {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json( responderUniformementeAoFrontend( StatusCodes.INTERNAL_SERVER_ERROR, [],
                                                                                           "servidor não conseguiu reter dados", errors.array()) );
      return;
    }
  })();

});

RoutesTarefas.put( "/tarefas/:identificador", log,
                  param("identificador").notEmpty().isNumeric(),
                  checkSchema( OptionalTarefaSchema, ["body"]),
                  (req: Request, res: Response) =>
{
  const errors = validationResult( req );

  if ( !errors.isEmpty() )
  {
    res.status(StatusCodes.BAD_REQUEST).json( responderUniformementeAoFrontend( StatusCodes.BAD_REQUEST, [], "",errors.array()) );
    return;
  }

  ( async ()=>
  {
    try
    {

      //@ts-ignore
      const identificador: number = +req.params.identificador;

      const nucleares: Pick<Tarefa, "titulo" | "corpo"> = {
        titulo: req.body.titulo && undefined,
        corpo: req.body.corpo && undefined
      };

      const opcionais: Pick<Tarefa, "prioritario" | "concluido"> =
      {
        prioritario: req.body.prioritario && undefined,
        concluido: req.body.concluido && undefined,
      };

      const subParteTarefa = await controller.obterTituloIdentificadorUmaTarefa( identificador );

      if ( subParteTarefa === null )
      {
        res.status(StatusCodes.NOT_FOUND).json( responderUniformementeAoFrontend( StatusCodes.NOT_FOUND, [],
                                                                                "recurso para modificação não existe.", errors.array()) );
        return;
      }

      await controller.modificarTextualTarefa( identificador, nucleares );

      //Warning: two distinct methods converging to one logic based on one boolean.
      if ( typeof opcionais.concluido === "string" )
      {
        await controller.concluirTarefa( identificador );
        await controller.desconcluirTarefa( identificador );
        return;
      }
      else if ( typeof opcionais.prioritario === "string" )
      {
        await controller.priorizarTarefa( identificador );
        controller.despriorizarTarefa( identificador );
        return;
      }
      res.status(StatusCodes.OK).json( responderUniformementeAoFrontend( StatusCodes.OK, await controller.obterTarefa( identificador ),
                                                                        "recurso modificado", errors.array()) );
      return;
    }
    catch ( err )
    {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json( responderUniformementeAoFrontend( StatusCodes.INTERNAL_SERVER_ERROR, [],
                                                                                           "servidor não conseguiu atualizar dados", errors.array()) );
      return;
    }
  })();
});

RoutesTarefas.delete( "/tarefas/:identificador", log, param("identificador").notEmpty().isNumeric(), (req: Request, res: Response) =>
{
  const errors = validationResult( req );

  if ( !errors.isEmpty() )
  {
    res.status(StatusCodes.BAD_REQUEST).json( responderUniformementeAoFrontend( StatusCodes.BAD_REQUEST, [], "", errors.array()) );
    return;
  }

  (async ()=>
  {
    try
    {
      //@ts-ignore
      const identificador: number = +req.params.identificador;
      const subParteTarefa = await controller.obterTituloIdentificadorUmaTarefa( identificador ); 

      if ( subParteTarefa === null )
      {
        res.status(StatusCodes.NOT_FOUND).json( responderUniformementeAoFrontend( StatusCodes.NOT_FOUND, [],
                                              "recurso para deleção não existe.", errors.array()) );
        return;
      }

      await controller.eliminarTarefa( identificador );

      res.status(StatusCodes.NO_CONTENT).json( responderUniformementeAoFrontend( StatusCodes.NO_CONTENT, [], "recurso foi eliminado.", errors.array() ) );
      return;
    }
    catch (err)
    {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json( responderUniformementeAoFrontend( StatusCodes.INTERNAL_SERVER_ERROR, [], "servidor não conseguiu eliminar tarefa", errors.array()) );
      return;
    }
  })();
});


export { RoutesTarefas };
