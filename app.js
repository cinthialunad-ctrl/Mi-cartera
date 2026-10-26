/* Mi Cartera — lógica de la app. Todo se guarda en este celular (localStorage). */
(function () {
  "use strict";

  // ---------- Datos ----------
  const CLAVE = "mi-cartera-v1";
  const VACIO = { ops: [], cash: { ars: 0, usd: 0 }, ccl: null, precios: {}, hist: [], moneda: "usd" };
  let D = cargar();

  function cargar() {
    try {
      const raw = localStorage.getItem(CLAVE);
      if (raw) return Object.assign({}, VACIO, JSON.parse(raw));
    } catch (e) {}
    return JSON.parse(JSON.stringify(VACIO));
  }
  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(D)); }
    catch (e) { aviso("No se pudo guardar en el celular. Revisá el espacio libre."); }
  }

  const NOMBRES = { SPY: "S&P 500", QQQ: "Nasdaq 100", DIA: "Dow Jones", IWM: "Russell 2000", EEM: "Mercados emergentes",
    AAPL: "Apple", MSFT: "Microsoft", NVDA: "Nvidia", GOOGL: "Google (Alphabet)", AMZN: "Amazon", META: "Meta", TSLA: "Tesla",
    KO: "Coca-Cola", MELI: "Mercado Libre", GGAL: "Grupo Galicia", YPF: "YPF", VIST: "Vista Energy", PAMP: "Pampa Energía",
    BRKB: "Berkshire Hathaway", BMA: "Banco Macro", GLD: "Oro", XLE: "Energía EE.UU.", NFLX: "Netflix", DIS: "Disney" };
  const nombre = t => NOMBRES[t] || t;

  // ---------- Utilidades ----------
  const $ = id => document.getElementById(id);
  const num = v => { const x = parseFloat(String(v ?? "").replace(/\./g, "").replace(",", ".")); return isFinite(x) ? x : 0; };
  // Acepta "13,04", "13.04", "1.553,74" y "1.553" (punto como separador de miles).
  const numIn = v => {
    const s = String(v ?? "").trim().replace(/\s|\$|US/g, "");
    if (/^\d{1,3}(\.\d{3})+$/.test(s)) return parseFloat(s.replace(/\./g, ""));
    if (/^\d+(\.\d+)?$/.test(s)) return parseFloat(s);
    return num(s);
  };
  const hoy = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const fecha = (s, corta) => { if (!s) return ""; const [y, m, d] = s.slice(0, 10).split("-").map(Number); return corta ? `${d} ${MESES[m - 1]}` : `${d} ${MESES[m - 1]} ${y}`; };
  const dias = s => s ? Math.round((new Date(hoy()) - new Date(s.slice(0, 10))) / 864e5) : Infinity;
  function plata(v, cur, dec) {
    if (v == null || !isFinite(v)) return "—";
    const d = dec ?? 2;
    const s = Math.abs(v).toLocaleString("es-AR", { minimumFractionDigits: d, maximumFractionDigits: d });
    return (v < 0 ? "-" : "") + (cur === "ars" ? "$ " : "US$ ") + s;
  }
  const pct = v => !isFinite(v) ? "—" : (v >= 0 ? "+" : "") + v.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%";
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  let toastT;
  function aviso(m) { const t = $("toast"); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 2800); }

  // ---------- Cálculos ----------
  function calcular() {
    const ccl = D.ccl ? D.ccl.valor : 0;
    const by = {};
    let realUsd = 0, realArs = 0, divUsd = 0;
    const ops = [...D.ops].sort((a, b) => (a.fecha || "").localeCompare(b.fecha || "") || (a.creado || 0) - (b.creado || 0));
    for (const o of ops) {
      const t = o.ticker;
      const h = by[t] || (by[t] = { ticker: t, qty: 0, costUsd: 0, costArs: 0 });
      const q = +o.cantidad || 0, p = +o.precioUsd || 0, oc = +o.ccl || ccl || 0;
      if (o.tipo === "compra" || o.tipo === "inicial") { h.qty += q; h.costUsd += q * p; h.costArs += q * p * oc; }
      else if (o.tipo === "venta" && h.qty > 0) {
        const qq = Math.min(q, h.qty), au = h.costUsd / h.qty, aa = h.costArs / h.qty;
        realUsd += qq * (p - au); realArs += qq * p * oc - qq * aa;
        h.costUsd -= qq * au; h.costArs -= qq * aa; h.qty -= qq;
      } else if (o.tipo === "dividendo") { realUsd += +o.monto || 0; realArs += (+o.monto || 0) * oc; divUsd += +o.monto || 0; }
    }
    const pos = Object.values(by).filter(h => h.qty > 1e-9).map(h => {
      const pr = D.precios[h.ticker];
      const price = pr ? pr.usd : h.costUsd / h.qty;
      const vUsd = h.qty * price, vArs = vUsd * ccl;
      return Object.assign(h, { price, conPrecio: !!pr, precioFecha: pr && pr.fecha, precioAuto: !!(pr && pr.auto), vUsd, vArs,
        avgUsd: h.costUsd / h.qty, avgArs: h.costArs / h.qty, plUsd: vUsd - h.costUsd, plArs: vArs - h.costArs });
    }).sort((a, b) => b.vUsd - a.vUsd);
    const invUsd = pos.reduce((s, h) => s + h.vUsd, 0);
    const costoUsd = pos.reduce((s, h) => s + h.costUsd, 0);
    const costoArs = pos.reduce((s, h) => s + h.costArs, 0);
    const efUsd = (D.cash.usd || 0) + (ccl ? (D.cash.ars || 0) / ccl : 0);
    const totUsd = invUsd + efUsd;
    return { ccl, pos, invUsd, invArs: invUsd * ccl, costoUsd, costoArs, efUsd, totUsd, totArs: totUsd * ccl,
      plUsd: invUsd - costoUsd, plArs: invUsd * ccl - costoArs, realUsd, realArs, divUsd };
  }

  // ---------- Dólar CCL ----------
  async function traerCCL(manual) {
    const btn = $("btn-ccl"); if (manual && btn) { btn.disabled = true; btn.textContent = "Buscando…"; }
    try {
      const r = await fetch("https://dolarapi.com/v1/dolares/contadoconliqui", { cache: "no-store" });
      if (!r.ok) throw new Error("http " + r.status);
      const j = await r.json();
      const v = +(j.venta || j.compra);
      if (!v) throw new Error("sin dato");
      D.ccl = { valor: v, fecha: hoy(), cuando: Date.now(), auto: true };
      guardar(); render();
      if (manual) aviso("Dólar CCL actualizado");
    } catch (e) {
      if (manual) aviso("No pude traer el dólar. Revisá tu conexión o cargalo a mano en Actualizar precios.");
    } finally { if (btn) { btn.disabled = false; btn.textContent = "Actualizar"; } }
  }

  // ---------- Precios automáticos (precios.json lo genera GitHub 3 veces por día hábil) ----------
  const fechaLocal = ms => { const d = new Date(ms); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  let ultimoIntento = 0;
  async function traerPreciosAuto() {
    if (Date.now() - ultimoIntento < 10 * 60 * 1000) return;
    ultimoIntento = Date.now();
    try {
      const r = await fetch("precios.json?t=" + Date.now(), { cache: "no-store" });
      if (!r.ok) return;
      const j = await r.json();
      const cuando = Date.parse(j.actualizado) || 0;
      if (!cuando || !j.cedears) return;
      const ccl = +j.ccl || (D.ccl && D.ccl.valor) || 0;
      let cambio = false;
      for (const t of new Set(D.ops.map(o => o.ticker))) {
        const p = j.cedears[t]; if (!p) continue;
        let usd = +p.usd;
        if (!(usd > 0) && +p.ars > 0 && ccl) usd = p.ars / ccl;
        if (!(usd > 0)) continue;
        const prev = D.precios[t];
        const prevCuando = prev ? (prev.cuando || Date.parse(prev.fecha) || 0) : 0;
        if (prevCuando >= cuando) continue;
        D.precios[t] = { usd, fecha: fechaLocal(cuando), cuando, auto: true };
        cambio = true;
      }
      if (!D.ccl && ccl > 0) { D.ccl = { valor: ccl, fecha: fechaLocal(cuando), cuando, auto: true }; cambio = true; }
      if (!D.autoPrecios || D.autoPrecios.cuando !== cuando) { D.autoPrecios = { cuando }; cambio = true; }
      if (cambio) { guardar(); render(); }
    } catch (e) {}
  }

  // ---------- Historial (un punto por día) ----------
  function guardarPunto(c) {
    if (!c.pos.length && !c.efUsd) return;
    if (!c.ccl) return;
    const p = { fecha: hoy(), usd: +c.totUsd.toFixed(2), ars: +c.totArs.toFixed(2) };
    const i = D.hist.findIndex(h => h.fecha === p.fecha);
    if (i >= 0) { if (D.hist[i].usd === p.usd && D.hist[i].ars === p.ars) return; D.hist[i] = p; } else D.hist.push(p);
    D.hist.sort((a, b) => a.fecha.localeCompare(b.fecha));
    if (D.hist.length > 1500) D.hist = D.hist.slice(-1500);
    guardar();
  }

  // ---------- Render ----------
  function render() {
    const c = calcular(), cur = D.moneda, A = cur === "ars";
    const tieneAlgo = D.ops.length > 0 || D.cash.ars > 0 || D.cash.usd > 0;
    $("bienvenida").hidden = tieneAlgo;
    $("resumen").hidden = !tieneAlgo;
    document.querySelectorAll("[data-cur]").forEach(b => b.setAttribute("aria-pressed", b.dataset.cur === cur));

    if (tieneAlgo) {
      guardarPunto(c);
      $("total").textContent = c.ccl || !A ? plata(A ? c.totArs : c.totUsd, cur) : "Falta el dólar";
      const pl = A ? c.plArs : c.plUsd, base = A ? c.costoArs : c.costoUsd;
      if (c.pos.length) {
        const gana = pl >= 0;
        $("resultado").innerHTML = `<span class="badge">${gana ? "▲" : "▼"} ${esc(plata(Math.abs(pl), cur))} (${esc(pct(base ? pl / base * 100 : NaN))})</span>
          <button class="term" type="button" data-term="no-realizada">${gana ? "Vas ganando" : "Vas perdiendo"} · ¿qué es?</button>`;
        $("explicacion").textContent = `Pusiste ${plata(base, cur)} en inversiones y hoy valen ${plata(A ? c.invArs : c.invUsd, cur)}.` +
          (A ? " En pesos también cuenta lo que subió el dólar." : "");
      } else {
        $("resultado").innerHTML = "";
        $("explicacion").textContent = "Por ahora tenés solo efectivo. Cuando cargues una inversión vas a ver si ganás o perdés.";
      }

      // aviso de precios viejos
      const viejos = c.pos.filter(h => !h.conPrecio || dias(h.precioFecha) >= 4);
      if (viejos.length) {
        const sinPrecio = viejos.some(h => !h.conPrecio);
        $("aviso-texto").textContent = sinPrecio ? "Cargá el precio de hoy para ver cuánto vale tu cartera." :
          `Tus precios son del ${fecha(viejos[0].precioFecha, true)}. Actualizalos para ver el valor real.`;
        $("aviso-precios").hidden = false;
      } else $("aviso-precios").hidden = true;

      grafico(A);
      repartir(c);
      $("ccl-valor").textContent = c.ccl ? plata(c.ccl, "ars") : "Sin dato";
      $("ccl-fecha").textContent = D.ccl ? `${D.ccl.auto ? "Traído de internet" : "Cargado a mano"} el ${fecha(D.ccl.fecha)}. Se usa para pasar tus dólares a pesos.` :
        "Tocá Actualizar para traerlo de internet.";
      tip();
    }
    renderInversiones(c);
  }

  function grafico(A) {
    const svg = $("grafico");
    const pts = D.hist.map(h => ({ f: h.fecha, v: A ? h.ars : h.usd })).filter(p => p.v > 0);
    const ok = pts.length >= 2;
    svg.style.display = ok ? "block" : "none"; $("grafico-vacio").hidden = ok;
    $("rango").textContent = pts.length ? (ok ? `${fecha(pts[0].f, true)} – ${fecha(pts[pts.length - 1].f, true)}` : `Desde ${fecha(pts[0].f, true)}`) : "";
    svg.innerHTML = "";
    if (!ok) return;
    const W = 320, H = 130, vs = pts.map(p => p.v);
    const mn = Math.min(...vs), mx = Math.max(...vs), pad = (mx - mn) * 0.15 || mx * 0.02;
    const lo = mn - pad, hi = mx + pad;
    const x = i => 4 + i * (W - 8) / (pts.length - 1), y = v => H - 6 - (v - lo) / (hi - lo) * (H - 14);
    const d = pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join("");
    const subio = vs[vs.length - 1] >= vs[0];
    const col = subio ? "var(--up)" : "var(--down)";
    svg.innerHTML =
      [0.3, 0.6].map(f => `<line x1="0" x2="${W}" y1="${H * f}" y2="${H * f}" style="stroke:var(--line)" stroke-width="1" vector-effect="non-scaling-stroke"/>`).join("") +
      `<path d="${d}L${x(pts.length - 1)},${H}L${x(0)},${H}Z" style="fill:${col};fill-opacity:.12;stroke:none"/>` +
      `<path d="${d}" style="fill:none;stroke:${col}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;
  }

  function repartir(c) {
    const cols = ["var(--accent)", "#8E6CC9", "#D08A2E", "#3AA39A", "#C25A86", "#6B8A2B"];
    const partes = c.pos.map((h, i) => ({ k: `${nombre(h.ticker)} (${h.ticker})`, v: h.vUsd, col: cols[i % cols.length] }));
    if (c.efUsd > 0) partes.push({ k: "Efectivo", v: c.efUsd, col: "var(--peso)" });
    const tot = partes.reduce((s, p) => s + p.v, 0) || 1;
    $("alloc").innerHTML = partes.map(p => `<span style="width:${(p.v / tot * 100).toFixed(2)}%;background:${p.col}"></span>`).join("");
    $("legend").innerHTML = partes.map(p => `<li><i style="background:${p.col}"></i><span>${esc(p.k)}</span><span class="pct num">${(p.v / tot * 100).toLocaleString("es-AR", { maximumFractionDigits: 0 })}%</span></li>`).join("");
  }

  let tipIdx = null;
  function tip() {
    const G = window.GLOSARIO || [];
    if (!G.length) return;
    if (tipIdx == null) { const d = new Date(); tipIdx = (d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate()) % G.length; }
    const g = G[tipIdx];
    $("tip").innerHTML = `<span class="eyebrow">Aprendé algo hoy</span><h2>${esc(g.titulo)}</h2><p>${esc(g.resumen)}</p>
      <button class="link" type="button" data-term="${g.id}" style="align-self:flex-start">Leer más</button>`;
  }

  function renderInversiones(c) {
    const cur = D.moneda, A = cur === "ars";
    const ep = $("estado-precios");
    if (ep) ep.textContent = D.autoPrecios && D.autoPrecios.cuando ?
      `Precios actualizados solos el ${fecha(fechaLocal(D.autoPrecios.cuando))} a las ${new Date(D.autoPrecios.cuando).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false })}.` :
      "Los precios se van a actualizar solos en días hábiles.";
    const P = $("posiciones");
    P.innerHTML = c.pos.length ? c.pos.map(h => {
      const pl = A ? h.plArs : h.plUsd, base = A ? h.costArs : h.costUsd;
      return `<button class="pos" type="button" data-pos="${esc(h.ticker)}">
        <span class="logo">${esc(h.ticker.slice(0, 4))}</span>
        <span class="name">${esc(nombre(h.ticker))}</span><span class="val num">${esc(plata(A ? h.vArs : h.vUsd, cur))}</span>
        <span class="sub num">${esc(fmtCant(h.qty))} ${esc(h.ticker)}${h.conPrecio ? "" : " · falta precio"}</span>
        <span class="pl num ${pl >= 0 ? "up" : "down"}">${pl >= 0 ? "▲" : "▼"} ${esc(pct(base ? pl / base * 100 : NaN))}</span>
      </button>`;
    }).join("") : `<div class="empty">Todavía no cargaste inversiones. Tocá <b>Registrar movimiento</b> y elegí “Ya lo tenía” para sumar lo que tenés en Cocos.</div>`;

    $("efectivo").innerHTML = `<div class="kv"><span>Pesos</span><b class="num">${esc(plata(D.cash.ars || 0, "ars"))}</b></div>
      <div class="kv"><span>Dólares</span><b class="num">${esc(plata(D.cash.usd || 0, "usd"))}</b></div>`;

    const M = $("movimientos");
    const ops = [...D.ops].sort((a, b) => (b.fecha || "").localeCompare(a.fecha || "") || (b.creado || 0) - (a.creado || 0));
    const QUE = { compra: "Compraste", venta: "Vendiste", dividendo: "Cobraste dividendo", inicial: "Ya lo tenías" };
    M.innerHTML = ops.length ? ops.map(o => {
      const usd = o.tipo === "dividendo" ? +o.monto : o.cantidad * o.precioUsd;
      const v = A ? usd * (o.ccl || c.ccl) : usd;
      const det = o.tipo === "dividendo" ? `${o.ticker} · ${fecha(o.fecha)}` :
        `${fmtCant(o.cantidad)} ${o.ticker} a ${plata(o.precioUsd, "usd")} · ${fecha(o.fecha)}`;
      return `<div class="mov"><span class="what">${QUE[o.tipo] || o.tipo}</span><span class="amt num ${o.tipo === "venta" || o.tipo === "dividendo" ? "up" : ""}">${esc(plata(v, cur))}</span>
        <span class="sub num">${esc(det)}</span><button class="del" type="button" data-borrar="${esc(o.id)}">Borrar</button></div>`;
    }).join("") : `<div class="empty">Acá vas a ver cada compra, venta o dividendo que cargues.</div>`;
  }
  const fmtCant = q => (+q).toLocaleString("es-AR", { maximumFractionDigits: 4 });

  // ---------- Hojas (formularios que suben desde abajo) ----------
  let alCerrar = null;
  function abrir(html, onMount) {
    $("sheet-in").innerHTML = html;
    $("scrim").hidden = false; $("sheet").hidden = false; $("sheet").scrollTop = 0;
    if (onMount) onMount($("sheet-in"));
  }
  function cerrar() { $("scrim").hidden = true; $("sheet").hidden = true; $("sheet-in").innerHTML = ""; if (alCerrar) { alCerrar(); alCerrar = null; } }
  $("scrim").addEventListener("click", cerrar);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("sheet").hidden) cerrar(); });

  function toggles(root) {
    root.querySelectorAll("[data-group]").forEach(b => b.addEventListener("click", () => {
      root.querySelectorAll(`[data-group="${b.dataset.group}"]`).forEach(x => x.setAttribute("aria-pressed", x === b));
      root.dispatchEvent(new CustomEvent("toggle", { detail: { group: b.dataset.group, value: b.dataset.value } }));
    }));
  }
  const elegido = (root, g) => { const b = root.querySelector(`[data-group="${g}"][aria-pressed="true"]`); return b ? b.dataset.value : null; };

  function hojaTermino(id) {
    const g = (window.GLOSARIO || []).find(x => x.id === id);
    if (!g) return;
    abrir(`<h2>${esc(g.titulo)}</h2><p class="muted">${esc(g.resumen)}</p><p>${esc(g.texto)}</p>
      <button class="btn primary" type="button" data-preguntar-sobre="${g.id}">Preguntarle más a Claude</button>
      <button class="btn" type="button" data-cerrar>Entendido</button>`);
  }

  function hojaMovimiento(tipoInicial) {
    const c = calcular();
    const tickers = [...new Set([...c.pos.map(h => h.ticker), "SPY", "QQQ", "AAPL", "MSFT", "NVDA", "MELI", "GGAL", "YPF"])];
    abrir(`<h2>Registrar movimiento</h2>
      <div class="field"><span>¿Qué hiciste?</span>
        <div class="choice">
          <button type="button" data-group="tipo" data-value="compra">Compré</button>
          <button type="button" data-group="tipo" data-value="venta">Vendí</button>
          <button type="button" data-group="tipo" data-value="dividendo">Cobré dividendo</button>
          <button type="button" data-group="tipo" data-value="inicial">Ya lo tenía</button>
        </div>
        <span class="hint" id="m-ayuda"></span>
      </div>
      <label class="field"><span>¿Qué inversión? (el código, ej: SPY)</span>
        <input id="m-ticker" list="m-list" autocapitalize="characters" autocomplete="off" placeholder="SPY">
        <datalist id="m-list">${tickers.map(t => `<option value="${t}">${esc(nombre(t))}</option>`).join("")}</datalist></label>
      <div id="m-bloque-cant">
        <div class="grid2">
          <label class="field"><span>Cantidad</span><input id="m-cant" type="text" inputmode="decimal" placeholder="Ej: 9"></label>
          <label class="field"><span id="m-precio-label">Precio de cada uno</span><input id="m-precio" type="text" inputmode="decimal" placeholder="Ej: 13,04"></label>
        </div>
        <div class="field" style="margin-top:12px"><span>El precio lo cargo en</span>
          <div class="choice"><button type="button" data-group="mon" data-value="usd" aria-pressed="true">Dólares (US$)</button><button type="button" data-group="mon" data-value="ars" aria-pressed="false">Pesos ($)</button></div>
          <span class="hint">En Cocos podés ver el precio en las dos monedas con el botón de la bandera.</span>
        </div>
      </div>
      <label class="field" id="m-bloque-monto" hidden><span>¿Cuánto cobraste? (en US$)</span><input id="m-monto" type="text" inputmode="decimal" placeholder="Ej: 0,85"></label>
      <div class="grid2">
        <label class="field"><span>Fecha</span><input id="m-fecha" type="date" value="${hoy()}"></label>
        <label class="field"><span>Dólar CCL ese día</span><input id="m-ccl" type="text" inputmode="decimal" value="${c.ccl ? String(c.ccl).replace(".", ",") : ""}"></label>
      </div>
      <p class="hint muted small">Si no sabés el dólar de ese día, dejá el de hoy. Solo cambia un poco la ganancia en pesos.</p>
      <div class="actions"><button class="btn" type="button" data-cerrar>Cancelar</button><button class="btn primary" type="button" id="m-guardar">Guardar</button></div>`,
      root => {
        toggles(root);
        const AYUDA = {
          compra: "Una compra nueva que hiciste en Cocos.",
          venta: "Vendiste parte o todo. La app calcula cuánto ganaste.",
          dividendo: "Plata que te pagó la inversión. Aparece en Actividad de Cocos.",
          inicial: "Para cargar lo que ya tenías: usá la cantidad y el precio promedio que muestra Cocos."
        };
        const set = t => {
          root.querySelectorAll('[data-group="tipo"]').forEach(x => x.setAttribute("aria-pressed", x.dataset.value === t));
          $("m-ayuda").textContent = AYUDA[t];
          $("m-bloque-cant").hidden = t === "dividendo"; $("m-bloque-monto").hidden = t !== "dividendo";
          $("m-precio-label").textContent = t === "inicial" ? "Precio promedio" : t === "venta" ? "Precio de venta (cada uno)" : "Precio de cada uno";
        };
        set(tipoInicial || "compra");
        root.addEventListener("toggle", e => { if (e.detail.group === "tipo") set(e.detail.value); });
        $("m-guardar").addEventListener("click", () => {
          const tipo = elegido(root, "tipo"), ticker = $("m-ticker").value.trim().toUpperCase().replace(/\s+/g, "");
          const ccl = numIn($("m-ccl").value), f = $("m-fecha").value || hoy();
          if (!ticker) return aviso("Escribí el código de la inversión, por ejemplo SPY.");
          const op = { id: "op" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), tipo, ticker, fecha: f, ccl, creado: Date.now() };
          if (tipo === "dividendo") {
            op.monto = numIn($("m-monto").value);
            if (!(op.monto > 0)) return aviso("Escribí cuánto cobraste.");
          } else {
            op.cantidad = numIn($("m-cant").value);
            let p = numIn($("m-precio").value);
            if (!(op.cantidad > 0)) return aviso("Escribí la cantidad.");
            if (!(p > 0)) return aviso("Escribí el precio.");
            if (elegido(root, "mon") === "ars") { if (!(ccl > 0)) return aviso("Para precios en pesos necesito el dólar CCL de ese día."); p = p / ccl; }
            op.precioUsd = p;
            if (tipo === "venta") {
              const h = calcular().pos.find(x => x.ticker === ticker);
              if (!h || op.cantidad > h.qty + 1e-9) return aviso(`No tenés ${fmtCant(op.cantidad)} ${ticker} para vender.`);
            }
          }
          if (!(ccl > 0) && tipo !== "inicial" && !D.ccl) return aviso("Cargá el dólar CCL de ese día.");
          D.ops.push(op);
          if ((tipo === "compra" || tipo === "inicial") && !D.precios[ticker]) D.precios[ticker] = { usd: op.precioUsd, fecha: f };
          if (!D.ccl && ccl > 0) D.ccl = { valor: ccl, fecha: f, cuando: Date.now(), auto: false };
          guardar(); cerrar(); render();
          aviso(tipo === "inicial" ? "¡Listo! Ya está en tu cartera." : "Movimiento guardado");
        });
      });
  }

  function hojaPrecios() {
    const c = calcular();
    if (!c.pos.length) { aviso("Primero cargá una inversión."); return; }
    abrir(`<h2>Actualizar precios</h2>
      <p class="muted">Los precios se actualizan solos los días hábiles. Usá esto solo si querés cargar uno a mano: abrí la inversión en Cocos y copiá el <b>Último precio</b>.</p>
      <div class="field"><span>Los cargo en</span>
        <div class="choice"><button type="button" data-group="mon" data-value="usd" aria-pressed="true">Dólares (US$)</button><button type="button" data-group="mon" data-value="ars" aria-pressed="false">Pesos ($)</button></div></div>
      ${c.pos.map(h => `<label class="field"><span>${esc(nombre(h.ticker))} (${esc(h.ticker)})</span>
        <input type="text" inputmode="decimal" data-precio="${esc(h.ticker)}" data-usd="${h.conPrecio ? h.price : ""}" value="${h.conPrecio ? String(+h.price.toFixed(4)).replace(".", ",") : ""}"></label>`).join("")}
      <label class="field"><span>Dólar CCL</span><input id="p-ccl" type="text" inputmode="decimal" value="${c.ccl ? String(c.ccl).replace(".", ",") : ""}">
        <span class="hint">Se trae solo de internet. Cambialo solo si querés usar otro valor.</span></label>
      <div class="actions"><button class="btn" type="button" data-cerrar>Cancelar</button><button class="btn primary" type="button" id="p-guardar">Guardar</button></div>`,
      root => {
        toggles(root);
        root.addEventListener("toggle", e => {
          if (e.detail.group !== "mon") return;
          const ccl = numIn($("p-ccl").value);
          root.querySelectorAll("[data-precio]").forEach(i => {
            const usd = +i.dataset.usd; if (!usd) return;
            i.value = e.detail.value === "ars" ? (ccl ? String(+(usd * ccl).toFixed(2)).replace(".", ",") : "") : String(+usd.toFixed(4)).replace(".", ",");
          });
        });
        $("p-guardar").addEventListener("click", () => {
          const ccl = numIn($("p-ccl").value), ars = elegido(root, "mon") === "ars";
          if (ars && !(ccl > 0)) return aviso("Para precios en pesos necesito el dólar CCL.");
          root.querySelectorAll("[data-precio]").forEach(i => {
            const v = numIn(i.value); if (!(v > 0)) return;
            D.precios[i.dataset.precio] = { usd: ars ? v / ccl : v, fecha: hoy(), cuando: Date.now() };
          });
          if (ccl > 0 && (!D.ccl || Math.abs(ccl - D.ccl.valor) > 0.001)) D.ccl = { valor: ccl, fecha: hoy(), cuando: Date.now(), auto: false };
          guardar(); cerrar(); render(); aviso("Precios actualizados");
        });
      });
  }

  function hojaEfectivo() {
    abrir(`<h2>Efectivo en la cuenta</h2>
      <p class="muted">La plata que tenés en Cocos sin invertir. La ves en Portfolio, en “Dinero”.</p>
      <div class="grid2">
        <label class="field"><span>Pesos ($)</span><input id="e-ars" type="text" inputmode="decimal" value="${D.cash.ars ? String(D.cash.ars).replace(".", ",") : ""}" placeholder="0"></label>
        <label class="field"><span>Dólares (US$)</span><input id="e-usd" type="text" inputmode="decimal" value="${D.cash.usd ? String(D.cash.usd).replace(".", ",") : ""}" placeholder="0"></label>
      </div>
      <div class="actions"><button class="btn" type="button" data-cerrar>Cancelar</button><button class="btn primary" type="button" id="e-guardar">Guardar</button></div>`,
      () => $("e-guardar").addEventListener("click", () => {
        D.cash = { ars: numIn($("e-ars").value), usd: numIn($("e-usd").value) };
        guardar(); cerrar(); render(); aviso("Efectivo actualizado");
        if (!D.ccl) traerCCL(false);
      }));
  }

  function hojaPosicion(t) {
    const c = calcular(), h = c.pos.find(x => x.ticker === t); if (!h) return;
    const cur = D.moneda, A = cur === "ars";
    const pl = A ? h.plArs : h.plUsd, base = A ? h.costArs : h.costUsd;
    const glos = t === "SPY" ? "spy" : "cedear";
    abrir(`<h2>${esc(nombre(t))} <span class="muted">(${esc(t)})</span></h2>
      <div>
        <div class="kv"><span>Tenés</span><b class="num">${esc(fmtCant(h.qty))}</b></div>
        <div class="kv"><span>Pagaste en promedio <button class="term" type="button" data-term="precio-promedio">?</button></span><b class="num">${esc(plata(A ? h.avgArs : h.avgUsd, cur))}</b></div>
        <div class="kv"><span>Vale hoy cada uno</span><b class="num">${esc(plata(A ? h.price * c.ccl : h.price, cur))}</b></div>
        <div class="kv"><span>Pusiste en total</span><b class="num">${esc(plata(base, cur))}</b></div>
        <div class="kv"><span>Vale hoy en total</span><b class="num">${esc(plata(A ? h.vArs : h.vUsd, cur))}</b></div>
        <div class="kv"><span>Resultado</span><b class="num ${pl >= 0 ? "up" : "down"}">${esc(plata(pl, cur))} (${esc(pct(base ? pl / base * 100 : NaN))})</b></div>
      </div>
      <p class="muted">${pl >= 0 ? "Si vendieras todo hoy, ganarías" : "Si vendieras todo hoy, perderías"} aprox. ${esc(plata(Math.abs(pl), cur))}. Mientras no vendas, es una foto del momento.</p>
      ${h.conPrecio ? `<p class="fine">${h.precioAuto ? "Precio actualizado solo" : "Precio cargado a mano"} el ${fecha(h.precioFecha)}.</p>` : `<p class="fine">Falta cargar el precio de hoy: se está usando tu precio promedio.</p>`}
      <button class="btn" type="button" data-term="${glos}">¿Qué es ${t === "SPY" ? "SPY" : "un CEDEAR"}?</button>
      <button class="btn primary" type="button" data-preguntar-ticker="${esc(t)}">Preguntar a Claude sobre ${esc(t)}</button>`);
  }

  function hojaAjustes() {
    abrir(`<h2>Ajustes</h2>
      <button class="btn" type="button" data-action="efectivo">Editar efectivo</button>
      <h2 style="margin-top:6px">Copia de seguridad</h2>
      <p class="muted small">Tus datos están solo en este celular. Si borrás los datos del navegador o cambiás de teléfono, se pierden. Guardá una copia cada tanto.</p>
      <button class="btn" type="button" id="a-exportar">Guardar copia en el celular</button>
      <label class="btn" style="display:block">Recuperar una copia<input type="file" id="a-importar" accept="application/json,.json" hidden></label>
      <h2 style="margin-top:6px">Empezar de cero</h2>
      <button class="btn danger" type="button" id="a-borrar">Borrar todos mis datos</button>
      <button class="btn" type="button" data-cerrar>Cerrar</button>`,
      () => {
        $("a-exportar").addEventListener("click", () => {
          const blob = new Blob([JSON.stringify(D, null, 2)], { type: "application/json" });
          const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `mi-cartera-${hoy()}.json`;
          document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
          aviso("Copia guardada en Descargas");
        });
        $("a-importar").addEventListener("change", e => {
          const f = e.target.files[0]; if (!f) return;
          const r = new FileReader();
          r.onload = () => {
            try { const j = JSON.parse(r.result); if (!Array.isArray(j.ops)) throw 0; D = Object.assign({}, VACIO, j); guardar(); cerrar(); render(); aviso("Copia recuperada"); }
            catch (err) { aviso("Ese archivo no es una copia de Mi Cartera."); }
          };
          r.readAsText(f);
        });
        const b = $("a-borrar");
        b.addEventListener("click", () => {
          if (!b.dataset.armed) { b.dataset.armed = "1"; b.textContent = "Tocá de nuevo para borrar todo"; setTimeout(() => { delete b.dataset.armed; b.textContent = "Borrar todos mis datos"; }, 4000); return; }
          D = JSON.parse(JSON.stringify(VACIO)); guardar(); cerrar(); render(); aviso("Datos borrados");
        });
      });
  }

  // ---------- Aprender ----------
  function renderGlosario(filtro) {
    const q = (filtro || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const G = (window.GLOSARIO || []).filter(g => !q || norm(g.titulo + " " + g.resumen + " " + g.texto).includes(q));
    $("glosario").innerHTML = G.length ? G.map(g => `<details class="gl" id="gl-${g.id}"><summary><b>${esc(g.titulo)}</b><span>${esc(g.resumen)}</span></summary>
      <div class="body"><p>${esc(g.texto)}</p><button class="link" type="button" data-preguntar-sobre="${g.id}" style="align-self:flex-start">Preguntarle más a Claude →</button></div></details>`).join("")
      : `<div class="empty">No encontré nada con “${esc(filtro)}”. Probá preguntárselo a Claude en la pestaña Preguntar.</div>`;
  }
  $("buscar").addEventListener("input", e => renderGlosario(e.target.value));

  // ---------- Preguntar a Claude ----------
  const SUGERENCIAS = [
    "¿Está bien tener toda mi plata en un solo fondo?",
    "Si el SPY baja mucho, ¿qué hago?",
    "¿Conviene comprar todos los meses un poco?",
    "¿Qué diferencia hay entre dólar MEP y CCL?",
    "¿Qué hago con los pesos que tengo sin invertir?",
    "¿Cómo leo la pantalla de mi inversión en Cocos?"
  ];
  $("sugerencias").innerHTML = SUGERENCIAS.map(s => `<button class="chip" type="button">${esc(s)}</button>`).join("");
  $("sugerencias").addEventListener("click", e => { const b = e.target.closest(".chip"); if (b) { $("pregunta").value = b.textContent; $("pregunta").focus(); } });

  function contextoCartera() {
    const c = calcular();
    const lineas = c.pos.map(h => `- ${fmtCant(h.qty)} ${h.ticker} (${nombre(h.ticker)}), precio promedio ${plata(h.avgUsd, "usd")}, hoy ${plata(h.price, "usd")} (${pct(h.costUsd ? h.plUsd / h.costUsd * 100 : NaN)})`);
    if (D.cash.ars) lineas.push(`- Efectivo en pesos: ${plata(D.cash.ars, "ars")}`);
    if (D.cash.usd) lineas.push(`- Efectivo en dólares: ${plata(D.cash.usd, "usd")}`);
    if (c.ccl) lineas.push(`- Dólar CCL: ${plata(c.ccl, "ars")}`);
    return lineas.length ? `\n\nMi cartera hoy (valor total aprox. ${plata(c.totUsd, "usd")}):\n${lineas.join("\n")}` : "";
  }
  function preguntar(texto, conCartera) {
    const prompt = `Soy principiante en inversiones, vivo en Argentina y uso el bróker Cocos. Explicame en lenguaje simple, sin tecnicismos, como si fueras un amigo que sabe de finanzas.${conCartera ? contextoCartera() : ""}\n\nMi pregunta: ${texto}`;
    try { navigator.clipboard && navigator.clipboard.writeText(prompt).catch(() => {}); } catch (e) {}
    const url = "https://claude.ai/new?q=" + encodeURIComponent(prompt);
    const a = document.createElement("a"); a.href = url; a.target = "_blank"; a.rel = "noopener";
    document.body.appendChild(a); a.click(); a.remove();
  }
  $("btn-preguntar").addEventListener("click", () => {
    const t = $("pregunta").value.trim();
    if (!t) { aviso("Escribí tu pregunta o elegí una de las sugeridas."); $("pregunta").focus(); return; }
    preguntar(t, $("con-cartera").checked);
  });

  // ---------- Navegación y clicks ----------
  function ir(tab) {
    document.querySelectorAll(".view").forEach(v => v.hidden = v.dataset.view !== tab);
    document.querySelectorAll("[data-tab]").forEach(b => { if (b.dataset.tab === tab) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
    window.scrollTo(0, 0);
    try { sessionStorage.setItem("tab", tab); } catch (e) {}
  }
  document.querySelectorAll("[data-tab]").forEach(b => b.addEventListener("click", () => ir(b.dataset.tab)));

  document.addEventListener("click", e => {
    const el = e.target.closest("button,[data-term]"); if (!el) return;
    if (el.dataset.cur) { D.moneda = el.dataset.cur; guardar(); render(); return; }
    if (el.dataset.term) { hojaTermino(el.dataset.term); return; }
    if (el.hasAttribute("data-cerrar")) { cerrar(); return; }
    if (el.dataset.pos) { hojaPosicion(el.dataset.pos); return; }
    if (el.dataset.preguntarSobre) {
      const g = (window.GLOSARIO || []).find(x => x.id === el.dataset.preguntarSobre);
      cerrar(); ir("preguntar");
      $("pregunta").value = g ? `Leí que "${g.titulo}" es: ${g.resumen} ¿Me lo explicás mejor con un ejemplo de mi caso?` : "";
      return;
    }
    if (el.dataset.preguntarTicker) {
      const t = el.dataset.preguntarTicker; cerrar(); ir("preguntar");
      $("pregunta").value = `¿Qué es ${t} (${nombre(t)}), cómo viene últimamente y qué riesgos tiene para alguien como yo?`;
      return;
    }
    if (el.dataset.borrar) {
      if (!el.classList.contains("armed")) { el.classList.add("armed"); el.textContent = "¿Seguro? Tocá de nuevo"; setTimeout(() => { el.classList.remove("armed"); el.textContent = "Borrar"; }, 3500); return; }
      D.ops = D.ops.filter(o => o.id !== el.dataset.borrar); guardar(); render(); aviso("Movimiento borrado"); return;
    }
    const act = el.dataset.action;
    if (act === "primera") { hojaMovimiento("inicial"); }
    else if (act === "movimiento") { hojaMovimiento("compra"); }
    else if (act === "precios") { hojaPrecios(); }
    else if (act === "efectivo") { hojaEfectivo(); }
  });
  $("btn-ajustes").addEventListener("click", hojaAjustes);
  $("btn-ccl").addEventListener("click", () => traerCCL(true));

  // ---------- Arranque ----------
  render();
  renderGlosario("");
  let tab = "inicio"; try { tab = sessionStorage.getItem("tab") || "inicio"; } catch (e) {}
  ir(tab);
  if (!D.ccl || Date.now() - (D.ccl.cuando || 0) > 60 * 60 * 1000) traerCCL(false);
  traerPreciosAuto();
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return;
    if (D.ccl && Date.now() - (D.ccl.cuando || 0) > 60 * 60 * 1000) traerCCL(false);
    traerPreciosAuto();
  });

  if ("serviceWorker" in navigator && location.protocol === "https:") {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }

  // para pruebas
  window.__miCartera = { calcular, get datos() { return D; } };
})();
