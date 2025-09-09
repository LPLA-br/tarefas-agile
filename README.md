# PROJETO RÁPIDO DE APLICAÇÃO DE TAREFAS - Backend

Implementação *agile as possible* da clássica aplicação gerenciadora de tarefas.

Limite Temporal
2/set/2025 até 9/set/2025

CHANGELOG:

0.5.0  (State Of Art)

- listagem de titulos e ids.
- obtencao de conteúdo de uma tarefa.
- criação de tarefas.
- manipulacao lógica de estados de tarefa (concluido, prioritario).
- remoção arbitrária de tarefas se assim for desejado.
    
## COMO RODAR ISSO COM O DOCKER ?

Siga as etapas abaixo para sistema
linux como software de conteiner Docker:

```shellscript

# obtenha a imagem do node do dockerhub
$ docker pull node

# crie uma nova imagem extendendo as camadas da
# imagen node obtida. Neste caso node/tarefas:0.X.X
$ docker build -t 'node/tarefas:VERSAO' .

# Por fim, instâncie a imagem em um container associando
# a porta tcp 8080 do container com a 8080 da tua máquina.
$ docker run --publish 8080:8080/tcp node/tarefas:0.X.X

```

