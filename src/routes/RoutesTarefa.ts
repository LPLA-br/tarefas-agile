/* RESPONSABILIDADE: Definição de roteamento URL HTTP da aplicação demonstrativa de tarefas.
* */

import type { Request, Response } from "express";
import { Router } from "express";

import { ControllerTarefas } from "../controllers/ControllerTarefas.js";

const RoutesTarefas = Router();
const controller = new ControllerTarefas();

RoutesTarefas.get( "/tarefas/titulos", (req: Request, res: Response) =>
{
});


RoutesTarefas.get( "/tarefas/:identificador", (req: Request, res: Response) =>
{ });

RoutesTarefas.post( "/tarefas/:identificador", (req: Request, res: Response) =>{ });

RoutesTarefas.put( "/tarefas/:identificador", (req: Request, res: Response) =>{ });

RoutesTarefas.delete( "/tarefas/:identificador", (req: Request, res: Response) => { });


export { RoutesTarefas };
