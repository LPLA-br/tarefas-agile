import express from "express";

import Tarefa from "../entities/Tarefa";
import TypeTarefa from "../entities/TypeTarefa";

abstract class ControllerTarefas
{
  constructor()
  {}

  public abstract criarTarefa();
  public abstract modificarTarefa();
  public abstract priorizarTarefa();
  public abstract despriorizarTarefa();
  public abstract eliminarTarefa();
  public abstract concluirTarefa();

}

