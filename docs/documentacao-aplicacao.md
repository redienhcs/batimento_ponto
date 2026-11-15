# Documentação Técnica — Previsão de Batimento de Ponto

**Arquivo da aplicação:** `ponto.html`  
**Tipo:** aplicação web estática, um único arquivo HTML, sem backend  
**Público:** usuário final e mantenedor da aplicação  
**Idioma da interface:** português brasileiro

---

## 1. Visão geral e objetivo

A aplicação **Previsão de Batimento de Ponto** calcula, no navegador, os horários de batimento de um dia de trabalho a partir de parâmetros configuráveis e de médias históricas do usuário.

Objetivos principais:

- Prever entrada, saída para almoço, retorno do almoço e saída final.
- Permitir registrar uma entrada real e calcular os demais batimentos, distribuindo o tempo de trabalho proporcionalmente entre manhã e tarde quando necessário.
- Manter um histórico local de batimentos para recalcular médias.
- Registrar compensações de tempo (horas extras/faltas) com totalização geral e por motivo.
- Funcionar totalmente offline, sem envio de dados a servidor.

Todos os cálculos e dados permanecem no navegador do usuário.

---

## 2. Como executar

Não há instalação, build ou servidor.

1. Abra o arquivo `ponto.html` diretamente no navegador (duplo clique ou "Abrir com…").
2. A aplicação carrega automaticamente a configuração, o histórico de batimentos e o histórico de compensação salvos em `localStorage`.
3. Use a seção **1. Configuração** para ajustar parâmetros.
4. Use a seção **2. Histórico de batimentos** para registrar batimentos e calcular a previsão do dia.
5. Use a seção **3. Importar / Exportar** para importar/exportar dados.
6. Use as seções **4** a **6** para estatísticas, compensação de tempo e tendências.

Navegadores recomendados: Chrome, Edge ou Firefox modernos. A aplicação depende de `localStorage`, `FileReader`, `<input type="time">`, `<canvas>` e `navigator.clipboard` (apenas na extensão).

---

## 3. Estrutura da interface

A interface está organizada em seis seções (cards) mais cabeçalho, banner de lembrete de backup e rodapé.

### 3.1 Cabeçalho

- Título: "Previsão de Batimento de Ponto".
- Subtítulo informando que é aplicação local de um único arquivo HTML, com dados e cálculos no navegador (sem backend), em modo noturno (dark theme).
- Paleta de cores em modo noturno (dark theme), definida por variáveis CSS em `:root` (ex.: `--bg:#0f172a`, `--card:#1e293b`, `--text:#e2e8f0`).

### 3.2 Seção 1 — Configuração

Campos de entrada (`<input type="time">`) e botões de ação.

| Campo | ID | Descrição |
|---|---|---|
| Saída final desejada | `cfgSaidaFinal` | Horário de saída final do dia (HH:MM). |
| Jornada alvo (h) | `cfgJornada` | Jornada líquida desejada (HH:MM). |
| Duração do almoço | `cfgAlmoco` | Tempo de pausa para almoço (HH:MM). |
| Almoço mínimo | `cfgAlmocoMin` | Duração mínima permitida para o almoço ao ajustar (HH:MM). |
| Manhã média | `cfgManha` | Duração média da manhã (entrada → saída almoço) (HH:MM). |
| Tarde média | `cfgTarde` | Duração média da tarde (retorno → saída) (HH:MM). |

Botões:

- **Restaurar médias históricas** (`btnRestaurar`): repõe todos os parâmetros para `DEFAULTS`.
- **Recalcular a partir do histórico** (`btnRecalcStats`): recalcula `manha`, `tarde` e `almoco` a partir do histórico e atualiza a configuração.

### 3.3 Seção 2 — Histórico de batimentos

Campos para inclusão manual e cálculo:

| Campo | ID | Descrição |
|---|---|---|
| Data | `histData` | Data do dia. Preenchida automaticamente com a data atual ao carregar, se vazia. |
| Entrada | `histEntrada` | Horário de entrada (HH:MM). Usado também como entrada para o cálculo da previsão. |
| Saída almoço | `histSaidaAlmoco` | Horário de saída para almoço (HH:MM). |
| Retorno almoço | `histRetorno` | Horário de retorno do almoço (HH:MM). |
| Saída final | `histSaida` | Horário de saída final (HH:MM). |

Botões:

| Botão | ID | Ação |
|---|---|---|
| Adicionar ao histórico | `btnAddHist` | Adiciona o registro manual ao histórico, após validação de coerência temporal. |
| Limpar campos | `btnLimparCamposHist` | Limpa os campos de batimento (`histEntrada`, `histSaidaAlmoco`, `histRetorno`, `histSaida`) e redefine `histData` para a data atual. Não remove registros do histórico. |
| Calcular batimentos | `btnCalcular` | Executa `predict()` e exibe o resultado na área `resultado`. |

Tabela de histórico (`histBody`): colunas Data, Entrada, Saída almoço, Retorno, Saída final, Jornada e ação Excluir. Cada linha recebe a classe CSS `abaixo` (texto em vermelho) quando a jornada calculada é menor que a jornada alvo configurada.

Contador de registros (`histCount`).

