/* DESCRIÇÃO: configuração do express.
* */

import express from 'express';
//import { notFound } from './routes/NotFound.js';
import { RoutesTarefas } from './routes/RoutesTarefa.js';
import bodyParser from 'body-parser';
import { cors } from "./middlewares/cors.js";

const app = express();

app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({ extended: true }) );

app.use( cors );

app.use('/', RoutesTarefas );

export { app };
