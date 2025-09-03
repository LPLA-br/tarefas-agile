/* AUTOR: LPLA-br
 * RESPONSABILIDADE: Definição de roteamento URL HTTP da aplicação demonstrativa de tarefas.
* */

import type { Request, Response } from "express";
import { Router } from "express";

const RoutesTarefas = Router();

RoutesTarefas.get( "/tarefas/quantidade", (req: Request, res: Response) =>{});

RoutesTarefas.get( "/tarefas/titulos", (req: Request, res: Response) => {});

RoutesTarefas.get( "/tarefas/:identificador", (req: Request, res: Response) =>
{ });

//criação
RoutesTarefas.post( "/tarefas/:identificador", (req: Request, res: Response) =>{ });

//subsitituição parcial ou total
RoutesTarefas.put( "/tarefas/:identificador", (req: Request, res: Response) =>{ });

RoutesTarefas.delete( "/tarefas/:identificador", (req: Request, res: Response) => { });


export { RoutesTarefas };