Área de resultado (`resultado`):

- Título (`resultadoTitulo`).
- Grade de itens (`resultadoGrid`).
- Nota explicativa (`resultadoNota`).

### 3.4 Banner de lembrete de backup

Parágrafo `backupReminder` (classe `note warn`), exibido quando há 5 ou mais registros novos desde a última exportação. Texto: "⚠ Há novos registros desde o último backup. Considere exportar o histórico."

### 3.5 Seção 3 — Importar / Exportar

| Botão | ID | Ação |
|---|---|---|
| Importar batimentos (CSV) | `btnImportar` | Abre seletor de arquivo (`fileCsv`). |
| Exportar batimentos (CSV) | `btnExportar` | Baixa `ponto-historico.csv`. |
| Importar compensação (CSV) | `btnImportarComp` | Abre seletor de arquivo (`fileCompCsv`). |
| Exportar compensação (CSV) | `btnExportarComp` | Baixa `compensacao-historico.csv`. |
| Exportar tudo (JSON) | `btnExportarTudo` | Baixa `ponto-dados.json` (config + histórico de batimentos + histórico de compensação). |
| Importar tudo (JSON) | `btnImportarTudo` | Abre seletor de arquivo (`fileTudo`). |
| Limpar histórico | `btnLimparHist` | Apaga todo o histórico de batimentos (com confirmação). |

Campo de texto colado:

- Área de texto `pasteArea` ("Colar dados copiados do site").
- Botão `btnImportarPaste` ("Importar do texto colado"): executa `parsePaste`.

Notas da interface documentam o formato CSV esperado de batimentos.

### 3.6 Seção 4 — Estatísticas do histórico

Grade (`statsGrid`) com estatísticas calculadas e nota (`statsNota`) com proporção manhã/tarde.

### 3.7 Seção 5 — Compensação de tempo

Campos:

| Campo | ID | Descrição |
|---|---|---|
| Data | `compData` | Data do registro. Preenchida automaticamente com a data atual ao carregar, se vazia. |
| Início | `compInicio` | Horário de início (HH:MM). |
| Fim | `compFim` | Horário de fim (HH:MM). |
| Duração | `compDuracao` | Duração calculada automaticamente (HH:MM), somente leitura. |
| Motivo | `compMotivo` | Motivo da compensação (texto livre). |

Botões:

| Botão | ID | Ação |
|---|---|---|
| Adicionar ao histórico de compensação | `btnAddComp` | Adiciona um registro ou salva alterações quando em modo de edição. O texto muda para "Salvar alterações" durante a edição. |
| Cancelar edição | `btnCancelarComp` | Cancela a edição em andamento (inicialmente oculto). |
| Limpar histórico de compensação | `btnLimparComp` | Apaga todo o histórico de compensação (com confirmação). |

Tabela de compensação (`compBody`): colunas Data, Início, Fim, Duração, Motivo e ação Excluir. Clicar em qualquer linha da tabela (exceto no botão Excluir) abre o registro para edição. O cursor da linha é `pointer`.

Contador de registros (`compCount`). Total compensado (`compTotal`). Totais por motivo (`compPorMotivo`).

### 3.8 Seção 6 — Tendências

Gráfico de tendências em `<canvas id="trendCanvas">` (900×320). Nota: "Gráfico dos batimentos do histórico (entrada, jornada e almoço). Eixo X = ordem dos registros."

Legenda:

- Entrada (h) — cor `#60a5fa` (azul).
- Jornada (h) — cor `#34d399` (verde).
- Almoço (h) — cor `#fbbf24` (amarelo).

### 3.9 Rodapé

Mensagem: "Previsão de Batimento de Ponto — dados permanecem no seu navegador."

---

## 4. Campos de configuração e valores padrão

Os valores padrão estão definidos em `DEFAULTS` e correspondem às médias confirmadas sobre 299 registros válidos.

| Parâmetro (config) | Campo UI | Valor padrão (minutos) | Valor padrão (HH:MM) | Origem |
|---|---|---:|---|---|
| `saidaFinal` | Saída final desejada | 1020 | `17:00` | Configuração de referência |
| `jornada` | Jornada alvo (h) | 480 | `08:00` | Jornada alvo |
| `almoco` | Duração do almoço | 66 | `01:06` | Média histórica (arredondada) |
| `almocoMin` | Almoço mínimo | 30 | `00:30` | Piso mínimo de almoço |
| `manha` | Manhã média | 265 | `04:25` | Média histórica (arredondada) |
| `tarde` | Tarde média | 219 | `03:39` | Média histórica (arredondada) |

Médias históricas confirmadas (299 registros válidos) — valores originais em segundos; os padrões da configuração são arredondados para o minuto mais próximo:

| Métrica | Valor |
|---|---|
| Registros válidos | 299 |
| Entrada média | `07:42:58` |
| Saída para almoço média | `12:08:34` |
| Retorno do almoço médio | `13:14:42` |
| Saída média | `16:53:46` |
| Jornada média | `08:04:39` |
| Almoço médio | `01:06:09` |
| Manhã média (entrada → almoço) | `04:25:36` |
| Tarde média (retorno → saída) | `03:39:03` |

