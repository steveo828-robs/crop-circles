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
  const quartzFilter = document.getElementById("quartzFilter");
  const ufoView = document.getElementById("ufo");
  const whyHere = document.getElementById("whyHere");
  const ufoBody = document.getElementById("ufoBody");
  const evBody = document.getElementById("evBody");
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
      <span class="rl-k">Repeat site \u00b7 ${h.count}</span>
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
      if (quartzFilter.checked && !quartzTag.has(item.id)) return false;
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
      if (item.featured) badges.push("Featured");
      if (item.meaning && item.meaning.summary) badges.push("Meaning");
      if (item.anomalies && item.anomalies.length) badges.push("Strange findings");
      const rep = repeatOf(item);
      if (rep) badges.push(`Repeat site \u00b7 ${rep.count}`);
      if (quartzTag.has(item.id)) badges.push("Near quartz");
      return `<article class="card${item.featured ? " featured" : ""}" tabindex="0" data-id="${esc(item.id)}">
        <div class="card-photo"><img src="${esc(item.imageUrl)}" alt="${esc(item.name || "")}" loading="lazy" referrerpolicy="no-referrer"${item.imageWidth ? ` width="${item.imageWidth}" height="${item.imageHeight}"` : ""} onerror="this.style.opacity=0.2" /></div>
        <div class="card-body">
          <h2>${esc(item.name || placeText(item))}</h2>
          <p class="card-meta">${esc(whenText(item))} · ${esc(placeText(item))}</p>
          ${badges.length ? `<p class="tags">${esc(badges.join(" \u00b7 "))}</p>` : ""}
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

  let claimsSeries = "world";
  let slideIdx = 0;
  let slideCount = 0;
  let slideMeta = [];
  let slideDet = [];

  const PF = { y: "Proof shown", p: "Partial proof", n: "No proof shown — claim only" };
  const PFNF = "Claim only — proof said to exist but not found online";
  const PFNF_SHORT = "Claim only — proof not found online";
  function pfBadge(s, extra, nf) { return `<span class="pf pf-${s}">${esc(nf ? (nf === "short" ? PFNF_SHORT : PFNF) : PF[s])}${extra ? ` <em>${esc(extra)}</em>` : ""}</span>`; }
  /* badge for a proof row; short = compact wording for tiles and lists */
  function pfOf(r, extra, short) { return pfBadge(r.s, extra, r.nf ? (short ? "short" : true) : false); }
  /* v9: the proof itself — click-to-load youtube-nocookie embed, or a big direct link */
  const ytUrl = (id) => `https://www.youtube.com/watch?v=${id}`;
  const pvHref = (v) => v.yt ? ytUrl(v.yt) : v.url;
  const isFootage = (v) => !!v.yt || /gettyimages/.test(v.url || "");
  function pvVerb(v) { return isFootage(v) ? "Watch the proof" : /circlemakers/.test(v.url) ? "See the build photos" : /sheldrake/.test(v.url) ? "See the aerial photo" : "Read the article"; }
  function pvShort(v) { return v.yt ? "video" : /gettyimages/.test(v.url) ? "news footage" : /circlemakers/.test(v.url) ? "build photos on makers’ site" : /sheldrake/.test(v.url) ? "aerial photo" : "newspaper article"; }
  function pvEmbed(v) {
    return `<div class="pv-yt"><button type="button" class="pv-play" data-yt="${esc(v.yt)}" data-title="${esc(v.label)}" aria-label="Load video: ${esc(v.label)}">
      <span class="pv-fb">Video preview needs signal</span><img src="https://i.ytimg.com/vi/${esc(v.yt)}/hqdefault.jpg" alt="" loading="lazy" referrerpolicy="no-referrer" />
      <span class="pv-tri" aria-hidden="true"></span><span class="pv-cap">\u25b6 Tap to play \u00b7 ${esc(v.label)}</span></button></div>`;
  }
  function pvBtn(v, small) {
    return `<a class="pv-btn${small ? " sm" : ""}" href="${esc(pvHref(v))}" target="_blank" rel="noopener"><b>${isFootage(v) ? "\u25b6 " : ""}${esc(pvVerb(v))} \u2197</b><small>${esc(v.label)}${v.yt ? " \u00b7 YouTube" : ""}</small></a>`;
  }

  function renderClaims() {
    if (claimsBody.dataset.ready) { sizeDeck(); return; }
    const C = window.CC_CLAIMS;
    if (!C || !C.deck || !C.proof) { claimsBody.innerHTML = '<p class="map-off">Claims content unavailable.</p>'; return; }
    const K = C.deck, T = C.timing, D = C.claimants, G = C.gallery, CP = C.compare, LY = C.lay, BY = C.byYear, MI = C.mistakes;
    const SR = window.CC_SOURCES || {};
    const uniq = (a) => [...new Set(a)].filter((k) => SR[k]);
    const keysOf = (items) => items.flatMap(([, ...k]) => k);
    const pr = (what) => C.proof.find((r) => r.what === what);
    const tag = (t) => t === "c" ? '<span class="sl-tag c">Claimed man-made</span>' : t === "u" ? '<span class="sl-tag u">Reported unexplained</span>' : t ? `<span class="sl-tag m">${esc(t)}</span>` : "";
    const item = (id) => allData.find((d) => d.id === id);
    const photoBtn = (d, alt) => d ? `<button type="button" class="sl-photo" data-id="${esc(d.id)}" aria-label="Open ${esc(d.name)}"><img src="${esc(d.imageUrl)}" alt="${esc(alt || d.name)}" loading="lazy" /></button>` : "";
    const ext = (url, alt, link, cls) => `<a class="sl-media ext${cls ? " " + cls : ""}" href="${esc(link)}" target="_blank" rel="noopener">
        <span class="sl-fb"><b>Photo loads from source — needs signal</b><small>Tap to open the source page \u2197</small></span>
        <img class="ext" src="${esc(url)}" alt="${esc(alt)}" loading="lazy" referrerpolicy="no-referrer" /></a>`;
    const bul = (items) => `<ul class="sl-bul">${items.map((t) => `<li>${esc(Array.isArray(t) ? t[0] : t)}</li>`).join("")}</ul>`;
    const detList = (items) => `<ul class="sd-list">${items.map(([t, ...k]) => `<li><p>${esc(t)}</p><p class="sd-src">${srcLinks(k)}</p></li>`).join("")}</ul>`;
    const quote = (q, who) => `<blockquote class="sl-q"><p>${esc(q)}</p><cite>\u2014 ${esc(who)}</cite></blockquote>`;
    const big = (b, sub) => `<div class="sl-big"><b>${esc(b)}</b><span>${esc(sub)}</span></div>`;
    const vs = (a, b) => `<div class="sl-vs">
        <div class="sl-stat ${a.c || "c"}"><b>${esc(a.big)}</b><span>${esc(a.small)}</span></div>
        <div class="sl-stat ${b.c || "u"}"><b>${esc(b.big)}</b><span>${esc(b.small)}</span></div></div>`;
    const line = (t) => `<p class="sl-line">${esc(t)}</p>`;
    const note = (t) => `<p class="sl-note">${esc(t)}</p>`;
    const pvDet = (r) => r.pv ? `<h5 class="sd-h">The proof itself</h5><ul class="sd-list">${r.pv.map((v) => `<li>${pvBtn(v, true)}<p class="sd-p"><b>What it shows:</b> ${esc(v.shows)}</p><p class="sd-src">${esc(v.src)}</p></li>`).join("")}</ul>` : "";

    const S = [];
    let chap = "";
    const chapters = [];
    const add = (o) => {
      if (o.ch && o.ch !== chap) { chap = o.ch; chapters.push({ name: chap, start: S.length }); }
      const keys = uniq(o.src || []);
      const detKeys = uniq((o.detKeys || []).concat(keys));
      const detHtml = (o.det || "") + (detKeys.length ? `<h5 class="sd-h">Sources</h5><ul class="sd-srcs">${detKeys.map((k) => `<li>${srcLinks([k])}</li>`).join("")}</ul>` : "");
      const i = S.length;
      slideDet[i] = { title: o.head, html: detHtml };
      const srcLine = keys.length ? `Source: ${keys.slice(0, 2).map((k) => srcLinks([k])).join(" \u00b7 ")}${keys.length > 2 ? ` +${keys.length - 2}` : ""}` : "";
      const foot = (srcLine || detHtml) ? `<div class="sl-foot"><p class="sl-src">${srcLine}</p>${detHtml ? `<button type="button" class="sl-det" data-det="${i}">Details</button>` : ""}</div>` : "";
      S.push(`<section class="slide ${o.cls || ""}" aria-roledescription="slide" aria-label="${esc(o.head)}"><div class="sl-in">${o.top || ""}<h3 class="sl-h">${esc(o.head)}</h3>${o.body || ""}</div>${foot}</section>`);
      slideMeta[i] = chap;
    };

    /* v10: cut to claims with photos/video of the formation itself */
    const KEEP = ["Demonstrations for the press, 1991", "BBC Country File demo, ~200 ft, 100 circles", "1992 crop-circle-making competition entries",
      "Sarraltroff, Moselle test formation", "Mitsubishi ‘Space Star’, East Field", "National Geographic square spiral", "Greenpeace, Oaxaca, Mexico",
      "The Levellers video, Poynings", "History Channel logo", "Korn (rock band), Bakersfield", "Big Brother 4 logo (Channel 4)", "Julia Set, near Stonehenge"];
    const P = KEEP.map(pr).filter(Boolean);
    claimsBody._proof = P;

    /* ——— Intro ——— */
    add({ ch: "Start", cls: "sl-title", top: '<div class="sl-ring big" aria-hidden="true"><span></span></div>', head: K.title.head,
      body: line("Only the claims where you can see the formation itself — in footage or photos. Who said they made it, and the proof they showed.") + `<button type="button" class="sl-go" data-go="1">${esc(K.title.hint)}</button>` });
    add({ ch: "Start", head: "How to read the badges",
      body: `<ul class="sl-legend">
        <li>${pfBadge("y")}<span>The proof itself is linked: video of the build or build photos.</span></li>
        <li>${pfBadge("p")}<span>Some proof, but not of the whole thing claimed.</span></li>
        <li>${pfBadge("n")}<span>They said it; no footage, witness or paperwork was published.</span></li>
        <li class="sl-tags2"><span class="sl-tag c">Claimed man-made</span><span class="sl-tag u">Reported unexplained</span><span>Someone said they made it \u00b7 researchers presented it as unexplained.</span></li></ul>`,
      det: `<p class="sd-p">${esc(C.proofIntro)}</p>` });

    /* ——— Doug & Dave ——— */
    const ddDemo = pr("Demonstrations for the press, 1991");
    add({ ch: "Doug & Dave", cls: "sl-pv", top: tag("c") + pfOf(ddDemo, "demo"), head: "Doug & Dave, 1991",
      body: line("Two men from Southampton went public in Today on 9 September 1991, saying they’d made circles since 1978 — then made one for the press.") +
      quote("“No human could have done this.”", "Pat Delgado, after inspecting their demo circle near Sevenoaks, Kent") +
      pvBtn(ddDemo.pv[0]) + note("Simple designs — not the complex formations."),
      src: ["today91", "gettyDD"], det: detList(D[0].points) + `<h5 class="sd-h">The other side</h5>` + detList(D[0].counter) + `<p class="sd-p">${esc(ddDemo.how)}</p>` + pvDet(ddDemo) });
    add({ ch: "Doug & Dave", head: "Their count vs the total", body: vs({ big: "25–30", small: "new circles a season, they said (Time, 1991)" }, { big: "≈ 800", small: "the annual count by 1991 (Rupert Sheldrake)", c: "n" }) +
      quote("“…a maximum of 30 formations a year”", "Rupert Sheldrake, even if their claims were believed"),
      src: ["time91", "sheldrake"], det: detList([D[0].points[4], D[0].counter[0]]) });

    /* ——— Filmed builds ——— */
    const c92 = pr("1992 crop-circle-making competition entries"), g92 = G.items[0];
    add({ ch: "Filmed builds", cls: "sl-pv", top: tag("c") + pfOf(c92), head: "The 1992 contest",
      body: line("West Wycombe, 11 July 1992: 12 teams, one set design, 10 pm–3 am in the dark. Winners: three Westland Helicopters engineers, £3,000.") + pvEmbed(c92.pv[0]) +
      `<a class="sl-link" href="${esc(g92.link)}" target="_blank" rel="noopener">Aerial photo of the entries (John Macnish) \u2197</a>`,
      src: ["sheldrake", "yt1992"], det: pvDet(c92) + detList([D[2].points[0]]) + `<p class="sd-p">${esc(c92.how)}</p>` });
    const sr = pr("Sarraltroff, Moselle test formation"), sar = G.items.find((g) => g.img);
    add({ ch: "Filmed builds", cls: "sl-pv", top: tag("c") + pfOf(sr, "video"), head: "Sarraltroff, 2018",
      body: line("French YouTubers made it at night in “under two hours” — their video of the build:") + pvEmbed(sr.pv[0]) +
      `<p class="pv-shows"><b>What it shows:</b> ${esc(sr.pv[0].shows)}</p>`,
      src: ["ytAstro", "fi18", "rl18"], det: `<p class="sd-p">${esc(sar.who)}</p><p class="sd-p">${esc(sr.how)}</p>` + pvDet(sr) +
      `<h5 class="sd-h">Design</h5><div class="sd-img"><img src="${esc(sar.img)}" alt="${esc(sar.imgAlt)}" loading="lazy" /></div><p class="sd-src">${esc(sar.imgKind)} \u00b7 Wizly-08, CC BY-SA 4.0</p>`, detKeys: ["commonsSarr"] });
    const cf = pr("BBC Country File demo, ~200 ft, 100 circles");
    add({ ch: "Filmed builds", cls: "sl-pv", top: tag("c") + pfOf(cf), head: "BBC Countryfile build",
      body: `<p class="sl-place">${esc(cf.who)} \u00b7 ${esc(cf.year)}</p>` + pvEmbed(cf.pv[0]) + `<p class="pv-shows"><b>What it shows:</b> ${esc(cf.pv[0].shows)}</p>`,
      src: cf.src, det: `<p class="sd-p">${esc(cf.how)}</p>` + pvDet(cf) });

    /* ——— Circlemakers ——— */
    const cmRows = P.filter((r) => /^Circlemakers/.test(r.who) && r.what !== cf.what);
    add({ ch: "Circlemakers", top: tag("c"), head: "Circlemakers: the build photos",
      body: line("Paid builds for adverts, TV and bands — build photos on their own site.") +
      `<ul class="sl-pfl compact pv-list">${cmRows.map((r) => `<li><a href="${esc(pvHref(r.pv[0]))}" target="_blank" rel="noopener"><b>${esc(r.what)}</b><span>${r.s === "p" ? "Partial \u00b7 " : ""}${esc(r.year)} \u00b7 ${esc(pvShort(r.pv[0]))} \u2197</span></a></li>`).join("")}</ul>`,
      src: ["cmWork", "cmAbout"], det: `<ul class="sd-list">${cmRows.map((r) => `<li>${pfOf(r)}<p><b>${esc(r.what)}</b> (${esc(r.year)}) — ${esc(r.how)}</p>${r.pv.map((v) => pvBtn(v, true)).join("")}<p class="sd-src">${srcLinks(r.src)}</p></li>`).join("")}</ul><p class="sd-p">${esc(C.proofNote)}</p>` });
    add({ ch: "Circlemakers", head: "What they don’t claim", body: quote("“…careful never to admit responsibility for any specific formation”", "John Vidal, The Guardian, on crop-circle makers") +
      line("We found no formation in this gallery publicly claimed by the Circlemakers.") + note("Barbury Castle 2008: the Daily Mail reported “no one has claimed responsibility”."),
      src: ["vidal", "mail08"], det: detList([D[1].points[4]]) + `<p class="sd-p">${esc(D[1].note)}</p>` });

    /* ——— Julia Set ——— */
    const jl = pr("Julia Set, near Stonehenge"), jr = T.rows[0], mr = T.rows[1];
    add({ ch: "Julia Set", top: tag("c") + pfBadge("n"), head: "Julia Set, 1996",
      body: ext("https://www.colinandrews.net/sitebuilder/images/JuliaSet_Stonehenge-564x419.jpg", "Aerial photo of the Julia Set formation beside Stonehenge", "https://colinandrews.net/JuliaSetStory2.html") +
      `<p class="sl-credit">Photo \u00a9 Colin Andrews, colinandrews.net</p>` +
      quote("“…made the previous night, by three people, in about two and three-quarters hours”", "Rod Dickinson, to researcher Michael Lindemann") +
      note("Radford: “there exists no photographs or video of it being made.”"),
      src: ["si22", "andrewsJulia"], det: detList([D[2].points[1]]) + `<h5 class="sd-h">Proof status</h5><p class="sd-p">${esc(jl.how)}</p>` });
    add({ ch: "Julia Set", top: pfBadge("n"), head: "Claim vs window", body: vs({ big: "≈ 2¾ h", small: "claimed, 3 people, from about 2:45 am" }, { big: "45 min", small: "window “in full daylight” — Colin Andrews" }) +
      line("Taken at face value, the claimed build ends around 5:30 am — after that day’s 5:01 am sunrise."),
      src: ["si22", "andrewsJulia", "tadSalisbury"], det: detList(jr.build.concat(jr.window)) });
    const mh = item("2001-08-12-milk-hill-galaxy-spiral");
    add({ ch: "Julia Set", top: tag("u"), head: "Milk Hill: 409 circles vs the dark", body: `<div class="sl-media">${photoBtn(mh, "Milk Hill 2001, aerial")}</div>` +
      vs({ big: "≈ 30 s", small: "per circle — Circlemakers’ own sum", c: "c" }, { big: "4 h 12 m", small: "full darkness that night (Swindon)", c: "n" }) + note("No one has claimed it."),
      src: ["cmTotc01", "tadSwindon", "ccc01"], det: detList(mr.build.concat(mr.window)) });

    /* ——— Mess-ups (with photos) ——— */
    const wo = pr("Seven-pointed star, West Overton");
    const ms = K.messups.filter((m) => !m.big);
    ms.forEach((m, i) => {
      const d = m.id ? item(m.id) : null;
      const vis = d ? `<div class="sl-media">${photoBtn(d, m.place + " " + m.date)}</div>` : ext(m.img, m.alt, m.link);
      add({ ch: "Mess-ups", cls: "sl-mess", top: tag(`Mess-up ${i + 1} of ${ms.length}`), head: m.head,
        body: `<p class="sl-place">${esc(m.place)} \u00b7 ${esc(m.date)}</p>${vis}${m.credit ? `<p class="sl-credit">${esc(m.credit)}</p>` : ""}` + quote(m.quote, m.who),
        src: m.src, det: i === 0 ? detList(MI.errors) : "" });
    });

    /* ——— Proof ——— */
    const cnt = { y: 0, p: 0, n: 0 };
    P.forEach((r) => cnt[r.s]++);
    add({ ch: "Proof", head: "Claims with proof vs claim only", body: `<div class="sl-pfcount">
        <div class="pfc y"><b>${cnt.y}</b><span>Proof shown</span></div>
        <div class="pfc p"><b>${cnt.p}</b><span>Partial</span></div>
        <div class="pfc n"><b>${cnt.n}</b><span>Claim only</span></div></div>` +
      line(`${P.length} claims with a photo or video of the formation. Proof means the evidence itself — video or build photos — linked here.`) +
      note("Also: West Overton, 2000 — Matthew Williams was fined £100 after admitting a seven-pointed star (court reports; no formation photo found).") +
      `<button type="button" class="sl-more" data-sheet="proof">Open the full proof table</button>`,
      det: `<p class="sd-p">${esc(C.proofIntro)}</p><p class="sd-p">${esc(wo.how)}</p>` + pvDet(wo) + `<p class="sd-p">${esc(C.proofNote)}</p>`, detKeys: ["gh00", "guardian00"] });

    /* ——— End ——— */
    add({ ch: "End", cls: "sl-title", top: '<div class="sl-ring big" aria-hidden="true"><span></span></div>', head: K.close.head,
      body: line("Every slide names who said what — and whether they showed proof. Then see the unclaimed side: the UFOs tab.") + `<button type="button" class="sl-go" data-go="0">\u21ba ${esc(K.close.again)}</button>` });

    slideCount = S.length;
    const sheetProof = `<p class="sd-p">${esc(C.proofIntro)}</p><p class="sd-p"><b>${cnt.y}</b> proof shown \u00b7 <b>${cnt.p}</b> partial \u00b7 <b>${cnt.n}</b> claim only. Links checked 10 Oct 2026.</p>
      <table class="pt"><thead><tr><th>Claim</th><th>Status</th><th>The proof itself</th><th>What it shows</th><th>Source</th></tr></thead><tbody>${P.map((r) => `<tr class="pt-${r.s}">
        <td data-l="Claim"><b>${esc(r.what)}</b><small>${esc(r.who)} \u00b7 ${esc(r.year)}</small></td>
        <td data-l="Status">${pfOf(r)}</td>
        <td data-l="The proof itself">${r.pv ? r.pv.map((v) => pvBtn(v, true)).join("") : `<span class="pt-none">None online</span>`}</td>
        <td data-l="What it shows">${r.pv ? r.pv.map((v) => `<p>${esc(v.shows)}</p>`).join("") + (r.s === "p" ? `<p><em>Why partial:</em> ${esc(r.how)}</p>` : "") : `<p><em>Missing:</em> ${esc(r.missing || "")}</p><p>${esc(r.how)}</p>`}</td>
        <td data-l="Source">${srcLinks(r.src)}</td></tr>`).join("")}</tbody></table><p class="sd-p">${esc(C.proofNote)}</p>`;
    slideDet.proof = { title: `Proof table — all ${P.length} claims`, html: sheetProof };

    claimsBody.innerHTML = `<div class="deck" id="deck" aria-roledescription="carousel" aria-label="Who made them? slides" tabindex="0">
        <div class="deck-prog"><span id="deckProg"></span></div>
        <div class="deck-track" id="deckTrack">${S.join("")}</div>
        <div class="sd hidden" id="slSheet" role="dialog" aria-modal="true" aria-labelledby="sdTitle">
          <div class="sd-panel"><div class="sd-head"><b id="sdTitle"></b><button type="button" class="sl-x" data-close="1" aria-label="Close">\u00d7</button></div><div class="sd-body" id="sdBody"></div></div>
        </div>
        <div class="deck-bar">
          <button type="button" class="deck-arrow" data-dir="-1" aria-label="Previous slide">\u2039</button>
          <div class="deck-mid"><span class="deck-ch" id="deckCh"></span><div class="deck-dots" id="deckDots"></div></div>
          <button type="button" class="deck-arrow" data-dir="1" aria-label="Next slide">\u203a</button>
        </div>
      </div>`;
    claimsBody._chapters = chapters;
    const tocEl = document.getElementById("slToc"); if (tocEl) tocEl.outerHTML = `<ol class="sl-toc">${chapters.slice(1, -1).map((c) => `<li><button type="button" data-go="${c.start}">${esc(c.name)}</button></li>`).join("")}</ol>`;
    claimsBody.querySelectorAll("img.ext, .pv-play img").forEach((im) => {
      const fail = () => im.classList.add("failed");
      im.addEventListener("error", fail);
      if (im.complete && !im.naturalWidth && im.getAttribute("src")) im.addEventListener("load", () => {}, { once: true });
    });
    claimsBody.dataset.ready = "1";
    drawYearChart();
    bindDeck();
    sizeDeck();
    goSlide(slideIdx, true);
  }

  function openSheet(key) {
    const d = slideDet[key];
    if (!d) return;
    document.getElementById("sdTitle").textContent = d.title;
    document.getElementById("sdBody").innerHTML = d.html;
    document.getElementById("sdBody").scrollTop = 0;
    document.getElementById("slSheet").classList.remove("hidden");
  }
  function closeSheet() { const s = document.getElementById("slSheet"); if (s) s.classList.add("hidden"); }

  function sizeDeck() {
    const deck = document.getElementById("deck");
    if (!deck || claimsView.classList.contains("hidden")) return;
    const head = document.querySelector("header.top");
    const h = window.innerHeight - (head ? head.getBoundingClientRect().height : 0);
    deck.style.height = Math.max(420, h) + "px";
  }

  function goSlide(i, instant) {
    const track = document.getElementById("deckTrack");
    if (!track) return;
    slideIdx = Math.max(0, Math.min(slideCount - 1, i));
    track.style.transition = instant ? "none" : "";
    track.style.transform = `translateX(${-slideIdx * 100}%)`;
    track.querySelectorAll(".slide").forEach((s, k) => s.setAttribute("aria-hidden", String(k !== slideIdx)));
    track.querySelectorAll(".pv-yt[data-orig]").forEach((w) => { if (w.closest(".slide") !== track.children[slideIdx]) { w.innerHTML = w.dataset.orig; w.removeAttribute("data-orig"); } });
    const chs = claimsBody._chapters || [];
    let ci = 0;
    chs.forEach((c, k) => { if (c.start <= slideIdx) ci = k; });
    const c = chs[ci], end = ci + 1 < chs.length ? chs[ci + 1].start : slideCount;
    document.getElementById("deckCh").textContent = `${c ? c.name : ""} \u00b7 ${slideIdx + 1}/${slideCount}`;
    const dots = [];
    for (let k = c.start; k < end; k++) dots.push(`<button type="button" data-go="${k}" aria-label="Slide ${k + 1} of ${slideCount}"${k === slideIdx ? ' aria-current="true"' : ""}></button>`);
    document.getElementById("deckDots").innerHTML = dots.join("");
    document.getElementById("deckProg").style.width = ((slideIdx + 1) / slideCount * 100).toFixed(2) + "%";
    claimsView.querySelectorAll('.deck-bar [data-dir="-1"]').forEach((b) => { b.disabled = slideIdx === 0; });
    claimsView.querySelectorAll('.deck-bar [data-dir="1"]').forEach((b) => { b.disabled = slideIdx === slideCount - 1; });
    closeSheet();
  }

  function bindDeck() {
    const deck = document.getElementById("deck");
    const track = document.getElementById("deckTrack");
    let x0 = null, y0 = 0, dx = 0, horiz = null;
    deck.addEventListener("touchstart", (e) => {
      if (e.target.closest(".sd, .st-chart")) { x0 = null; return; }
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; dx = 0; horiz = null;
    }, { passive: true });
    deck.addEventListener("touchmove", (e) => {
      if (x0 == null) return;
      dx = e.touches[0].clientX - x0;
      const dy = e.touches[0].clientY - y0;
      if (horiz == null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) horiz = Math.abs(dx) > Math.abs(dy);
      if (!horiz) return;
      e.preventDefault();
      track.style.transition = "none";
      const edge = (slideIdx === 0 && dx > 0) || (slideIdx === slideCount - 1 && dx < 0) ? 0.3 : 1;
      track.style.transform = `translateX(calc(${-slideIdx * 100}% + ${dx * edge}px))`;
    }, { passive: false });
    deck.addEventListener("touchend", () => {
      if (x0 == null) return;
      x0 = null;
      const w = deck.clientWidth;
      if (horiz && Math.abs(dx) > Math.min(70, w * 0.18)) goSlide(slideIdx + (dx < 0 ? 1 : -1));
      else goSlide(slideIdx);
    });
    document.addEventListener("keydown", (e) => {
      if (claimsView.classList.contains("hidden") || !document.getElementById("overlay").classList.contains("hidden")) return;
      if (e.target.closest && e.target.closest("input, textarea, select")) return;
      if (!document.getElementById("slSheet").classList.contains("hidden")) { if (e.key === "Escape") closeSheet(); return; }
      if (e.key === "ArrowRight") { goSlide(slideIdx + 1); e.preventDefault(); }
      if (e.key === "ArrowLeft") { goSlide(slideIdx - 1); e.preventDefault(); }
    });
    window.addEventListener("resize", sizeDeck);
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
    ro.dataset.def = `Peak: ${max} in ${peakY} \u00b7 ${last}: ${sr.data[last]}`;
    ro.textContent = ro.dataset.def;
    const s = document.getElementById("stSrc");
    if (s) s.innerHTML = `Source: ${srcLinks(sr.src)}${sr.key === "england" ? " (read from chart image)" : ""}`;
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
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
    }).addTo(map);
    const layer = L.featureGroup().addTo(map);
    mapped.slice().sort((a, b) => a.count - b.count).forEach((h) => {
      const repeat = h.count > 1;
      L.circleMarker([h.coord.lat, h.coord.lon], {
        radius: 5 + 4 * Math.sqrt(h.count),
        color: "#1a73e8",
        weight: repeat ? 2 : 1,
        fillColor: "#1a73e8",
        fillOpacity: repeat ? 0.35 : 0.15
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

  /* ——— v10: "The case for UFOs at the hotspots" story cards (Why here?, UFOs, Evidence) ——— */
  const X = () => window.CC_EXTRA || null;
  const quartzTag = new Map();
  function xLinks(keys) {
    const S = (X() || {}).S || {};
    return (keys || []).filter((k) => S[k]).map((k) => `<a href="${esc(S[k][1])}" target="_blank" rel="noopener">${esc(S[k][0])}</a>`).join(" \u00b7 ");
  }
  function extImg(url, alt, link, credit) {
    return `<figure class="st-media"><a class="st-ext" href="${esc(link)}" target="_blank" rel="noopener">
      <span class="sl-fb"><b>Photo loads from source — needs signal</b><small>Tap to open the source page \u2197</small></span>
      <img class="ext" src="${esc(url)}" alt="${esc(alt)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.classList.add('failed')" /></a>
      <figcaption>${esc(credit)}</figcaption></figure>`;
  }
  function ytCard(id, label) {
    return `<div class="pv-yt st-yt"><button type="button" class="pv-play" data-yt="${esc(id)}" data-title="${esc(label)}" aria-label="Load video: ${esc(label)}">
      <span class="pv-fb">Video preview needs signal</span><img src="https://i.ytimg.com/vi/${esc(id)}/hqdefault.jpg" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.classList.add('failed')" />
      <span class="pv-tri" aria-hidden="true"></span><span class="pv-cap">\u25b6 Tap to play \u00b7 ${esc(label)}</span></button></div>
      <a class="st-link" href="https://www.youtube.com/watch?v=${esc(id)}" target="_blank" rel="noopener">Open on YouTube \u2197</a>`;
  }
  function itemBtn(id) {
    const d = allData.find((x) => x.id === id);
    if (!d) return "";
    return `<figure class="st-media"><button type="button" class="st-item" data-id="${esc(d.id)}" aria-label="Open ${esc(d.name || "")}"><img src="${esc(d.imageUrl)}" alt="${esc(d.name || "")}" loading="lazy" /></button>
      <figcaption>${esc(d.name || "")} \u00b7 ${esc(whenText(d))} \u00b7 Photo: ${esc(d.photoCredit || "")}</figcaption></figure>`;
  }
  function thumbHtml(c) {
    const m = c.media || {};
    if (m.img) return `<a class="st-thumb" href="${esc(m.img)}" target="_blank" rel="noopener"><img src="${esc(m.img)}" alt="${esc(m.alt)}" loading="lazy" /></a>`;
    if (m.ext) return `<a class="st-thumb" href="${esc(m.link)}" target="_blank" rel="noopener"><span class="st-thumb-fb">Photo needs signal</span><img src="${esc(m.ext)}" alt="${esc(m.alt)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.classList.add('failed')" /></a>`;
    const d = c.item && allData.find((x) => x.id === c.item);
    if (d) return `<button type="button" class="st-thumb st-item" data-id="${esc(d.id)}" aria-label="Open ${esc(d.name || "")}"><img src="${esc(d.imageUrl)}" alt="${esc(d.name || "")}" loading="lazy" /></button>`;
    return "";
  }
  function creditLine(c) {
    const m = c.media || {}, S = X().S;
    const parts = [];
    if (m.img || m.ext) parts.push(S[m.credit] ? xLinks([m.credit]) : esc(m.credit));
    [c.item, c.item2].filter(Boolean).forEach((id) => { const d = allData.find((x) => x.id === id); if (d) parts.push(`${esc(d.name || "")}: photo ${esc(d.photoCredit || "")}`); });
    return parts.length ? `<p class="st-credit">${parts.join(" \u00b7 ")}</p>` : "";
  }
  function storyCard(c, idx) {
    const thumb = thumbHtml(c);
    let media = "";
    if (c.media && c.media.yt) media = ytCard(c.media.yt, c.media.label);
    else if (c.media && c.media.link && !c.media.img && !c.media.ext) media = `<a class="st-watch" href="${esc(c.media.link)}" target="_blank" rel="noopener">\u25b6 ${esc(c.media.label)}</a>${c.media.note ? `<p class="st-small">${esc(c.media.note)}</p>` : ""}`;
    if (c.item2) { const d = allData.find((x) => x.id === c.item2); if (d) media += `<button type="button" class="st-wide st-item" data-id="${esc(d.id)}" aria-label="Open ${esc(d.name || "")}"><img src="${esc(d.imageUrl)}" alt="${esc(d.name || "")}" loading="lazy" /></button>`; }
    let stat = "";
    if (c.stat === "hotspots") {
      const top = hs.hotspots.filter((h) => h.count > 1).slice(0, 3);
      stat = `<ul class="st-rows">${top.map((h) => `<li><button type="button" data-place="${esc(h.id)}"><span>${esc(areaLabel(h))}</span><b>${h.count} formations</b></button></li>`).join("")}</ul>`;
    }
    const facts = (c.facts || []).map(([t]) => `<p>${esc(t)}</p>`).join("");
    const q = c.quote ? `<blockquote class="st-q">${esc(c.quote[0])}<cite>${esc(c.quote[1])}</cite></blockquote>` : "";
    const note = c.note ? `<p class="st-belief"><b>Belief, not measurement:</b> ${esc(c.note.replace(/^Belief, not measured science: /, ""))}</p>` : "";
    const go = c.go ? `<button type="button" class="st-next" data-view="${esc(c.go[0])}">${esc(c.go[1])}</button>` : "";
    const keys = [...new Set((c.facts || []).flatMap(([, ...k]) => k).concat(c.noteSrc || []))];
    const srcs = keys.length ? `<p class="st-mh">Sources</p><ul class="st-srcs">${keys.map((k) => `<li>${xLinks([k])}</li>`).join("")}</ul>` : "";
    const other = c.other && c.other.length ? `<p class="st-mh">The other side</p><ul class="st-oth">${c.other.map(([t, ...k]) => `<li>${esc(t)} <span class="st-src">${xLinks(k)}</span></li>`).join("")}</ul>` : "";
    return `<article class="st-card" id="st-${idx}">
      <div class="st-row"><div class="st-txt"><p class="st-kick">${esc(c.kicker || "")}${c.place ? ` \u00b7 ${esc(c.place)}` : ""}</p><h3>${esc(c.title)}</h3></div>${thumb}</div>
      ${media}${creditLine(c)}<div class="st-snip">${facts}</div>${stat}${q}${note}
      ${srcs || other ? `<details class="st-more"><summary>More</summary>${other}${srcs}</details>` : ""}${go}</article>`;
  }
  function quartzCard() {
    const Q = X().QUARTZ;
    const thumbs = Q.tagged.map(([id, km, site]) => {
      const d = allData.find((x) => x.id === id);
      return d ? `<button type="button" class="hs-thumb st-item" data-id="${esc(d.id)}" aria-label="${esc((d.name || "") + ", " + km + " km from " + site)}"><img src="${esc(d.imageUrl)}" alt="" loading="lazy" /><span>${esc(String(d.year || ""))} \u00b7 ${km} km</span></button>` : "";
    }).join("");
    return `<article class="st-card st-quartz" id="st-quartz">
      <p class="st-kick">Quartz ground</p><h3>${Q.tagged.length} formations on sarsen ground</h3>
      <div class="st-snip"><p>Formations in this gallery within ${Q.ruleKm} km of a documented field of sarsens — quartz sandstone boulders.</p></div>
      <div class="hs-strip st-strip">${thumbs}</div>
      <div class="st-links"><button type="button" class="st-next" data-qmap="1">Show on the map</button><button type="button" class="st-next" data-qgal="1">See them in the Gallery</button></div>
      <details class="st-more"><summary>More</summary><p class="st-mh">Sarsen sites</p><ul class="st-oth">${Q.sites.map((s) => `<li><b>${esc(s.name)}</b> — ${esc(s.why)} <span class="st-src">${xLinks(s.src)}</span></li>`).join("")}</ul>
      <p class="st-mh">How we tagged them</p><ul class="st-oth"><li>${esc(Q.rule)}</li><li>Coordinates in this gallery are approximate (place-name level), so distances are approximate too.</li><li>${esc(Q.kabNote)}</li></ul></details></article>`;
  }
  function storyHead(sec, others) {
    return `<header class="st-head"><p class="st-case">The case for UFOs at the hotspots</p><h2>${esc(sec.title)}</h2><p class="st-lead">${esc(sec.intro)}</p>
      <nav class="st-chips" aria-label="The case">${others.map(([v, l]) => `<button type="button" data-view="${v}"${v === currentView ? ' aria-current="true"' : ""}>${esc(l)}</button>`).join("")}</nav></header>`;
  }
  const CASE_NAV = [["hotspots", "1 \u00b7 Why here?"], ["ufo", "2 \u00b7 Lights"], ["evidence", "3 \u00b7 Instruments"]];
  function renderStory(el, key) {
    if (!X()) { el.innerHTML = '<p class="map-off">Content unavailable.</p>'; return; }
    if (el.dataset.ready) return;
    const sec = X()[key];
    let cards = sec.cards.map((c, i) => storyCard(c, key + i));
    if (key === "WHY") cards.splice(6, 0, quartzCard());
    el.innerHTML = storyHead(sec, CASE_NAV) + cards.join("");
    el.dataset.ready = "1";
  }
  function bindStory(el) {
    el.addEventListener("click", (e) => {
      const pl = e.target.closest(".pv-play");
      if (pl) {
        pl.parentElement.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(pl.dataset.yt)}?autoplay=1&rel=0&playsinline=1" title="${esc(pl.dataset.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
        return;
      }
      const it = e.target.closest(".st-item");
      if (it) { const d = allData.find((x) => x.id === it.dataset.id); if (d) openDetail(d); return; }
      const v = e.target.closest("[data-view]");
      if (v) { showView(v.dataset.view); window.scrollTo(0, 0); return; }
      const pc = e.target.closest("[data-place]");
      if (pc) { filterToPlace(pc.dataset.place); return; }
      if (e.target.closest("[data-qmap]")) { showQuartzLayer(); return; }
      if (e.target.closest("[data-qgal]")) {
        placeFilterId = null; yearFilter.value = "all"; meaningFilter.checked = false; anomalyFilter.checked = false; search.value = "";
        quartzFilter.checked = true; showView("gallery"); render(); window.scrollTo(0, 0);
      }
    });
  }
  let quartzLayer = null;
  function showQuartzLayer() {
    if (!map || typeof L === "undefined") return;
    if (!quartzLayer) {
      quartzLayer = L.featureGroup();
      const Q = X().QUARTZ;
      Q.sites.forEach((s) => {
        L.circle([s.lat, s.lon], { radius: Q.ruleKm * 1000, color: "#188038", weight: 1, fillColor: "#188038", fillOpacity: 0.08 }).addTo(quartzLayer);
        L.circleMarker([s.lat, s.lon], { radius: 6, color: "#fff", weight: 2, fillColor: "#188038", fillOpacity: 1 })
          .bindPopup(`<b>${esc(s.name)}</b><br>${esc(s.why)}`).addTo(quartzLayer);
      });
    }
    if (!map.hasLayer(quartzLayer)) quartzLayer.addTo(map);
    hotspotMapEl.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => { map.invalidateSize(); map.fitBounds(quartzLayer.getBounds(), { padding: [20, 20], maxZoom: 12 }); }, 350);
    mapNote.textContent = "Green = quartz ground: documented sarsen sites with a 3 km ring. Blue = formation sites.";
  }

  /* ——— v10: Kab tab ——— */
  let kab = null, kabFilter = "all";
  const kabBody = document.getElementById("kabBody");
  const kabView = document.getElementById("kab");
  const fmtDate = (s) => { if (!s) return ""; const [y, m, d] = s.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }); };
  function firstLine(t) { return (t || "").split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 2).join(" \u00b7 ").replace(/https?:\/\/\S+/g, "").trim(); }
  function linkify(t) { return esc(t).replace(/https?:\/\/[^\s<]+/g, (u) => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`); }
  function renderKab() {
    if (!kab) {
      kabBody.innerHTML = '<p class="map-off">Loading Kab’s posts…</p>';
      fetch("kab.json").then((r) => r.json()).then((d) => { kab = d; renderKab(); })
        .catch(() => { kabBody.innerHTML = '<p class="map-off">Couldn’t load Kab’s posts.</p>'; });
      return;
    }
    const all = kab.items;
    const list = all.filter((k) => kabFilter === "all" || (kabFilter === "photo" ? k.kind === "photo" : kabFilter === "quartz" ? k.quartz : kabFilter === "uk" ? /Wiltshire|Hampshire|England|UK|Somerset|Dorset|Devon|Oxfordshire/.test(k.place || "") : true));
    const n = (f) => all.filter(f).length;
    kabBody.innerHTML = `<header class="kab-head"><h2>Kab’s crop circles</h2>
      <p class="evidence-lede">${all.length} crop-circle posts from Kabamur Taygeta’s public Telegram channel, best photos first. Captions are Kab’s own words, verbatim. Dates are when Kab posted (CT); places only where Kab gave one.</p>
      <div class="kab-chips" role="group" aria-label="Filter">
        ${[["all", `All ${all.length}`], ["photo", `Photos ${n((k) => k.kind === "photo")}`], ["uk", `England ${n((k) => /Wiltshire|Hampshire|England|UK|Somerset|Dorset|Devon|Oxfordshire/.test(k.place || ""))}`], ["quartz", `Quartz posts ${n((k) => k.quartz)}`]].map(([f, l]) => `<button type="button" data-kf="${f}" aria-pressed="${f === kabFilter}">${esc(l)}</button>`).join("")}
      </div></header>
      <div class="gallery kab-grid">${list.map((k) => `<article class="card kab-card" tabindex="0" data-kab="${k.id}">
        <div class="card-photo"><img src="${esc(k.images[0][0])}" alt="Crop circle posted by Kab, ${esc(fmtDate(k.posted))}" loading="lazy" width="${k.images[0][1]}" height="${k.images[0][2]}" /></div>
        <div class="card-body"><h2>${esc(k.place || "Place not given")}</h2><p class="card-meta">Posted ${esc(fmtDate(k.posted))}</p>
        <p class="kab-cap">${esc(firstLine(k.caption))}</p>
        <div class="badges">${k.quartz ? '<span class="badge quartz">Quartz claim</span>' : ""}${k.kind !== "photo" ? '<span class="badge still">Video still</span>' : ""}${k.images.length > 1 ? `<span class="badge">${k.images.length} photos</span>` : ""}</div></div></article>`).join("")}</div>
      <section class="kab-quartz"><h2>Kab on quartz</h2><p class="evidence-lede">Every post in Kab’s channel crawl (4,924 messages) that links crop circles to quartz or crystals — Kab’s claims, verbatim.</p>
        ${kab.quartzPosts.map((q) => `<details class="st-other kab-q"><summary><b>${esc(fmtDate(q.posted) || "Date not shown")}</b> \u00b7 ${esc(firstLine(q.caption).slice(0, 90))}…</summary><p class="kab-full">${linkify(q.caption)}</p><a class="st-link" href="${esc(q.url)}" target="_blank" rel="noopener">Open on Telegram \u2197</a>${q.inTab ? ' <span class="st-small">(also in the grid above)</span>' : ""}</details>`).join("")}
      </section>`;
  }
  function openKab(id) {
    const k = kab && kab.items.find((x) => x.id === id);
    if (!k) return;
    const imgs = k.images.map(([u, w, h]) => `<div class="detail-photo-wrap"><img class="detail-photo" src="${esc(u)}" alt="Crop circle posted by Kab" width="${w}" height="${h}" loading="lazy" /></div>`).join("");
    detail.innerHTML = `${imgs}<div class="detail-body">
      <h2 id="detailTitle">${esc(k.place || "Place not given by Kab")}</h2>
      <p class="detail-meta">Posted ${esc(fmtDate(k.posted))} (CT) \u00b7 Kabamur Taygeta, Telegram</p>
      <div class="section"><h3>Kab’s caption (verbatim)</h3><p class="kab-full">${linkify(k.caption)}</p></div>
      <div class="section"><a class="st-watch" href="${esc(k.url)}" target="_blank" rel="noopener">Open the Telegram post \u2197</a>
      ${k.yt ? `<p class="src">Image: still from the YouTube video Kab linked \u2014 <a href="https://www.youtube.com/watch?v=${esc(k.yt)}" target="_blank" rel="noopener">watch on YouTube</a></p>` : k.kind === "still" ? '<p class="src">Image: still from the video in Kab’s post (low resolution).</p>' : '<p class="src">Photo as posted by Kab on Telegram; original photographers are not always named.</p>'}</div></div>`;
    overlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    overlay.scrollTop = 0;
  }
  kabBody.addEventListener("click", (e) => {
    const f = e.target.closest("[data-kf]");
    if (f) { kabFilter = f.dataset.kf; renderKab(); return; }
    const c = e.target.closest("[data-kab]");
    if (c) openKab(+c.dataset.kab);
  });
  kabBody.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const c = e.target.closest("[data-kab]");
    if (c) { e.preventDefault(); openKab(+c.dataset.kab); }
  });

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
    document.getElementById("searchWrap").style.display = isG ? "" : "none";
    countEl.style.display = isG ? "" : "none";
    evidence.classList.toggle("hidden", name !== "evidence");
    hotspotsView.classList.toggle("hidden", name !== "hotspots");
    claimsView.classList.toggle("hidden", name !== "claims");
    ufoView.classList.toggle("hidden", name !== "ufo");
    kabView.classList.toggle("hidden", name !== "kab");
    document.body.classList.toggle("deck-mode", name === "claims");
    if (name === "claims") { window.scrollTo(0, 0); renderClaims(); }
    const ph = placeFilterId && hs.hotspots.find((h) => h.id === placeFilterId);
    placeChip.classList.toggle("hidden", !(isG && ph));
    if (name === "evidence") { renderStory(evBody, "EV"); renderEvidence(); }
    if (name === "hotspots") { renderHotspots(); renderStory(whyHere, "WHY"); }
    if (name === "ufo") renderStory(ufoBody, "UFO");
    if (name === "kab") renderKab();
    [whyHere, ufoBody, evBody].forEach((el) => el.querySelectorAll(".st-chips [data-view]").forEach((b) => b.toggleAttribute("aria-current", b.dataset.view === name)));
    if (history.replaceState) history.replaceState(null, "", "#" + name);
  }

  claimsView.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]") || e.target.id === "slSheet") { closeSheet(); return; }
    const dt = e.target.closest("[data-det]");
    if (dt) { openSheet(+dt.dataset.det); return; }
    const sh = e.target.closest("[data-sheet]");
    if (sh) { openSheet(sh.dataset.sheet); return; }
    const pl = e.target.closest(".pv-play");
    if (pl) {
      const w = pl.parentElement;
      w.dataset.orig = w.innerHTML;
      w.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(pl.dataset.yt)}?autoplay=1&rel=0&playsinline=1" title="${esc(pl.dataset.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
      return;
    }
    if (e.target.closest(".sd")) return;
    const go = e.target.closest("[data-go]");
    if (go) { goSlide(+go.dataset.go); return; }
    const dir = e.target.closest("[data-dir]");
    if (dir) { goSlide(slideIdx + +dir.dataset.dir); return; }
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
      document.getElementById("stReadout").textContent = `${bar.dataset.y}: ${bar.dataset.v} reported (${claimsSeries === "world" ? "worldwide" : "England"})`;
      return;
    }
    const t = e.target.closest(".sl-photo");
    if (t) {
      const item = allData.find((d) => d.id === t.dataset.id);
      if (item) openDetail(item);
      return;
    }
    /* tap the left or right edge of a slide to move */
    const sl = e.target.closest(".slide");
    if (sl && !e.target.closest("a, button")) {
      const r = sl.getBoundingClientRect();
      const fx = (e.clientX - r.left) / r.width;
      if (fx < 0.22) goSlide(slideIdx - 1); else if (fx > 0.78) goSlide(slideIdx + 1);
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
  quartzFilter.addEventListener("change", render);
  [whyHere, ufoBody, evBody].forEach(bindStory);
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
      if (window.CC_EXTRA) window.CC_EXTRA.QUARTZ.tagged.forEach(([id, km, site]) => quartzTag.set(id, { km, site }));
      render();
      if (["#ufo", "#kab"].includes(location.hash)) showView(location.hash.slice(1));
      else if (location.hash === "#evidence") showView("evidence");
      else if (location.hash === "#hotspots") showView("hotspots");
      else if (location.hash === "#claims") showView("claims");
    })
    .catch((err) => {
      gallery.innerHTML = `<p style="padding:1rem;color:#f0a0a0">Failed to load dataset: ${esc(err.message)}</p>`;
    });
})();
