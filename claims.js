/* Crop Circles — "Claims" section content.
   Every line is attributed to the person/publication that said it, with a link.
   The app itself makes no judgement about how any formation was made. */
(function (root) {
  "use strict";

  const S = {
    today91: ["Today, 9 Sep 1991 (transcribed reprint)", "https://menwhoconnedtheworld.weebly.com/new-11-today-september-9-1991.html"],
    time91: ["Time, Sep 1991", "https://time.com/archive/6718621/it-happens-in-the-best-circles/"],
    nyt91: ["New York Times, 10 Sep 1991", "https://www.nytimes.com/1991/09/10/world/2-jovial-con-men-demystify-those-crop-circles-in-britain.html"],
    smithsonian: ["Smithsonian (Irving & Brookesmith, 2009)", "https://www.smithsonianmag.com/arts-culture/crop-circles-the-art-of-the-hoax-2524283/"],
    cmNews: ["circlemakers.org news", "https://circlemakers.org/new_documents.html"],
    cmAbout: ["circlemakers.org", "https://circlemakers.org/case_history.html"],
    cmTools: ["circlemakers.org — tools", "https://circlemakers.org/tools.html"],
    cmWork: ["circlemakers.org — commissions", "https://circlemakers.org/exhibit_a.html"],
    cmWeetabix: ["circlemakers.org — Weetabix", "https://www.circlemakers.org/withabix.html"],
    cmNatGeo04: ["circlemakers.org — National Geographic 2004", "https://circlemakers.org/natgeo.html"],
    cmO2: ["circlemakers.org — o2 Blackpool", "https://www.circlemakers.org/makeit.html"],
    sheldrake: ["Rupert Sheldrake, ‘The Crop Circle Making Competition’", "https://www.sheldrake.org/essays/the-crop-circle-making-competition"],
    croppie: ["The Croppie, ‘Doug & Dave: Addressing Inconsistencies’", "https://thecroppie.com/2019/03/26/doug-dave-addressing-inconsistencies/"],
    vidal: ["John Vidal, The Guardian, 21 Aug 2001", "https://www.theguardian.com/g2/story/0,3604,539938,00.html"],
    si22: ["Benjamin Radford, Skeptical Inquirer, 2022", "https://skepticalinquirer.org/2022/05/revisiting-the-stonehenge-surprise-the-best-case-for-crop-circles/"],
    andrewsJulia: ["Colin Andrews, CPRI newsletter 1996", "https://www.colinandrews.net/JuliaSetStory.html"],
    bbc2000: ["BBC News, 9 Aug 2000", "http://news.bbc.co.uk/2/hi/uk_news/871607.stm"],
    blt: ["BLT Research — Plant Abnormalities", "http://www.bltresearch.com/plantab.php"],
    lev94: ["Levengood, Physiologia Plantarum 92, 1994", "https://onlinelibrary.wiley.com/doi/10.1111/j.1399-3054.1994.tb05348.x"],
    lev99: ["Levengood & Talbott, Physiologia Plantarum 105, 1999", "https://iccra.org/levengood/CircleScans/1999-PhysPlant-DispersionOfEnergies-Levengood.pdf"],
    iccra: ["ICCRA field report, Trevor WI, 2005", "https://iccra.org/bystate/Wisconsin/ICCRA%20-%20WI%20-%20Trevor,%20Kenosha%20County%20(June%2021,%202005).html"],
    grassi: ["Grassi, Cocheo & Russo, J. Scientific Exploration 19(2), 2005", "https://www.cicap.org/crops/en/jse_19_2_159-170_2005.pdf"],
    csicop: ["CSICOP / Joe Nickell", "https://web.archive.org/web/20060707212846/http:/www.csicop.org/hoaxwatch/cropcircles.html"],
    ccc01: ["Stuart Dike & John Hunt, Crop Circle Connector", "https://www.cropcirclearchives.co.uk/archives/2001/MilkHill2/milkhill2001a.html"],
    tadSwindon: ["timeanddate.com — Swindon, Aug 2001", "https://www.timeanddate.com/sun/uk/swindon?month=8&year=2001"],
    tadSalisbury: ["timeanddate.com — Salisbury, Jul 1996", "https://www.timeanddate.com/sun/uk/salisbury?month=7&year=1996"],
    plus08: ["Plus magazine, 1 Jul 2008", "https://plus.maths.org/pi-appears-crop-circle"],
    mail08: ["Daily Mail, 17 Jun 2008", "https://www.dailymail.com/news/article-1027178/Easy-pi-Astrophysicist-solves-riddle-Britains-complex-crop-circle.html"],
    vigay00: ["Paul Vigay, field report, Aug 2000", "http://www.vigay.com/cropcircles/articles/uk2000dg.html"],
    enigma21: ["Enigma #21 newsletter (Paul Vigay)", "https://thecroppie.com/wp-content/uploads/2019/08/enigma21.pdf"]
  };

  const CLAIMS = {
    lede: "People who said they made crop circles — and the counterpoints researchers raise. Every line names who said it; this app doesn’t decide how any formation was made.",

    claimants: [
      {
        title: "Doug Bower & Dave Chorley",
        sub: "Southampton, Hampshire · went public September 1991",
        points: [
          ["Went public in Today on 9 September 1991; the paper said it had questioned them for seven days at their homes in Southampton.", "today91"],
          ["Bower said their first circle was in summer 1978 in the ‘Strawberry Field’ near Cheesefoot Head, made “with the iron bar I used to secure the back door of my shop… on our hands and knees”.", "today91"],
          ["Other accounts date the first circle to 1976 — Smithsonian, and Circlemakers (June 1976, Longwood Estate, a simple circle “about 30 feet across”).", "smithsonian", "cmNews"],
          ["Kit at their Today demonstration: “4ft wooden plinths, with rope reins, a ball of string and an old baseball cap” with wire threaded through the visor as a sighting loop.", "today91"],
          ["Time reported they said they had made as many as 25 to 30 new circles each season for 13 years.", "time91"],
          ["Researcher Pat Delgado inspected their Sevenoaks, Kent demonstration circle and said: “No human could have done this.”", "today91"]
        ],
        counter: [
          ["Rupert Sheldrake: even if believed, they made “a maximum of 30 formations a year” — when the 1991 count was about 800.", "sheldrake"],
          ["The Croppie notes their start date varies between accounts (1975, 1976 or 1978).", "croppie"]
        ],
        links: [["Photos of Doug & Dave (Rob Irving) — Smithsonian", "https://www.smithsonianmag.com/arts-culture/crop-circles-the-art-of-the-hoax-2524283/"]]
      },
      {
        title: "Circlemakers",
        sub: "John Lundberg, Rod Dickinson, Wil Russell, Rob Irving · circlemakers.org",
        points: [
          ["Their website was started in 1995 by John Lundberg, Rod Dickinson and Geoff Gilbertson.", "cmAbout"],
          ["Tools they list: stalk-stompers (4 ft and 6 ft), pre-stretched nylon string, a 2 ft marking pole, 100 ft surveying tape and an OS map; optional infrared image intensifier.", "cmTools"],
          ["Commissions on their site include Weetabix (2002), Mountain Dew (2000), Nike Italy (2005), National Geographic TV (2004, 2009), BBC’s QI, Greenpeace Mexico, The Sun’s Olympic rings (Cherhill) and Tesco Mobile emojis (2015).", "cmWork", "cmNews"],
          ["John Vidal described watching a team of four at night: “All we had were sketches, 100ft-long tape measures… and 4ft planks with a rope connecting each end.”", "vidal"],
          ["Vidal also wrote that makers are “careful never to admit responsibility for any specific formation”.", "vidal"]
        ],
        counter: [],
        note: "In this gallery: we found no formation publicly claimed by the Circlemakers. For Barbury Castle 2008 the Daily Mail reported “no one has claimed responsibility”.",
        noteSrc: ["mail08"]
      },
      {
        title: "Other documented claims",
        sub: "Brief",
        points: [
          ["1992 crop-circle-making competition, West Wycombe: 12 teams had 10 pm–3 am to make a set design; 11 followed it; three Westland Helicopters engineers won £3,000. Doug & Dave declined to enter.", "sheldrake"],
          ["Julia Set, Stonehenge 1996: Rod Dickinson told researcher Michael Lindemann it “was made the previous night, by three people, in about two and three-quarters hours”.", "si22"],
          ["BBC News (2000), on Colin Andrews’ view: about 20% are caused by eddies in the earth’s magnetic field — “the rest are man-made”.", "bbc2000"]
        ],
        counter: []
      }
    ],

    compare: {
      tiles: [
        { kind: "text", title: "Doug & Dave’s ‘hallmark’", text: "“A large corn circle with the wheat laid down in a clockwise swirling motion, the hallmark basic ring they have done since 1978.”", src: ["today91"], linkLabel: "Photos — Smithsonian", link: "https://www.smithsonianmag.com/arts-culture/crop-circles-the-art-of-the-hoax-2524283/" },
        { kind: "photo", id: "2001-08-12-milk-hill-galaxy-spiral", title: "Milk Hill, 2001", text: "409 circles, about 900 ft across (Crop Circle Connector)." },
        { kind: "photo", id: "2008-06-01-barbury-castle-pi", title: "Barbury Castle, 2008", text: "Pi to 10 digits, 150 ft (Plus magazine)." }
      ],
      plants: [
        ["BLT Research / W.C. Levengood reported elongated growth nodes, node bending (usually 45–90°) and ‘expulsion cavities’ (holes blown out at nodes) in formation plants compared with controls from the same field.", "blt", "lev94"],
        ["In 1997 they flattened test circles “using a plank with ropes attached at the ends (consistent with the proposed method used by self-proclaimed vandals)”. After 3 days nodes were about 10% longer — versus “30 to an over 200% increase” in the formations they sampled.", "lev99"],
        ["They reported expulsion cavities have “never been observed in literally thousands of control plants”.", "lev99"],
        ["BLT: mechanical flattening of canola with planks, boards or feet “will snap or break the plant stems, rather than bend them” — while noting this “has not been scientifically evaluated”.", "blt"],
        ["ICCRA: a formation they judged mechanically made (Wisconsin, 2005) showed broken stalks, crease marks, serrated edges — and no node elongation.", "iccra"]
      ],
      plantCounter: [
        ["Grassi, Cocheo & Russo (CICAP): the data show “nothing but a mere difference in the stem elongation” between flattened and standing plants, “as we should expect when whatever kind of mechanical force flattens the plants, rope and wood plank included.”", "grassi"],
        ["Joe Nickell (CSICOP): wheat is green and pliable from mid-May to August, so pressed stalks need not break.", "csicop"]
      ],
      image: { url: "img/anomalies/blt_node_length.jpg", caption: "Node length comparison — BLT Research (W.C. Levengood)" }
    },

    timing: {
      rows: [
        {
          name: "Julia Set, near Stonehenge",
          date: "7 July 1996 · 149 circles (Colin Andrews)",
          build: [["3 people, about 2¾ hours, starting around 2:45 am — Rod Dickinson, as told to Michael Lindemann.", "si22"]],
          window: [["Not there at 5:30 pm, seen at 6:15 pm: “this pattern did appear during a 45 minute period, in full daylight” — Colin Andrews.", "andrewsJulia"],
                   ["That night: sunset 9:22 pm, sunrise 5:01 am; nautical darkness 11:15 pm–3:08 am (3 h 53 m). It never reached full astronomical darkness.", "tadSalisbury"]]
        },
        {
          name: "Milk Hill ‘Galaxy’",
          date: "Night of 11–12 Aug 2001 · 409 circles",
          build: [["About 6 people, about 5 hours — an estimate by John Vidal (not a maker’s claim).", "vidal"]],
          window: [["Heavy rain that night; “no evidence of any mud on the stems on the formations first morning” — Stuart Dike.", "ccc01"],
                   ["John Hunt camped on Milk Hill that evening: “I do not believe that the large formation was there” — though he “would not like to swear” to it.", "ccc01"],
                   ["Sunset 8:37 pm → sunrise 5:47 am (9 h 10 m). Civil darkness 9:15 pm–5:09 am (7 h 54 m). Full night 11:06 pm–3:18 am (4 h 12 m). Swindon figures, about 20 km away.", "tadSwindon"]]
        },
        {
          name: "Barbury Castle π",
          date: "Reported 1 June 2008 · 150 ft",
          build: [["No one claimed it.", "mail08"]],
          window: [["Rain the night before, but no mud inside the formation — Lucy Pringle.", "plus08"]]
        }
      ],
      benchmarks: [
        ["Weetabix, West Kennett Long Barrow 2002 (300 × 400 ft): “made over several days and took a total of 16 hours”.", "cmWeetabix"],
        ["National Geographic demo 2004 (200 ft square spiral, daylight): 3 people, “a very sedate 5 hours… with lots of breaks”.", "cmNatGeo04"],
        ["National Geographic 2009: a mathematician’s design reproduced “under cover of darkness in a 4 hour window”.", "cmNews"],
        ["o2, Blackpool beach 2003 (300 ft, sand): six people in about 6 hours.", "cmO2"],
        ["1992 competition: a 5-hour dark window (10 pm–3 am); 11 of 12 teams finished the set design.", "sheldrake"]
      ],
      note: "These were commissioned or staged builds; several were done in daylight or over several days, so the makers did not have to stay hidden."
    },

    mistakes: {
      noErrors: [
        ["Colin Andrews on the Julia Set: “awe inspiring, not only in symmetry and precision but in the circumstances of its arrival”.", "andrewsJulia"],
        ["Lucy Pringle on Barbury Castle: “you try putting that in a field in the middle of the night and achieving that degree of mathematical accuracy.”", "plus08"],
        ["Astrophysicist Mike Reed: “The tenth digit has even been correctly rounded up.”", "mail08"],
        ["Stuart Dike on Milk Hill: no mud on the stems, after what he called the worst rain he had seen all summer.", "ccc01"],
        ["Researchers have argued stalks are bent, not broken, with no footprints leading in (as summarised by CSICOP).", "csicop"]
      ],
      errors: [
        ["Paul Vigay on Allington, Aug 2000: “a number of obvious errors in the construction” — alternating flattened/standing bars “out of sync”.", "vigay00"],
        ["Enigma #21: 2000 was “the year that we started to see numerous errors in construction”.", "enigma21"],
        ["John Vidal on Milk Hill 2001: “quite well made - though there is evidence of sloppiness”.", "vidal"],
        ["ICCRA, Wisconsin 2005: evenly spaced strips with a raised un-flattened ridge between them, serrated edges, broken stalks, footprints and post holes at the circle centres.", "iccra"],
        ["Rod Dickinson on the Julia Set’s large central circle (“a little out of place”): it gave a laid-down work area next to a tramline to measure from.", "si22"],
        ["Joe Nickell: tractor tramlines let makers walk in without leaving tracks.", "csicop"],
        ["Pat Delgado called the Today demo circle genuine before Doug & Dave were revealed.", "today91"]
      ]
    }
  };

  root.CC_CLAIMS = CLAIMS;
  root.CC_SOURCES = S;
})(typeof self !== "undefined" ? self : this);
