// DESCRIÇÃO; testes unitários pós implementação das rotas. Nível de rota para cumprir prazo.
// 7/09/2025

const axios = require("axios");
const validar = require("./axios-validateStatusConf");
const { StatusCodes } = require("http-status-codes");

const servidor = "127.0.0.1";
const porta = "8080";

beforeAll( ()=>
{
  test( "criar recurso", async ()=>
  {
    const res = await axios.post( `${servidor}:${porta}/tarefas`, {titulo: "demonstração", corpo: "demonstrar criação"}, {validateStatus: validar});
    expect( res.status ).toBe( StatusCodes.CREATED );
  });

  test( "criar recurso/ ausência de dados", async ()=>
  {
    const res = await axios.post( `${servidor}:${porta}/tarefas`, {}, {validateStatus: validar});
    expect( res.status ).toBe( StatusCodes.BAD_REQUEST );
  });
});

describe( "obtenção de recursos", ()=>
{

  test( "obter titulos e identificadores das tarefas", async ()=>
  {
    const res = await axios.get( `${servidor}:${porta}/tarefas/titulos`, {validateStatus: validar});
    expect( res.status ).toBe( StatusCodes.OK );
    expect( typeof res.data ).toBe( "object" );
  });

  test( "obter conteudo de tarefa pelo identificador", async ()=>
  {
    const res = await axios.get( `${servidor}:${porta}/tarefas/1`, {validateStatus: validar});
    expect( res.status ).toBe( StatusCodes.OK );
    expect( typeof res.data ).toBe( "object" );
  });

  test( "tentativa de obter inexistente", async ()=>
  {
    const res = await axios.get( `${servidor}:${porta}/tarefas/777`, {validateStatus: validar});
    expect( res.status ).toBe( StatusCodes.NOT_FOUND );
  });
});

describe( "macro-modificação de recurso", ()=>
{
  test( "modificar corpo e texto", async ()=>
  {
    const res = await axios.put( `${servidor}:${porta}/tarefas/1`, { titulo: "modificar", corpo: "deve modificar" }, {validateStatus: validar});
    expect( res.status ).toBe( StatusCodes.OK );
    expect( typeof res.data ).toBe( "object" );
  });

  test( "tentativa modificar corpo e texto de uma tarefa inexistente", async ()=>
  {
    const res = await axios.put( `${servidor}:${porta}/tarefas/777`, { titulo: "não penso", corpo: "logo não existo" }, {validateStatus: validar});
    expect( res.status ).toBe( StatusCodes.NOT_FOUND );
  });

  test( "modificar prioridade", async ()=>
  {
    const res = await axios.put( `${servidor}:${porta}/tarefas/1`, { titulo: "modificar", corpo: "deve modificar", prioritario: true }, {validateStatus: validar});
    expect( res.status ).toBe( StatusCodes.OK );
  });

  test( "modificar conclusão", async ()=>
  {
    const res = await axios.put( `${servidor}:${porta}/tarefas/1`, { titulo: "modificar", corpo: "deve modificar", concluido: true }, {validateStatus: validar});
    expect( res.status ).toBe( StatusCodes.OK );
  });
});


afterAll(()=>{
  test( "deletar recurso", async ()=>
  {
    const res = await axios.put( `${servidor}:${porta}/tarefas/1`, {}, {validateStatus: validar});
    expect( res.status ).toBe( StatusCodes.OK );
  });

  test( "tentativa de deletar recurso inexistente", async ()=>
  {
    const res = await axios.put( `${servidor}:${porta}/tarefas/777`, {}, {validateStatus: validar});
    expect( res.status ).toBe( StatusCodes.NOT_FOUND );
  });
}, 5000);

