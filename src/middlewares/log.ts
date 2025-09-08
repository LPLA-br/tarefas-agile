// DESCRIÇÃO: emitir para stdout do servidor.
// Quem requisitou, Qual recurso, Quando ?

import type { Request, Response, NextFunction } from "express";

export const log = ( req: Request, res: Response, next: NextFunction )=>
{
  const logObject = {
    requesterIPAddress: req.ip,
    method: req.method,
    resource: req.originalUrl,
    requestTimestamp: new Date().getTime().toString(),
  };

  console.log( JSON.stringify( logObject ) );
  next();
}

