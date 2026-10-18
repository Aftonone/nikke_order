/* kinds: c = chapters, e = event, x = collaboration, p = popularity event, s = short event story, S = optional side story */
var DATA = {
"2022": `Nov 4 ; c|Chapters 1–16|Launch ; S|Second Affection|after Chapter 14
Nov 10 ; e|No Caller ID
Nov 24 ; c|Chapters 17–18 ; e|High Tech Toy
Dec 8 ; e|Miracle Snow
Dec 29 ; e|Brand New Year`,
"2023": `Jan 12 ; c|Chapters 19–20 ; e|D-Outsiders
Feb 2 ; e|Maid in Valentine
Feb 23 ; x|Bullet x Chainsaw||unavailable
Mar 16 ; e|Bow Wow Paradise
Mar 30 ; e|Cherry Blossom
Apr 1 ; s|Full Fool Day
Apr 13 ; e|License to Kill
Apr 27 ; c|Chapters 21–22 ; e|Over Zone|0.5 anniversary
May 18 ; e|Bunny x777
Jun 1 ; e|Queen's Order
Jun 15 ; e|Blue Water Island
Jul 6 ; e|Nya Nya Paradise
Jul 20 ; c|Chapters 23–24 ; e|Golden Ship ; S|Wordless|after Chapter 24
Aug 3 ; e|Sea, You, Again
Aug 24 ; p|First Affection
Sep 1 ; x|OuteR: Automata||unavailable
Sep 21 ; e|School of Lock
Oct 5 ; e|Dazzling Cupid
Oct 19 ; e|A.C.P.U. Freeze!
Nov 2 ; c|Chapters 25–26 ; e|Red Ash|1st anniversary ; e|Happy 1st Anniversary||unavailable
Nov 23 ; e|Alone Survivor
Dec 7 ; e|Neverland
Dec 28 ; e|New Year, New Sword`,
"2024": `Jan 11 ; e|Lion Heart
Jan 25 ; e|Dirty Back Yard
Feb 5 ; e|Perfect Maid
Feb 22 ; c|Chapters 27–28 ; e|Boom's Day
Mar 7 ; e|Kill the Lord
Mar 21 ; e|Re:CIPE For You||unavailable
Apr 1 ; s|Liar's End
Apr 11 ; e|One More Time
Apr 25 ; c|Chapters 29–30 ; e|Last Kingdom|1.5 anniversary
May 16 ; e|Dark Hero
May 30 ; e|Golden Coin Rush
Jun 20 ; e|Claymore!
Jul 4 ; e|Beauty Full Shot
Jul 25 ; c|Chapters 31–32 ; e|Juvenile Days
Aug 8 ; e|ColorLess
Aug 22 ; x|You Can (Not) Evade||unavailable
Sep 19 ; p|Nonsense Red ; e|Jinx Player
Oct 3 ; e|Phantom Thief Detective
Oct 17 ; e|Life Again
Oct 31 ; c|Chapters 33–34 ; e|Old Tales|2nd anniversary ; S|Mudfish|after the 2nd anniversary
Nov 21 ; e|Secret Garden
Dec 5 ; e|Ice Dragon Saga
Dec 26 ; e|Footstep, Walk, Run`,
"2025": `Jan 1 ; s|Out of Uniform
Jan 16 ; e|Wisdom Spring
Jan 30 ; e|Romantic Valentine
Feb 20 ; c|Chapters 35–36 ; x|EVANGELION: Second Quest||unavailable
Mar 13 ; e|For Rest
Mar 27 ; e|New Flavor
Apr 1 ; s|Fool Burst Day
Apr 10 ; e|True Flavor
Apr 24 ; c|Chapters 37–38 ; e|Unbreakable Sphere|2.5 anniversary
May 15 ; e|Arcane Archive
May 29 ; e|Lord, for Justice
Jun 12 ; x|Memories Teller
Jul 3 ; e|Over the Horizon
Jul 17 ; e|Boom the Ghost!
Aug 7 ; c|Chapters 39–40 ; e|Absolute ; S|Eden Spear|after Chapter 39
Sep 4 ; e|Coins in Rush||unavailable
Sep 25 ; e|Reborn Evil||unavailable
Oct 16 ; e|Go! Ninja Thief!||unavailable ; p|Yes, My Commander||unavailable
Oct 30 ; c|Chapters 41–42 ; e|Goddess Fall|3rd anniversary ; S|Pretty Star|after Chapter 42
Nov 20 ; e|Blank Ticket||unavailable
Dec 4 ; e|Terminus Ticket||unavailable
Dec 30 ; e|Ark Guardian||unavailable`,
"2026": `Jan 15 ; e|Sin Editor||unavailable
Jan 29 ; e|Fatal Maid||unavailable
Feb 12 ; c|Chapters 43–44 ; x|Lie Cause Recoil||unavailable
Feb 13 ; e|Chocolate, Please!||unavailable
Mar 5 ; e|Enter Heaven||unavailable
Mar 19 ; e|2x2 Love||unavailable
Apr 1 ; s|Fool Metal Panic!||unavailable
Apr 9 ; e|Good World||unavailable
Apr 23 ; c|Chapters 45–46 ; e|Star Anis|3.5 anniversary
May 14 ; e|B-Side Idol||unavailable
May 28 ; e|Bitter Spice||unavailable
Jun 11 ; e|Ark Ranger||unavailable
Jul 2 ; e|Wave to You||unavailable
Jul 23 ; e|Project Matis||unavailable
Aug 13 ; x|Persona on Frontline||unavailable
Aug 13 ; c|Chapters 47–48
Sep 3 ; e|Great Villain Union||unavailable
Sep 17 ; e|Coin Rush Showdown||unavailable
Oct 8 ; e|Little Witch Trick||upcoming ; p|Most Beautiful Maid ; S|Gingerbread House|after Wave to You
`};

