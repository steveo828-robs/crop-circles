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
    enigma21: ["Enigma #21 newsletter (Paul Vigay)", "https://thecroppie.com/wp-content/uploads/2019/08/enigma21.pdf"],
    cmNews1: ["circlemakers.org news 2002–03", "https://www.circlemakers.org/new_documents1.html"],
    cmKorn: ["circlemakers.org — Korn", "https://www.circlemakers.org/korn_circle.html"],
    cmMits: ["circlemakers.org — Mitsubishi", "https://www.circlemakers.org/mits.html"],
    cmShredded: ["circlemakers.org — Shredded Wheat", "https://www.circlemakers.org/shredded_wheat.html"],
    cmDew: ["circlemakers.org — Mountain Dew", "https://www.circlemakers.org/mountaindew.html"],
    cmOlyFr: ["circlemakers.org — The Sun, France", "https://www.circlemakers.org/olympics_france.html"],
    cmOly: ["circlemakers.org — The Sun, Cherhill", "https://www.circlemakers.org/olympics.html"],
    cmBB: ["circlemakers.org — Big Brother 4", "https://www.circlemakers.org/bigbrother.html"],
    cmGreenpeace: ["circlemakers.org — Greenpeace", "https://www.circlemakers.org/greenpeace.html"],
    cmLevellers: ["circlemakers.org — The Levellers", "https://www.circlemakers.org/levellers.html"],
    cmHTV: ["circlemakers.org — HTV", "https://www.circlemakers.org/htv.html"],
    cmNZ: ["circlemakers.org — NBC, New Zealand", "https://www.circlemakers.org/nztrip.html"],
    cmHistory: ["circlemakers.org — History Channel", "https://www.circlemakers.org/making_history.html"],
    cmBeeb: ["circlemakers.org — BBC Country File with Doug Bower", "https://www.circlemakers.org/beeb.html"],
    cmTotc01: ["circlemakers.org — Top of the Crops 2001", "https://www.circlemakers.org/totc2001.html"],
    lego24: ["Mediaweek, 23 Jul 2024", "https://mediaweek.vinyl.media/lego-australia-launches-space-range-with-a-crop-circle"],
    ansty16: ["The Croppie, ‘Anstygate’, 17 Aug 2016 (quoting Colin Andrews)", "https://thecroppie.com/2016/08/17/anstygate/"],
    fi18: ["franceinfo / France 3, 20 Sep 2018", "https://www.franceinfo.fr/internet/youtube/crop-circle-un-canular-devoile-en-moselle_2949519.html"],
    rl18: ["Le Républicain Lorrain, 24 Aug 2018", "https://www.republicain-lorrain.fr/edition-de-sarrebourg-chateau-salins/2018/08/24/le-crop-circle-etait-l-oeuvre-d-une-bande-de-youtubeurs"],
    commonsSarr: ["Diagram: Wizly-08, CC BY-SA 4.0, Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Agroglyphe_de_Sarraltroff.jpg"],
    cccenter: ["Crop Circle Center database — yearly statistics", "https://www.cropcirclecenter.com/"],
    dallaglio: ["Claudio Dall’Aglio chart, via Crop Circle Connector archives", "https://www.cropcirclearchives.co.uk/archives/ccarchives.htm"],
    si92: ["Nickell & Fischer, Skeptical Inquirer vol. 16 (1992)", "https://cdn.centerforinquiry.org/wp-content/uploads/sites/29/1992/01/22165201/p39.pdf"],
    vigayDist: ["Paul Vigay, ‘Crop Circle Distribution Patterns’", "http://www.vigay.com/cropcircles/articles/distribution.html"],
    bbc21: ["BBC Travel, 22 Aug 2021", "https://www.bbc.com/travel/article/20210822-englands-crop-circle-controversy"],
    vigay00s: ["Paul Vigay, Allington field report", "https://www.vigay.com/cropcircles/articles/uk2000dg.html"],
    vigayCrab: ["Paul Vigay, Crabwood analysis, Aug 2002", "https://www.vigay.com/cropcircles/articles/alienface.html"],
    pringleHS11: ["Lucy Pringle, Honeystreet 2011 page", "https://cropcirclephotographs.co.uk/photos/2011/honey-street2-cropcircle-2011.shtml"],
    eevee11: ["Cosmic Crop Circles blog, 4 Jun 2011", "http://cosmiccropcircles.blogspot.com/2011/06/hackpen-hill-nr-wrougton-wiltshire-may.html"],
    tt11: ["Steve Alexander, Temporary Temples 2011", "https://temporarytemples.co.uk/crop-circles/2011-crop-circles"],
    croppie20: ["The Croppie, 24 Jun 2020", "https://thecroppie.com/2020/06/24/2020-circles-berwick-bassett-clump-winterbourne-monkton-wiltshire/"],
    guardian00: ["The Guardian, 7 Nov 2000", "https://www.theguardian.com/uk/2000/nov/07/geoffreygibbs.sallyjamesgregory"],
    gh00: ["Gazette and Herald, Nov 2000", "https://www.gazetteandherald.co.uk/news/7393908.man-fined-100-for-making-crop-circle/"]
  };

  const CLAIMS = {
    lede: "People who said they made crop circles — and the counterpoints researchers raise. Every line names who said it; this app doesn’t decide how any formation was made.",

    /* v8 proof status. y = proof shown, p = partial, n = no proof shown (claim only).
       "how" says what proof exists (or what is missing), from the linked source. */
    proofIntro: "‘Proof’ here means evidence published by someone other than the claimant’s word alone — footage, press or judges who watched, a client on record, or a court case.",
    proofNote: "For Circlemakers builds the details come mostly from their own website (client named, photos and diagrams, often filmed); the adverts and TV shows themselves were public. Their proof covers only the formations they name — John Vidal wrote that makers are “careful never to admit responsibility for any specific formation” beyond these.",
    proof: [
      { who: "Doug Bower & Dave Chorley", what: "Circles since the late 1970s, “25 to 30” a season", year: "1978–91", s: "p", how: "They made a circle in front of Today journalists in 1991 — a design they said they had used “four or five times” that summer. No footage or outside witness was published for the earlier or more complex circles they said they made.", src: ["today91", "time91", "sheldrake"] },
      { who: "Doug & Dave", what: "First circles, Cheesefoot Head ‘punchbowl’", year: "From 1978", s: "n", how: "Their own account to Today, which says it questioned them for seven days; no footage or third-party witness of these builds is cited. Start dates differ between accounts (1975, 1976 or 1978).", src: ["today91", "croppie"] },
      { who: "Doug & Dave", what: "Demonstration circle near Sevenoaks, Kent", year: "1991", s: "y", how: "Today journalists watched them make it “step by step”; hours later Pat Delgado inspected it and said “No human could have done this.” A simple design, not one of the complex formations.", src: ["today91"] },
      { who: "Circlemakers with Doug Bower", what: "BBC Country File demo, ~200 ft, 100 circles", year: "1998", s: "y", how: "Filmed at night by a BBC crew using an infra-red camera.", src: ["cmBeeb"] },
      { who: "12 competing teams", what: "1992 crop-circle-making competition entries", year: "1992", s: "y", build: "1992 making competition", how: "Organised contest: invigilators with night-vision binoculars, five judges, dawn aerial photos; the winners made it again in daylight before the public and TV crews.", src: ["sheldrake"] },
      { who: "Rod Dickinson (to Michael Lindemann)", what: "Julia Set, near Stonehenge", year: "1996", s: "n", how: "Makers not named. Radford: “there exists no photographs or video of it being made”; Dickinson “confessed to making it—or at least knowing who did.”", src: ["si22"] },
      { who: "Reported by Colin Andrews", what: "Ansty — Mothership Glass commission", year: "2016", s: "n", build: "Mothership Glass (reported)", how: "Andrews says the makers’ names are “known to me” but published no names, footage or paperwork. Not a maker’s own statement.", src: ["ansty16"] },
      { who: "Thrive PR / SoldOut Events", what: "LEGO Space, Narromine NSW", year: "2024", s: "y", build: "LEGO Australia", how: "The client’s PR agency described the commission on record; campaign video and drone footage were shot by Brightworks.", src: ["lego24"] },
      { who: "YouTubers (AstronoGeek, Defakator & others)", what: "Sarraltroff, Moselle test formation", year: "2018", s: "y", build: "YouTubers’ test (AstronoGeek, Defakator & others)", how: "They published video of themselves making it (France 3); done with the farmer’s permission.", src: ["fi18", "rl18"] },
      { who: "Matthew Williams", what: "Seven-pointed star, West Overton", year: "2000", s: "y", how: "Pleaded guilty to criminal damage at Devizes magistrates and was fined £100 + £40 costs — based on his own admission to police.", src: ["gh00", "guardian00"] },
      { who: "Circlemakers", what: "Korn (rock band), Bakersfield", year: "2010", s: "y", build: "Korn (rock band)", how: "Video by HDNet; the band’s own press release.", src: ["cmKorn"] },
      { who: "Circlemakers", what: "Mountain Dew (Pepsi) advert", year: "2000", s: "y", build: "Mountain Dew (Pepsi) advert", how: "Used in the Mountain Dew advert.", src: ["cmDew"] },
      { who: "Circlemakers", what: "Weetabix Energy, West Kennet", year: "2002", s: "y", build: "Weetabix", how: "Client campaign; photo credited to Weetabix.", src: ["cmWeetabix"] },
      { who: "Circlemakers", what: "Shredded Wheat logo, Puckeridge", year: "2006", s: "y", build: "Shredded Wheat", how: "Commissioned for the cereal packet; made on a farm that supplies the brand.", src: ["cmShredded"] },
      { who: "Circlemakers", what: "Mitsubishi ‘Space Star’, East Field", year: "1998", s: "y", build: "Mitsubishi ‘Space Star’ advert", how: "Made for a Mitsubishi advert, filmed there the next morning.", src: ["cmMits"] },
      { who: "Circlemakers", what: "The Sun — London 2012 bid, France", year: "2005", s: "y", build: "The Sun — London 2012 bid", how: "A Sun photographer and journalist travelled with the crew.", src: ["cmOlyFr"] },
      { who: "Circlemakers", what: "The Sun — Olympic rings, Cherhill", year: "2005", s: "y", build: "The Sun — Olympic rings", how: "Commissioned by a Sun journalist; ran on the paper’s front cover.", src: ["cmOly"] },
      { who: "Circlemakers", what: "Big Brother 4 logo (Channel 4)", year: "2003", s: "y", build: "Big Brother 4 (Channel 4)", how: "Channel 4 commission, one of four BB4 logos.", src: ["cmBB"] },
      { who: "Circlemakers", what: "National Geographic square spiral", year: "2004", s: "y", build: "National Geographic TV|2004", how: "Filmed by National Geographic, including time-lapse from a 120 ft crane.", src: ["cmNatGeo04"] },
      { who: "Circlemakers", what: "Greenpeace, Oaxaca, Mexico", year: "2006", s: "y", build: "Greenpeace", how: "Made with Greenpeace for its GM-maize campaign.", src: ["cmGreenpeace"] },
      { who: "Circlemakers", what: "The Levellers video, Poynings", year: "2002", s: "y", build: "The Levellers video", how: "The band was filmed flattening much of it for the video.", src: ["cmLevellers"] },
      { who: "Circlemakers", what: "History Channel logo", year: "2002", s: "y", build: "History Channel logo", how: "Made for a History Channel documentary; photos of the build published.", src: ["cmHistory"] },
      { who: "Circlemakers", what: "HTV West documentary, Beckhampton", year: "2001", s: "y", build: "HTV West documentary", how: "Commissioned by broadcaster HTV West for a TV documentary.", src: ["cmHTV"] },
      { who: "Circlemakers", what: "National Geographic TV (Apollonius design)", year: "2009", s: "y", build: "National Geographic TV|2009", how: "Made for a National Geographic documentary from a design by a UCL mathematician.", src: ["cmNews"] },
      { who: "Circlemakers", what: "NBC ‘Secrets of Deception’, New Zealand", year: "1998", s: "y", build: "NBC ‘Secrets of Deception’", how: "Flown out “to be filmed creating a crop circle for NBC-TV”.", src: ["cmNZ"] }
    ],

    /* v7 slide deck. Every line is attributed; quotes are verbatim from the linked source. */
    deck: {
      title: { head: "Who really made them?", line: "Some people say they made crop circles. Here’s what they said — and what others say back.", hint: "Swipe or tap → to begin" },
      doug: { head: "Doug & Dave", tag: "c", big: "1978", bigSub: "the year Bower said their first circle was made", line: "In 1991 they told Today they had made circles with “4ft wooden plinths, with rope reins… and an old baseball cap”.", src: ["today91"] },
      cm: { head: "Circlemakers", tag: "c", big: "15", bigSub: "commissions written up on their own site", line: "A UK art group that makes formations for adverts and TV — and publishes how long each took.", src: ["cmWork"] },
      simple: { head: "Simple then, complex now", line: "Doug & Dave described a plain swirled ring. Milk Hill (2001) had 409 circles — no one has claimed it.", src: ["today91", "ccc01"] },
      nodes: { head: "Up close: bent nodes", img: "img/anomalies/blt_node_italy.jpg", alt: "Elongated node on a wheat stalk, as presented by BLT Research", line: "BLT Research says stalks in some formations are bent and stretched at the nodes. Critics say a plank can do the same.", note: "We found no licensed close-up from a claimed man-made formation.", src: ["blt", "grassi"] },
      time: { head: "How long to build?", a: { big: "Up to 3 days", small: "paid builds, as reported", src: ["lego24", "ansty16"] }, b: { big: "≈ 4 h", small: "full darkness the night Milk Hill was reported", src: ["tadSwindon"] }, line: "Paid builds were often done with permission, some in daylight.", src: ["lego24", "ansty16", "tadSwindon"] },
      longest: { head: "Longest paid builds", topIds: ["LEGO Australia", "Mothership Glass (reported)", "Korn (rock band)"] },
      messIntro: "Mess-ups",
      messups: [
        { place: "Allington, Wiltshire", date: "Aug 2000", head: "Bars out of sync", img: "https://www.vigay.com/cropcircles/reports/uk2000dg/uk00dgsm.gif", imgKind: "diagram", alt: "Paul Vigay’s geometry overlay of the Allington 2000 formation", credit: "Analysis image: Paul Vigay", link: "https://www.vigay.com/cropcircles/articles/uk2000dg.html",
          quote: "“…the hoaxers got their alternating flattened/standing bars out of sync!”", who: "Paul Vigay, researcher", src: ["vigay00s"] },
        { place: "Crabwood, Hampshire", date: "Aug 2002", head: "A garbled word", img: "https://www.vigay.com/cropcircles/imgs/uk02dl/aerial1.jpg", alt: "Aerial photo of the Crabwood 2002 ‘face’ and disc", credit: "Photo © Lucy Pringle, via vigay.com", link: "https://www.vigay.com/cropcircles/articles/alienface.html",
          quote: "One word in the coded disc reads “EELIJ?E” — perhaps BELIEVE. That “could indicate an error in the physical construction”.", who: "Paul Vigay, who also called the frame “slightly sloppy”", src: ["vigayCrab"] },
        { place: "Honeystreet, Wiltshire", date: "Jul 2011", head: "Left unfinished?", img: "https://cropcirclephotographs.co.uk/photos/2011/honey-street2a.jpg", alt: "Aerial photo of the Honeystreet formation reported 4 July 2011", credit: "Photo © Lucy Pringle", link: "https://cropcirclephotographs.co.uk/photos/2011/honey-street2-cropcircle-2011.shtml",
          quote: "“A circle containing a seemingly unfinished elaborate design.”", who: "Lucy Pringle, photographer", src: ["pringleHS11"] },
        { place: "Hackpen Hill, Wiltshire", date: "May 2011", head: "Messed up mid-build?", id: "2011-05-30-hackpen-hill", credit: "Photo: Steve Alexander / Temporary Temples",
          quote: "“Either someone messed up this formation during it’s construction, and it remains unfinished, or it was always meant to look like this?”", who: "Cosmic Crop Circles blog", src: ["eevee11", "tt11"] },
        { place: "Berwick Bassett, Wiltshire", date: "Jun 2020", head: "Abandoned?", img: "https://thecroppie.com/wp-content/uploads/2020/06/received_259014408724402.jpeg", alt: "Photo of the Berwick Bassett formation reported 21 June 2020", credit: "Photo: Nick Bull, via The Croppie", link: "https://thecroppie.com/2020/06/24/2020-circles-berwick-bassett-clump-winterbourne-monkton-wiltshire/",
          quote: "“…maybe just an abandoned, incomplete effort.”", who: "The Croppie", src: ["croppie20"] },
        { place: "West Overton, Wiltshire", date: "Aug 2000", head: "Caught and fined", big: "£100", bigSub: "fine, plus £40 costs", noPhoto: "No licensed photo of this formation found.",
          quote: "Matthew Williams admitted making a seven-pointed star “to prove the experts wrong” — believed to be Britain’s first such prosecution.", who: "Gazette and Herald; The Guardian", src: ["gh00", "guardian00"] }
      ],
      counter: { head: "The other side", id: "2008-06-01-barbury-castle-pi", quote: "“…you try putting that in a field in the middle of the night and achieving that degree of mathematical accuracy.”", who: "Lucy Pringle, on Barbury Castle 2008 (unclaimed)", src: ["plus08", "mail08"] },
      years: { head: "How many each year?", line: "Reports rose fast in the late 1980s, peaked in the 1990s, and are now a few dozen a year." },
      close: { head: "You decide.", line: "Every slide names who said what. Tap “Source” to check it yourself.", again: "Start again" }
    },

    story: {
      intro: "Some people say they made crop circles. Six short steps: what they said, and what others say back. This app doesn’t decide who is right.",
      ch1: {
        head: "Who says they made them",
        take: "Two groups have said publicly that they make crop circles.",
        people: [
          { name: "Doug Bower & Dave Chorley", line: "Told Today in 1991 they had made circles since the late 1970s with a plank, rope and a cap.", src: ["today91"] },
          { name: "Circlemakers", line: "UK art group that makes formations for adverts and TV, and publishes how long each took.", src: ["cmWork"] }
        ]
      },
      ch2: {
        head: "Simple then, complex now",
        take: "Doug & Dave described a plain swirled ring. Milk Hill (2001) had 409 circles; no one has claimed it.",
        ring: { title: "Doug & Dave’s ring", quote: "“A large corn circle with the wheat laid down in a clockwise swirling motion…”", src: ["today91"] },
        photoId: "2001-08-12-milk-hill-galaxy-spiral",
        photoTitle: "Milk Hill, 2001",
        photoLine: "409 circles, about 900 ft across",
        photoSrc: ["ccc01"]
      },
      ch3: {
        head: "Up close: bent or broken?",
        take: "BLT Research says stalks in some formations are bent and stretched at the nodes — the knuckle-like joints on a stalk. Critics say a plank can do the same.",
        img: "img/anomalies/blt_node_italy.jpg",
        caption: "Elongated node from a formation sample, as presented by BLT Research",
        missing: "We found no licensed close-up of the flattened crop in a claimed man-made formation."
      },
      ch4: {
        head: "How long did it take?",
        take: "Paid builds, as the makers report them, took up to three days — often in daylight, with permission. Milk Hill was reported to have appeared in one short night.",
        statA: { big: "Up to 3 days", small: "Paid builds, often in daylight", src: ["lego24", "ansty16", "cmKorn", "cmMits"] },
        statB: { big: "≈ 4 h", small: "Full darkness the night Milk Hill was reported", src: ["tadSwindon"] },
        topIds: ["LEGO Australia", "Mothership Glass (reported)", "Korn (rock band)", "Weetabix", "Shredded Wheat"]
      },
      ch5: {
        head: "Mistakes?",
        take: "Some observers praise how precise the big formations are. Others point to visible errors.",
        none: [{ q: "“The tenth digit has even been correctly rounded up.”", who: "Mike Reed, astrophysicist, on Barbury Castle 2008", src: ["mail08"] }],
        some: [
          { q: "“…a number of obvious errors in the construction”", who: "Paul Vigay, on Allington 2000", src: ["vigay00"] },
          { q: "“…quite well made - though there is evidence of sloppiness”", who: "John Vidal, on Milk Hill 2001", src: ["vidal"] }
        ]
      },
      ch6: {
        head: "How many each year?",
        take: "In these counts, reports rose fast in the late 1980s, peaked in the 1990s, and are now a few dozen a year."
      }
    },

    plain: {
      lede: "Some people say they made crop circles. Here is what they said, what others say back, and where to check. This app doesn’t decide who is right.",
      heads: { who: "Who says they made them?", compare: "Simple circles vs complex designs", time: "How long did it take?", mistakes: "Where are the mistakes?" },
      cards: {
        "Doug Bower & Dave Chorley": "In 1991 two men from Southampton told a newspaper they had been making circles since the late 1970s — with a plank, rope and a cap.",
        "Circlemakers": "A UK art group that openly makes formations for adverts and TV, and writes up how long each one took.",
        "Other documented claims": "A 1992 making contest, a claim about the 1996 Julia Set, and a researcher’s view."
      },
      years: "In these counts, reports rose fast in the late 1980s, peaked in the 1990s, and are now a few dozen a year.",
      gallery: "Each was claimed by the people named. Most photos can’t be shown here, so tiles link to them. Swipe sideways →",
      tiles: "Doug & Dave described a plain swirled circle. Some later formations have hundreds of circles.",
      plants: "Some researchers say stalks in unexplained formations are bent and stretched at the nodes — the knuckle-like joints on a stalk. Critics say flattening with a plank can do the same.",
      lay: "Close-ups of flattened crop, side by side. We found no licensed close-up of a claimed man-made lay, so that side links out.",
      time: "Paid builds were often done in daylight, with permission, sometimes over two or three days. The big unclaimed ones were reported to have appeared overnight.",
      statA: { big: "≈ 2 h – 3 days", small: "Paid or test builds, as reported by the makers, their clients or a researcher", src: ["cmHistory", "fi18", "cmKorn", "lego24", "ansty16"] },
      statB: { big: "≈ 4 h", small: "Full darkness on the night Milk Hill (409 circles) was reported — Swindon figures", src: ["tadSwindon"] },
      windows: {
        "Julia Set, near Stonehenge": ["Claimed: 3 people, about 2¾ h, at night", "Reported: appeared within 45 min, in daylight"],
        "Milk Hill ‘Galaxy’": ["Unclaimed. Estimate: ~6 people, ~5 h (journalist’s guess)", "Reported: ~4 h of full darkness; no mud after heavy rain"],
        "Barbury Castle π": ["Unclaimed", "Reported: rain the night before, no mud inside"]
      },
      noErrors: "Some researchers point to precision and clean, mud-free stalks.",
      errors: "Others point to slips, uneven lines, broken stalks and footprints."
    },

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
          ["1992 crop-circle-making competition, West Wycombe (11 July): 12 teams had 10 pm–3 am in darkness to make a set design; Sheldrake writes 11 “made more or less impressive formations that followed the set design”; three Westland Helicopters engineers won £3,000. Doug & Dave declined to enter.", "sheldrake"],
          ["Julia Set, Stonehenge 1996: Rod Dickinson told researcher Michael Lindemann it “was made the previous night, by three people, in about two and three-quarters hours”. The makers were not named; Radford says Dickinson “confessed to making it—or at least knowing who did”.", "si22"],
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
      lead: {
        title: "Paid builds: hours to days. Overnight windows: a few hours.",
        text: "Makers’ own write-ups of commissioned formations report builds of up to two days (Korn, 2010: “two stages over two days”), 16 hours spread “over several days” (Weetabix, 2002) and 12–14 hours in one day (Mitsubishi 1998, Shredded Wheat 2006). Two later commissions were reported at three days — by the client’s PR agency (LEGO, 2024) and by researcher Colin Andrews (Ansty, 2016). These were done with the landowner’s permission, several in daylight.",
        src: ["cmKorn", "cmWeetabix", "cmMits", "cmShredded", "lego24", "ansty16"]
      },
      builds: [
        { name: "LEGO Australia", where: "Narromine, NSW", year: "2024", size: "50 m", team: "“teams” (not counted)", time: "“three full days”", light: "Not stated", note: "Quote from Clare Basire of Thrive PR, the agency behind the stunt; makers not named.", src: ["lego24"] },
        { name: "Mothership Glass (reported)", where: "Ansty", year: "2016", size: "Not stated", team: "Not named", time: "Three days", light: "Not stated", note: "Colin Andrews’ investigation: a paid commission made in three days with the field owners’ agreement. Not a maker’s own statement.", src: ["ansty16"] },
        { name: "Korn (rock band)", where: "Bakersfield, California", year: "2010", size: "700 × 230 ft", team: "4", time: "“two stages over two days”", light: "Not stated", note: "Mature wheat.", src: ["cmKorn", "cmNews"] },
        { name: "Mountain Dew (Pepsi) advert", where: "Washington State", year: "2000", size: "Not stated", team: "3", time: "“two leisurely days”", light: "Not stated", note: "Mowed into short grass, not crop.", src: ["cmDew"] },
        { name: "Weetabix", where: "West Kennet Long Barrow, Wiltshire", year: "2002", size: "300 × 400 ft", team: "3", time: "16 h total, “over several days”", light: "Not stated", note: "“The most complex formation we’ve ever been asked to create”; built from nine diagrams.", src: ["cmWeetabix", "cmNews1"] },
        { name: "Shredded Wheat", where: "Puckeridge, Hertfordshire", year: "2006", size: "Not stated", team: "4", time: "14 h", light: "From “a very early start”", note: "Lettering left standing in wheat; 18 diagrams.", src: ["cmShredded", "cmNews"] },
        { name: "Mitsubishi ‘Space Star’ advert", where: "East Field, Alton Barnes, Wiltshire", year: "1998", size: "350 × 110 ft", team: "3", time: "12 h", light: "Daylight", note: "“Uncharacteristically the formation was made during daylight”; security kept visitors out.", src: ["cmMits"] },
        { name: "The Sun — London 2012 bid", where: "Campigneulles-les-Grandes, France", year: "2005", size: "205 ft", team: "6", time: "About 7 h", light: "Daylight", note: "Started at dawn, “back in London before sunset”.", src: ["cmOlyFr"] },
        { name: "The Sun — Olympic rings", where: "Cherhill, Wiltshire", year: "2005", size: "200 ft", team: "4", time: "“a sedate 5 hours”", light: "Not stated", note: "Barley; diagrams drawn the day before.", src: ["cmOly", "cmNews"] },
        { name: "Big Brother 4 (Channel 4)", where: "Southern England (secret)", year: "2003", size: "220 ft", team: "6", time: "5 h", light: "Not stated", note: "Oilseed rape. The other three BB4 logos were paint, stone or sand.", src: ["cmBB"] },
        { name: "National Geographic TV", where: "Opposite Silbury Hill, Wiltshire", year: "2004", size: "200 ft", team: "3", time: "“a very sedate 5 hours”", light: "Daylight, filmed", note: "Their own square-spiral design, “with lots of breaks in construction for filming”.", src: ["cmNatGeo04"] },
        { name: "Greenpeace", where: "Ayotzintepec, Oaxaca, Mexico", year: "2006", size: "200 ft", team: "4", time: "4½ h", light: "Not stated", note: "Question mark and ring in 8 ft maize.", src: ["cmGreenpeace", "cmNews"] },
        { name: "The Levellers video", where: "Poynings, West Sussex", year: "2002", size: "About 200 ft", team: "3 + band", time: "About 4 h", light: "Daylight", note: "The band flattened much of it under instruction, on camera.", src: ["cmLevellers"] },
        { name: "History Channel logo", where: "Wiltshire", year: "2002", size: "140 ft", team: "3", time: "“a couple of hours”", light: "Daylight", note: "“Created at a very sedate pace in daylight”.", src: ["cmHistory", "cmNews1"] },
        { name: "HTV West documentary", where: "Beckhampton, Wiltshire", year: "2001", size: "240 ft", team: "3", time: "About 4 h", light: "Darkness", note: "178 standing and flattened elements, eight-fold geometry.", src: ["cmHTV"] },
        { name: "National Geographic TV", where: "Not stated", year: "2009", size: "Not stated", team: "Not stated", time: "“a 4 hour window”", light: "Darkness", note: "Design by a University College London mathematician, sent to them as a diagram beforehand. Actual build time not given.", src: ["cmNews"] },
        { name: "NBC ‘Secrets of Deception’", where: "Southern New Zealand", year: "1998", size: "300 ft, 100+ circles", team: "3", time: "Designed to be made in “under four hours”", light: "Night", note: "The page gives the design target, not a measured build time.", src: ["cmNZ"] },
        { name: "YouTubers’ test (AstronoGeek, Defakator & others)", where: "Sarraltroff, Moselle, France", year: "2018", size: "Not stated", team: "A group", time: "“en moins de deux heures” (under 2 h)", light: "Night", note: "Planks and ropes; farmer’s permission (France 3).", src: ["fi18", "rl18"] },
        { name: "1992 making competition", where: "West Wycombe, Buckinghamshire", year: "1992", size: "Set design", team: "12 teams (winners: 3)", time: "Up to 5 h, 10 pm–3 am", light: "Darkness", note: "Sheldrake’s text says the design was sent three weeks ahead; his photo caption says 24 hours. Plots were marked out by the organisers. 11 of 12 teams followed the design.", src: ["sheldrake"] }
      ],
      rows: [
        {
          name: "Julia Set, near Stonehenge",
          date: "7 July 1996 · 149 circles (Colin Andrews)",
          build: [["3 people, about 2¾ hours, starting around 2:45 am — Rod Dickinson, as told to Michael Lindemann. The makers were not named.", "si22"],
                  ["Taken at face value, that would end around 5:30 am — after that day’s 5:01 am sunrise.", "si22", "tadSalisbury"]],
          window: [["Not there at 5:30 pm, seen at 6:15 pm: “this pattern did appear during a 45 minute period, in full daylight” — Colin Andrews.", "andrewsJulia"],
                   ["That night: sunset 9:22 pm, sunrise 5:01 am; nautical darkness 11:15 pm–3:08 am (3 h 53 m). It never reached full astronomical darkness.", "tadSalisbury"]]
        },
        {
          name: "Milk Hill ‘Galaxy’",
          date: "Night of 11–12 Aug 2001 · 409 circles",
          build: [["About 6 people, about 5 hours — an estimate by John Vidal (not a maker’s claim).", "vidal"],
                  ["Unclaimed. Circlemakers wrote that, allowing time to get in and out in darkness, “the construction time left should be around four hours” — one circle “every 30 seconds… not even allowing any time for the surveying”.", "cmTotc01"]],
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
      note: "Commissioned builds were done with permission, often in daylight or over more than one session, with the design drawn up in advance — so the makers did not have to stay hidden or finish in one night. Times are as the makers or the named source reported them; “Not stated” means the source doesn’t say."
    },

    byYear: {
      intro: "How many were reported each year, from different counts. They disagree because they count different things (whole formations vs individual circles) and different areas. A dash means no sourced figure for that year.",
      series: [
        { key: "world", label: "Worldwide — formations in the Crop Circle Center database", scope: "Worldwide", src: ["cccenter"], data: {"1980": 20, "1981": 15, "1982": 15, "1983": 16, "1984": 17, "1985": 23, "1986": 25, "1987": 67, "1988": 56, "1989": 152, "1990": 286, "1991": 286, "1992": 354, "1993": 231, "1994": 297, "1995": 244, "1996": 328, "1997": 262, "1998": 287, "1999": 280, "2000": 292, "2001": 225, "2002": 264, "2003": 277, "2004": 240, "2005": 227, "2006": 184, "2007": 172, "2008": 178, "2009": 156, "2010": 145, "2011": 128, "2012": 139, "2013": 103, "2014": 108, "2015": 88, "2016": 69, "2017": 59, "2018": 64, "2019": 60, "2020": 57, "2021": 31, "2022": 20, "2023": 31, "2024": 17, "2025": 19} },
        { key: "england", label: "England — formations, Claudio Dall’Aglio chart (read from the chart image)", scope: "England only", src: ["dallaglio"], data: {"1978": 1, "1980": 1, "1981": 2, "1982": 2, "1983": 1, "1984": 2, "1985": 3, "1986": 6, "1987": 21, "1988": 110, "1989": 120, "1990": 81, "1991": 70, "1992": 62, "1993": 29, "1994": 70, "1995": 70, "1996": 89, "1997": 93, "1998": 99, "1999": 144, "2000": 124, "2001": 95, "2002": 71, "2003": 73, "2004": 58, "2005": 70} }
      ],
      points: [
        ["1980–83: 3, 3, 5 and 22 circles in British cornfields; 1987–89: 73, 113 and “over 250” — Terence Meaden’s figures, as cited by Nickell & Fischer. These count individual circles in Britain.", "si92"],
        ["1990: “700 circles in Britain” — Jenny Randles, as cited by Nickell & Fischer.", "si92"],
        ["1991: “By 1991 the annual count was about 800” — Rupert Sheldrake (scope not stated; he says the great majority were in England).", "sheldrake"],
        ["UK: 204 reported formations in 1992; a peak of 148 in 1999; “around the 100 per year mark” for 1996–2003 — Paul Vigay.", "vigayDist"],
        ["UK recently: “an average of 30 crop circles appear each year in the UK, around 80% of them in Wiltshire” — BBC Travel, 2021.", "bbc21"],
        ["For scale: Doug & Dave said they made as many as 25 to 30 a season (Time, 1991).", "time91"]
      ],
      chartNote: "The Dall’Aglio chart also shows Wiltshire and rest-of-world bars; some of those labels overlap, so they are not copied here. The Crop Circle Center count for 2026 is still open and is not shown. The right-hand number is how many of each year are in this app’s gallery."
    },

    gallery: {
      intro: "Formations that named people or groups said they made. Each tile says who claimed it and links to where their photos are. Only openly licensed images are shown in the app; the rest link out.",
      noPhotoNote: "No openly licensed photos of the 1992 competition entries could be found. An aerial photo of the entries by John Macnish appears on Rupert Sheldrake’s essay page (first tile); it isn’t licensed for reuse here, so it is linked, not shown. The same applies to the Circlemakers’ own photos of their commissions.",
      items: [
        { title: "1992 making competition entries", proof: "1992 crop-circle-making competition entries", date: "11–12 July 1992", where: "West Wycombe, Buckinghamshire", who: "12 competing teams; winners three Westland Helicopters engineers — Rupert Sheldrake (organiser)", src: ["sheldrake"], link: "https://www.sheldrake.org/essays/the-crop-circle-making-competition", linkLabel: "Aerial photo (John Macnish) — Sheldrake’s page" },
        { title: "Doug & Dave demonstrations", proof: "Demonstration circle near Sevenoaks, Kent", date: "1991", where: "Sevenoaks, Kent (Today demo)", who: "Doug Bower & Dave Chorley, for Today", src: ["today91"], link: "https://www.smithsonianmag.com/arts-culture/crop-circles-the-art-of-the-hoax-2524283/", linkLabel: "Photos (Rob Irving) — Smithsonian" },
        { title: "BBC Country File demo, with Doug Bower", proof: "BBC Country File demo, ~200 ft, 100 circles", date: "25 July (aired Jan 1999)", where: "Not stated", who: "Lundberg, Dickinson, Russell & Doug Bower: about 200 ft, 100 circles, made at night", src: ["cmBeeb"], link: "https://www.circlemakers.org/beeb.html", linkLabel: "Photos — circlemakers.org" },
        { title: "Mitsubishi ‘Space Star’ car", proof: "Mitsubishi ‘Space Star’, East Field", date: "August 1998", where: "East Field, Alton Barnes", who: "Circlemakers (3), daylight, 12 h", src: ["cmMits"], link: "https://www.circlemakers.org/mits.html", linkLabel: "Photos — circlemakers.org" },
        { title: "HTV West formation", proof: "HTV West documentary, Beckhampton", date: "Late July 2001", where: "Beckhampton, Wiltshire", who: "Circlemakers (3), darkness, about 4 h", src: ["cmHTV"], link: "https://www.circlemakers.org/htv.html", linkLabel: "Photos — circlemakers.org" },
        { title: "Weetabix Energy", proof: "Weetabix Energy, West Kennet", date: "July 2002", where: "West Kennet Long Barrow", who: "Circlemakers (3), 16 h over several days", src: ["cmWeetabix"], link: "https://www.circlemakers.org/withabix.html", linkLabel: "Photos — circlemakers.org" },
        { title: "National Geographic square spiral", proof: "National Geographic square spiral", date: "August 2004", where: "Opposite Silbury Hill", who: "Circlemakers (3), daylight, 5 h", src: ["cmNatGeo04"], link: "https://www.circlemakers.org/natgeo.html", linkLabel: "Photos — circlemakers.org" },
        { title: "Shredded Wheat logo", proof: "Shredded Wheat logo, Puckeridge", date: "2006", where: "Puckeridge, Hertfordshire", who: "Circlemakers (4), 14 h", src: ["cmShredded"], link: "https://www.circlemakers.org/shredded_wheat.html", linkLabel: "Photos — circlemakers.org" },
        { title: "Korn crop circle", proof: "Korn (rock band), Bakersfield", date: "2010", where: "Bakersfield, California", who: "Circlemakers (4), two days", src: ["cmKorn"], link: "https://www.circlemakers.org/korn_circle.html", linkLabel: "Photos — circlemakers.org" },
        { title: "Sarraltroff test formation", proof: "Sarraltroff, Moselle test formation", date: "June 2018", where: "Sarraltroff, Moselle, France", who: "YouTubers AstronoGeek (Arnaud Thiry), Defakator and others — at night, under 2 h", src: ["fi18", "rl18"], img: "img/claimed/sarraltroff-2018.jpg", imgAlt: "Diagram of the Sarraltroff 2018 formation", imgCredit: ["commonsSarr"], imgKind: "Diagram, not a photo" },
        { title: "LEGO Space", proof: "LEGO Space, Narromine NSW", date: "2024", where: "Narromine, NSW, Australia", who: "Thrive PR / SoldOut Events — “three full days”", src: ["lego24"], link: "https://mediaweek.vinyl.media/lego-australia-launches-space-range-with-a-crop-circle", linkLabel: "Photos — Mediaweek" }
      ]
    },

    lay: {
      intro: "Close-ups of the flattened crop: first, formations people said they made; then plants that researchers presented as unexplained. Each item says who reported what.",
      claimedNote: "No openly licensed close-up photos of the lay inside a claimed formation could be found, so none are shown here. These pages describe or picture it:",
      claimed: [
        ["Levengood & Talbott made their own test circles “using a plank with ropes attached at the ends”; after 3 days nodes were about 10% longer (described in text, no close-ups reproduced here).", "lev99"],
        ["ICCRA, Wisconsin 2005 — a formation ICCRA judged mechanically made (not a maker’s claim): their field report describes broken stalks, creases, serrated edges and footprints.", "iccra"],
        ["Circlemakers — their National Geographic 2004 page has photos of the finished square spiral and of a ‘stalk stomper’ used to make it.", "cmNatGeo04"],
        ["Sarraltroff 2018 — France 3 reported that the YouTubers filmed themselves making it with planks and ropes (video, not hosted here).", "fi18"]
      ],
      reported: [
        { img: "img/anomalies/blt_node_italy.jpg", label: "Reported by BLT Research", text: "Presented by BLT as an elongated node from an Italian formation sample.", src: ["blt"] },
        { img: "img/anomalies/blt_node_length.jpg", label: "Reported by BLT Research (W.C. Levengood)", text: "Wheat samples vs controls: “172% mean node length increase” at the node beneath the seed-head, as captioned by BLT.", src: ["blt"] },
        { img: "img/anomalies/blt_plantab2.jpg", label: "Reported by BLT Research", text: "One of the plant-abnormality photos on BLT’s page.", src: ["blt"] }
      ],
      counterNote: ["Grassi, Cocheo & Russo (CICAP) argue node elongation is what “we should expect when whatever kind of mechanical force flattens the plants, rope and wood plank included.”", "grassi"]
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
