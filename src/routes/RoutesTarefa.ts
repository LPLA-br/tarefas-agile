/* RESPONSABILIDADE: Definição de roteamento URL HTTP da aplicação demonstrativa de tarefas.
* */

import type { Request, Response } from "express";
import { Router } from "express";

import { body, validationResult, checkSchema } from "express-validator";
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

        res.status(200).json( responderUniformementeAoFrontend( 200, dados, "titulos e respectivos ids de todas tarefas") );
      }
      catch ( err )
      {
        res.status(500).json( responderUniformementeAoFrontend( 500, [], "servidor não conseguiu obter dados do recurso" ) );
      }
    }

    res.status(400).json( responderUniformementeAoFrontend( 400, [], "requisição sem \"campo\" string válido") );
  })();
});


RoutesTarefas.get( "/tarefas/:identificador", body("identificador").notEmpty().isNumeric(),(req: Request, res: Response) =>
{
  const validation = validationResult( req );

  ( async ()=>
  {
    if ( validation.isEmpty() )
    {
      try
      {
        const dados = await controller.obterTarefa( req.body.identificador );

        res.status(200).json( responderUniformementeAoFrontend( 200, dados, "dados de uma tarefa especifica") );
      }
      catch ( err )
      {
        res.status(500).json( responderUniformementeAoFrontend( 500, [], "servidor não conseguiu obter dados do recurso" ) );
      }
    }

    res.status(400).json( responderUniformementeAoFrontend( 400, [], "requisição sem \"identificador\" numérico válido") );
  })();
});

RoutesTarefas.post( "/tarefas", checkSchema( TarefaSchema ), (req: Request, res: Response) =>
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

        res.status(200).json( responderUniformementeAoFrontend( 201, dados, "tarefa criada") );
      }
      catch ( err )
      {
        res.status(500).json( responderUniformementeAoFrontend( 500, [], "servidor não conseguiu reter dados" ) );
      }
    }

    res.status(400).json( responderUniformementeAoFrontend( 400, [], "requisição não possui campos (titulo,corpo) do tipo string") );
    
  })();

});

RoutesTarefas.put( "/tarefas/:identificador", checkSchema(TarefaPutSchema),(req: Request, res: Response) =>
{
  const validation = validationResult( req );

  ( async ()=>
  {
    if ( validation.isEmpty() )
    {
      try
      {
        const conteudo: Partial<TypeTarefa> = {
          titulo: req.body.titulo,
          corpo: req.body.corpo
        };

        const propriedades: Partial<TypeTarefa> =
        {
          identificador: req.body.identificador,
          prioritario: req.body.prioritario,
          concluido: req.body.concluido,
        };

        controller.modificarTextualTarefa( propriedades.identificador, conteudo );

      }
      catch ( err )
      {

      }
    }
 
    res.status(400).json( responderUniformementeAoFrontend( 400, [], "requisição não possui campos (titulo,corpo) do tipo string") );
  })();
});

RoutesTarefas.delete( "/tarefas/:identificador", (req: Request, res: Response) =>
{

});


export { RoutesTarefas };
