# Análise e proposta — Previsão de batimento de ponto

**Fonte analisada:** `C:\Users\af63537\Documents\Procergs\horarios.ods`  
**Data da análise:** 10/11/2026  
**Status:** análise inicial, sem implementação

## 1. Contexto e arquitetura identificados

O arquivo `horarios.ods` é uma planilha do LibreOffice Calc com uma única aba (`Planilha1`), contendo aproximadamente 361 linhas de registro de ponto. A estrutura observada, após expansão das células com `number-columns-repeated`, é:

| Coluna | Significado provável |
|---|---|
| A | Mês (ex.: `Agosto`, `Setembro`) |
| B | Tipo de dia (`SAB`, `DOM`, `FER` ou vazio) |
| C | Dia do mês |
| D | Entrada |
| E | Saída para almoço |
| F | Retorno do almoço |
| G | Saída final |
| H | Horas trabalhadas (fórmula) |
| I | Saldo do dia em relação a 8:00 (fórmula) |
| J/L | Saldos/cumulativos em algumas seções |

Foram identificados **299 registros válidos** com os quatro batimentos (`entrada`, `saída almoço`, `retorno`, `saída`). Os dados cobrem jornadas típicas de segunda a sexta, com fins de semana/feriados em branco e alguns registros de hora extra/compensação.

Estatísticas relevantes da base:

- Entrada média: `07:42:58`
- Saída para almoço média: `12:08:34`
- Retorno do almoço médio: `13:14:42`
- Saída média: `16:53:46`
- Horas trabalhadas médias: `08:04:39`
- Duração média do almoço: `01:06:09`
- Manhã média (entrada → almoço): `04:25:36`
- Tarde média (retorno → saída): `03:39:03`
- Faixa de entrada: `06:57` a `08:46`
- Faixa de saída: `14:15` a `19:00`


## 2. Diagnóstico

### Problema real

O usuário precisa prever batimentos de ponto a partir de uma regra simples:

> último batimento às `17:00` + jornada de `8:00` horas.

A planilha atual armazena histórico, mas não oferece uma previsão direta nem normaliza os dados para cálculo. Além disso, o ODS contém:

- células mescladas/repetidas;
- fórmulas em vez de valores em algumas colunas;
- linhas de fim de semana/feriado em branco;
- seções com formatos levemente diferentes;
- saldo cumulativo em colunas não uniformes.

Isso torna a planilha boa como fonte histórica, mas ruim como base de cálculo automatizado sem uma etapa de normalização.

### Regra de previsão recomendada

Para um dia com saída final fixada em `17:00` e jornada alvo de `8:00`, usando a média observada do almoço (`01:06:09`) e da manhã (`04:25:36`):

- Manhã: `04:25:36`
- Almoço: `01:06:09`
- Tarde: `03:34:24` (restante para completar 8:00)

Resultado previsto:

| Batimento | Horário previsto |
|---|---:|
| Entrada | `07:54` |
| Saída para almoço | `12:19` |
| Retorno do almoço | `13:26` |
| Saída final | `17:00` |
| Jornada líquida | `8:00` |

Se o usuário quiser compensar saldo acumulado (coluna de saldo/cumulativo), a jornada alvo pode ser ajustada:

```text
jornada_ajustada = 8:00 - saldo_acumulado_do_periodo
```

Com jornada ajustada menor, a entrada pode ser mais tarde; com saldo negativo, mais cedo.

## 3. Alternativas consideradas

### A. Fórmulas diretamente no LibreOffice Calc

Criar uma aba `Previsão` na própria planilha, usando `MÉDIA`, aritmética de tempo e referências às colunas D:G.

- **Vantagens:** zero instalação, usa o arquivo existente, fácil de ajustar.
- **Desvantagens:** frágil a mudanças de layout, difícil de compartilhar como app, sem validação/teste automatizado.
- **Risco:** fórmulas quebram se linhas/colunas mudarem.

### B. Script local em Node.js lendo CSV exportado

Um CLI que recebe um CSV normalizado e calcula previsões.

- **Vantagens:** lógica testável, fácil de versionar, sem dependências de planilha.
- **Desvantagens:** exige exportação manual do ODS para CSV e conhecimento técnico para rodar.
- **Risco:** parsing de tempo e fusos.

