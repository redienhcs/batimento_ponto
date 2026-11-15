(function () {
  "use strict";

  function extrairBlocoPonto() {
    const text = (document.body.innerText || "").replace(/\r/g, "");
    const lines = text.split("\n").map((l) => l.trim()).filter((l) => l !== "");
    const out = [];
    let i = 0;
    while (i < lines.length) {
      if (/ponto do dia/i.test(lines[i])) {
        // procurar data por extenso nas próximas linhas
        let j = i + 1;
        let dataLine = "";
        const times = [];
        // avançar até coletar data + 4 horários
        while (j < lines.length && times.length < 4) {
          const line = lines[j];
          if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(line)) {
            times.push(line.slice(0, 5));
          } else if (/\d{1,2}\s+de\s+[A-Za-zÀ-ÿ]+\s+de\s+\d{4}/i.test(line)) {
            dataLine = line;
          } else if (times.length === 0 && dataLine === "" && /ponto do dia/i.test(line)) {
            // ignore
          } else if (times.length > 0 && !/^\d{1,2}:\d{2}/.test(line) && times.length < 4) {
            // interrompe se aparecer lixo antes de completar
            // mas permite continuar se for data
            if (!/\d{1,2}\s+de\s+[A-Za-zÀ-ÿ]+\s+de\s+\d{4}/i.test(line)) break;
          }
          j++;
          if (j - i > 20) break; // segurança
        }
        if (dataLine && times.length >= 4) {
          out.push(dataLine);
          out.push(...times.slice(0, 4));
          out.push(""); // separador
        }
        i = j;
      } else {
        i++;
      }
    }
    if (out.length) return out.join("\n").trim();
    // fallback: texto completo
    return text.trim();
  }

  async function copiar() {
    const data = extrairBlocoPonto();
    if (!data) { alert("Nenhum dado encontrado."); return; }
    try {
      await navigator.clipboard.writeText(data);
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = data;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try { document.execCommand("copy"); } catch (err) { /* ignore */ }
      document.body.removeChild(ta);
    }
    const msg = document.createElement("div");
    msg.textContent = "Batimento copiado!";
    msg.style.cssText = "position:fixed;bottom:16px;right:16px;z-index:2147483647;padding:10px 14px;background:#16a34a;color:#fff;border-radius:6px;font-weight:600;box-shadow:0 2px 8px rgba(0,0,0,.3);";
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 1500);
  }

  // Botão (type=button + preventDefault) + atalho
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "Copiar batimento";
  btn.style.cssText = "position:fixed;bottom:16px;right:16px;z-index:2147483647;padding:10px 14px;background:#2563eb;color:#fff;border:none;border-radius:6px;font-weight:600;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.3);";
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    copiar();
  }, true);
  document.body.appendChild(btn);

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === "c" || e.key === "C")) {
      e.preventDefault();
      e.stopPropagation();
      copiar();
    }
  }, true);
})();
