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

  let claimsSeries = "world";
  let slideIdx = 0;
  let slideCount = 0;

  function renderClaims() {
    if (claimsBody.dataset.ready) { sizeDeck(); return; }
    const C = window.CC_CLAIMS;
    if (!C || !C.deck) { claimsBody.innerHTML = '<p class="map-off">Claims content unavailable.</p>'; return; }
    const K = C.deck, T = C.timing;
    const SR = window.CC_SOURCES || {};
    const tag = (t) => t === "c" ? '<span class="sl-tag c">Claimed man-made</span>' : t === "u" ? '<span class="sl-tag u">Reported unexplained</span>' : t ? `<span class="sl-tag m">${esc(t)}</span>` : "";
    const src = (keys) => {
      const ks = [...new Set(keys)].filter((k) => SR[k]);
      if (!ks.length) return "";
      return `<p class="sl-src">Source: ${ks.map((k) => `<a href="${esc(SR[k][1])}" target="_blank" rel="noopener">${esc(SR[k][0])}</a>`).join(" \u00b7 ")}</p>`;
    };
    const slide = (cls, inner, foot) => `<section class="slide ${cls}" aria-roledescription="slide"><div class="sl-in">${inner}</div>${foot || ""}</section>`;
    const item = (id) => allData.find((d) => d.id === id);
    const photoBtn = (d, alt) => d ? `<button type="button" class="sl-photo" data-id="${esc(d.id)}" aria-label="Open ${esc(d.name)}"><img src="${esc(d.imageUrl)}" alt="${esc(alt || d.name)}" loading="lazy" /></button>` : "";
    const S = [];

    /* 1 title */
    S.push(slide("sl-title", `<div class="sl-ring big" aria-hidden="true"><span></span></div>
      <h3 class="sl-h">${esc(K.title.head)}</h3><p class="sl-line">${esc(K.title.line)}</p>
      <button type="button" class="sl-go" data-go="1">${esc(K.title.hint)}</button>`));

    /* 2-3 claimants */
    [K.doug, K.cm].forEach((d) => S.push(slide("", `${tag(d.tag)}<h3 class="sl-h">${esc(d.head)}</h3>
      <div class="sl-big"><b>${esc(d.big)}</b><span>${esc(d.bigSub)}</span></div>
      <p class="sl-line">${esc(d.line)}</p>`, src(d.src))));

    /* 4 simple vs complex */
    const mh = item("2001-08-12-milk-hill-galaxy-spiral");
    S.push(slide("", `<h3 class="sl-h">${esc(K.simple.head)}</h3>
      <div class="sl-split">
        <figure>${tag("c")}<div class="sl-tile"><div class="sl-ring" aria-hidden="true"><span></span></div></div><figcaption>Doug &amp; Dave’s ring</figcaption></figure>
        <figure>${tag("u")}<div class="sl-tile">${photoBtn(mh, "Milk Hill 2001, aerial")}</div><figcaption>Milk Hill, 2001</figcaption></figure>
      </div>
      <p class="sl-line">${esc(K.simple.line)}</p>`, src(K.simple.src)));

    /* 5 nodes */
    S.push(slide("", `${tag("u")}<h3 class="sl-h">${esc(K.nodes.head)}</h3>
      <div class="sl-media"><img src="${esc(K.nodes.img)}" alt="${esc(K.nodes.alt)}" loading="lazy" /></div>
      <p class="sl-line">${esc(K.nodes.line)}</p><p class="sl-note">${esc(K.nodes.note)}</p>`, src(K.nodes.src)));

    /* 6 time */
    S.push(slide("", `<h3 class="sl-h">${esc(K.time.head)}</h3>
      <div class="sl-vs">
        <div class="sl-stat c"><b>${esc(K.time.a.big)}</b><span>${esc(K.time.a.small)}</span></div>
        <div class="sl-stat u"><b>${esc(K.time.b.big)}</b><span>${esc(K.time.b.small)}</span></div>
      </div>
      <p class="sl-line">${esc(K.time.line)}</p>`, src(K.time.src)));

    /* 7 longest */
    const row = (b, i) => `<li>${i != null ? `<i>${i + 1}</i>` : ""}<div><b>${esc(b.name)}</b><span>${esc(b.year)} \u00b7 ${esc(b.time)}</span></div></li>`;
    const top = K.longest.topIds.map((n) => T.builds.find((b) => b.name === n)).filter(Boolean);
    S.push(slide("", `${tag("c")}<h3 class="sl-h">${esc(K.longest.head)}</h3>
      <ol class="sl-top">${top.map((b, i) => row(b, i)).join("")}</ol>
      <button type="button" class="sl-more" data-all="1">See all ${T.builds.length} builds</button>
      <div class="sl-all hidden" id="slAll"><div class="sl-all-head"><b>All reported build times</b><button type="button" class="sl-x" data-all="0" aria-label="Close">\u00d7</button></div>
        <ul>${T.builds.map((b) => `<li><b>${esc(b.name)}</b><span>${esc(b.year)} \u00b7 ${esc(b.time)}${/not stated/i.test(b.light) ? "" : " \u00b7 " + esc(b.light.toLowerCase())}</span><small>${srcLinks(b.src.slice(0, 1))}</small></li>`).join("")}</ul></div>`,
      src(top.flatMap((b) => b.src.slice(0, 1)))));

    /* mess-ups */
    const n = K.messups.length;
    K.messups.forEach((m, i) => {
      const d = m.id ? item(m.id) : null;
      const vis = m.big ? `<div class="sl-big"><b>${esc(m.big)}</b><span>${esc(m.bigSub)}</span></div><p class="sl-note">${esc(m.noPhoto)}</p>`
        : d ? `<div class="sl-media">${photoBtn(d, m.place + " " + m.date)}</div>`
        : `<a class="sl-media" href="${esc(m.link)}" target="_blank" rel="noopener"><img src="${esc(m.img)}" alt="${esc(m.alt)}" loading="lazy" referrerpolicy="no-referrer" /></a>`;
      S.push(slide("sl-mess", `${tag(`Mess-up ${i + 1} of ${n}`)}<h3 class="sl-h">${esc(m.head)}</h3>
        <p class="sl-place">${esc(m.place)} \u00b7 ${esc(m.date)}</p>
        ${vis}${m.credit ? `<p class="sl-credit">${esc(m.credit)}</p>` : ""}
        <blockquote class="sl-q"><p>${esc(m.quote)}</p><cite>\u2014 ${esc(m.who)}</cite></blockquote>`, src(m.src)));
    });

    /* counterpoint */
    const bc = item(K.counter.id);
    S.push(slide("", `${tag("Counterpoint")}<h3 class="sl-h">${esc(K.counter.head)}</h3>
      <div class="sl-media">${photoBtn(bc, "Barbury Castle 2008, aerial")}</div>
      <blockquote class="sl-q"><p>${esc(K.counter.quote)}</p><cite>\u2014 ${esc(K.counter.who)}</cite></blockquote>`, src(K.counter.src)));

    /* years */
    const BY = C.byYear;
    S.push(slide("", `<h3 class="sl-h">${esc(K.years.head)}</h3>
      <div class="st-seg" role="group" aria-label="Count">${BY.series.map((sr) => `<button type="button" data-series="${sr.key}" aria-pressed="${sr.key === claimsSeries}">${sr.key === "world" ? "Worldwide" : "England"}</button>`).join("")}</div>
      <div class="st-chart" id="stChart"></div>
      <p class="st-readout" id="stReadout"></p>
      <p class="sl-line">${esc(K.years.line)}</p>`, `<p class="sl-src" id="stSrc"></p>`));

    /* close */
    S.push(slide("sl-title", `<div class="sl-ring big" aria-hidden="true"><span></span></div>
      <h3 class="sl-h">${esc(K.close.head)}</h3><p class="sl-line">${esc(K.close.line)}</p>
      <button type="button" class="sl-go" data-go="0">\u21ba ${esc(K.close.again)}</button>`));

    slideCount = S.length;
    claimsBody.innerHTML = `<div class="deck" id="deck" aria-roledescription="carousel" aria-label="Who made them? slides" tabindex="0">
        <div class="deck-track" id="deckTrack">${S.join("")}</div>
        <div class="deck-bar">
          <button type="button" class="deck-arrow" data-dir="-1" aria-label="Previous slide">\u2039</button>
          <div class="deck-dots" role="tablist">${S.map((_, i) => `<button type="button" role="tab" data-go="${i}" aria-label="Slide ${i + 1} of ${S.length}"></button>`).join("")}</div>
          <button type="button" class="deck-arrow" data-dir="1" aria-label="Next slide">\u203a</button>
        </div>
      </div>`;
    claimsBody.dataset.ready = "1";
    drawYearChart();
    bindDeck();
    sizeDeck();
    goSlide(slideIdx, true);
  }

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
    claimsView.querySelectorAll(".deck-dots button").forEach((b, k) => b.setAttribute("aria-selected", String(k === slideIdx)));
    claimsView.querySelectorAll('[data-dir="-1"]').forEach((b) => { b.disabled = slideIdx === 0; });
    claimsView.querySelectorAll('[data-dir="1"]').forEach((b) => { b.disabled = slideIdx === slideCount - 1; });
    const all = document.getElementById("slAll");
    if (all) all.classList.add("hidden");
  }

  function bindDeck() {
    const deck = document.getElementById("deck");
    const track = document.getElementById("deckTrack");
    let x0 = null, y0 = 0, dx = 0, horiz = null;
    deck.addEventListener("touchstart", (e) => {
      if (e.target.closest(".sl-all, .st-chart")) { x0 = null; return; }
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
    deck.addEventListener("keydown", (e) => {
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
    document.body.classList.toggle("deck-mode", name === "claims");
    if (name === "claims") { window.scrollTo(0, 0); renderClaims(); }
    const ph = placeFilterId && hs.hotspots.find((h) => h.id === placeFilterId);
    placeChip.classList.toggle("hidden", !(isG && ph));
    if (name === "evidence") { renderOrbCard(); renderEvidence(); }
    if (name === "hotspots") renderHotspots();
    if (history.replaceState) history.replaceState(null, "", "#" + name);
  }

  claimsView.addEventListener("click", (e) => {
    const all = e.target.closest("[data-all]");
    if (all) { document.getElementById("slAll").classList.toggle("hidden", all.dataset.all === "0"); return; }
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
    if (sl && !e.target.closest("a, button, .sl-all")) {
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