Observações:

- A configuração não armazena "entrada média" nem "saída média" como parâmetros; apenas `saidaFinal`, `jornada`, `almoco`, `almocoMin`, `manha` e `tarde`.
- As médias de entrada/saída são exibidas apenas nas estatísticas do histórico.
- O botão "Restaurar médias históricas" repõe os seis parâmetros para `DEFAULTS`, inclusive `saidaFinal` (`17:00`), `jornada` (`08:00`) e `almocoMin` (`00:30`).
- Não existe mais parâmetro de saldo acumulado; a jornada alvo é usada diretamente em todos os cálculos.

---

## 5. Algoritmos

Todas as durações são tratadas internamente em segundos (os valores de configuração e os resultados são arredondados para o minuto mais próximo). Conversões: `toSec(t)` (HH:MM ou HH:MM:SS → segundos) e `toTime(sec)` (segundos → HH:MM, arredondado para minuto, com sinal negativo quando aplicável).

### 5.1 Cálculo de batimentos (`predict`)

Entradas lidas dos campos da seção 2: `E = histEntrada`, `SA = histSaidaAlmoco`, `RT = histRetorno`, `SS = histSaida`, além de `S = saidaFinal`, `J = jornada`, `A = almoco`, `Amin = almocoMin`, `M = manha`, `T = tarde`.

O comportamento depende de quais campos de batimento estão preenchidos:

1. **Sem entrada (`!E`)** — previsão a partir da saída final:
   ```
   entrada       = S - J - A
   saidaAlmoco   = entrada + M
   retorno       = saidaAlmoco + A
   saidaFinal    = S
   ```
   Saída: Entrada (prevista), Saída para almoço, Retorno do almoço, Saída final, Jornada líquida (`J`).  
   Nota: "Entrada calculada para completar {J} com saída às {S}."

2. **Todos os quatro preenchidos (`E, SA, RT, SS`)** — exibe o registro real:
   ```
   manha         = SA - E
   almoco        = RT - SA
   tarde         = SS - RT
   jornadaReal   = manha + tarde
   ```
   Saída: Entrada, Saída para almoço, Retorno do almoço, Saída final, Jornada resultante, Desvio vs alvo (`jornadaReal - J`).  
   Nota: "Jornada resultante {jornadaReal} (alvo {J})."

3. **Somente entrada (`E`)** — modo registro com distribuição proporcional e ajuste de almoço/saída:
   ```
   trabalhoDesejado = S - E - A
   ```
   Se `S - E - Amin < 0`, retorna erro: "Entrada muito tarde: não há tempo para almoço mínimo até a saída desejada."
   - Se `trabalhoDesejado >= J`: `A_usado = A`, `saidaFinal = S`, `trabalho = trabalhoDesejado`.
   - Senão, `A_calc = S - E - J`:
     - Se `A_calc >= Amin`: `A_usado = A_calc`, `saidaFinal = S`, `trabalho = J`, `ajustouAlmoco = true`.
     - Senão: `A_usado = Amin`, `saidaFinal = E + J + Amin`, `trabalho = J`, `ajustouAlmoco = true`, `passouSaida = true`.
   ```
   soma = M + T
   frac = (soma > 0) ? M / soma : 0.5
   manha = round(trabalho * frac / 60) * 60
   tarde = trabalho - manha
   saidaAlmoco = E + manha
   retorno = saidaAlmoco + A_usado
   jornadaReal = manha + tarde
   ```
   Saída: Entrada (informada), Saída para almoço, Retorno do almoço, Saída final (prevista/desejada), Almoço utilizado, Jornada resultante, Desvio vs alvo.  
   Nota inclui ajustes de almoço e de saída final quando aplicáveis, além de "Faltam/Sobram/Exatamente … para a jornada alvo."

4. **Entrada + saída almoço (`E, SA`)** — prevê retorno e saída:
   ```
   manha = SA - E
   jornadaRestante = J - manha
   ```
   Se `jornadaRestante < 0`, retorna erro: "Manhã excedeu a jornada alvo."
   - `tardeDesejada = S - SA - A`.
   - Se `tardeDesejada >= jornadaRestante`: `A_usado = A`, `saidaFinal = S`.
   - Senão, `A_calc = S - E - J`:
     - Se `A_calc >= Amin`: `A_usado = A_calc`, `saidaFinal = S`, `ajustou = true`.
     - Senão: `A_usado = Amin`, `saidaFinal = SA + Amin + jornadaRestante`, `ajustou = true`, `passou = (saidaFinal > S)`.
   ```
   retorno = SA + A_usado
   jornadaReal = manha + jornadaRestante
   ```
   Saída: Entrada, Saída para almoço, Retorno (previsto), Saída final (prevista/desejada), Almoço utilizado, Jornada resultante.

5. **Entrada + saída almoço + retorno (`E, SA, RT`)** — prevê saída:
   ```
   manha = SA - E
   tardeNecessaria = J - manha
   ```
   Se `tardeNecessaria < 0`, retorna erro: "Manhã excedeu a jornada alvo."
   ```
   saidaPrevista = RT + tardeNecessaria
   saidaFinal = saidaPrevista > S ? saidaPrevista : S
   jornadaReal = manha + (saidaFinal - RT)
   ```
   Saída: Entrada, Saída para almoço, Retorno, Saída final (prevista/desejada), Jornada resultante.

