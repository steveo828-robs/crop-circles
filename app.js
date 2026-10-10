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
  let slideMeta = [];
  let slideDet = [];

  const PF = { y: "Proof shown", p: "Partial proof", n: "No proof shown — claim only" };
  function pfBadge(s, extra) { return `<span class="pf pf-${s}">${esc(PF[s])}${extra ? ` <em>${esc(extra)}</em>` : ""}</span>`; }

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

    /* ——— Intro ——— */
    add({ ch: "Start", cls: "sl-title", top: '<div class="sl-ring big" aria-hidden="true"><span></span></div>', head: K.title.head,
      body: line("People who said they made crop circles, whether they showed proof, and what others say back. This app doesn’t decide who is right.") + `<button type="button" class="sl-go" data-go="1">${esc(K.title.hint)}</button>` });
    add({ ch: "Start", head: "In this deck", body: `<div class="sl-toc" id="slToc"></div>` });
    add({ ch: "Start", head: "How to read the badges",
      body: `<ul class="sl-legend">
        <li>${pfBadge("y")}<span>Someone other than the claimant saw, filmed, judged or documented it.</span></li>
        <li>${pfBadge("p")}<span>Some proof, but of something smaller — e.g. a simple demo, not the formations claimed.</span></li>
        <li>${pfBadge("n")}<span>They said it; no footage, witness or paperwork was published.</span></li>
        <li><span class="sl-tag c">Claimed man-made</span><span>Someone said they made it.</span></li>
        <li><span class="sl-tag u">Reported unexplained</span><span>Researchers presented it as unexplained.</span></li></ul>`,
      det: `<p class="sd-p">${esc(C.proofIntro)}</p>` });

    /* ——— Doug & Dave ——— */
    const dd = pr(C.proof[0].what);
    add({ ch: "Doug & Dave", top: tag("c") + pfBadge("p"), head: "Doug & Dave", body: big("1978", "the year Bower said their first circle was made") +
      line("Two men from Southampton went public in Today on 9 September 1991.") + note(dd.how),
      src: ["today91", "time91"], det: detList(D[0].points) + `<h5 class="sd-h">The other side</h5>` + detList(D[0].counter) + `<h5 class="sd-h">Proof status</h5><p class="sd-p">${esc(dd.how)}</p>`, detKeys: dd.src });
    add({ ch: "Doug & Dave", head: "What they said they used", body: bul([
        "“4ft wooden plinths, with rope reins, a ball of string and an old baseball cap”",
        "Wire threaded through the cap’s visor as a sighting loop",
        "Bower: the first was made “with the iron bar I used to secure the back door of my shop… on our hands and knees”",
        "Today says it questioned them for seven days at their homes"]),
      src: ["today91"], det: detList(D[0].points.slice(0, 4)) });
    const ch = pr("First circles, Cheesefoot Head ‘punchbowl’");
    add({ ch: "Doug & Dave", top: pfBadge("n"), head: "When did they start?", body: vs({ big: "1978", small: "Bower, in Today (1991)" }, { big: "1976", small: "Smithsonian; Circlemakers (Longwood Estate, “about 30 feet across”)", c: "c" }) +
      line("The Croppie notes the start date varies between accounts: 1975, 1976 or 1978.") + note("Early circles: their own account only. " + "No footage or outside witness cited."),
      src: ["today91", "smithsonian", "cmNews", "croppie"], det: detList([D[0].points[1], D[0].points[2], D[0].counter[1]]) + `<h5 class="sd-h">Proof status</h5><p class="sd-p">${esc(ch.how)}</p>` });
    add({ ch: "Doug & Dave", top: pfBadge("y", "demo only"), head: "The Delgado episode",
      body: quote("“No human could have done this.”", "Pat Delgado, after inspecting their demo circle near Sevenoaks, Kent") +
      line("Today journalists had watched the pair make it “step by step” hours earlier.") + note("A simple design they said they’d used “four or five times” that summer — not one of the complex formations."),
      src: ["today91"], det: detList([D[0].points[5]]) + `<p class="sd-p">${esc(pr("Demonstration circle near Sevenoaks, Kent").how)}</p>` + detList([MI.errors[6]]) });
    add({ ch: "Doug & Dave", head: "Their count vs the total", body: vs({ big: "25–30", small: "new circles a season, they said (Time, 1991)" }, { big: "≈ 800", small: "the annual count by 1991 (Rupert Sheldrake)", c: "n" }) +
      quote("“…a maximum of 30 formations a year”", "Rupert Sheldrake, even if their claims were believed"),
      src: ["time91", "sheldrake"], det: detList([D[0].points[4], D[0].counter[0]]) });

    /* ——— Circlemakers ——— */
    add({ ch: "Circlemakers", top: tag("c") + pfBadge("y", "for named commissions"), head: "Circlemakers",
      body: big("1995", "website started by John Lundberg, Rod Dickinson & Geoff Gilbertson") + line("Members named include John Lundberg, Rod Dickinson, Wil Russell and Rob Irving. They make formations for adverts, TV and bands."),
      src: ["cmAbout", "cmWork"], det: detList(D[1].points) });
    add({ ch: "Circlemakers", head: "Their tools", body: bul([
        "Stalk-stompers, 4 ft and 6 ft",
        "Pre-stretched nylon string and a 2 ft marking pole",
        "100 ft surveying tape and an OS map",
        "Optional: an infrared image intensifier"]) +
      quote("“All we had were sketches, 100ft-long tape measures… and 4ft planks with a rope connecting each end.”", "John Vidal, The Guardian, watching a team of four at night"),
      src: ["cmTools", "vidal"], det: detList([D[1].points[1], D[1].points[3]]) });
    add({ ch: "Circlemakers", top: pfBadge("y"), head: "Paid work", body: bul([
        "Adverts: Mitsubishi (1998), Mountain Dew (2000), Weetabix (2002), Nike Italy (2005)",
        "TV: BBC Country File, HTV West, History Channel, National Geographic (2004, 2009), BBC’s QI",
        "Campaigns: Greenpeace Mexico, The Sun’s Olympic rings, Tesco Mobile emojis (2015)",
        "Music: The Levellers (2002), Korn (2010)"]) + note("The proof table covers the 15 with published build details."),
      src: ["cmWork", "cmNews"], det: detList([D[1].points[2]]) + `<p class="sd-p">${esc(C.proofNote)}</p>` });
    add({ ch: "Circlemakers", head: "What they don’t claim", body: quote("“…careful never to admit responsibility for any specific formation”", "John Vidal, The Guardian, on crop-circle makers") +
      line("We found no formation in this gallery publicly claimed by the Circlemakers.") + note("Barbury Castle 2008: the Daily Mail reported “no one has claimed responsibility”."),
      src: ["vidal", "mail08"], det: detList([D[1].points[4]]) + `<p class="sd-p">${esc(D[1].note)}</p>` });

    /* ——— 1992 contest ——— */
    const c92 = pr("1992 crop-circle-making competition entries");
    add({ ch: "1992 contest", top: tag("c") + pfBadge("y"), head: "The 1992 contest", body: vs({ big: "12 teams", small: "one set design, plots marked out by the organisers" }, { big: "10 pm–3 am", small: "in darkness — up to 5 hours", c: "n" }) +
      line("West Wycombe, 11 July 1992. Winners: three Westland Helicopters engineers, £3,000."),
      src: ["sheldrake"], det: detList([D[2].points[0]]) + `<h5 class="sd-h">Proof status</h5><p class="sd-p">${esc(c92.how)}</p>` });
    add({ ch: "1992 contest", head: "How it was run", body: bul([
        "Plots marked out by the organisers, allocated at random",
        "Invigilators with night-vision binoculars; points for not being seen",
        "Five judges, plus aerial photos at dawn",
        "The winners made it again in daylight, before the public and TV crews"]),
      src: ["sheldrake"], det: `<p class="sd-p">${esc(c92.how)}</p>` });
    const g92 = G.items[0];
    add({ ch: "1992 contest", head: "What happened", body: bul([
        "11 of 12 teams “made more or less impressive formations that followed the set design”",
        "One team (Matt Ridley’s) made a question mark instead",
        "Doug & Dave were invited, and declined",
        "Design notice: the text says three weeks ahead; a photo caption says 24 hours"]) +
      `<a class="sl-link" href="${esc(g92.link)}" target="_blank" rel="noopener">Aerial photo of the entries (John Macnish) \u2197</a>`,
      src: ["sheldrake"], det: `<p class="sd-p">${esc(G.noPhotoNote)}</p>` + detList([D[2].points[0]]) + `<p class="sd-p">${esc(T.builds.find((b) => b.name === "1992 making competition").note)}</p>` });

    /* ——— Other claims ——— */
    const jl = pr("Julia Set, near Stonehenge");
    add({ ch: "Other claims", top: tag("c") + pfBadge("n"), head: "Julia Set, 1996",
      body: quote("“…made the previous night, by three people, in about two and three-quarters hours”", "Rod Dickinson, to researcher Michael Lindemann") +
      line("The makers were not named.") + note("Radford: “there exists no photographs or video of it being made.”"),
      src: ["si22"], det: detList([D[2].points[1]]) + `<h5 class="sd-h">Proof status</h5><p class="sd-p">${esc(jl.how)}</p>` });
    const an = pr("Ansty — Mothership Glass commission");
    add({ ch: "Other claims", top: tag("c") + pfBadge("n"), head: "Ansty, 2016", body: big("3 days", "reported build time, with the field owners’ agreement") +
      line("Colin Andrews reported it was a paid commission for Mothership Glass.") + note("Andrews says the makers’ names are “known to me” — none published."),
      src: ["ansty16"], det: `<p class="sd-p">${esc(an.how)}</p><p class="sd-p">${esc(T.builds.find((b) => b.name === "Mothership Glass (reported)").note)}</p>` });
    add({ ch: "Other claims", top: tag("c") + pfBadge("y", "client on record"), head: "LEGO, 2024", body: big("3 days", "“three full days” — Clare Basire, Thrive PR") +
      line("A 50 m design based on a LEGO Minifigure at Narromine, NSW, for LEGO’s space range."),
      src: ["lego24"], det: `<p class="sd-p">${esc(pr("LEGO Space, Narromine NSW").how)}</p><p class="sd-p">${esc(T.builds.find((b) => b.name === "LEGO Australia").note)}</p>` });
    const sar = G.items.find((g) => g.img);
    add({ ch: "Other claims", top: tag("c") + pfBadge("y", "video"), head: "Sarraltroff, 2018",
      body: `<div class="sl-media"><img src="${esc(sar.img)}" alt="${esc(sar.imgAlt)}" loading="lazy" /></div><p class="sl-credit">${esc(sar.imgKind)} \u00b7 Wizly-08, CC BY-SA 4.0</p>` +
      line("French YouTubers made it at night in “under two hours” and posted video of it."),
      src: ["fi18", "rl18", "commonsSarr"], det: `<p class="sd-p">${esc(sar.who)}</p><p class="sd-p">${esc(pr("Sarraltroff, Moselle test formation").how)}</p>` });
    add({ ch: "Other claims", head: "A researcher’s estimate", body: big("80%", "man-made, in Colin Andrews’ view (BBC News, 2000)") +
      line("He put about 20% down to eddies in the earth’s magnetic field."), src: ["bbc2000"], det: detList([D[2].points[2]]) });

    /* ——— Claimed formations ——— */
    const tile = (g) => {
      const p = pr(g.proof);
      return `<li class="sl-gt">${g.img ? `<img src="${esc(g.img)}" alt="${esc(g.imgAlt)}" loading="lazy" />` : ""}
        <b>${esc(g.title)}</b><span>${esc(g.date)}</span>${p ? pfBadge(p.s) : ""}
        ${g.link ? `<a href="${esc(g.link)}" target="_blank" rel="noopener">Photos \u2197</a>` : `<small>${esc(g.imgKind || "")}</small>`}</li>`;
    };
    const gi = G.items;
    [[0, 4], [4, 8], [8, 11]].forEach(([a, b], k) => add({ ch: "Claimed formations", top: tag("c"), head: `Formations people said they made (${k + 1}/3)`, cls: "sl-gal",
      body: `<ul class="sl-grid">${gi.slice(a, b).map(tile).join("")}</ul>` + (k === 2 ? note("No openly licensed photos of the 1992 entries or Circlemakers’ commissions — tiles link to them.") : ""),
      src: gi.slice(a, b).flatMap((g) => g.src), det: `<ul class="sd-list">${gi.slice(a, b).map((g) => `<li><p><b>${esc(g.title)}</b> (${esc(g.date)}, ${esc(g.where)}) — ${esc(g.who)}</p><p class="sd-src">${srcLinks(g.src)}</p></li>`).join("")}</ul><p class="sd-p">${esc(G.noPhotoNote)}</p>` }));

    /* ——— Simple vs complex ——— */
    const mh = item("2001-08-12-milk-hill-galaxy-spiral");
    add({ ch: "Simple vs complex", head: K.simple.head, body: `<div class="sl-split">
        <figure>${tag("c")}<div class="sl-tile"><div class="sl-ring" aria-hidden="true"><span></span></div></div><figcaption>Doug &amp; Dave’s ring</figcaption></figure>
        <figure>${tag("u")}<div class="sl-tile">${photoBtn(mh, "Milk Hill 2001, aerial")}</div><figcaption>Milk Hill, 2001</figcaption></figure></div>` + line(K.simple.line),
      src: K.simple.src, det: `<p class="sd-p">Doug &amp; Dave’s “hallmark”: ${esc(C.compare.tiles[0].text)}</p><p class="sd-p">${esc(C.compare.tiles[1].text)} Photo: ${esc(mh ? mh.photoCredit : "")}</p>` });
    const bc = item("2008-06-01-barbury-castle-pi");
    add({ ch: "Simple vs complex", top: tag("u"), head: "Barbury Castle π, 2008", body: `<div class="sl-media">${photoBtn(bc, "Barbury Castle 2008, aerial")}</div>` +
      line("Pi to 10 digits in a 150 ft design. No one claimed it.") + note("Rain the night before, but no mud inside — Lucy Pringle."),
      src: ["plus08", "mail08"], det: detList(T.rows[2].build.concat(T.rows[2].window)) + `<p class="sd-p">${esc(C.compare.tiles[2].text)}</p>` });

    /* ——— Up close ——— */
    add({ ch: "Up close", top: tag("u"), head: K.nodes.head, body: `<div class="sl-media"><img src="${esc(K.nodes.img)}" alt="${esc(K.nodes.alt)}" loading="lazy" /></div>` + line(K.nodes.line) + note(K.nodes.note),
      src: K.nodes.src, det: `<p class="sd-p">${esc(LY.reported[0].text)}</p>` });
    add({ ch: "Up close", top: tag("u"), head: "What BLT Research reports", body: bul([
        "Longer, bent nodes (usually 45–90°) and ‘expulsion cavities’ vs control plants",
        "Their own plank-flattened test circles: nodes ~10% longer after 3 days — vs “30 to an over 200% increase” in formations",
        "Expulsion cavities “never been observed in literally thousands of control plants”",
        "Planks or feet on canola “will snap or break the plant stems” — not yet “scientifically evaluated”"]),
      src: ["blt", "lev94", "lev99"], det: detList(CP.plants.slice(0, 4)) });
    add({ ch: "Up close", head: "The other side", body: bul([
        "Grassi, Cocheo & Russo (CICAP): longer nodes are what “we should expect when whatever kind of mechanical force flattens the plants, rope and wood plank included”",
        "Joe Nickell: wheat is green and pliable mid-May to August, so pressed stalks need not break",
        "ICCRA: a formation they judged mechanically made had broken stalks, creases — and no node elongation"]),
      src: ["grassi", "csicop", "iccra"], det: detList(CP.plantCounter.concat([CP.plants[4]])) });
    add({ ch: "Up close", head: "Side by side", body: `<div class="sl-split">
        <figure>${tag("c")}<div class="sl-tile sl-empty"><span>No licensed close-up of a claimed formation’s crop found</span></div><figcaption>Claimed man-made</figcaption></figure>
        <figure>${tag("u")}<div class="sl-tile"><img src="${esc(LY.reported[1].img)}" alt="Node length comparison, BLT Research" loading="lazy" /></div><figcaption>BLT sample vs control</figcaption></figure></div>` +
      line("BLT’s caption: “172% mean node length increase” at the node below the seed-head."),
      src: ["blt", "lev99"], det: `<h5 class="sd-h">Claimed man-made: where to look</h5>` + detList(LY.claimed) + `<h5 class="sd-h">Reported by BLT</h5><ul class="sd-list">${LY.reported.map((r) => `<li><p>${esc(r.text)}</p><p class="sd-src">${srcLinks(r.src)}</p></li>`).join("")}</ul>` + detList([LY.counterNote]) });

    /* ——— Build time ——— */
    add({ ch: "Build time", head: K.time.head, body: vs(K.time.a, K.time.b) + line("Paid builds were done with permission, often in daylight or over several sessions — so the makers didn’t need to stay hidden."),
      src: K.time.src, det: `<p class="sd-p">${esc(T.lead.text)}</p><p class="sd-p">${esc(T.note)}</p>`, detKeys: T.lead.src });
    const row = (b, i) => `<li><i>${i + 1}</i><div><b>${esc(b.name)}</b><span>${esc(b.year)} \u00b7 ${esc(b.time)}</span></div></li>`;
    const top = K.longest.topIds.map((n) => T.builds.find((b) => b.name === n)).filter(Boolean);
    const bProof = (b) => C.proof.find((r) => r.build && r.build.split("|")[0] === b.name && (!r.build.split("|")[1] || r.build.split("|")[1] === b.year));
    add({ ch: "Build time", top: tag("c"), head: K.longest.head, body: `<ol class="sl-top">${top.map((b, i) => { const p = bProof(b); return row(b, i).replace("</span></div>", `</span>${p ? pfBadge(p.s) : ""}</div>`); }).join("")}</ol>` +
      `<button type="button" class="sl-more" data-sheet="builds">See all ${T.builds.length} builds</button>`,
      src: top.flatMap((b) => b.src.slice(0, 1)) });
    const jr = T.rows[0], mr = T.rows[1];
    add({ ch: "Build time", top: pfBadge("n"), head: "Julia Set: claim vs window", body: vs({ big: "≈ 2¾ h", small: "claimed, 3 people, from about 2:45 am" }, { big: "45 min", small: "window “in full daylight” — Colin Andrews" }) +
      line("Taken at face value, the claimed build ends around 5:30 am — after that day’s 5:01 am sunrise."),
      src: ["si22", "andrewsJulia", "tadSalisbury"], det: detList(jr.build.concat(jr.window)) });
    add({ ch: "Build time", top: tag("u"), head: "Milk Hill: 409 circles", body: big("≈ 30 s", "per circle — Circlemakers’ figure, for about four hours") +
      quote("“…not even allowing any time for the surveying”", "Circlemakers, on Milk Hill (unclaimed)") + note("John Vidal’s guess: about 6 people, about 5 hours."),
      src: ["cmTotc01", "vidal"], det: detList(mr.build) });
    add({ ch: "Build time", top: tag("u"), head: "Milk Hill: the night", body: bul([
        "Full night 11:06 pm–3:18 am (4 h 12 m); civil darkness 7 h 54 m",
        "Heavy rain, but “no evidence of any mud on the stems” — Stuart Dike",
        "John Hunt camped there: “I do not believe that the large formation was there” — though he “would not like to swear” to it"]),
      src: ["tadSwindon", "ccc01"], det: detList(mr.window) });

    /* ——— Mess-ups ——— */
    add({ ch: "Mess-ups", head: "Where are the mistakes?", body: bul([
        "Enigma #21: 2000 was “the year that we started to see numerous errors in construction”",
        "John Vidal on Milk Hill 2001: “quite well made - though there is evidence of sloppiness”",
        "ICCRA, Wisconsin 2005: serrated edges, broken stalks, footprints, post holes",
        "Rod Dickinson: the Julia Set’s central circle, “a little out of place”, was a work area"]) + note("Next: six mess-ups, one per slide."),
      src: ["enigma21", "vidal", "iccra", "si22"], det: detList(MI.errors) });
    const n = K.messups.length;
    K.messups.forEach((m, i) => {
      const d = m.id ? item(m.id) : null;
      const vis = m.big ? big(m.big, m.bigSub) + note(m.noPhoto)
        : d ? `<div class="sl-media">${photoBtn(d, m.place + " " + m.date)}</div>`
        : ext(m.img, m.alt, m.link);
      const isWO = /West Overton/.test(m.place);
      add({ ch: "Mess-ups", cls: "sl-mess", top: tag(`Mess-up ${i + 1} of ${n}`) + (isWO ? pfBadge("y", "court") : ""), head: m.head,
        body: `<p class="sl-place">${esc(m.place)} \u00b7 ${esc(m.date)}</p>${vis}${m.credit ? `<p class="sl-credit">${esc(m.credit)}</p>` : ""}` + quote(m.quote, m.who),
        src: m.src, det: isWO ? `<p class="sd-p">${esc(pr("Seven-pointed star, West Overton").how)}</p>` : "" });
    });

    /* ——— Other side ——— */
    const bc2 = item(K.counter.id);
    add({ ch: "The other side", top: tag("Counterpoint"), head: "Praised as precise", body: `<div class="sl-media">${photoBtn(bc2, "Barbury Castle 2008, aerial")}</div>` + quote(K.counter.quote, K.counter.who),
      src: K.counter.src, det: detList(MI.noErrors) });
    add({ ch: "The other side", head: "No mess-ups, they say", body: bul([
        "Colin Andrews on the Julia Set: “awe inspiring, not only in symmetry and precision”",
        "Astrophysicist Mike Reed on Barbury Castle: “The tenth digit has even been correctly rounded up.”",
        "Stuart Dike on Milk Hill: no mud on the stems after heavy rain",
        "Researchers argue stalks are bent, not broken, with no footprints (as summarised by CSICOP)"]),
      src: ["andrewsJulia", "mail08", "ccc01", "csicop"], det: detList(MI.noErrors) });

    /* ——— Proof ——— */
    const cnt = { y: 0, p: 0, n: 0 };
    C.proof.forEach((r) => cnt[r.s]++);
    add({ ch: "Proof", head: "Claims with proof vs claim only", body: `<div class="sl-pfcount">
        <div class="pfc y"><b>${cnt.y}</b><span>Proof shown</span></div>
        <div class="pfc p"><b>${cnt.p}</b><span>Partial</span></div>
        <div class="pfc n"><b>${cnt.n}</b><span>Claim only</span></div></div>` +
      line(`${C.proof.length} claims in this app. ${C.proofIntro}`) + `<button type="button" class="sl-more" data-sheet="proof">See all ${C.proof.length} with sources</button>`,
      det: `<p class="sd-p">${esc(C.proofNote)}</p>`, detKeys: ["vidal"] });
    const weak = C.proof.filter((r) => r.s !== "y");
    add({ ch: "Proof", head: "Claim only or partial", body: `<ul class="sl-pfl">${weak.map((r) => `<li>${pfBadge(r.s)}<b>${esc(r.what)}</b><span>${esc(r.who)} \u00b7 ${esc(r.year)}</span></li>`).join("")}</ul>`,
      src: weak.flatMap((r) => r.src), det: `<ul class="sd-list">${weak.map((r) => `<li><p><b>${esc(r.what)}</b> — ${esc(r.how)}</p><p class="sd-src">${srcLinks(r.src)}</p></li>`).join("")}</ul>` });
    const strong = [
      ["Doug & Dave’s 1991 demo circle", "press watched it made"],
      ["BBC Country File demo", "filmed by the BBC"],
      ["1992 contest entries", "invigilators, judges, photos"],
      ["West Overton star, 2000", "guilty plea in court"],
      ["Sarraltroff, 2018", "makers’ own video"],
      ["LEGO, 2024", "client’s PR agency on record"],
      [`${C.proof.filter((r) => r.who === "Circlemakers").length} Circlemakers commissions`, "clients, adverts, TV"]];
    add({ ch: "Proof", top: pfBadge("y"), head: "Claims with proof shown", body: `<ul class="sl-pfl compact">${strong.map(([a, b]) => `<li><b>${esc(a)}</b><span>${esc(b)}</span></li>`).join("")}</ul>` + note("Proof covers only the formation named."),
      src: ["today91", "cmBeeb", "sheldrake"], det: `<ul class="sd-list">${C.proof.filter((r) => r.s === "y").map((r) => `<li><p><b>${esc(r.what)}</b> (${esc(r.year)}) — ${esc(r.how)}</p><p class="sd-src">${srcLinks(r.src)}</p></li>`).join("")}</ul><p class="sd-p">${esc(C.proofNote)}</p>` });

    /* ——— Each year ——— */
    add({ ch: "Each year", head: K.years.head, body: `<div class="st-seg" role="group" aria-label="Count">${BY.series.map((sr) => `<button type="button" data-series="${sr.key}" aria-pressed="${sr.key === claimsSeries}">${sr.key === "world" ? "Worldwide" : "England"}</button>`).join("")}</div>
      <div class="st-chart" id="stChart"></div><p class="st-readout" id="stReadout"></p>` + line(K.years.line),
      src: BY.series.flatMap((s) => s.src), det: `<p class="sd-p">${esc(BY.intro)}</p><p class="sd-p">${esc(BY.chartNote.replace(/ The right-hand number.*$/, ""))}</p>` + BY.series.map((s) => `<p class="sd-p">${esc(s.label)}</p>`).join("") });
    add({ ch: "Each year", head: "Other published totals", body: bul([
        "1980–83: 3, 3, 5 and 22 circles in Britain; 1987–89: 73, 113 and “over 250” — Terence Meaden",
        "1990: “700 circles in Britain” — Jenny Randles",
        "1991: about 800 — Rupert Sheldrake"]) + note("These count individual circles, not whole formations."),
      src: ["si92", "sheldrake"], det: detList(BY.points.slice(0, 3)) });
    add({ ch: "Each year", head: "Other totals, UK", body: bul([
        "204 UK formations in 1992; a peak of 148 in 1999 — Paul Vigay",
        "“around the 100 per year mark” for 1996–2003 — Vigay",
        "Now “an average of 30” a year in the UK, ~80% in Wiltshire — BBC Travel, 2021",
        "For scale: Doug & Dave said 25 to 30 a season (Time, 1991)"]),
      src: ["vigayDist", "bbc21", "time91"], det: detList(BY.points.slice(3)) });

    /* ——— End ——— */
    add({ ch: "End", cls: "sl-title", top: '<div class="sl-ring big" aria-hidden="true"><span></span></div>', head: K.close.head,
      body: line("Every slide names who said what — and whether they showed proof. Tap “Details” or “Source” to check.") + `<button type="button" class="sl-go" data-go="0">\u21ba ${esc(K.close.again)}</button>` });

    slideCount = S.length;
    const sheetBuilds = `<ul class="sd-list">${T.builds.map((b) => { const p = bProof(b); return `<li><p><b>${esc(b.name)}</b> \u00b7 ${esc(b.year)} \u00b7 ${esc(b.where)}</p>
        <p class="sd-row">${p ? pfBadge(p.s) : ""}</p>
        <dl class="sd-dl"><dt>Time</dt><dd>${esc(b.time)}</dd><dt>Team</dt><dd>${esc(b.team)}</dd><dt>Size</dt><dd>${esc(b.size)}</dd><dt>Light</dt><dd>${esc(b.light)}</dd>${p ? `<dt>Proof</dt><dd>${esc(p.how)}</dd>` : ""}</dl>
        <p class="sd-p">${esc(b.note)}</p><p class="sd-src">${srcLinks(b.src)}</p></li>`; }).join("")}</ul><p class="sd-p">${esc(T.note)}</p>`;
    const sheetProof = `<p class="sd-p">${esc(C.proofIntro)}</p><ul class="sd-list">${C.proof.map((r) => `<li><p class="sd-row">${pfBadge(r.s)}</p><p><b>${esc(r.what)}</b> (${esc(r.year)}) — ${esc(r.who)}</p><p class="sd-p">${esc(r.how)}</p><p class="sd-src">${srcLinks(r.src)}</p></li>`).join("")}</ul><p class="sd-p">${esc(C.proofNote)}</p>`;
    slideDet.builds = { title: `All ${T.builds.length} reported build times`, html: sheetBuilds };
    slideDet.proof = { title: "Proof status — all claims", html: sheetProof };

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
    document.getElementById("slToc").outerHTML = `<ol class="sl-toc">${chapters.slice(1, -1).map((c) => `<li><button type="button" data-go="${c.start}">${esc(c.name)}</button></li>`).join("")}</ol>`;
    claimsBody.querySelectorAll("img.ext").forEach((im) => {
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
    if (e.target.closest("[data-close]") || e.target.id === "slSheet") { closeSheet(); return; }
    const dt = e.target.closest("[data-det]");
    if (dt) { openSheet(+dt.dataset.det); return; }
    const sh = e.target.closest("[data-sheet]");
    if (sh) { openSheet(sh.dataset.sheet); return; }
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
