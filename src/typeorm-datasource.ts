/* DESCRIÇÃO: Define tecnologia de persistência informaçional a ser utilizada
 * em conjunto com Mapeador Objeto Relacional "Typeorm"
* */

import { DataSource } from "typeorm";
import TratadorConfiguracoes from "./utilities/TratadorConfiguracoes.js";

// ENTIDADES
import { Tarefa } from "./entities/Tarefa.js";

const conf = new TratadorConfiguracoes();

const TypeormDataSource = new DataSource(
  {
    type: "better-sqlite3",
    database: conf.obterCaminhoDatabaseLocal(),
    logging: conf.obterEstadoDeLOGDatabaseLocal(),
    entities: [Tarefa],
    migrations: [],
    synchronize: true, // true → false PRODUÇÃO
  }
);

try
{
  await TypeormDataSource.initialize();
  console.log( "TypeormDataSource: INICIALIZADO" );
}
catch ( err )
{
  console.error( "TypeormDataSource: Erro durante inicialização → \n", err );
}

export { TypeormDataSource };