6. **Qualquer outra combinação** — retorna erro: "Preencha os batimentos em ordem (entrada, saída almoço, retorno, saída)."

Observação: a jornada alvo (`J = config.jornada`) é usada diretamente; não há compensação por saldo.

### 5.2 Estatísticas (`computeMeans`)

1. Filtra registros com os quatro campos preenchidos: `entrada`, `saidaAlmoco`, `retorno`, `saida`.
2. Se nenhum válido, retorna `null`.
3. Calcula médias aritméticas (em segundos) por campo; exibição arredondada para minuto.
4. Deriva:
   - `manha = (saidaAlmoco - entrada) / n`
   - `almoco = (retorno - saidaAlmoco) / n`
   - `tarde = (saida - retorno) / n`
   - `jornada = manha + tarde`

Retorno: `{ n, entrada, saidaAlmoco, retorno, saida, manha, almoco, tarde, jornada }`.

### 5.3 Exibição de estatísticas (`renderStats`)

Mostra: Registros válidos, Entrada média, Saída almoço média, Retorno médio, Saída média, Jornada média, Almoço médio, Manhã média, Tarde média (em `HH:MM`, 5 caracteres) e proporção manhã/tarde em porcentagem.

### 5.4 Recalcular a partir do histórico (`btnRecalcStats`)

1. Calcula médias (`computeMeans`).
2. Se `null`, alerta "Histórico insuficiente."
3. Aplica apenas `manha`, `tarde` e `almoco` à configuração (`applyMeansToConfig`), arredondando para minutos (`Math.round(x/60)*60`).
4. Salva a configuração e atualiza a UI.
5. Alerta "Médias atualizadas a partir do histórico."

Não altera `saidaFinal`, `jornada`, `almocoMin` nem dados de compensação.

### 5.5 Restaurar médias históricas (`btnRestaurar`)

Define `config = Object.assign({}, DEFAULTS)`, salva e atualiza a UI. Restaura todos os parâmetros, incluindo `saidaFinal`, `jornada`, `almoco`, `almocoMin`, `manha` e `tarde`.

### 5.6 Validação de coerência temporal na adição manual

Ao clicar em **Adicionar ao histórico**, a função valida, além da exigência de `entrada` e `saida`:

- se `saidaAlmoco` informado: `entrada < saidaAlmoco`;
- se `retorno` e `saidaAlmoco` informados: `saidaAlmoco < retorno`;
- se `retorno` e `saida` informados: `retorno < saida`;
- se `saidaAlmoco` e `saida` informados: `saidaAlmoco < saida`.

Caso alguma condição falhe, exibe alerta correspondente e não adiciona o registro.

### 5.7 Cálculo da duração na compensação

A função `updateCompDuracao` recalcula `compDuracao` sempre que `compInicio` ou `compFim` mudam:

```
dur = toSec(compFim) - toSec(compInicio)
if dur < 0: dur += 24*3600
compDuracao = toTime(dur)
```

### 5.8 Gráfico de tendências (`drawTrends`)

- Usa o canvas `trendCanvas`.
- Se houver menos de 2 registros, exibe "Dados insuficientes para gráfico (mínimo 2 registros)."
- Ordena o histórico por `date`.
- Calcula, por registro:
  - entrada em horas: `toSec(entrada) / 3600`;
  - jornada em horas: `(saida - entrada - (retorno - saidaAlmoco)) / 3600`;
  - almoço em horas: `(retorno - saidaAlmoco) / 3600`.
- Define mínimo/máximo de todos os valores; eixo Y com 5 faixas; eixo X na ordem dos registros (`i/(n-1)`).
- Desenha três linhas com pontos (cores da legenda).
- Rótulos do eixo X a cada `max(1, floor(n/6))` registros, usando `date.slice(5)` (MM-DD) ou o índice+1 quando não há data.

---

## 6. Histórico local (localStorage)

### 6.1 Persistência

- Chave `ponto.config`: objeto JSON com os parâmetros de configuração.
- Chave `ponto.history`: array JSON de objetos de batimento.
- Chave `ponto.comp`: array JSON de objetos de compensação.
- Chave `ponto.lastExportCount`: número de registros de batimento existentes na última exportação (usado pelo lembrete de backup).

Leitura/escrita via `loadConfig`/`saveConfig`, `loadHistory`/`saveHistory`, `loadComp`/`saveComp`. Em caso de erro de parsing, retorna valor padrão/vazio.

Formato do objeto de batimento:

- `id` (string, `"h" + Date.now()` na inclusão manual, `Date.now() + "-" + i` na importação CSV, `Date.now() + "-" + out.length` na importação por texto).
- `date` (string da data, pode ser vazia).
- `entrada`, `saidaAlmoco`, `retorno`, `saida` (strings `HH:MM`).

Formato do objeto de compensação:

- `id` (string, `"c" + Date.now()` na inclusão, `Date.now() + "-" + i` na importação CSV).
- `data` (string da data).
- `inicio`, `fim` (strings `HH:MM`).
- `duracao` (string `HH:MM`).
- `motivo` (string).

