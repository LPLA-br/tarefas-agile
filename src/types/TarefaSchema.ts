// DESCRIÇÃO: define a tarefa para que o express-validator possa entender
// o que uma tarefa precisa possuir para ser processada e salva no servidor.

import type { Schema } from "express-validator";

export const TarefaSchema: Schema =
{
  titulo:
  {
    in: ['body'],
    isString: true,
    notEmpty:
    {
      errorMessage: "título é necessário"
    }
  },
  corpo:
  {
    in: ['body'],
    isString: true,
    notEmpty:
    {
      errorMessage: "corpo é necessário"
    }
  },
};

export const OptionalTarefaSchema: Schema =
{
  titulo:
  {
    optional: true,
    in: ['body'],
    isString: true,
    notEmpty:
    {
      errorMessage: "título é necessário"
    }
  },
  corpo:
  {
    optional: true,
    in: ['body'],
    isString: true,
    notEmpty:
    {
      errorMessage: "corpo é necessário"
    }
  },
};

// Superconjunto de OptionalTarefaSchema
export const TarefaEstadosSchema: Schema = Object.assign(
{
  prioritario:
  {
    optional: true,
    in: ['body'],
    isBoolean: true,
    /*notEmpty:
    {
      errorMessage: "prioritario é necessário para avaliação de modificação no servidor"
    }*/
  },
  concluido:
  {
    optional: true,
    in: ['body'],
    isBoolean: true,
    /*notEmpty:
    {
      errorMessage: "concluido é necessário para avaliação de modificação no servidor"
    }*/
  },
}, OptionalTarefaSchema);

