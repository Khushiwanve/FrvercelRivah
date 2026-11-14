/* components/featured.js: featured partner cards at the top of "Creators we grow". Content comes from data.js (featured).
   "View case study" opens a full dialog; the Instagram button opens the partner's Instagram. */
(function () {
  "use strict";
  var mount = RV.$("#featured"); if (!mount) return;
  var D = window.RIVAH, list = D.featured, lim = +mount.dataset.limit || list.length;
  var IG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/></svg>';
  var BG = ["linear-gradient(150deg,#B5573A,#3B2A20)", "linear-gradient(150deg,#7A8266,#3B2A20)", "linear-gradient(150deg,#3B2A20,#B5573A)"];

  mount.innerHTML = list.slice(0, lim).map(function (f, i) {
    var stats = f.stats.slice(0, 3).map(function (s) { return "<div><b>" + s.v + "</b><span>" + s.l + "</span></div>"; }).join("");
    return '<article class="fc"><div class="fh" style="background:' + BG[i % 3] + '"><small>' + f.industry + "</small><h3>" + f.name + "</h3>" + (f.role ? "<em>" + f.role + "</em>" : "") + "</div>" +
      '<div class="fb"><p>' + f.summary + '</p><div class="fs">' + stats + '</div><div class="fa"><button class="btn" type="button" data-i="' + i + '">View case study</button>' +
      (f.instagram ? '<a class="fi" href="' + f.instagram + '" target="_blank" rel="noopener" aria-label="' + f.name + ' on Instagram">' + IG + "</a>" : "") + "</div></div></article>";
  }).join("");

  /* one shared dialog for the whole site */
  var dlg = document.getElementById("fd");
  if (!dlg) {
    dlg = document.createElement("dialog");
    dlg.id = "fd"; dlg.setAttribute("aria-labelledby", "fd-t");
    dlg.innerHTML = '<button class="x" type="button" aria-label="Close">✕</button><div id="fd-b"></div>';
    document.body.appendChild(dlg);
    dlg.querySelector(".x").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("close", function () { document.documentElement.style.overflow = ""; });
  }

  function open(i) {
    var f = list[i], h = '<span class="tag">' + f.industry + '</span><h2 id="fd-t">' + f.name + "</h2>";
    if (f.role) h += "<p><b>" + f.role + "</b></p>";
    if (f.summary !== f.approachIntro && f.summary !== f.challenge) h += "<p>" + f.summary + "</p>";
    if (f.challenge) h += "<h4>" + (f.challengeTitle || "The challenge") + "</h4><p>" + f.challenge + "</p>";
    if (f.approachIntro || f.approach.length) {
      h += "<h4>" + (f.approachTitle || "Our approach") + "</h4>";
      if (f.approachIntro) h += "<p>" + f.approachIntro + "</p>";
      if (f.approach.length) h += "<ul>" + f.approach.map(function (a) { return "<li>" + a + "</li>"; }).join("") + "</ul>";
    }
    if (f.stats.length) {
      h += "<h4>" + (f.statsTitle || "Highlights") + '</h4><div class="kp">' + f.stats.map(function (s) { return "<div><b>" + s.v + "</b><span>" + s.l + "</span></div>"; }).join("") + "</div>";
    }
    if (f.results && f.results.length) h += "<h4>" + (f.resultsTitle || "Results") + "</h4><ul>" + f.results.map(function (r) { return "<li>" + r + "</li>"; }).join("") + "</ul>";
    if (f.note) h += "<p>" + f.note + "</p>";
    if (f.instagram) h += '<p><a class="btn o" href="' + f.instagram + '" target="_blank" rel="noopener">View on Instagram</a></p>';
    document.getElementById("fd-b").innerHTML = h;
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    document.documentElement.style.overflow = "hidden";
  }
  mount.addEventListener("click", function (e) { var b = e.target.closest("button[data-i]"); if (b) open(+b.dataset.i); });
})();