/* RESPONSABILIDADE: Definição de roteamento URL HTTP da aplicação demonstrativa de tarefas.
* */

import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import { param, body, validationResult, checkSchema } from "express-validator";
import type { ValidationError } from "express-validator";
import { TarefaSchema, TarefaPutSchema } from "../types/TarefaSchema.js";

import type { TypeTarefa } from "../types/TypeTarefa.js";

import { ControllerTarefas } from "../controllers/ControllerTarefas.js";

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

RoutesTarefas.get( "/tarefas/titulos", (req: Request, res: Response) =>
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
      const dados =
      {
        "titulos": await controller.obterCampoEspecificoTodasTarefas( "titulo" ),
        "identificadoes": await controller.obterCampoEspecificoTodasTarefas( "identificador" )
      }

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


RoutesTarefas.get( "/tarefas/:identificador", body("identificador").notEmpty().isNumeric(), (req: Request, res: Response) =>
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
      const dados = await controller.obterTarefa( req.body.identificador );

      //@ts-ignore
      if ( typeof dados === "null" || typeof dados === "undefined" )
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
RoutesTarefas.post( "/tarefas", checkSchema( TarefaSchema ), (req: Request, res: Response) =>
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

RoutesTarefas.put( "/tarefas/:identificador", param("identificador").notEmpty().isNumeric(),
                  checkSchema(TarefaPutSchema, ["body"]),(req: Request, res: Response) =>
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
      const obrigatorias: Partial<TypeTarefa> = {
        //@ts-ignore
        identificador: +req.params.identificador,
        titulo: req.body.titulo,
        corpo: req.body.corpo
      };

      const opcionais: Partial<TypeTarefa> =
      {
        prioritario: req.body.prioritario,
        concluido: req.body.concluido,
      };

      //@ts-ignore
      if ( controller.obterCampoEspecificoUmaTarefa( obrigatorias.identificador, "identificador" ) === null )
      {
        res.status(StatusCodes.NOT_FOUND).json( responderUniformementeAoFrontend( StatusCodes.NOT_FOUND, [],
                                                                                "recurso para deleção não existe.", errors.array()) );
        return;
      }

      controller.modificarTextualTarefa( obrigatorias.identificador, obrigatorias );

      //Warning: two distinct methods converging to one logic based on one boolean.
      if ( typeof opcionais.concluido === "string" )
      {
        controller.concluirTarefa( obrigatorias.identificador );
        controller.desconcluirTarefa( obrigatorias.identificador );
        return;
      }
      else if ( typeof opcionais.prioritario === "string" )
      {
        controller.priorizarTarefa( obrigatorias.identificador );
        controller.despriorizarTarefa( obrigatorias.identificador );
        return;
      }
      res.status(StatusCodes.OK).json( responderUniformementeAoFrontend( StatusCodes.OK, controller.obterTarefa( obrigatorias.identificador ),
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

RoutesTarefas.delete( "/tarefas/:identificador", param("identificador").notEmpty().isNumeric(), (req: Request, res: Response) =>
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
      if ( controller.obterCampoEspecificoUmaTarefa( +req.params.identificador, "identificador" ) === null )
      {
        res.status(StatusCodes.NOT_FOUND).json( responderUniformementeAoFrontend( StatusCodes.NOT_FOUND, [], "recurso para deleção não existe.", errors.array()) );
        return;
      }

      //@ts-ignore
      controller.eliminarTarefa( +req.params.identificador );
      res.status(StatusCodes.NO_CONTENT).json( responderUniformementeAoFrontend( StatusCodes.NO_CONTENT, [], "recurso foi eliminado.", errors.array() ) );
      return;
    }
    catch (err)
    {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json( responderUniformementeAoFrontend( StatusCodes.INTERNAL_SERVER_ERROR, [], "servidor não conseguiu eliminar tarefa",
                                                                                           errors.array()) );
      return;
    }
  })();
});


export { RoutesTarefas };
