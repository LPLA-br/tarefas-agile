/* RESPONSABILIDADE: Definição de roteamento URL HTTP da aplicação demonstrativa de tarefas.
* */

import type { Request, Response } from "express";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import { param, body, validationResult, checkSchema } from "express-validator";
import { TarefaSchema, TarefaPutSchema } from "../types/TarefaSchema.js";

import type { TypeTarefa } from "../types/TypeTarefa.js";

import { ControllerTarefas } from "../controllers/ControllerTarefas.js";

const RoutesTarefas = Router();
const controller = new ControllerTarefas();

function responderUniformementeAoFrontend( codigo: number, dados: any, mensagem: string )
{
  return {
    "codigo": codigo,
    "mensagem": mensagem,
    "dados": dados
  }
}

RoutesTarefas.get( "/tarefas/titulos", body('campo').notEmpty().isString(), (req: Request, res: Response) =>
{
  const validation = validationResult( req );

  ( async ()=>
  {
    if ( validation.isEmpty() )
    {
      try
      {
        const dados =
        {
          "titulos": await controller.obterCampoEspecificoTodasTarefas( req.body.campo ),
          "identificadoes": await controller.obterCampoEspecificoTodasTarefas( "identificador" )
        }

        res.status(StatusCodes.OK).json( responderUniformementeAoFrontend( StatusCodes.OK, dados, "titulos e respectivos ids de todas tarefas") );
        return;
      }
      catch ( err )
      {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json( responderUniformementeAoFrontend( StatusCodes.INTERNAL_SERVER_ERROR, [], "servidor não conseguiu obter dados do recurso" ) );
        return;
      }
    }
    res.status(StatusCodes.BAD_REQUEST).json( responderUniformementeAoFrontend( StatusCodes.BAD_REQUEST, [], "requisição sem \"campo\" string válido") );
  })();
});


RoutesTarefas.get( "/tarefas/:identificador", body("identificador").notEmpty().isNumeric(), (req: Request, res: Response) =>
{
  const validation = validationResult( req );

  ( async ()=>
  {
    if ( validation.isEmpty() )
    {
      try
      {
        const dados = await controller.obterTarefa( req.body.identificador );

        //@ts-ignore
        if ( typeof dados === "null" || typeof dados === "undefined" )
        {
          res.status(StatusCodes.NOT_FOUND).json( responderUniformementeAoFrontend( StatusCodes.NOT_FOUND, [], "recurso para deleção não existe." ) );
          return;
        }

        res.status(StatusCodes.OK).json( responderUniformementeAoFrontend( StatusCodes.OK, dados, "dados de uma tarefa especifica") );
        return;
      }
      catch ( err )
      {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json( responderUniformementeAoFrontend( StatusCodes.INTERNAL_SERVER_ERROR, [], "servidor não conseguiu obter dados do recurso" ) );
        return;
      }
    }
    res.status(StatusCodes.BAD_REQUEST).json( responderUniformementeAoFrontend( StatusCodes.BAD_REQUEST, [], "requisição sem \"identificador\" numérico válido") );
  })();
});

// Warning: HTTP url param not indicate resource
RoutesTarefas.post( "/tarefas", checkSchema( TarefaSchema, ["body"]), (req: Request, res: Response) =>
{
  const validation = validationResult( req );

  ( async ()=>
  {
    if ( validation.isEmpty() )
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

        res.status(StatusCodes.CREATED).json( responderUniformementeAoFrontend( StatusCodes.CREATED, dados, "tarefa criada") );
        return;
      }
      catch ( err )
      {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json( responderUniformementeAoFrontend( StatusCodes.INTERNAL_SERVER_ERROR, [], "servidor não conseguiu reter dados" ) );
        return;
      }
    }
    res.status(StatusCodes.BAD_REQUEST).json( responderUniformementeAoFrontend( StatusCodes.BAD_REQUEST, [], "requisição não possui campos (titulo,corpo) do tipo string") ); 
  })();

});

RoutesTarefas.put( "/tarefas/:identificador", param("identificador").notEmpty().isNumeric(),
                  checkSchema(TarefaPutSchema, ["body"]),(req: Request, res: Response) =>
{
  const validation = validationResult( req );

  ( async ()=>
  {
    if ( validation.isEmpty() )
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
          res.status(StatusCodes.NOT_FOUND).json( responderUniformementeAoFrontend( StatusCodes.NOT_FOUND, [], "recurso para deleção não existe." ) );
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
        res.status(StatusCodes.OK).json( responderUniformementeAoFrontend( StatusCodes.OK, controller.obterTarefa( obrigatorias.identificador ), "recurso modificado" ) );
        return;
      }
      catch ( err )
      {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json( responderUniformementeAoFrontend( StatusCodes.INTERNAL_SERVER_ERROR, [], "servidor não conseguiu atualizar dados" ) );
        return;
      }
    }
    res.status(StatusCodes.BAD_REQUEST).json( responderUniformementeAoFrontend( StatusCodes.BAD_REQUEST, [], "requisição não possui campos (titulo,corpo) do tipo string") );
  })();
});

RoutesTarefas.delete( "/tarefas/:identificador", param("identificador").notEmpty().isNumeric(), (req: Request, res: Response) =>
{
  const validation = validationResult( req );

  if ( validation.isEmpty() )
  {
    try
    {
      //@ts-ignore
      if ( controller.obterCampoEspecificoUmaTarefa( +req.params.identificador, "identificador" ) === null )
      {
        res.status(StatusCodes.NOT_FOUND).json( responderUniformementeAoFrontend( StatusCodes.NOT_FOUND, [], "recurso para deleção não existe." ) );
        return;
      }

      //@ts-ignore
      controller.eliminarTarefa( +req.params.identificador );
      res.status(StatusCodes.NO_CONTENT).json( responderUniformementeAoFrontend( StatusCodes.NO_CONTENT, [], "recurso foi eliminado." ) );
      return;
    }
    catch (err)
    {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json( responderUniformementeAoFrontend( StatusCodes.INTERNAL_SERVER_ERROR, [], "servidor não conseguiu eliminar tarefa" ) );
      return;
    }
  }
  res.status(StatusCodes.BAD_REQUEST).json( responderUniformementeAoFrontend( StatusCodes.BAD_REQUEST, [], "requisição não possui campo identificador para deleção") );
  return;
});


export { RoutesTarefas };