var KEY = "nikke-play-order-v1";
var state = { done: {}, doneItems: {}, side: {}, filters: { main: true, collab: true, popularity: true, short: true, side: true, unavailable: false } };
try {
  var raw = localStorage.getItem(KEY);
  if (raw) {
    var p = JSON.parse(raw);
    if (p && (p.done || p.doneItems)) {
      state = p;
      state.doneItems = state.doneItems || {};
      state.filters = Object.assign(
        { main: true, collab: true, popularity: true, short: true, side: !p.hideSide, unavailable: false },
        p.filters || {}
      );
      delete state.hideSide;
    }
  }
} catch (e) {}
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

var legacyDone = state.done || {};
var previousDoneItems = state.doneItems || {};
var migratedDoneItems = {};
state.doneItems = {};
var ITEM_TOTAL = 0;
var LEGACY_ITEM_TOTAL = 0;
var steps = []; /* {n, year, el} */
var contentItems = []; /* {id, year, el} */
var playItems = []; /* {id, year, el, side} */

function itemHtml(raw, id, domId, legacyId) {
  var f = raw.split("|"), k = f[0], name = esc(f[1]), tag = f[2] ? esc(f[2]) : "";
  var availability = f[3] || "";
  var filter = "";
  if (k === "c") {
    filter = ' data-filter="main"';
  } else if (k === "x") {
    filter = ' data-filter="collab"';
  } else if (k === "p") {
    filter = ' data-filter="popularity"';
  } else if (k === "s") {
    filter = ' data-filter="short"';
  }
  var extra = tag ? '<span class="tag">' + tag + '</span>' : "";
  if (k === "c") extra = '<span class="tag main-story">Main Story</span>' + extra;
  if (k === "x") extra = '<span class="tag x">Collaboration</span>' + extra;
  if (k === "p") extra = '<span class="tag popularity">Popularity event</span>' + extra;
  if (k === "s") extra = '<span class="tag short">Short story</span>' + extra;
  if (availability === "unavailable") {
    extra += '<span class="tag unavailable-status">' + (k === "x" ? "Unavailable collab" : "Not archived") + '</span>';
  } else if (availability === "upcoming") {
    extra += '<span class="tag unavailable-status">Upcoming</span>';
  }
  var title = '<span class="nm">' + name + '</span>';
  var unavailableAttr = availability ? ' data-availability="' + availability + '"' : "";
  var legacyAttr = legacyId ? ' data-legacyid="' + legacyId + '"' : "";
  return '<div class="it" data-itemid="' + id + '"' + legacyAttr + filter + unavailableAttr + '><label><input type="checkbox" id="item' + domId + '" aria-label="Mark ' + name + ' done">' + title + '</label>' + extra + '</div>';
}

