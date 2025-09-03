
import type { Request, Response } from "express";

export const notFound = ( req:Request, res:Response )=>
{
  console.log( `{"HOST":"${req.ip}", "METHOD":"${req.method}", "ROUTE":"${req.path}", "STATUS": "NOT_FOUND"}` );

  res
  .status(404)
  .json({});
};

