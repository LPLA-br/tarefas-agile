/* AUTOR: LPLA-br
 * DESCRIÇÃO: configuração do express.
* */

import express from 'express';
//import { notFound } from "";

const app = express();

//app.use( notFound );

app.use( express.json() );
app.use( express.urlencoded({ extended: true }) );

export { app };