function itemKey(year, name) {
  return year + "-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

var root = document.getElementById("root");
var sideCount = 0;
Object.keys(DATA).forEach(function (year) {
  var rows = DATA[year].split("\n");
  var byMonth = [];
  rows.forEach(function (line) {
    var parts = line.split(" ; ");
    var date = parts[0];
    var mon = date.slice(0, 3);
    var last = byMonth[byMonth.length - 1];
    if (!last || last.mon !== mon) { last = { mon: mon, rows: [] }; byMonth.push(last); }
    last.rows.push(parts);
  });

  var sec = document.createElement("section");
  sec.className = "year";
  sec.innerHTML = '<div class="year-head"><h2>' + year + '</h2><span class="yc" id="yc' + year + '"></span></div>';
  byMonth.forEach(function (m) {
    var mEl = document.createElement("div");
    mEl.className = "month";
    var label = document.createElement("div");
    label.className = "mlabel";
    label.textContent = m.mon;
    var ol = document.createElement("ol");
    ol.className = "steps";
    m.rows.forEach(function (parts) {
      var n = steps.length + 1;
      var itemMarkup = "", sides = "";
      parts.slice(1).forEach(function (raw) {
        if (raw.charAt(0) === "S") {
          var f = raw.split("|");
          sideCount += 1;
          var sid = sideCount;
          sides += '<div class="side" data-filter="side" data-sid="' + sid + '"><label><input type="checkbox" id="side' + sid + '" aria-label="Mark side story ' + esc(f[1]) + ' done"><span class="sn">' + esc(f[1]) + '</span><span class="tag side">Optional Side Story</span></label><span class="sw">' + esc(f[2]) + '</span></div>';
        } else {
          ITEM_TOTAL += 1;
          var fields = raw.split("|");
          var key = itemKey(year, fields[1]);
          var legacyId = fields[1] === "Chocolate, Please!" ? 0 : ++LEGACY_ITEM_TOTAL;
          if (legacyDone[n] || previousDoneItems[key]) migratedDoneItems[key] = 1;
          itemMarkup += itemHtml(raw, key, ITEM_TOTAL, legacyId);
        }
      });
      var li = document.createElement("li");
      li.className = "step";
      li.id = "step" + n;
      li.innerHTML =
        '<div class="body">' + itemMarkup + sides + '</div>';
      ol.appendChild(li);
      steps.push({ n: n, year: year, el: li });
      li.querySelectorAll(".it[data-itemid]").forEach(function (el) {
        contentItems.push({
          id: el.getAttribute("data-itemid"),
          legacyId: Number(el.getAttribute("data-legacyid")),
          year: year,
          el: el
        });
      });
    });
    mEl.appendChild(label);
    mEl.appendChild(ol);
    sec.appendChild(mEl);
  });
  root.appendChild(sec);
});

var personaItem = contentItems.find(function (item) { return item.el.querySelector(".nm").textContent === "Persona on Frontline"; });
var chapterItem = contentItems.find(function (item) { return item.el.querySelector(".nm").textContent === "Chapters 47–48"; });
if (personaItem && chapterItem) {
  var oldPersonaId = personaItem.legacyId;
  personaItem.legacyId = chapterItem.legacyId;
  chapterItem.legacyId = oldPersonaId;
}
contentItems.forEach(function (item) {
  if (item.legacyId && previousDoneItems[item.legacyId]) migratedDoneItems[item.id] = 1;
});
state.doneItems = migratedDoneItems;
state.done = {};
steps.forEach(function (step) {
  step.el.querySelectorAll(".it[data-itemid], .side[data-sid]").forEach(function (el) {
    var side = el.hasAttribute("data-sid");
    var item = {
      id: el.getAttribute(side ? "data-sid" : "data-itemid"),
      year: step.year,
      el: el,
      side: side
    };
    item.number = playItems.length + 1;
    var label = el.querySelector("label");
    var number = document.createElement("span");
    number.className = "num";
    number.textContent = item.number;
    label.insertBefore(number, label.firstChild);
    playItems.push(item);
  });
});
ITEM_TOTAL = playItems.length;
save();
document.getElementById("bar").setAttribute("aria-valuemax", ITEM_TOTAL);

function firstOpen() {
  for (var i = 0; i < playItems.length; i++) {
    var item = playItems[i];
    var done = item.side ? state.side[item.id] : state.doneItems[item.id];
    if (!done && !item.el.hidden) return item;
  }
  return null;
}

function refresh() {
  var countedItems = playItems.filter(function (item) {
    return state.filters.unavailable || !item.el.hasAttribute("data-availability");
  });
  var done = countedItems.filter(function (item) {
    return item.side ? state.side[item.id] : state.doneItems[item.id];
  }).length;
  contentItems.forEach(function (item) {
    var on = !!state.doneItems[item.id];
    item.el.classList.toggle("done", on);
    item.el.classList.remove("next");
    item.el.querySelector('input[type="checkbox"]').checked = on;
  });
  document.querySelectorAll(".side[data-sid]").forEach(function (el) {
    var sid = el.getAttribute("data-sid");
    var on = !!state.side[sid];
    el.classList.toggle("done", on);
    el.classList.remove("next");
    document.getElementById("side" + sid).checked = on;
  });
  steps.forEach(function (step) {
    var chip = step.el.querySelector(".nextchip");
    if (chip) chip.remove();
  });
  document.querySelectorAll(".legend-filter").forEach(function (button) {
    button.setAttribute("aria-pressed", !!state.filters[button.getAttribute("data-filter")]);
  });
  document.querySelectorAll(".step").forEach(function (step) {
    var hasVisibleContent = false;
    step.querySelectorAll(".it, .side[data-sid]").forEach(function (item) {
      var filter = item.getAttribute("data-filter");
      var availability = item.getAttribute("data-availability");
      var visible = (!filter || !!state.filters[filter]) &&
        (availability === null || !!state.filters.unavailable);
      item.hidden = !visible;
      if (visible) hasVisibleContent = true;
    });
    step.hidden = !hasVisibleContent;
  });
  document.querySelectorAll(".month").forEach(function (month) {
    month.hidden = !month.querySelector(".step:not([hidden])");
  });
  document.querySelectorAll(".year").forEach(function (year) {
    year.hidden = !year.querySelector(".month:not([hidden])");
  });
  var nx = firstOpen();
  if (nx) {
    nx.el.classList.add("next");
    var first = nx.el.querySelector(".nm, .sn");
    if (first) { var c = document.createElement("span"); c.className = "nextchip"; c.textContent = "NEXT"; first.parentNode.appendChild(c); }
  }
  document.getElementById("count").innerHTML = done + " / " + countedItems.length + "<span>items done</span>";
  document.getElementById("bar").setAttribute("aria-valuemax", countedItems.length);
  document.getElementById("barfill").style.width = (countedItems.length ? done / countedItems.length * 100 : 0) + "%";
  document.getElementById("bar").setAttribute("aria-valuenow", done);
  var nl = document.getElementById("nextline");
  if (!nx && done === countedItems.length) nl.textContent = "You are caught up. Chapters 49–50 arrive Oct 29.";
  else if (!nx) nl.textContent = "No unfinished items match the selected filters.";
  else {
    var title = nx.el.querySelector(".nm, .sn").textContent;
    nl.textContent = "Next: item " + nx.number + ", " + title + ", " + nx.year;
  }
  Object.keys(DATA).forEach(function (y) {
    var inY = countedItems.filter(function (item) { return item.year === y; });
    var dn = inY.filter(function (item) { return item.side ? state.side[item.id] : state.doneItems[item.id]; }).length;
    document.getElementById("yc" + y).textContent = dn + " / " + inY.length + " done";
  });
}

root.addEventListener("change", function (e) {
  var t = e.target;
  if (!t || t.type !== "checkbox") return;
  var itemMatch = /^item(\d+)$/.exec(t.id);
  if (itemMatch) {
    var itemId = t.closest(".it").getAttribute("data-itemid");
    if (t.checked) state.doneItems[itemId] = 1; else delete state.doneItems[itemId];
  }
  var s = /^side(\d+)$/.exec(t.id);
  if (s) { if (t.checked) state.side[s[1]] = 1; else delete state.side[s[1]]; }
  save(); refresh();
});

document.getElementById("jump").addEventListener("click", function () {
  var nx = firstOpen();
  if (nx) nx.el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
});
document.querySelectorAll(".legend-filter").forEach(function (button) {
  button.addEventListener("click", function () {
    var filter = button.getAttribute("data-filter");
    state.filters[filter] = !state.filters[filter];
    save(); refresh();
  });
});
var resetBtn = document.getElementById("reset"), resetTimer = null;
resetBtn.addEventListener("click", function () {
  if (!resetTimer) {
    resetBtn.textContent = "Click again to confirm";
    resetTimer = setTimeout(function () { resetBtn.textContent = "Clear progress"; resetTimer = null; }, 3500);
    return;
  }
  clearTimeout(resetTimer); resetTimer = null;
  resetBtn.textContent = "Clear progress";
  state.doneItems = {}; state.side = {}; save(); refresh();
});

refresh();
