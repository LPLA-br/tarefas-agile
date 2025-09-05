/* AUTOR: LPLA-br
 * RESPONSABILIDADE: Leitura de arquivo de configuração do servidor.
 * */
import * as fs from 'fs';

import type { ConfigFile } from '../types/ConfigFile.js';

export default class TratadorConfiguracoes
{
  private readonly CONF_FILE: string = "../server-config.json";
  private configParams: ConfigFile;

  constructor()
  {
    const fileContent = fs.readFileSync( this.CONF_FILE );
    this.configParams = JSON.parse( fileContent.toString() );
  }

  public obterPortaTCP(): number | undefined
  {
    try
    {
      return this.configParams.TCPport;
    }
    catch( err )
    {
      console.error( `${this.constructor.name}: ${err}` );
    }
  }

  public obterCaminhoDatabaseLocal(): string
  {
    return this.configParams.databasePATH;
  }

  public obterEstadoDeLOGDatabaseLocal(): boolean
  {
    return this.configParams.databaseLOG;
  }

}

