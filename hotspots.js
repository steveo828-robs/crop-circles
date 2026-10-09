/* Crop Circles — group formations into repeat-location "hotspots".
   Uses only the dataset's own location text and (approximate) coordinates. */
(function (root) {
  "use strict";

  const RADIUS_KM = 2.5;

  const COUNTY = {
    "wiltshire": "Wiltshire", "wilts": "Wiltshire",
    "hampshire": "Hampshire", "hants": "Hampshire",
    "oxfordshire": "Oxfordshire", "dorset": "Dorset",
    "somerset": "Somerset", "som.": "Somerset", "som": "Somerset",
    "surrey": "Surrey", "east sussex": "East Sussex",
    "gloucestershire": "Gloucestershire", "devon": "Devon",
    "cambridgshire": "Cambridgeshire", "cambridgeshire": "Cambridgeshire",
    "switzerland": "Switzerland", "italy": "Italy"
  };

  // Spelling variants of the same named place (no places are merged that are different places).
  const ALIAS = {
    "owlsebury": "Owslebury",
    "olivers castle": "Oliver's Castle",
    "yarnbury castle hillfort": "Yarnbury Castle",
    "east field alton barnes": "East Field"
  };

  function cleanPart(s) {
    return String(s || "")
      .replace(/[’`]/g, "'")
      .replace(/\s*\((?:\d+|stage \d+)\)\s*/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // "Milk Hill, near Alton Barnes / Alton Priors, Wiltshire" -> { place: "Milk Hill", county: "Wiltshire" }
  function parseLocation(item) {
    const raw = String(item.location || item.name || "").trim();
    let parts = raw.split(",").map(cleanPart).filter(Boolean);
    let county = "";
    if (parts.length > 1) {
      const last = parts[parts.length - 1];
      const key = last.toLowerCase().replace(/\s*\(.*\)\s*$/, "").trim();
      if (COUNTY[key]) { county = COUNTY[key]; parts = parts.slice(0, -1); }
    }
    let place = parts[0] || cleanPart(item.name) || "Unknown";
    place = place
      .replace(/\s*\((?:nr\.?|near)\s[^)]*\)\s*/i, " ")   // "Stonehenge (nr. visitor centre)"
      .replace(/\s+near\s.+$/i, "")                        // "Burderop Down near Barbury Castle"
      .replace(/^(?:below|north of)\s+/i, "")              // "Below Milk Hill"
      .replace(/\bSt\.\s/g, "St ")
      .replace(/\s+/g, " ")
      .trim();
    const alias = ALIAS[place.toLowerCase().replace(/'/g, "")] || ALIAS[place.toLowerCase()];
    if (alias) place = alias;
    return { place, county };
  }

  function hasCoords(item) {
    return typeof item.latitude === "number" && typeof item.longitude === "number" &&
      isFinite(item.latitude) && isFinite(item.longitude);
  }

  function distKm(a, b) {
    const R = 6371, toR = Math.PI / 180;
    const dLat = (b.lat - a.lat) * toR, dLon = (b.lon - a.lon) * toR;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * toR) * Math.cos(b.lat * toR) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function slug(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function build(data) {
    // 1) group by normalised place name
    const places = new Map();
    data.forEach((item) => {
      const { place, county } = parseLocation(item);
      const key = place.toLowerCase();
      if (!places.has(key)) places.set(key, { name: place, county: "", country: "", items: [], coords: [] });
      const p = places.get(key);
      p.items.push(item);
      if (county && !p.county) p.county = county;
      if (item.country && !p.country) p.country = item.country;
      if (hasCoords(item)) p.coords.push({ lat: item.latitude, lon: item.longitude });
    });
    const plist = [...places.values()];
    plist.forEach((p) => {
      p.coord = p.coords.length
        ? { lat: p.coords.reduce((s, c) => s + c.lat, 0) / p.coords.length,
            lon: p.coords.reduce((s, c) => s + c.lon, 0) / p.coords.length }
        : null;
    });

    // 2) cluster named places whose recorded coordinates lie within RADIUS_KM of a leader
    //    (leaders = places with the most formations; no chaining, so areas stay compact)
    const byCount = (a, b) => b.items.length - a.items.length || a.name.localeCompare(b.name);
    const withC = plist.filter((p) => p.coord).sort(byCount);
    const areas = [];
    const used = new Set();
    withC.forEach((leader) => {
      if (used.has(leader)) return;
      used.add(leader);
      const members = [leader];
      withC.forEach((p) => {
        if (used.has(p)) return;
        if (distKm(leader.coord, p.coord) <= RADIUS_KM) { used.add(p); members.push(p); }
      });
      areas.push(members);
    });
    plist.filter((p) => !p.coord).forEach((p) => areas.push([p]));

    // 3) summarise
    const hotspots = areas.map((members) => {
      members.sort(byCount);
      const items = members.flatMap((m) => m.items)
        .sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")));
      const years = items.map((i) => i.year).filter(Boolean);
      const lead = members[0];
      const pins = members.filter((m) => m.coord);
      return {
        id: slug(lead.name + "-" + (lead.county || lead.country || "")),
        name: lead.name,
        isArea: members.length > 1,
        places: members.map((m) => ({ name: m.name, count: m.items.length })),
        county: lead.county || members.map((m) => m.county).find(Boolean) || "",
        country: lead.country || members.map((m) => m.country).find(Boolean) || "",
        count: items.length,
        yearFrom: years.length ? Math.min(...years) : null,
        yearTo: years.length ? Math.max(...years) : null,
        items,
        coord: lead.coord,
        mapped: pins.length > 0
      };
    }).sort((a, b) => b.count - a.count || (b.yearTo || 0) - (a.yearTo || 0) || a.name.localeCompare(b.name));

    const byItem = new Map();
    hotspots.forEach((h) => h.items.forEach((it) => byItem.set(it.id, h)));
    return { hotspots, byItem, radiusKm: RADIUS_KM };
  }

  const api = { build, parseLocation, distKm, RADIUS_KM };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.CCHotspots = api;
})(typeof self !== "undefined" ? self : this);