### 6.2 Adicionar registro manual de batimento

Botão **Adicionar ao histórico** (`btnAddHist`):

1. Lê os campos `histData`, `histEntrada`, `histSaidaAlmoco`, `histRetorno`, `histSaida`.
2. Valida: exige ao menos `entrada` e `saida` preenchidos; caso contrário alerta "Preencha ao menos entrada e saída final."
3. Aplica a validação de coerência temporal (seção 5.6).
4. Normaliza horários com `toTime(toSec(...))`.
5. Adiciona ao array, salva e re-renderiza histórico e estatísticas.
6. Limpa os campos de horário (data permanece).

### 6.3 Excluir registro de batimento

Cada linha possui botão "Excluir" com `data-id`. Remove o registro com o `id` correspondente, salva e re-renderiza (histórico, estatísticas, lembrete de backup e tendências).

### 6.4 Limpar histórico de batimentos

Botão **Limpar histórico** pede confirmação (`confirm("Limpar todo o histórico?")`). Se confirmado, zera o array, salva e re-renderiza.

### 6.5 Jornada calculada na tabela

Na renderização, a jornada exibida é:

```
jornada = saida - entrada - (retorno - saidaAlmoco)
```

Exibida em `HH:MM` (5 caracteres). A linha recebe a classe `abaixo` (vermelho) quando `jornada < config.jornada`.

### 6.6 Compensação de tempo — adicionar/editar/excluir

- **Adicionar**: valida que `compInicio` e `compFim` estejam preenchidos; calcula `compDuracao`; cria registro com `id = "c" + Date.now()`, salva e re-renderiza. Limpa os campos (via `cancelEditComp`).
- **Editar**: clicar em uma linha da tabela (exceto no botão Excluir) chama `editComp(id)`, que preenche os campos, define `compEditId`, altera o texto do botão para "Salvar alterações" e exibe "Cancelar edição". Ao salvar, atualiza o registro existente.
- **Cancelar edição**: `cancelEditComp` limpa campos, redefine `compEditId = null`, restaura o texto do botão e oculta "Cancelar edição".
- **Excluir**: botão "Excluir" com `data-id` remove o registro, salva e re-renderiza.
- **Limpar todo**: `btnLimparComp` pede confirmação (`confirm("Limpar todo o histórico de compensação?")`).

### 6.7 Totalização da compensação

- Total geral: soma de `toSec(duracao)` de todos os registros, exibido em `compTotal`.
- Totais por motivo: agrupamento por `motivo` (registros sem motivo usam "(sem motivo)"), exibidos em `compPorMotivo` ordenados alfabeticamente.

---

## 7. Importação e exportação

### 7.1 Batimentos — CSV

**Formato esperado** (conforme nota da interface):

```
data,entrada,saida_almoco,retorno_almoco,saida
```

- Cabeçalho opcional.
- Horários em `HH:MM` (também aceita `HH:MM:SS`, normalizado para minuto).
- Separador: vírgula.

A exportação usa exatamente esse cabeçalho.

**Importação (`parseCsv`):**

1. Divide o texto em linhas não vazias.
2. Detecta cabeçalho: se a primeira linha contém "entrada" (case-insensitive), trata-a como cabeçalho e mapeia colunas por nome.
3. Mapeamento de colunas (por `includes`):
   - `data`: coluna que contém "data" (padrão índice 0).
   - `entrada`: coluna que contém "entrada".
   - `saidaAlmoco`: coluna que contém "saida" **e** "alm" (tenta `saida_almoco` como fallback).
   - `retorno`: coluna que contém "retorno".
   - `saida`: coluna que contém "saida" **e não** "alm" (padrão índice 4).
4. Se não houver cabeçalho, usa índices padrão: `data=0, entrada=1, saidaAlmoco=2, retorno=3, saida=4`.
5. Para cada linha, monta registro com `id = Date.now() + "-" + i` e normaliza horários via `toTime(toSec(...))`.
6. Inclui o registro apenas se tiver `entrada` e `saida` não vazios.
7. Concatena os registros importados ao histórico existente (não substitui).

**Exportação (`exportCsv`):**

Gera o CSV com o cabeçalho acima e linhas `<date>,<entrada>,<saidaAlmoco>,<retorno>,<saida>`. Os horários são exportados como `HH:MM`. O download é feito como `ponto-historico.csv` via `Blob` e link temporário. Chama `markExported()` (atualiza o lembrete de backup).

### 7.2 Compensação — CSV

**Formato:**

```
data,inicio,fim,duracao,motivo
```

**Importação (`parseCompCsv`):**

1. Divide o texto em linhas não vazias.
2. Detecta cabeçalho: se a primeira linha contém "inicio", "início" ou "fim" (case-insensitive), trata-a como cabeçalho e mapeia colunas por nome.
3. Mapeamento: `data`, `inicio` (ou `início`), `fim`, `duracao` (ou `duração`), `motivo`, com fallbacks de índices 0..4.
4. Para cada linha, exige `inicio` e `fim` não vazios; calcula `duracao` se ausente (`fim - inicio`, ajustando +24h se negativo); normaliza horários (`toTime(...).slice(0,5)`).
5. Concatena ao histórico de compensação existente.

