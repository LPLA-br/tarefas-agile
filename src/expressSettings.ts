/* DESCRIÇÃO: configuração do express.
* */

import express from 'express';
//import { notFound } from './routes/NotFound.js';
import { RoutesTarefas } from './routes/RoutesTarefa.js';
import bodyParser from 'body-parser';


const app = express();

//app.use( notFound );
//
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({ extended: true }) );

app.use('/', RoutesTarefas );

export { app };
