/* Kentucky Book Map: draws an illustrated SVG map and pins from books.json. */
(function () {
  "use strict";

  const W = 1000;
  const H = 500;
  const MAX_ZOOM = 9;

  // tier 1 shows always, tier 2 appears once zoomed in. side: label placement.
  const TOWNS = [
    { name: "Louisville", lat: 38.2527, lng: -85.7585, tier: 1, side: "left" },
    { name: "Lexington", lat: 38.0406, lng: -84.5037, tier: 1, side: "below" },
    { name: "Frankfort", lat: 38.2009, lng: -84.8733, tier: 1, capital: true, side: "above" },
    { name: "Bowling Green", lat: 36.9685, lng: -86.4808, tier: 1 },
    { name: "Owensboro", lat: 37.7719, lng: -87.1112, tier: 1, side: "below" },
    { name: "Covington", lat: 39.0837, lng: -84.5086, tier: 1, side: "below" },
    { name: "Paducah", lat: 37.0834, lng: -88.6, tier: 1, side: "below" },
    { name: "Ashland", lat: 38.4784, lng: -82.6379, tier: 1, side: "left" },
    { name: "Pikeville", lat: 37.4793, lng: -82.5188, tier: 1, side: "left" },
    { name: "Hazard", lat: 37.2495, lng: -83.1932, tier: 1, side: "below" },
    { name: "Somerset", lat: 37.092, lng: -84.6041, tier: 1 },
    { name: "Elizabethtown", lat: 37.694, lng: -85.8591, tier: 1, side: "left" },
    { name: "Hopkinsville", lat: 36.8656, lng: -87.4886, tier: 1, side: "above" },
    { name: "Morehead", lat: 38.184, lng: -83.4327, tier: 1, side: "above" },
    { name: "Richmond", lat: 37.7479, lng: -84.2947, tier: 2 },
    { name: "London", lat: 37.129, lng: -84.0833, tier: 2 },
    { name: "Maysville", lat: 38.6412, lng: -83.7444, tier: 2, side: "below" },
    { name: "Bardstown", lat: 37.8092, lng: -85.4669, tier: 2 },
    { name: "Danville", lat: 37.6456, lng: -84.7722, tier: 2, side: "left" },
    { name: "Henderson", lat: 37.8362, lng: -87.59, tier: 2, side: "below" },
    { name: "Madisonville", lat: 37.3281, lng: -87.4989, tier: 2 },
    { name: "Murray", lat: 36.6103, lng: -88.3148, tier: 2, side: "above" },
    { name: "Harlan", lat: 36.8431, lng: -83.3219, tier: 2, side: "below" },
    { name: "Middlesboro", lat: 36.6084, lng: -83.7166, tier: 2, side: "above" },
    { name: "Corbin", lat: 36.9487, lng: -84.0969, tier: 2, side: "left" },
    { name: "Glasgow", lat: 36.9959, lng: -85.9119, tier: 2 },
    { name: "Campbellsville", lat: 37.3434, lng: -85.3419, tier: 2 },
    { name: "Paris", lat: 38.2098, lng: -84.253, tier: 2 },
    { name: "Hindman", lat: 37.3359, lng: -82.9804, tier: 2, side: "above" },
    { name: "Mayfield", lat: 36.7417, lng: -88.6367, tier: 2, side: "below" },
  ];

  const REGIONS = [
    { name: "The Bluegrass", lat: 38.42, lng: -84.42 },
    { name: "Appalachia", lat: 37.52, lng: -83.05, rotate: -28 },
    { name: "Pennyrile", lat: 37.12, lng: -86.05 },
    { name: "Western Coalfield", lat: 37.5, lng: -87.15, size: 0.72 },
    { name: "Jackson Purchase", lat: 36.9, lng: -88.82, size: 0.6, rotate: -90 },
  ];

  const NEIGHBORS = [
    { name: "Indiana", lat: 38.52, lng: -86.45 },
    { name: "Ohio", lat: 38.88, lng: -83.55 },
    { name: "Illinois", lat: 37.48, lng: -88.72 },
    { name: "Tennessee", lat: 36.43, lng: -85.9 },
    { name: "Virginia", lat: 36.88, lng: -82.52, rotate: -32 },
    { name: "W. Va.", lat: 37.98, lng: -82.2, rotate: 62 },
  ];

  // Hand-sketched river courses through known towns, [lng, lat]. Decorative, not surveyed.
  const RIVERS = [
    { name: "Kentucky R.", labelAt: "47%", pts: [[-82.83, 37.12], [-83.19, 37.25], [-83.38, 37.55], [-83.71, 37.57], [-83.97, 37.7], [-84.27, 37.9], [-84.5, 37.85], [-84.72, 37.82], [-84.85, 38.03], [-84.87, 38.2], [-84.87, 38.42], [-85.18, 38.68]] },
    { name: "Licking R.", labelAt: "40%", pts: [[-83.07, 37.75], [-83.26, 37.92], [-83.53, 38.12], [-83.9, 38.38], [-84.33, 38.68], [-84.5, 39.09]] },
    { name: "Green R.", labelAt: "58%", pts: [[-84.7, 37.4], [-84.94, 37.32], [-85.34, 37.25], [-85.5, 37.26], [-85.89, 37.27], [-86.1, 37.19], [-86.27, 37.19], [-86.69, 37.22], [-86.98, 37.27], [-87.26, 37.54], [-87.41, 37.86]] },
    { name: "Cumberland R.", labelAt: "30%", pts: [[-83.32, 36.84], [-83.69, 36.76], [-83.89, 36.87], [-84.16, 36.74], [-84.34, 36.84], [-84.6, 36.99], [-85.15, 36.87], [-85.37, 36.79], [-85.5, 36.6]] },
    { name: "", pts: [[-87.97, 36.62], [-87.95, 36.87], [-88.07, 37.05], [-88.4, 37.14]] },
    { name: "", pts: [[-88.05, 36.5], [-88.15, 36.8], [-88.27, 37.01], [-88.6, 37.09]] },
  ];

  const svg = d3.select("#map");
  const tooltip = document.getElementById("tooltip");
  const card = document.getElementById("card");
  const listEl = document.getElementById("list");
  const filterEl = document.getElementById("filter");
  const mapWrap = document.querySelector(".map-wrap");
  const fmt = new Intl.NumberFormat("en-US");

  let projection, locs, books, byId;
  let k = 1;
  let openKey = null;
  let selectedId = null;
  let zoomLayer, markerLayer, townLayer, townLabelLayer, labelLayer, zoom;
  let ui = 1;

  Promise.all([d3.json("data/kentucky.json"), d3.json("books.json")])
    .then(([geo, data]) => init(geo, data))
    .catch((err) => {
      console.error(err);
      mapWrap.insertAdjacentHTML("beforeend", '<p style="padding:16px">The map data could not be loaded.</p>');
    });

  function init(geo, data) {
    books = data.slice().sort((a, b) => a.rank - b.rank);
    byId = new Map(books.map((b) => [b.id, b]));

    projection = d3.geoConicConformal().parallels([37.1, 38.6]).rotate([85.8, 0])
      .fitExtent([[36, 40], [W - 36, H - 52]], geo.outline);
    const path = d3.geoPath(projection);

    books.forEach((b) => {
      const p = projection([b.lng, b.lat]);
      b.x = p[0];
      b.y = p[1];
      b.key = b.lat + "," + b.lng;
    });
    locs = Array.from(d3.group(books, (b) => b.key), ([key, items]) => ({ key, items, x: items[0].x, y: items[0].y }));

    const defs = svg.append("defs");
    defs.append("clipPath").attr("id", "ky-clip").append("path").attr("d", path(geo.outline));

    zoomLayer = svg.append("g").attr("class", "zoom-layer");
    const base = zoomLayer.append("g");

    // soft engraved-coastline halo around the state
    [16, 10, 5].forEach((w) => base.append("path").attr("class", "halo").attr("d", path(geo.outline)).attr("stroke-width", w));
    base.append("path").attr("class", "land").attr("d", path(geo.outline));
    base.append("path").attr("class", "counties").attr("d", path(geo.countyLines));

    const line = d3.line().curve(d3.curveCatmullRom.alpha(0.5));
    const rivers = base.append("g").attr("clip-path", "url(#ky-clip)");
    RIVERS.forEach((r, i) => {
      const d = line(r.pts.map((p) => projection(p)));
      rivers.append("path").attr("class", "river").attr("d", d);
      if (r.name) {
        const pp = r.pts.map((p) => projection(p));
        if (pp[pp.length - 1][0] < pp[0][0]) pp.reverse();
        defs.append("path").attr("id", "river-" + i).attr("d", line(pp));
        base.append("text").attr("class", "river-label").attr("dy", -3)
          .append("textPath").attr("href", "#river-" + i).attr("startOffset", r.labelAt).text(r.name);
      }
    });

    base.append("path").attr("class", "outline").attr("d", path(geo.outline));

    const placeText = (sel, cls) => sel.attr("class", cls)
      .each((d) => { const p = projection([d.lng, d.lat]); d.x = p[0]; d.y = p[1]; })
      .style("font-size", (d) => (d.size ? d.size + "em" : null))
      .text((d) => d.name);
    labelLayer = base.append("g");
    labelLayer.append("g").selectAll("text").data(NEIGHBORS).join("text").call(placeText, "neighbor");
    labelLayer.append("g").selectAll("text").data(REGIONS).join("text").call(placeText, "region");
    base.append("text").attr("class", "river-label")
      .attr("transform", () => { const p = projection([-86.72, 38.0]); return `translate(${p[0]},${p[1]}) rotate(-8)`; })
      .attr("text-anchor", "middle").text("Ohio River");

    drawCompass(svg.append("g").attr("class", "compass").attr("transform", `translate(${W - 70},${H - 78})`));

    townLayer = zoomLayer.append("g");
    markerLayer = zoomLayer.append("g");
    townLabelLayer = zoomLayer.append("g");
    measure();
    drawTowns();
    drawMarkers();
    window.addEventListener("resize", () => { measure(); rescale(); });

    zoom = d3.zoom().scaleExtent([1, MAX_ZOOM]).translateExtent([[0, 0], [W, H]]).extent([[0, 0], [W, H]])
      .on("zoom", (ev) => {
        k = ev.transform.k;
        zoomLayer.attr("transform", ev.transform);
        svg.classed("zoomed", k >= 1.7);
        rescale();
      });
    svg.call(zoom).on("dblclick.zoom", null);
    svg.on("click", () => { if (openKey) { openKey = null; drawMarkers(); } });

    d3.select("#zoom-in").on("click", () => svg.transition().duration(250).call(zoom.scaleBy, 1.6));
    d3.select("#zoom-out").on("click", () => svg.transition().duration(250).call(zoom.scaleBy, 1 / 1.6));
    d3.select("#zoom-reset").on("click", () => { openKey = null; drawMarkers(); svg.transition().duration(400).call(zoom.transform, d3.zoomIdentity); });

    renderList(books);
    filterEl.addEventListener("input", () => {
      const q = filterEl.value.trim().toLowerCase();
      renderList(q ? books.filter((b) => (b.title + " " + b.author + " " + b.setting).toLowerCase().includes(q)) : books);
    });
    document.addEventListener("keydown", (ev) => { if (ev.key === "Escape") { closeCard(); if (openKey) { openKey = null; drawMarkers(); } } });
  }

  function drawCompass(g) {
    g.append("circle").attr("r", 20);
    g.append("path").attr("d", "M0,-30 L5,0 L0,30 L-5,0 Z");
    g.append("path").attr("d", "M-22,0 L0,-4 L22,0 L0,4 Z").attr("opacity", 0.55);
    g.append("text").attr("y", -35).text("N");
  }

  // On narrow screens the whole SVG shrinks, so enlarge pins and names to stay legible and tappable.
  function measure() {
    const w = svg.node().getBoundingClientRect().width || W;
    ui = Math.min(1.9, Math.max(1, (W / w) * 0.62));
  }

  function drawTowns() {
    const cls = (d) => "town t" + d.tier + (d.capital ? " capital" : "");
    TOWNS.forEach((d) => {
      const p = projection([d.lng, d.lat]);
      d.x = p[0];
      d.y = p[1];
      d.hasPin = locs.some((l) => Math.hypot(l.x - d.x, l.y - d.y) < 6);
    });
    townLayer.selectAll("g").data(TOWNS).join("g").attr("class", cls).each(function (d) {
      const el = d3.select(this);
      if (d.capital) el.append("path").attr("d", d3.symbol(d3.symbolStar, 46)()).attr("fill", "#2b2118");
      else el.append("rect").attr("x", -2).attr("y", -2).attr("width", 4).attr("height", 4);
    });
    townLabelLayer.selectAll("g").data(TOWNS).join("g").attr("class", cls).each(function (d) {
      const gap = d.hasPin ? 9 : 0; // clear the pin sitting on this town
      const t = d3.select(this).append("text").text(d.name);
      if (d.side === "left") t.attr("x", -7 - gap).attr("y", 4).attr("text-anchor", "end");
      else if (d.side === "above") t.attr("y", -8 - gap).attr("text-anchor", "middle");
      else if (d.side === "below") t.attr("y", 15 + gap).attr("text-anchor", "middle");
      else t.attr("x", 7 + gap).attr("y", 4);
    });
    rescale();
  }

  // Keep pins and town names a constant size on screen while the map scales under them.
  function rescale() {
    const s = ui / k;
    const at = (d) => `translate(${d.x},${d.y}) scale(${s})`;
    townLayer.selectAll("g.town").attr("transform", at);
    townLabelLayer.selectAll("g.town").attr("transform", at);
    markerLayer.selectAll("g.loc").attr("transform", at);
    const soft = Math.pow(k, -0.65); // region names grow a little with zoom, not fully
    labelLayer.selectAll("text").attr("transform", (d) => `translate(${d.x},${d.y}) rotate(${d.rotate || 0}) scale(${soft})`);
    zoomLayer.selectAll(".river-label").style("font-size", (9 * Math.pow(k, -0.6)).toFixed(2) + "px");
  }

  function drawMarkers() {
    const sel = markerLayer.selectAll("g.loc").data(locs, (d) => d.key).join("g").attr("class", "loc");
    sel.each(function (d) {
      const g = d3.select(this);
      g.selectAll("*").remove();
      if (d.items.length === 1) return addPin(g, d.items[0], 0, 0);
      if (d.key !== openKey) return addCluster(g, d);
      const n = d.items.length;
      const r = Math.max(30, n * 6.5);
      g.append("circle").attr("class", "fan-bg").attr("r", r + 15);
      const pts = d.items.map((b, i) => {
        const a = (i / n) * 2 * Math.PI - Math.PI / 2;
        return [b, Math.cos(a) * r, Math.sin(a) * r];
      });
      pts.forEach(([, x, y]) => g.append("line").attr("class", "spoke").attr("x2", x).attr("y2", y));
      g.append("circle").attr("class", "hub").attr("r", 2.5);
      pts.forEach(([b, x, y]) => addPin(g, b, x, y));
    });
    sel.filter((d) => d.key === openKey).raise();
    rescale();
  }

  function activate(node, fn) {
    node.attr("tabindex", 0).attr("role", "button")
      .on("click", (ev) => { ev.stopPropagation(); fn(); })
      .on("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); fn(); } });
  }

  function addPin(g, b, x, y) {
    const p = g.append("g").attr("class", "pin-g" + (b.id === selectedId ? " selected" : ""))
      .attr("transform", `translate(${x},${y})`).attr("aria-label", `${b.title} by ${b.author}`);
    p.append("circle").attr("class", "pin-hit").attr("r", 13);
    p.append("circle").attr("class", "ring").attr("r", 10.5);
    p.append("circle").attr("class", "pin " + (b.locationPrecision === "exact" ? "exact" : "approx")).attr("r", 6.5);
    activate(p, () => select(b.id, false));
    hover(p, `${b.title} · ${b.author}`);
  }

  function addCluster(g, d) {
    const c = g.append("g").attr("class", "cluster-g").attr("aria-label", `${d.items.length} books here`);
    c.append("circle").attr("class", "cluster").attr("r", 11);
    c.append("text").attr("class", "cluster-count").attr("y", 4).text(d.items.length);
    activate(c, () => { openKey = d.key; drawMarkers(); });
    hover(c, `${d.items.length} books · ${d.items[0].setting.split(" (")[0]}`);
  }

  function hover(node, text) {
    node.on("pointerenter", (ev) => { if (ev.pointerType === "mouse") showTip(ev, text); })
      .on("pointermove", (ev) => { if (ev.pointerType === "mouse") showTip(ev, text); })
      .on("pointerleave", () => { tooltip.hidden = true; });
  }

  function showTip(ev, text) {
    const box = mapWrap.getBoundingClientRect();
    tooltip.textContent = text;
    tooltip.hidden = false;
    tooltip.style.left = Math.min(Math.max(ev.clientX - box.left, 110), box.width - 110) + "px";
    tooltip.style.top = ev.clientY - box.top + "px";
  }

  function select(id, fromList) {
    const b = byId.get(id);
    if (!b) return;
    selectedId = id;
    const loc = locs.find((l) => l.key === b.key);
    openKey = loc.items.length > 1 ? loc.key : null;
    drawMarkers();
    showCard(b);
    listEl.querySelectorAll("li").forEach((li) => li.classList.toggle("selected", li.dataset.id === id));
    if (fromList) {
      const scale = Math.max(k, 2.6);
      const t = d3.zoomIdentity.translate(W / 2, H / 2).scale(scale).translate(-b.x, -b.y);
      svg.transition().duration(650).call(zoom.transform, t);
      if (window.matchMedia("(max-width: 900px)").matches) mapWrap.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      const li = listEl.querySelector(`li[data-id="${id}"]`);
      if (li && window.matchMedia("(min-width: 901px)").matches) li.scrollIntoView({ block: "nearest" });
    }
  }

  function showCard(b) {
    card.replaceChildren();
    const img = Object.assign(document.createElement("img"), { src: b.cover, alt: `Cover of ${b.title}` });
    const body = document.createElement("div");
    const add = (tag, cls, text) => {
      const el = document.createElement(tag);
      if (cls) el.className = cls;
      el.textContent = text;
      body.appendChild(el);
      return el;
    };
    add("h3", "", b.title);
    add("p", "by", "by " + b.author);
    add("p", "where", "Set in " + b.setting);
    if (b.locationPrecision !== "exact") add("p", "approx-note", "Pin placed approximately.");
    add("p", "meta", `No. ${b.rank} · ${fmt.format(b.goodreadsRatings)} Goodreads ratings`);
    const a = add("a", "gr", "View on Goodreads");
    a.href = b.goodreadsUrl;
    a.target = "_blank";
    a.rel = "noopener";
    const close = Object.assign(document.createElement("button"), { className: "close", type: "button", innerHTML: "&times;" });
    close.setAttribute("aria-label", "Close");
    close.addEventListener("click", closeCard);
    card.append(img, body, close);
    card.hidden = false;
  }

  function closeCard() {
    card.hidden = true;
    selectedId = null;
    listEl.querySelectorAll("li.selected").forEach((li) => li.classList.remove("selected"));
    if (markerLayer) drawMarkers();
  }

  function renderList(items) {
    listEl.replaceChildren();
    if (!items.length) {
      const li = document.createElement("li");
      li.className = "empty";
      li.textContent = "No books match that search.";
      listEl.appendChild(li);
      return;
    }
    const frag = document.createDocumentFragment();
    items.forEach((b) => {
      const li = document.createElement("li");
      li.dataset.id = b.id;
      if (b.id === selectedId) li.classList.add("selected");
      const btn = document.createElement("button");
      btn.type = "button";
      const rank = Object.assign(document.createElement("span"), { className: "rank", textContent: b.rank });
      const img = Object.assign(document.createElement("img"), { src: b.cover, alt: "", loading: "lazy", width: 34, height: 51 });
      const txt = document.createElement("span");
      txt.append(
        Object.assign(document.createElement("span"), { className: "t", textContent: b.title }),
        Object.assign(document.createElement("span"), { className: "a", textContent: b.author })
      );
      btn.append(rank, img, txt);
      btn.addEventListener("click", () => select(b.id, true));
      li.appendChild(btn);
      frag.appendChild(li);
    });
    listEl.appendChild(frag);
  }
})();