**Exportação (`exportCompCsv`):**

Gera o CSV com o cabeçalho acima. Download como `compensacao-historico.csv`. Não atualiza o lembrete de backup (apenas batimentos contam).

### 7.3 JSON unificado (Exportar/Importar tudo)

**Exportação (`btnExportarTudo`):** gera `ponto-dados.json` com `{ config, history, compHistory }`. Chama `markExported()`.

**Importação (`fileTudo`):** lê o JSON; se `data.config` existir, substitui a configuração (mesclando com `DEFAULTS`); se `data.history` for array, substitui o histórico de batimentos; se `data.compHistory` for array, substitui o histórico de compensação. Salva tudo e re-renderiza. Em caso de JSON inválido, alerta "Arquivo JSON inválido."

### 7.4 Importação por texto colado (`parsePaste`)

Suporta o formato da página do ponto (site), com data por extenso seguida de 4 horários em linhas separadas.

- Reconhece data por extenso: "Quarta, 28 de Outubro de 2026" ou "28 de Outubro de 2026" (regex `(\d{1,2})\s+de\s+([A-Za-zÀ-ÿ]+)\s+de\s+(\d{4})`), convertendo o nome do mês (com suporte a acentos e variantes "março"/"marco") para `YYYY-MM-DD`.
- Reconhece data numérica `dd/mm/yyyy` (ou `dd-mm-yyyy`), convertendo para `YYYY-MM-DD` (anos de 2 dígitos recebem prefixo `20`).
- Reconhece horários isolados na forma `HH:MM` (ou `HH:MM:SS`) em linhas separadas; acumula até 4 e então fecha um registro.
- Fallback: linha com 4 ou mais horários (`HH:MM`) na mesma linha gera um registro (usando a data atual se não houver data definida).
- Ao encontrar uma nova data com 4 horários acumulados, fecha o registro anterior antes de trocar a data.
- Um registro é criado apenas quando há `currentDate` e pelo menos 4 horários acumulados.

### 7.5 Limitações do CSV

- Não há suporte a campos entre aspas ou valores com vírgula.
- Não valida datas.
- A detecção de colunas é heurística (baseada em `includes`).
- Registros sem entrada ou saída final são descartados silenciosamente na importação de batimentos.
- Registros de compensação sem início ou fim são descartados silenciosamente.

---

## 8. Estatísticas

Conforme seção 5.2 a 5.4. Os valores são recalculados a partir do histórico de batimentos sempre que este muda (adição, exclusão, importação, limpeza). A seção 4 da interface exibe os resultados.

---

## 9. Compensação de tempo

Seção 5 da interface. Registra períodos de compensação (horas extras/faltas) com totalização.

- Campos: Data, Início, Fim, Duração (automática), Motivo (ver seção 3.7).
- A duração é calculada automaticamente por `updateCompDuracao` (seção 5.7), incluindo virada de meia-noite.
- Histórico próprio persistido em `localStorage` na chave `ponto.comp`.
- Edição ao clicar na linha da tabela (exceto no botão Excluir).
- Totalização geral (`compTotal`) e por motivo (`compPorMotivo`).
- Importação/exportação CSV no formato `data,inicio,fim,duracao,motivo` (seção 7.2).
- Incluído no JSON unificado (seção 7.3).

Não afeta a configuração nem os cálculos de batimento: a compensação é apenas registrada e totalizada.

---

## 10. Tendências (gráficos)

Seção 6 da interface. Canvas (`trendCanvas`) desenha três séries ordenadas por data: entrada (azul), jornada (verde) e almoço (amarelo), conforme seção 5.8. Exige ao menos 2 registros; caso contrário exibe mensagem. É re-renderizado sempre que o histórico de batimentos muda.

---

## 11. Lembrete de backup

Banner `backupReminder` exibido quando `history.length - ponto.lastExportCount >= 5` (5 ou mais registros novos desde a última exportação). `ponto.lastExportCount` é atualizado por `markExported()` nas exportações de batimentos (CSV) e no "Exportar tudo (JSON)". A exportação de compensação (CSV) não atualiza o contador.

---

## 12. Atalhos de teclado

Registrados em `document` (keydown):

- **Ctrl+Enter**: dispara o cálculo (`btnCalcular`).
- **Ctrl+S**: exporta batimentos (`btnExportar`), baixando `ponto-historico.csv`.
- **Ctrl+Shift+S**: exporta tudo (`btnExportarTudo`), baixando `ponto-dados.json`.

Os atalhos chamam `preventDefault()` para evitar o comportamento padrão do navegador.

---

## 13. Sinalização de jornada abaixo do alvo

Na tabela de histórico, cada linha recebe a classe CSS `abaixo` (cor vermelha, `--danger`) quando a jornada calculada do registro é menor que `config.jornada`. A comparação usa a jornada alvo configurada no momento da renderização.

---

## 14. Privacidade e persistência

