/* AUTOR: LPLA-br
*  DESCRIÇÃO: Setor de execução do projeto
* */

import process from "node:process";

import TratadorConfiguracoes from "./utilities/TratadorConfiguracoes.js";

import { app } from "./expressSettings.js";

process.on( 'SIGINT', () =>
{
  console.log("SIGINT - Servidor Interrompido com CTRL+C ");
  process.exit(0);
});

process.on( 'exit', (code)=>
{
  console.log( "exit, code: " + code );
});

try
{
  const porta = new TratadorConfiguracoes().obterPortaTCP();
  app.listen( porta, ()=>
  {
    console.log(`TAREFAS - OUVINDO PORTA: ${porta}`); });
}
catch( err )
{
  console.error( "main: ", err );
  process.exit(128);
}


