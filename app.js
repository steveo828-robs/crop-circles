/* Crop Circles — curated gallery with meanings & anomalies */
(function () {
  "use strict";

  const gallery = document.getElementById("gallery");
  const evidence = document.getElementById("evidence");
  const evidenceGrid = document.getElementById("evidenceGrid");
  const overlay = document.getElementById("overlay");
  const detail = document.getElementById("detail");
  const yearFilter = document.getElementById("yearFilter");
  const meaningFilter = document.getElementById("meaningFilter");
  const anomalyFilter = document.getElementById("anomalyFilter");
  const search = document.getElementById("search");
  const countEl = document.getElementById("count");
  const galleryFilters = document.getElementById("galleryFilters");
  const hotspotsView = document.getElementById("hotspots");
  const hotspotList = document.getElementById("hotspotList");
  const hotspotMapEl = document.getElementById("hotspotMap");
  const mapNote = document.getElementById("mapNote");
  const hotspotsLede = document.getElementById("hotspotsLede");
  const orbCard = document.getElementById("orbCard");
  const claimsView = document.getElementById("claims");
  const claimsBody = document.getElementById("claimsBody");
  const placeChip = document.getElementById("placeChip");
  const placeChipText = document.getElementById("placeChipText");

  let allData = [];
  let hs = { hotspots: [], byItem: new Map(), radiusKm: 2.5 };
  let placeFilterId = null;
  let map = null;
  let currentView = "gallery";

  // Orb footage shown at the top of Evidence. Descriptions are attributed to the sources linked below.
  const ORB_VIDEO = {
    youtubeId: "AcLcnrpxmUg",
    title: "Oliver\u2019s Castle \u201cballs of light\u201d video",
    date: "11 August 1996 \u2014 reported as filmed around first light (about 5 am)",
    location: "Field below Oliver\u2019s Castle hill fort, near Devizes, Wiltshire, UK",
    shows: "Two glowing balls of light circle over a field; as they pass, a six-petalled \u201csnowflake\u201d formation appears within a few seconds, then two more lights follow. (As described by Colin Andrews in 1996, Dan Drasin\u2019s 1996 report and Paul Vigay in Enigma #11.)",
    attribution: "Footage released by a man calling himself \u201cJohn Wheyleigh\u201d (later identified by researcher Colin Andrews as John Wabe) in August 1996; its authenticity has been debated ever since. Widely circulated on YouTube.",
    uploader: "YouTube copy uploaded by MrAstralwalker (\u201cOliver\u2019s Castle Crop Circle \u2013 The Original Footage\u201d)",
    links: [
      ["https://www.youtube.com/watch?v=AcLcnrpxmUg", "Watch on YouTube"],
      ["https://www.youtube.com/watch?v=18a0p_38n7c", "Alternate copy (West Pole)"],
      ["http://www.lucypringle.co.uk/photos/1996/uk1996cv.shtml", "Formation photo \u2014 Lucy Pringle"],
      ["https://www.cropcircleconnector.com/CPRI/flashcolin1.html", "Colin Andrews, 1996 report"],
      ["https://www.cropcircleconnector.com/ilyes/ilyes8.html", "Dan Drasin, 1996 analysis"],
      ["https://www.vigay.com/cropcircles/articles/e011-ocvid.html", "Paul Vigay, Enigma #11"]
    ]
  };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function whenText(item) {
    if (item.datePrecision === "month" && item.date) {
      return item.date.slice(0, 7);
    }
    return item.date || (item.year ? String(item.year) : "Unknown date");
  }

  function placeText(item) {
    const loc = (item.location || "").trim();
    if (!loc || /^unknown/i.test(loc)) return "Place unknown";
    return loc;
  }

  function haystack(item) {
    const m = item.meaning || {};
    const an = (item.anomalies || []).map((a) => [a.claim, a.reportedBy].join(" ")).join(" ");
    return [
      item.id, item.name, item.location, item.country, item.date, item.year,
      m.summary, m.source, an, item.photoCredit, item.featured ? "featured milk hill galaxy" : ""
    ].filter(Boolean).join(" ").toLowerCase();
  }

  function closeDetail() {
    overlay.classList.add("hidden");
    document.body.style.overflow = "";
  }

  function openDetail(item) {
    const imgUrl = item.imageUrl;
    const photo = imgUrl
      ? `<div class="detail-photo-wrap"><img class="detail-photo" src="${esc(imgUrl)}" alt="${esc(item.name || "Formation")}" loading="lazy" onerror="this.parentElement.replaceWith(Object.assign(document.createElement('div'),{className:'detail-miss',textContent:'Photo unavailable'}))" /></div>`
      : `<div class="detail-miss">No photo</div>`;

    let meaningHtml = "";
    if (item.meaning && item.meaning.summary) {
      meaningHtml = `<div class="section">
        <h3>What it represents</h3>
        <p>${esc(item.meaning.summary)}</p>
        ${item.meaning.source || item.meaning.sourceUrl ? `<p class="src">${esc(item.meaning.source || "")}${item.meaning.sourceUrl ? `${item.meaning.source ? " · " : ""}<a href="${esc(item.meaning.sourceUrl)}" target="_blank" rel="noopener">source</a>` : ""}</p>` : ""}
      </div>`;
    }

    let anomalyHtml = "";
    if (item.anomalies && item.anomalies.length) {
      const blocks = item.anomalies.map((a) => {
        const imgs = (a.images || [])
          .map((u) => `<img src="${esc(u)}" alt="Anomaly photo" loading="lazy" />`)
          .join("");
        return `<div class="anomaly-item">
          <p>${esc(a.claim)}</p>
          <p class="src">${esc(a.reportedBy || "")}${a.sourceUrl ? `${a.reportedBy ? " · " : ""}<a href="${esc(a.sourceUrl)}" target="_blank" rel="noopener">source</a>` : ""}</p>
          ${imgs ? `<div class="anomaly-photos">${imgs}</div>` : ""}
        </div>`;
      }).join("");
      anomalyHtml = `<div class="section anomaly"><h3>Strange findings</h3>${blocks}</div>`;
    }

    let extras = "";
    if (item.extraImages && item.extraImages.length) {
      extras = `<div class="section"><h3>More photos</h3><div class="extra-photos">${
        item.extraImages.map((ex) => {
          const u = typeof ex === "string" ? ex : ex.url;
          const c = typeof ex === "object" && ex.credit ? `<div class="src">${esc(ex.credit)}</div>` : "";
          return `<div><img src="${esc(u)}" alt="Extra photo" loading="lazy" />${c}</div>`;
        }).join("")
      }</div></div>`;
    }

    const links = [];
    (item.verificationSources || []).forEach((u) => {
      if (!u) return;
      let label = "Source";
      if (/temporarytemples/i.test(u)) label = "Temporary Temples";
      else if (/cropcircle/i.test(u)) label = "Crop Circle Connector / archive";
      else if (/commons\.wikimedia/i.test(u)) label = "Wikimedia Commons";
      else if (/plus\.maths/i.test(u)) label = "Plus Maths";
      else if (/blt/i.test(u)) label = "BLT Research";
      else if (/lucy|pringle|cropcirclephotographs/i.test(u)) label = "Lucy Pringle";
      else if (/bbc|news/i.test(u)) label = "News";
      links.push([u, label]);
    });
    if (item.imageSourcePage) links.push([item.imageSourcePage, "Image source page"]);
    if (item.kabPostUrl) links.push([item.kabPostUrl, "Kab post"]);
    if (item.videoUrl) links.push([item.videoUrl, "Video"]);
    if (item.meaning && item.meaning.sourceUrl) links.push([item.meaning.sourceUrl, "Meaning source"]);

    const seen = new Set();
    const linkHtml = links
      .filter(([u]) => (seen.has(u) ? false : (seen.add(u), true)))
      .map(([u, label]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(label)}</a>`)
      .join("");

    detail.innerHTML = `
      <div class="detail">
        ${photo}
        <h2 id="detailTitle">${esc(item.name || placeText(item))}</h2>
        <p class="meta">${esc(whenText(item))} · ${esc(placeText(item))}${item.country ? " · " + esc(item.country) : ""}</p>
        ${repeatLine(item)}
        ${meaningHtml}
        ${anomalyHtml}
        ${extras}
        <p class="credit">${esc(item.photoCredit || "")}${item.imageWidth ? `${item.photoCredit ? " · " : ""}${item.imageWidth}×${item.imageHeight}` : ""}</p>
        ${linkHtml ? `<div class="links">${linkHtml}</div>` : ""}
      </div>`;
    overlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  function repeatOf(item) {
    const h = hs.byItem.get(item.id);
    return h && h.count > 1 ? h : null;
  }

  function areaLabel(h) {
    return h.isArea ? `${h.name} area` : h.name;
  }

  function yearsText(h) {
    if (!h.yearFrom) return "";
    return h.yearFrom === h.yearTo ? String(h.yearFrom) : `${h.yearFrom}\u2013${h.yearTo}`;
  }

  function repeatLine(item) {
    const h = repeatOf(item);
    if (!h) return "";
    return `<button type="button" class="repeat-line" data-place="${esc(h.id)}">
      <span class="badge repeat">Repeat site \u00d7${h.count}</span>
      <span>${esc(areaLabel(h))} \u00b7 ${h.count} formations ${esc(yearsText(h))} \u203a</span>
    </button>`;
  }

  function filtered() {
    const y = yearFilter.value;
    const q = (search.value || "").trim().toLowerCase();
    const needM = meaningFilter.checked;
    const needA = anomalyFilter.checked;
    return allData.filter((item) => {
      if (placeFilterId) {
        const h = hs.byItem.get(item.id);
        if (!h || h.id !== placeFilterId) return false;
      }
      if (y !== "all" && String(item.year) !== y) return false;
      if (needM && !(item.meaning && item.meaning.summary)) return false;
      if (needA && !(item.anomalies && item.anomalies.length)) return false;
      if (q && !haystack(item).includes(q)) return false;
      return true;
    });
  }

  function render() {
    const items = filtered();
    countEl.textContent = `${items.length} formation${items.length === 1 ? "" : "s"}`;
    const ph = placeFilterId && hs.hotspots.find((h) => h.id === placeFilterId);
    placeChip.classList.toggle("hidden", !ph || currentView !== "gallery");
    if (ph) placeChipText.textContent = `\ud83d\udccd ${areaLabel(ph)} \u00b7 ${ph.count}`;
    gallery.innerHTML = items.map((item) => {
      const badges = [];
      if (item.featured) badges.push('<span class="badge featured">Featured</span>');
      if (item.meaning && item.meaning.summary) badges.push('<span class="badge meaning">Meaning</span>');
      if (item.anomalies && item.anomalies.length) badges.push('<span class="badge anomaly">Strange findings</span>');
      const rep = repeatOf(item);
      if (rep) badges.push(`<span class="badge repeat">Repeat site \u00d7${rep.count}</span>`);
      return `<article class="card${item.featured ? " featured" : ""}" tabindex="0" data-id="${esc(item.id)}">
        <div class="card-photo"><img src="${esc(item.imageUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.opacity=0.2" /></div>
        <div class="card-body">
          <h2>${esc(item.name || placeText(item))}</h2>
          <p class="card-meta">${esc(whenText(item))} · ${esc(placeText(item))}</p>
          <div class="badges">${badges.join("")}</div>
        </div>
      </article>`;
    }).join("");
  }

  function renderEvidence() {
    const photos = [
      ["img/anomalies/blt_node_length.jpg", "BLT — node length comparison"],
      ["img/anomalies/blt_plantab1.jpg", "BLT — plant abnormality photo 1"],
      ["img/anomalies/blt_plantab2.jpg", "BLT — plant abnormality photo 2"],
      ["img/anomalies/blt_node_italy.jpg", "BLT — elongated node (Italy sample)"],
    ];
    // also pull anomaly images from Milk Hill entry if present
    const milk = allData.find((d) => d.featured || /milk-hill-galaxy/i.test(d.id));
    if (milk && milk.anomalies) {
      milk.anomalies.forEach((a) => (a.images || []).forEach((u) => {
        if (!photos.some((p) => p[0] === u)) photos.push([u, a.reportedBy || "Anomaly photo"]);
      }));
    }
    evidenceGrid.innerHTML = photos.map(([u, cap]) =>
      `<figure><img src="${esc(u)}" alt="${esc(cap)}" loading="lazy" /><figcaption>${esc(cap)}</figcaption></figure>`
    ).join("");
  }

  function renderOrbCard() {
    if (orbCard.dataset.ready) return;
    const v = ORB_VIDEO;
    const src = `https://www.youtube-nocookie.com/embed/${v.youtubeId}?rel=0&playsinline=1&modestbranding=1`;
    orbCard.innerHTML = `
      <p class="orb-kicker">Orb footage</p>
      <div class="video-wrap">
        <iframe src="${esc(src)}" title="${esc(v.title)}" loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
      </div>
      <h2>${esc(v.title)}</h2>
      <p class="meta">${esc(v.date)}<br />${esc(v.location)}</p>
      <p>${esc(v.shows)}</p>
      <p class="attrib">${esc(v.attribution)}</p>
      <p class="attrib">${esc(v.uploader)}</p>
      <div class="links">${v.links.map(([u, l]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(l)}</a>`).join("")}</div>`;
    orbCard.dataset.ready = "1";
  }

  function srcLinks(keys) {
    const S = window.CC_SOURCES || {};
    return keys.filter((k) => S[k]).map((k) =>
      `<a href="${esc(S[k][1])}" target="_blank" rel="noopener">${esc(S[k][0])}</a>`).join(" \u00b7 ");
  }

  function pointList(items, cls) {
    return `<ul class="cl-points${cls ? " " + cls : ""}">${items.map(([text, ...keys]) =>
      `<li><p>${esc(text)}</p><p class="cl-src">${srcLinks(keys)}</p></li>`).join("")}</ul>`;
  }

  let claimsStep = 1;
  let claimsSeries = "world";

  function renderClaims() {
    if (claimsBody.dataset.ready) return;
    const C = window.CC_CLAIMS;
    if (!C || !C.story) { claimsBody.innerHTML = '<p class="map-off">Claims content unavailable.</p>'; return; }
    const ST = C.story;
    document.getElementById("claimsLede").textContent = ST.intro;
    const uniq = (a) => [...new Set(a)];
    const keysOf = (items) => items.flatMap(([, ...k]) => k);
    const tagC = '<span class="st-tag c">Claimed man-made</span>';
    const tagU = '<span class="st-tag u">Reported unexplained</span>';
    const sub = (title, html) => `<h5 class="st-sub">${esc(title)}</h5>${html}`;
    const srcBlock = (html, keys) => `<details class="st-src"><summary>Sources &amp; more</summary><div class="st-src-body">${html}
        <h5 class="st-sub">All sources</h5><ul class="st-srclist">${uniq(keys).map((k) => `<li>${srcLinks([k])}</li>`).join("")}</ul></div></details>`;
    const ch = (n, d, visual, more, keys) => `
      <article class="st-ch${n === claimsStep ? "" : " hidden"}" data-ch="${n}" aria-labelledby="st-h${n}">
        <p class="st-count">Step ${n} of 6</p>
        <h3 id="st-h${n}">${esc(d.head)}</h3>
        <p class="st-take">${esc(d.take)}</p>
        ${visual}
        ${srcBlock(more, keys)}
        <div class="st-nav">
          ${n > 1 ? `<button type="button" class="st-btn ghost" data-step="${n - 1}">\u2190 Back</button>` : "<span></span>"}
          ${n < 6 ? `<button type="button" class="st-btn" data-step="${n + 1}">Next \u2192</button>` : `<button type="button" class="st-btn ghost" data-step="1">Start again</button>`}
        </div>
      </article>`;

    /* 1 */
    const D = C.claimants;
    const c1 = ST.ch1;
    const v1 = `<div class="st-stack">${c1.people.map((p) => `
        <div class="st-panel c">${tagC}<h4>${esc(p.name)}</h4><p>${esc(p.line)}</p></div>`).join("")}</div>`;
    const G = C.gallery;
    const m1 = sub("Doug & Dave", pointList(D[0].points.slice(0, 4))) +
      sub("The other side", pointList(D[0].counter, "counter")) +
      sub("Circlemakers", pointList(D[1].points.slice(0, 3))) +
      sub("Other claims", pointList(D[2].points.slice(0, 2))) +
      (G ? sub("Formations people said they made", `<ul class="st-links">${G.items.map((g) => `<li><b>${esc(g.title)}</b> (${esc(g.date)}) \u2014 ${esc(g.who)}. ${g.link ? `<a href="${esc(g.link)}" target="_blank" rel="noopener">${esc(g.linkLabel)} \u2197</a>` : srcLinks(g.src)}</li>`).join("")}</ul><p class="st-p">${esc(G.noPhotoNote)}</p>`) : "");
    const k1 = c1.people.flatMap((p) => p.src).concat(keysOf(D[0].points.slice(0, 4)), keysOf(D[0].counter), keysOf(D[1].points.slice(0, 3)), keysOf(D[2].points.slice(0, 2)), G ? G.items.flatMap((g) => g.src) : []);

    /* 2 */
    const c2 = ST.ch2;
    const mh = allData.find((d) => d.id === c2.photoId);
    const v2 = `<div class="st-pair">
        <div class="st-half">${tagC}<div class="st-ring" aria-hidden="true"><span></span></div>
          <h4>${esc(c2.ring.title)}</h4><p>${esc(c2.ring.quote)}</p></div>
        <div class="st-half">${tagU}${mh ? `<button type="button" class="st-photo" data-id="${esc(mh.id)}"><img src="${esc(mh.imageUrl)}" alt="${esc(c2.photoTitle)}" loading="lazy" /></button>` : ""}
          <h4>${esc(c2.photoTitle)}</h4><p>${esc(c2.photoLine)}</p></div>
      </div>`;
    const m2 = sub("More", `<ul class="st-links"><li>Doug & Dave called it “the hallmark basic ring they have done since 1978”. ${srcLinks(["today91"])}</li>
        <li>Photos of Doug & Dave at work: <a href="https://www.smithsonianmag.com/arts-culture/crop-circles-the-art-of-the-hoax-2524283/" target="_blank" rel="noopener">Smithsonian \u2197</a></li>
        <li>Milk Hill photo: ${esc(mh ? mh.photoCredit || "" : "")}. Tap it to open the gallery entry.</li></ul>`);
    const k2 = c2.ring.src.concat(c2.photoSrc, ["smithsonian"]);

    /* 3 */
    const c3 = ST.ch3, CP = C.compare, LY = C.lay;
    const v3 = `<figure class="st-fig">${tagU}<img src="${esc(c3.img)}" alt="${esc(c3.caption)}" loading="lazy" /><figcaption>${esc(c3.caption)}</figcaption></figure>
      <p class="st-missing">${tagC}<span>${esc(c3.missing)}</span></p>`;
    const m3 = sub("What BLT Research reports", pointList(CP.plants.slice(0, 3))) +
      sub("The other side", pointList(CP.plantCounter, "counter")) +
      sub("Claimed man-made: where to look", pointList(LY.claimed, "counter"));
    const k3 = keysOf(CP.plants.slice(0, 3)).concat(keysOf(CP.plantCounter), keysOf(LY.claimed), ["blt"]);

    /* 4 */
    const c4 = ST.ch4, T = C.timing;
    const row = (b) => `<li><b>${esc(b.name)} <span class="st-yr">${esc(b.year)}</span></b><em>${esc(b.time)}${/not stated/i.test(b.light) ? "" : ` \u00b7 ${esc(b.light.toLowerCase())}`}</em><small>${srcLinks(b.src.slice(0, 1))}</small></li>`;
    const top = c4.topIds.map((n) => T.builds.find((b) => b.name === n)).filter(Boolean);
    const v4 = `<div class="st-pair stats">
        <div class="st-stat c"><b>${esc(c4.statA.big)}</b><span>${esc(c4.statA.small)}</span></div>
        <div class="st-stat u"><b>${esc(c4.statB.big)}</b><span>${esc(c4.statB.small)}</span></div>
      </div>
      <h4 class="st-listhead">Longest paid builds</h4>
      <ul class="st-rows">${top.map(row).join("")}</ul>
      <details class="st-all"><summary>See all ${T.builds.length} reported build times</summary><ul class="st-rows">${T.builds.map(row).join("")}</ul></details>`;
    const julia = T.rows[0], milk = T.rows[1];
    const m4 = sub("Julia Set, 1996", pointList(julia.build.concat(julia.window))) +
      sub("Milk Hill, 2001", pointList(milk.build.concat(milk.window))) +
      `<p class="st-p">${esc(T.note)}</p>`;
    const k4 = c4.statA.src.concat(c4.statB.src, T.builds.flatMap((b) => b.src), keysOf(julia.build.concat(julia.window, milk.build, milk.window)));

    /* 5 */
    const c5 = ST.ch5;
    const quote = (q) => `<blockquote class="st-q"><p>${esc(q.q)}</p><cite>${esc(q.who)}</cite></blockquote>`;
    const v5 = `<div class="st-pair">
        <div class="st-half"><span class="st-tag n">No errors</span>${c5.none.map(quote).join("")}</div>
        <div class="st-half"><span class="st-tag n">Errors found</span>${c5.some.map(quote).join("")}</div>
      </div>`;
    const nE = [0, 1, 3].map((i) => C.mistakes.noErrors[i]), yE = [1, 3].map((i) => C.mistakes.errors[i]);
    const m5 = sub("“No errors” — more", pointList(nE)) + sub("Errors — more", pointList(yE, "counter"));
    const k5 = c5.none.concat(c5.some).flatMap((q) => q.src).concat(keysOf(nE), keysOf(yE));

    /* 6 */
    const BY = C.byYear;
    const v6 = `<div class="st-seg" role="group" aria-label="Count">
        ${BY.series.map((sr) => `<button type="button" data-series="${sr.key}" aria-pressed="${sr.key === claimsSeries}">${sr.key === "world" ? "Worldwide" : "England"}</button>`).join("")}
      </div>
      <div class="st-chart" id="stChart"></div>
      <p class="st-readout" id="stReadout"></p>`;
    const m6 = sub("Why counts disagree", `<p class="st-p">${esc(BY.intro)}</p>`) + sub("Other published totals", pointList(BY.points)) + `<p class="st-p">${esc(BY.chartNote.replace(/ The right-hand number.*$/, ""))}</p>`;
    const k6 = BY.series.flatMap((sr) => sr.src).concat(keysOf(BY.points));

    claimsBody.innerHTML = `
      <nav class="st-chips" aria-label="Steps">${[1, 2, 3, 4, 5, 6].map((n) => `<button type="button" data-step="${n}" aria-label="Step ${n}: ${esc(ST["ch" + n].head)}"${n === claimsStep ? ' aria-current="step"' : ""}>${n}</button>`).join("")}</nav>
      ${ch(1, c1, v1, m1, k1)}${ch(2, c2, v2, m2, k2)}${ch(3, c3, v3, m3, k3)}${ch(4, c4, v4, m4, k4)}${ch(5, c5, v5, m5, k5)}${ch(6, ST.ch6, v6, m6, k6)}`;
    claimsBody.dataset.ready = "1";
    drawYearChart();
  }

  function drawYearChart() {
    const BY = window.CC_CLAIMS.byYear;
    const el = document.getElementById("stChart");
    if (!el) return;
    const sr = BY.series.find((s) => s.key === claimsSeries) || BY.series[0];
    const all = BY.series.flatMap((s) => Object.keys(s.data).map(Number));
    const y0 = Math.min(...all), y1 = Math.max(...all);
    const max = Math.max(...Object.values(sr.data));
    let peakY = y0;
    Object.entries(sr.data).forEach(([y, v]) => { if (v === max) peakY = +y; });
    const bars = [];
    for (let y = y0; y <= y1; y++) {
      const v = sr.data[y];
      bars.push(v == null ? `<span class="st-bar none" title="${y}: no sourced figure"></span>`
        : `<button type="button" class="st-bar${y === peakY ? " peak" : ""}" data-y="${y}" data-v="${v}" style="height:${Math.max(2, (v / max) * 100).toFixed(1)}%" aria-label="${y}: ${v}"></button>`);
    }
    const ticks = [];
    for (let y = Math.ceil(y0 / 10) * 10; y <= y1; y += 10) ticks.push(`<span style="left:${(((y - y0) + 0.5) / (y1 - y0 + 1) * 100).toFixed(2)}%">${y}</span>`);
    const last = Math.max(...Object.keys(sr.data).map(Number));
    el.innerHTML = `<div class="st-bars ${sr.key}">${bars.join("")}</div><div class="st-ticks">${ticks.join("")}</div>`;
    const ro = document.getElementById("stReadout");
    ro.dataset.def = `Peak: ${max} in ${peakY} \u00b7 ${last}: ${sr.data[last]}. Tap a bar for its year.`;
    ro.innerHTML = `${esc(ro.dataset.def)}<br><span class="cl-src">${esc(sr.label)} \u00b7 ${srcLinks(sr.src)}</span>`;
  }

  function goStep(n) {
    claimsStep = Math.min(6, Math.max(1, n));
    claimsView.querySelectorAll(".st-ch").forEach((a) => a.classList.toggle("hidden", +a.dataset.ch !== claimsStep));
    claimsView.querySelectorAll(".st-chips button").forEach((b) => {
      if (+b.dataset.step === claimsStep) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
    });
    const lede = document.getElementById("claimsLede");
    const y = lede.getBoundingClientRect().bottom + window.scrollY + 16 - 122;
    window.scrollTo({ top: Math.max(0, y), behavior: "auto" });
  }

  function renderHotspots() {
    const repeats = hs.hotspots.filter((h) => h.count > 1);
    const inRepeats = repeats.reduce((s, h) => s + h.count, 0);
    hotspotsLede.textContent = `${repeats.length} places in this gallery have more than one recorded formation (${inRepeats} of ${allData.length} formations). Nearby named sites within about ${hs.radiusKm} km are grouped as one area. Tap a place to see its formations in the gallery, or a photo to open it.`;
    hotspotList.innerHTML = repeats.map((h, i) => {
      const where = [h.county, h.country].filter(Boolean).join(", ");
      const sub = h.isArea ? `<p class="hs-sub">${h.places.map((p) => `${esc(p.name)} ${p.count}`).join(" \u00b7 ")}</p>` : "";
      const thumbs = h.items.map((it) =>
        `<button type="button" class="hs-thumb" data-id="${esc(it.id)}" aria-label="${esc((it.name || "") + " " + whenText(it))}">
          <img src="${esc(it.imageUrl)}" alt="" loading="lazy" onerror="this.style.opacity=0.2" />
          <span>${esc(it.year || "")}</span>
        </button>`).join("");
      return `<li class="hs-item" id="hs-${esc(h.id)}">
        <button type="button" class="hs-head" data-place="${esc(h.id)}">
          <span class="hs-rank">${i + 1}</span>
          <span class="hs-main">
            <span class="hs-name">${esc(areaLabel(h))}</span>
            <span class="hs-where">${esc(where)}${h.mapped ? "" : " \u00b7 not mapped (no coordinates)"}</span>
          </span>
          <span class="hs-count"><b>${h.count}</b><small>${esc(yearsText(h))}</small></span>
        </button>
        ${sub}
        <div class="hs-strip">${thumbs}</div>
      </li>`;
    }).join("");
    initMap();
  }

  function initMap() {
    const mapped = hs.hotspots.filter((h) => h.coord);
    const nMappedItems = allData.filter((d) => typeof d.latitude === "number").length;
    mapNote.textContent = `Pins show the ${nMappedItems} formations that have recorded coordinates (approximate). Circle size = number of formations. Many of the busiest sites lie within a few miles of each other in Wiltshire, around Avebury and Silbury Hill, and Milk Hill / Alton Barnes; Stonehenge lies about 25 km further south.`;
    if (map) { setTimeout(() => map.invalidateSize(), 50); return; }
    if (typeof L === "undefined") {
      hotspotMapEl.innerHTML = '<p class="map-off">Map unavailable offline.</p>';
      return;
    }
    map = L.map(hotspotMapEl, { scrollWheelZoom: false, attributionControl: true, zoomControl: true });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      className: "dark-tiles",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
    }).addTo(map);
    const layer = L.featureGroup().addTo(map);
    mapped.slice().sort((a, b) => a.count - b.count).forEach((h) => {
      const repeat = h.count > 1;
      L.circleMarker([h.coord.lat, h.coord.lon], {
        radius: 5 + 4 * Math.sqrt(h.count),
        color: repeat ? "#c4a574" : "#8b96a8",
        weight: repeat ? 2 : 1,
        fillColor: repeat ? "#c4a574" : "#8b96a8",
        fillOpacity: repeat ? 0.35 : 0.2
      }).bindPopup(
        `<b>${esc(areaLabel(h))}</b><br>${h.count} formation${h.count === 1 ? "" : "s"} ${esc(yearsText(h))}` +
        `<br><button type="button" class="popup-show" data-place="${esc(h.id)}">Show in gallery \u203a</button>`
      ).addTo(layer);
    });
    const focus = mapped.filter((h) => h.count > 1 && /United Kingdom/.test(h.country || "United Kingdom"));
    const pts = (focus.length ? focus : mapped).map((h) => [h.coord.lat, h.coord.lon]);
    if (pts.length) map.fitBounds(pts, { padding: [24, 24], maxZoom: 11 });
    else map.setView([51.4, -1.85], 9);
  }

  function filterToPlace(id) {
    placeFilterId = id;
    yearFilter.value = "all";
    meaningFilter.checked = false;
    anomalyFilter.checked = false;
    search.value = "";
    closeDetail();
    showView("gallery");
    render();
    window.scrollTo(0, 0);
  }

  function showView(name) {
    currentView = name;
    document.querySelectorAll(".nav-link").forEach((a) => {
      a.classList.toggle("active", a.dataset.view === name);
    });
    const isG = name === "gallery";
    gallery.classList.toggle("hidden", !isG);
    gallery.style.display = isG ? "" : "none";
    galleryFilters.style.display = isG ? "" : "none";
    evidence.classList.toggle("hidden", name !== "evidence");
    hotspotsView.classList.toggle("hidden", name !== "hotspots");
    claimsView.classList.toggle("hidden", name !== "claims");
    if (name === "claims") renderClaims();
    const ph = placeFilterId && hs.hotspots.find((h) => h.id === placeFilterId);
    placeChip.classList.toggle("hidden", !(isG && ph));
    if (name === "evidence") { renderOrbCard(); renderEvidence(); }
    if (name === "hotspots") renderHotspots();
    if (history.replaceState) history.replaceState(null, "", "#" + name);
  }

  claimsView.addEventListener("click", (e) => {
    const st = e.target.closest("[data-step]");
    if (st) { goStep(+st.dataset.step); return; }
    const se = e.target.closest("[data-series]");
    if (se) {
      claimsSeries = se.dataset.series;
      claimsView.querySelectorAll("[data-series]").forEach((b) => b.setAttribute("aria-pressed", String(b === se)));
      drawYearChart();
      return;
    }
    const bar = e.target.closest(".st-bar[data-y]");
    if (bar) {
      claimsView.querySelectorAll(".st-bar.sel").forEach((b) => b.classList.remove("sel"));
      bar.classList.add("sel");
      const ro = document.getElementById("stReadout");
      ro.firstChild.textContent = `${bar.dataset.y}: ${bar.dataset.v} reported (${claimsSeries === "world" ? "worldwide" : "England"}).`;
      return;
    }
    const t = e.target.closest(".st-photo");
    if (t) {
      const item = allData.find((d) => d.id === t.dataset.id);
      if (item) openDetail(item);
    }
  });

  hotspotList.addEventListener("click", (e) => {
    const t = e.target.closest(".hs-thumb");
    if (t) {
      const item = allData.find((d) => d.id === t.dataset.id);
      if (item) openDetail(item);
      return;
    }
    const head = e.target.closest(".hs-head");
    if (head) filterToPlace(head.dataset.place);
  });
  hotspotMapEl.addEventListener("click", (e) => {
    const b = e.target.closest(".popup-show");
    if (b) filterToPlace(b.dataset.place);
  });
  detail.addEventListener("click", (e) => {
    const b = e.target.closest(".repeat-line");
    if (b) filterToPlace(b.dataset.place);
  });
  document.getElementById("placeChipClear").addEventListener("click", () => {
    placeFilterId = null;
    render();
  });

  gallery.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    const item = allData.find((d) => d.id === card.dataset.id);
    if (item) openDetail(item);
  });
  gallery.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest(".card");
    if (!card) return;
    e.preventDefault();
    const item = allData.find((d) => d.id === card.dataset.id);
    if (item) openDetail(item);
  });

  document.getElementById("closeDetail").addEventListener("click", closeDetail);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeDetail(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDetail(); });

  yearFilter.addEventListener("change", render);
  meaningFilter.addEventListener("change", render);
  anomalyFilter.addEventListener("change", render);
  search.addEventListener("input", render);

  document.querySelectorAll(".nav-link").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      showView(a.dataset.view);
    });
  });

  fetch("crop-circles.json")
    .then((r) => r.json())
    .then((data) => {
      allData = Array.isArray(data) ? data : [];
      if (window.CCHotspots) hs = window.CCHotspots.build(allData);
      // featured first already in JSON; stable sort
      allData.sort((a, b) => {
        if (!!b.featured - !!a.featured) return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        return String(a.date || "").localeCompare(String(b.date || ""));
      });
      const years = [...new Set(allData.map((d) => d.year).filter(Boolean))].sort((a, b) => b - a);
      years.forEach((y) => {
        const opt = document.createElement("option");
        opt.value = String(y);
        opt.textContent = String(y);
        yearFilter.appendChild(opt);
      });
      render();
      if (location.hash === "#evidence") showView("evidence");
      else if (location.hash === "#hotspots") showView("hotspots");
      else if (location.hash === "#claims") showView("claims");
    })
    .catch((err) => {
      gallery.innerHTML = `<p style="padding:1rem;color:#f0a0a0">Failed to load dataset: ${esc(err.message)}</p>`;
    });
})();