### C. Aplicação web estática (um único arquivo HTML)

Uma página local, sem build e sem backend, que:

1. importa um CSV normalizado;
2. calcula estatísticas históricas;
3. permite informar último batimento (ex.: `17:00`), jornada alvo e almoço;
4. exibe batimentos previstos.

- **Vantagens:** simples, portável, testável, sem infraestrutura, pode ser aberta no navegador.
- **Desvantagens:** depende de exportação prévia do ODS para CSV.
- **Risco:** baixo, desde que a normalização seja feita uma vez.

## 4. Recomendação e justificativa

Recomendo a **alternativa C (aplicação web estática de um único arquivo HTML)**, com uma etapa inicial de normalização do ODS para CSV.

Justificativa:

1. É a opção mais proporcional ao problema: não exige backend, banco ou deploy.
3. Permite testar a lógica de previsão isoladamente.
4. Pode consumir um CSV gerado uma vez a partir do ODS.
5. É fácil de evoluir para PWA/mobile se necessário.

Como passo imediato e de menor atrito, também vale manter uma aba `Previsão` na planilha (alternativa A) para uso diário, usando as médias já calculadas. Mas a recomendação arquitetural principal é a aplicação estática.

### Algoritmo de previsão proposto

```text
entrada prevista = saida_final - jornada_alvo - duracao_almoco
saida_almoco     = entrada_prevista + media_manha
retorno_almoco   = saida_almoco + duracao_almoco
saida_final      = entrada_prevista + jornada_alvo + duracao_almoco
```

Parâmetros configuráveis:

- `saida_final` (padrão: `17:00`);
- `jornada_alvo` (padrão: `8:00`);
- `duracao_almoco` (padrão: média histórica `1:06`, ajustável);
- `media_manha` (padrão: `4:26`);
- `saldo_acumulado` (opcional, para compensação).

Validação recomendada: backtesting sobre os 299 registros, medindo erro entre horário previsto e real. Meta inicial: erro mediano menor que 15 minutos para entrada/saída.

## 5. Componentes ou arquivos potencialmente afetados


Arquivos novos sugeridos

- `ponto-previsao.html` — aplicação estática (UI + lógica).
- `ponto-historico.csv` — exportação normalizada do ODS.
- `ponto-previsao.test.js` — testes da lógica de cálculo (opcional).
- `README-ponto.md` — instruções de exportação e uso.

Estrutura sugerida do CSV normalizado:

```csv
data,dia_semana,entrada,saida_almoco,retorno_almoco,saida,horas_trabalhadas,saldo
2026-08-16,,08:02:00,11:48:00,12:43:00,17:05:00,08:08:00,00:08:00
```

Módulos da aplicação:

- `normalizer`: converte linhas brutas em registros válidos.
- `stats`: calcula médias de entrada, almoço, manhã e tarde.
- `predictor`: aplica a regra de previsão.
- `ui`: formulário e tabela de resultado.

## 6. Riscos e verificações necessárias

- **Normalização do ODS:** as linhas com células repetidas e fórmulas precisam ser expandidas/convertidas antes do uso. Recomenda-se exportar para CSV uma vez e validar os 299 registros.
- **Variação do almoço:** a média de `1:06` pode não representar dias específicos. Permitir ajuste manual do almoço na UI.
- **Horas extras/compensação:** registros como entrada às `17:13` e saída às `18:53` não seguem o padrão. Eles devem ser filtrados ou tratados como exceção no histórico.
- **Fins de semana/feriados:** linhas em branco devem ser ignoradas.
- **Cumulativo de saldo:** a coluna cumulativa aparece em formato inconsistente; validar antes de usar para compensação.
- **Fuso horário/local:** manter tudo em hora local, sem conversão UTC.
- **Privacidade:** os horários são dados pessoais; manter a aplicação local, sem envio a servidor.
- **Verificações recomendadas:**
  1. Backtesting da previsão sobre os 299 registros.
  2. Conferência manual de 10 dias representativos.
  3. Teste da UI com almoço ajustado (ex.: 45, 60 e 90 minutos).
  4. Validação de que dias sem batimento completo são ignorados.