- **Sem backend:** nenhum dado é enviado a servidor.
- **Persistência local:** `localStorage` com chaves `ponto.config`, `ponto.history`, `ponto.comp` e `ponto.lastExportCount`.
- **Escopo:** dados vinculados ao navegador/perfil e origem (arquivo local). Limpar dados do navegador ou usar outro perfil/dispositivo perde o histórico.
- **Dados pessoais:** horários de ponto são dados pessoais; mantenha o arquivo e os backups em local seguro.
- **Exportação:** os arquivos exportados (CSV/JSON) contêm os horários; trate-os como dado pessoal.

---

## 15. Limitações e riscos

- Sem sincronização entre dispositivos ou perfis de navegador.
- Dependência de `localStorage`: perda de dados ao limpar cache/cookies ou trocar de navegador.
- Sem autenticação ou controle de acesso.
- Cálculos em minutos; arredondamentos podem gerar desvios de 1 minuto.
- CSV sem suporte a aspas/campos com vírgula; parsing heurístico.
- A detecção de colunas no CSV é heurística (baseada em `includes`).
- O modo de cálculo depende da combinação de campos preenchidos; combinações fora de ordem retornam erro.
- A nota do modo de registro menciona "jornada alvo" com o valor configurado (sem compensação, pois não há mais saldo).
- Registros incompletos são ignorados nas estatísticas e descartados na importação de batimentos.
- Histórico com horas extras/compensação atípicas pode distorcer as médias; recomenda-se filtrar exceções antes de importar.
- Fins de semana/feriados em branco devem ser ignorados na normalização do ODS.
- Sem testes automatizados incluídos no arquivo.
- A extensão Firefox depende do site `spstou.ifractal.com.br` e copia todo o `innerText` da página.

---

## 16. Checklist de verificação

- [ ] Abrir `ponto.html` em navegador moderno sem erros no console.
- [ ] Verificar valores padrão carregados na seção 1, incluindo `Almoço mínimo` (`00:30`), em modo noturno.
- [ ] Confirmar preenchimento automático da data atual em `histData` e `compData` ao carregar.
- [ ] Calcular no modo de previsão (sem entrada) com configuração padrão e conferir entrada prevista `07:54` (com saída `17:00` e jornada `8:00`).
- [ ] Calcular informando apenas a entrada e conferir distribuição proporcional e ajuste de almoço.
- [ ] Testar erro com entrada muito tarde.
- [ ] Testar os modos com entrada+saída almoço e com entrada+saída almoço+retorno.
- [ ] Adicionar registro manual com entrada e saída; verificar tabela, contador e sinalização vermelha quando jornada < alvo.
- [ ] Tentar adicionar sem entrada/saída e verificar alerta.
- [ ] Tentar adicionar com horários fora de ordem e verificar alerta de coerência temporal.
- [ ] Excluir um registro e verificar atualização (histórico, estatísticas, tendências, lembrete).
- [ ] Limpar histórico com confirmação.
- [ ] Testar "Limpar campos" na seção 2 e verificar limpeza de `histEntrada`, `histSaidaAlmoco`, `histRetorno`, `histSaida`, com data atual em `histData`.
- [ ] Importar CSV de batimentos com e sem cabeçalho; verificar mapeamento de colunas.
- [ ] Exportar batimentos e verificar cabeçalho `data,entrada,saida_almoco,retorno_almoco,saida` e atualização do lembrete.
- [ ] Colar texto copiado do site em `pasteArea` e importar; verificar registros gerados.
- [ ] Recalcular estatísticas com histórico vazio (alerta esperado) e com registros.
- [ ] Restaurar médias históricas e verificar todos os campos.
- [ ] Adicionar/editar/excluir registros de compensação; verificar total geral e por motivo.
- [ ] Importar/exportar CSV de compensação no formato `data,inicio,fim,duracao,motivo`.
- [ ] Exportar e importar JSON unificado (`ponto-dados.json`).
- [ ] Verificar banner de lembrete de backup após 5 registros novos.
- [ ] Testar atalhos Ctrl+Enter, Ctrl+S e Ctrl+Shift+S.
- [ ] Verificar gráfico de tendências com 2+ registros.
- [ ] Confirmar persistência após recarregar a página.
- [ ] Validar que nenhum dado é enviado a servidor (aba Network).

---

## 17. Aplicação desktop (Electron)

Pasta `desktop/`, empacotamento da mesma aplicação em uma janela desktop via Electron.

- `desktop/main.js`: processo principal. Cria a janela (`BrowserWindow`, 1200×800), carrega `desktop/ponto.html` (`win.loadFile(path.join(__dirname, "ponto.html"))`) e remove o menu superior da janela:
  - `Menu.setApplicationMenu(null)` (remove o menu de aplicação padrão: File, Edit, View, etc.).
  - `autoHideMenuBar: true` e `win.setMenuBarVisibility(false)` (oculta a barra de menu).
  - Encerra a aplicação quando todas as janelas são fechadas (exceto no macOS, onde recria a janela ao reativar).
  - `contextIsolation: true` e `nodeIntegration: false` nas `webPreferences`.
