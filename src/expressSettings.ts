/* DESCRIÇÃO: configuração do express.
* */

import express from 'express';
import { notFound } from './routes/NotFound.js';
import { RoutesTarefas } from './routes/RoutesTarefa.js';

const app = express();

app.use( notFound );

app.use('/', RoutesTarefas );

app.use( express.json() );
app.use( express.urlencoded({ extended: true }) );

export { app };
