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

  function renderClaims() {
    if (claimsBody.dataset.ready) return;
    const C = window.CC_CLAIMS;
    if (!C) { claimsBody.innerHTML = '<p class="map-off">Claims content unavailable.</p>'; return; }
    const P = C.plain || {};
    document.getElementById("claimsLede").textContent = P.lede || C.lede;

    const uniq = (a) => [...new Set(a)];
    const keysOf = (items) => uniq(items.flatMap(([, ...k]) => k));
    const tagC = '<span class="tag tag-claimed">Claimed man-made</span>';
    const tagU = '<span class="tag tag-unexpl">Reported unexplained</span>';
    const more = (label, html) => html ? `<details class="cl-more"><summary>${esc(label)}</summary><div class="cl-more-body">${html}</div></details>` : "";
    const sources = (keys) => keys.length ? more(`Sources (${keys.length})`, `<ul class="cl-srclist">${uniq(keys).map((k) => `<li>${srcLinks([k])}</li>`).join("")}</ul>`) : "";
    const card = (o) => `<article class="cl-card${o.cls ? " " + o.cls : ""}"${o.id ? ` id="${o.id}"` : ""}>
        ${o.tag || ""}<h4>${esc(o.title)}</h4>
        ${o.take ? `<p class="cl-take">${esc(o.take)}</p>` : ""}
        ${o.body || ""}
        ${o.more || ""}
        ${sources(o.src || [])}
      </article>`;

    /* 1 · Who */
    const who = C.claimants.map((c) => card({
      title: c.title, take: (P.cards || {})[c.title],
      body: `<p class="cl-sub">${esc(c.sub)}</p>`,
      more: more("More detail", pointList(c.points)) +
            (c.counter && c.counter.length ? more("The other side", pointList(c.counter, "counter")) : "") +
            (c.note ? `<p class="cl-note">${esc(c.note)}</p>` : "") +
            (c.links ? `<div class="links">${c.links.map(([l, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(l)} \u2197</a>`).join("")}</div>` : ""),
      src: keysOf(c.points.concat(c.counter || [])).concat(c.noteSrc || [])
    })).join("");

    const BY = C.byYear;
    let byYear = "";
    if (BY) {
      const years = new Set();
      BY.series.forEach((sr) => Object.keys(sr.data).forEach((y) => years.add(+y)));
      const ys = [...years].sort((a, b) => a - b);
      const max = Math.max(...BY.series.flatMap((sr) => Object.values(sr.data)));
      const ours = {};
      allData.forEach((d) => { if (d.year) ours[d.year] = (ours[d.year] || 0) + 1; });
      const bars = ys.map((y) => `<li><span class="by-y">${y}</span><span class="by-bars">${BY.series.map((sr) => {
          const v = sr.data[y];
          return v == null ? `<span class="by-row ${sr.key} gap"><em>\u2014</em></span>`
            : `<span class="by-row ${sr.key}"><i style="width:${Math.max(1.5, (v / max) * 85).toFixed(1)}%"></i><em>${v}</em></span>`;
        }).join("")}</span><span class="by-ours">${ours[y] || ""}</span></li>`).join("");
      byYear = card({
        id: "cl-years", title: "How many were found each year?", take: P.years,
        body: `<div class="by-legend">${BY.series.map((sr) => `<span class="${sr.key}"><i></i><span>${esc(sr.label)}</span></span>`).join("")}<span class="ours"><b>#</b><span>In this app’s gallery</span></span></div>
          <ul class="by-chart">${bars}</ul>`,
        more: more("Why the counts disagree", `<p class="cl-p">${esc(BY.intro)}</p><p class="cl-p">${esc(BY.chartNote)}</p>`) +
              more("Other published totals", pointList(BY.points)),
        src: BY.series.flatMap((sr) => sr.src).concat(keysOf(BY.points))
      });
    }

    const G = C.gallery;
    const gal = G ? card({
      title: "Formations people said they made", take: P.gallery,
      body: `<div class="cl-gallery">${G.items.map((g) => `
        <div class="cl-gtile">
          ${g.img ? `<img src="${esc(g.img)}" alt="${esc(g.imgAlt || g.title)}" loading="lazy" /><span class="cl-gkind">${esc(g.imgKind || "")}</span>`
                  : `<a class="cl-gph" href="${esc(g.link)}" target="_blank" rel="noopener"><span>No licensed photo</span><b>See photos \u2197</b><small>${esc(g.linkLabel)}</small></a>`}
          ${tagC}
          <span class="cl-tile-t">${esc(g.title)}</span>
          <span class="cl-tile-d">${esc(g.date)} \u00b7 ${esc(g.where)}</span>
          <span class="cl-tile-d">By: ${esc(g.who)}</span>
          <span class="cl-src">${srcLinks(g.src)}${g.imgCredit ? " \u00b7 " + srcLinks(g.imgCredit) : ""}</span>
        </div>`).join("")}</div>`,
      more: `<p class="cl-note">${esc(G.noPhotoNote)}</p>`,
      src: G.items.flatMap((g) => g.src.concat(g.imgCredit || []))
    }) : "";

    /* 2 · Compare */
    const tiles = C.compare.tiles.map((t) => {
      if (t.kind === "photo") {
        const it = allData.find((d) => d.id === t.id);
        if (!it) return "";
        return `<button type="button" class="cl-tile photo" data-id="${esc(it.id)}">
          <img src="${esc(it.imageUrl)}" alt="${esc(t.title)}" loading="lazy" />
          <span class="cl-tile-t">${esc(t.title)}</span>
          <span class="cl-tile-d">${esc(t.text)}</span>
        </button>`;
      }
      return `<div class="cl-tile text">
        <span class="cl-tile-big">\u25ef</span>
        ${tagC}
        <span class="cl-tile-t">${esc(t.title)}</span>
        <span class="cl-tile-d">${esc(t.text)}</span>
        <span class="cl-src">${srcLinks(t.src)}${t.link ? ` \u00b7 <a href="${esc(t.link)}" target="_blank" rel="noopener">${esc(t.linkLabel)} \u2197</a>` : ""}</span>
      </div>`;
    }).join("");
    const tilesCard = card({ title: "Then and now", take: P.tiles, body: `<div class="cl-tiles">${tiles}</div><p class="cl-hint">Tap a photo to open it.</p>`, src: ["today91", "smithsonian"] });

    const plants = card({
      title: "Bent or broken stalks?", take: P.plants,
      body: C.compare.image ? `<figure class="cl-fig big">${tagU}<img src="${esc(C.compare.image.url)}" alt="${esc(C.compare.image.caption)}" loading="lazy" /><figcaption>${esc(C.compare.image.caption)}</figcaption></figure>` : "",
      more: more("What the researchers report", pointList(C.compare.plants)) + more("The other side", pointList(C.compare.plantCounter, "counter")),
      src: keysOf(C.compare.plants.concat(C.compare.plantCounter))
    });

    const LY = C.lay;
    const lay = LY ? card({
      title: "Up close: the flattened crop", take: P.lay,
      body: `<div class="cl-lay">
          <div class="cl-lay-col claimed">${tagC}
            <div class="cl-lay-ph"><span>No licensed close-up found</span><small>See the links below</small></div>
          </div>
          <div class="cl-lay-col reported">${tagU}
            <figure class="cl-fig"><img src="${esc(LY.reported[0].img)}" alt="${esc(LY.reported[0].text)}" loading="lazy" />
              <figcaption>${esc(LY.reported[0].label)}: ${esc(LY.reported[0].text)}</figcaption></figure>
          </div>
        </div>`,
      more: more("Claimed man-made: where to see it", `<p class="cl-p">${esc(LY.claimedNote)}</p>${pointList(LY.claimed, "counter")}`) +
            more("Reported unexplained: more photos", LY.reported.slice(1).map((r) => `<figure class="cl-fig big"><img src="${esc(r.img)}" alt="${esc(r.text)}" loading="lazy" /><figcaption>${esc(r.label)}: ${esc(r.text)} <span class="cl-src">${srcLinks(r.src)}</span></figcaption></figure>`).join("")) +
            (LY.counterNote ? more("The other side", pointList([LY.counterNote], "counter")) : ""),
      src: keysOf(LY.claimed).concat(LY.reported.flatMap((r) => r.src)).concat(LY.counterNote ? LY.counterNote.slice(1) : [])
    }) : "";

    /* 3 · Time */
    const T = C.timing;
    const buildLi = (b) => `
      <li class="cl-build${/day/i.test(b.time) && !/window|under/i.test(b.time) ? " multi" : ""}">
        <div class="cl-build-top"><b>${esc(b.name)}</b><span class="cl-build-time">${esc(b.time)}</span></div>
        <p class="cl-build-meta">${esc(b.year)} \u00b7 ${esc(b.light)} \u00b7 team: ${esc(b.team)}</p>
        ${more("Details", `<p class="cl-p">${esc(b.where)} \u00b7 size: ${esc(b.size)}</p><p class="cl-p">${esc(b.note)}</p><p class="cl-src">${srcLinks(b.src)}</p>`)}
      </li>`;
    const stat = (s, cls) => `<div class="cl-stat ${cls}"><b>${esc(s.big)}</b><span>${esc(s.small)}</span></div>`;
    const lead = card({
      cls: "cl-lead", title: "Time to build vs time available", take: P.time,
      body: `<div class="cl-stats">${stat(P.statA, "a")}${stat(P.statB, "b")}</div>
        <div class="cl-vs">
          <a href="#cl-builds" data-jump="cl-builds"><b>Paid builds \u2193</b><span>${T.builds.length} reported times</span></a>
          <a href="#cl-windows" data-jump="cl-windows"><b>Overnight ones \u2193</b><span>${T.rows.length} unclaimed formations</span></a>
        </div>`,
      more: more("Read the summary", `<p class="cl-p">${esc(T.lead.text)}</p>`),
      src: uniq(T.lead.src.concat(P.statA.src, P.statB.src))
    });
    const builds = card({
      id: "cl-builds", tag: tagC, title: "Paid builds: how long the makers said", take: "Longest first. Gold edge = more than one day.",
      body: `<ul class="cl-builds">${T.builds.slice(0, 6).map(buildLi).join("")}</ul>
        ${more(`Show all ${T.builds.length}`, `<ul class="cl-builds">${T.builds.slice(6).map(buildLi).join("")}</ul>`)}`,
      more: `<p class="cl-note">${esc(T.note)}</p>`,
      src: T.builds.flatMap((b) => b.src)
    });
    const rows = T.rows.map((r) => {
      const w = (P.windows || {})[r.name] || ["", ""];
      return card({
        cls: "cl-time", title: r.name, take: r.date,
        body: `<div class="cl-pair">
            <div class="cl-pair-a">${/^Claimed/.test(w[0]) ? tagC : '<span class="tag tag-none">No claim</span>'}<p>${esc(w[0])}</p></div>
            <div class="cl-pair-b">${tagU}<p>${esc(w[1])}</p></div>
          </div>`,
        more: more("Build time — details", pointList(r.build)) + more("The window — details", pointList(r.window)),
        src: keysOf(r.build.concat(r.window))
      });
    }).join("");

    /* 4 · Mistakes */
    const mNo = card({ title: "“No mistakes”", take: P.noErrors, more: more("Who says so", pointList(C.mistakes.noErrors)), src: keysOf(C.mistakes.noErrors) });
    const mYes = card({ title: "Reported mistakes", take: P.errors, more: more("Examples", pointList(C.mistakes.errors, "counter")), src: keysOf(C.mistakes.errors) });

    const H = P.heads || {};
    claimsBody.innerHTML = `
      <section class="cl-sec" id="cl-who"><h3>1 \u00b7 ${esc(H.who || "Who claimed")}</h3>${who}${gal}${byYear}</section>
      <section class="cl-sec" id="cl-compare"><h3>2 \u00b7 ${esc(H.compare || "Simple vs complex")}</h3>${tilesCard}${plants}${lay}</section>
      <section class="cl-sec" id="cl-time"><h3>3 \u00b7 ${esc(H.time || "Time vs window")}</h3>${lead}${builds}
        <div id="cl-windows" class="cl-anchor"></div>${rows}</section>
      <section class="cl-sec" id="cl-mistakes"><h3>4 \u00b7 ${esc(H.mistakes || "Mistakes?")}</h3>${mNo}${mYes}</section>`;
    claimsBody.dataset.ready = "1";
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
    const j = e.target.closest("[data-jump]");
    if (j) {
      e.preventDefault();
      const el = document.getElementById(j.dataset.jump);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const t = e.target.closest(".cl-tile.photo");
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