- `desktop/package.json`: manifesto npm/Electron.
  - `main`: `main.js`.
  - Scripts: `start` (`electron .`) e `build` (`electron-builder --win`).
  - Dependências de desenvolvimento: `electron` ^28.0.0 e `electron-builder` ^24.0.0; `electron-packager` ^17.1.2 entre as dependências.
  - Configuração de build (`build`): `appId` `com.procergs.ponto`, `productName` `PrevisaoPonto`, arquivos `main.js` e `../ponto.html`, alvo Windows `nsis`.
- `desktop/ponto.html`: cópia do `ponto.html` da raiz usada pela aplicação desktop.

Como executar:

1. Instale as dependências em `desktop/` (uma vez): `npm install`.
2. Rodar em modo desenvolvimento: `npm start` (executa `electron .`), que abre a janela carregando `desktop/ponto.html`.
3. Executável direto (build existente): `desktop/dist/win-unpacked/PrevisaoPonto.exe` (gerado pelo electron-builder) ou `dist/PrevisaoPonto-win32-x64/PrevisaoPonto.exe` (gerado pelo electron-packager).

Como gerar o `.exe`:

- Usando o electron-packager (presente em `dependencies`): a partir da pasta `desktop/`, execute `npx electron-packager . PrevisaoPonto --platform=win32 --arch=x64`. O comando exato (parâmetros e pasta de saída) não está registrado em script npm no repositório; confirme os parâmetros desejados antes de gerar. (Pendente de confirmação.)
- Alternativamente, o script `npm run build` usa o electron-builder (`electron-builder --win`) e gera o instalador NSIS em `desktop/dist/`.

Fluxo de atualização (quando `ponto.html` da raiz for alterado):

1. Copie o `ponto.html` atualizado da raiz para `desktop/ponto.html`.
2. Rebuild o executável (electron-packager ou `npm run build` com electron-builder).
3. Distribua o novo `.exe`/instalador.

Observação: o `localStorage` da versão desktop é independente do navegador; os dados não são compartilhados entre a versão web e a desktop.

---

## 18. Extensão Firefox (copiar batimento)

Pasta `firefox-extension/`, extensão WebExtension (manifest v3) para copiar o texto da página do ponto.

Arquivos:

- `firefox-extension/manifest.json`: manifesto da extensão.
  - Nome "Copiar Batimento de Ponto", versão 1.1, descrição "Atalho para copiar os batimentos da página do ponto."
  - Permissões: `clipboardWrite` e `activeTab`.
  - Host permissions: `https://spstou.ifractal.com.br/*`.
  - Content script `content.js` aplicado em `https://spstou.ifractal.com.br/procergs/*` com `run_at: document_idle`.
  - Comando `copiar-batimento` com atalho sugerido `Ctrl+Shift+C` (macOS: `Command+Shift+C`) e descrição "Copiar batimento de ponto".
- `firefox-extension/content.js`: script de conteúdo que:
  - Injeta um botão fixo "Copiar batimento" no canto inferior direito da página.
  - Extrai o bloco "Ponto do dia": localiza a linha contendo "ponto do dia" (case-insensitive) e, nas linhas seguintes, coleta a data por extenso (`dd de Mês de yyyy`) e os 4 primeiros horários `HH:MM` (ou `HH:MM:SS`, truncado para `HH:MM`), com limite de 20 linhas por bloco. Se encontrar data + 4 horários, emite a data seguida dos 4 horários e uma linha em branco (separador); caso contrário, usa o texto completo da página como fallback.
  - Copia o resultado para a área de transferência (`navigator.clipboard.writeText`, com fallback para `textarea` + `execCommand("copy")`).
  - Exibe feedback visual "Batimento copiado!" por 1,5 s.
  - Trata o atalho `Ctrl+Shift+C` (`Ctrl`/`Command` + `Shift` + `C`) com `preventDefault`/`stopPropagation` e dispara a cópia.

Instalação temporária (Firefox):

1. Abra `about:debugging#/runtime/this-firefox` no Firefox.
2. Clique em "Carregar extensão temporária..." ("Load Temporary Add-on...").
3. Selecione o arquivo `firefox-extension/manifest.json`.
4. A extensão fica ativa até o Firefox ser fechado (instalação temporária).

Uso:

1. Instale a extensão e abra a página do ponto (`https://spstou.ifractal.com.br/procergs/*`).
2. Pressione `Ctrl+Shift+C` (ou clique no botão "Copiar batimento") para copiar o bloco "Ponto do dia".
3. Cole o texto na área "Colar dados copiados do site" da aplicação e clique em "Importar do texto colado".

---

## 19. Referências no repositório

- `ponto.html` — aplicação.
- `README.md` — resumo da análise e recomendação.
- `docs/analise-ponto.md` — análise da planilha `horarios.ods`, diagnóstico, alternativas e riscos.
- `horarios.ods` — fonte histórica (não normalizada).
- `desktop/` — aplicação desktop (Electron): `main.js`, `package.json`, `ponto.html` (cópia) e executáveis gerados.
- `firefox-extension/` — extensão Firefox para copiar o texto da página do ponto (`manifest.json`, `content.js`).
- `dist/` — executável empacotado (electron-packager).

---

*Documentação gerada a partir da análise do código de `ponto.html` e dos documentos existentes. Itens marcados como pendentes dependem de confirmação do usuário (ex.: normalização do ODS e backtesting).*