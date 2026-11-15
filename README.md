# batimento_ponto

Projeto para previsão de horários de batimento de ponto com base no histórico de `horarios.ods`.

## Local correto

Todas as informações deste projeto devem ficar em:

```text
C:\Users\af63537\projetos\batimento_ponto
```

## Documentos

- [Análise e proposta](docs/analise-ponto.md) — análise da planilha `horarios.ods`, diagnóstico, alternativas, recomendação e riscos.

## Resumo da análise

- Fonte: `C:\Users\af63537\Documents\Procergs\horarios.ods`
- 299 registros válidos com os quatro batimentos
- Entrada média: `07:42:58`
- Saída para almoço média: `12:08:34`
- Retorno do almoço médio: `13:14:42`
- Saída média: `16:53:46`
- Jornada média: `08:04:39`
- Almoço médio: `01:06:09`

## Previsão de referência

Considerando saída final às `17:00` e jornada de `8:00`:

| Batimento | Horário previsto |
|---|---:|
| Entrada | `07:54` |
| Saída para almoço | `12:19` |
| Retorno do almoço | `13:26` |
| Saída final | `17:00` |

## Recomendação

Implementar uma aplicação web estática de um único arquivo HTML, sem backend, com:

1. importação de CSV normalizado;
2. cálculo de estatísticas históricas;
3. previsão dos batimentos a partir da saída final, jornada e almoço;
4. opção de compensar saldo acumulado.
