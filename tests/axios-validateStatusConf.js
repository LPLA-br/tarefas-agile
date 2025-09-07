
/*Controle de emissão de erros via throw pelo axios
para códigos de erro HTTP*/
const validar = function (status)
{
  return ( status >= 200 && status <= 599 );
}

module.exports = { validar };

