/* components/reels.js: reel cards in a swipeable row.
   - Tapping the card (the video, the play button or the Instagram icon) opens that reel on Instagram.
   - The speaker button turns the sound on or off. Only one reel plays with sound at a time.
   Use data-limit on #reels-grid to show only the first few. Content comes from data.js (reels). */
(function () {
  "use strict";
  var grid = RV.$("#reels-grid"); if (!grid) return;
  var D = window.RIVAH, limit = +grid.dataset.limit || D.reels.length;
  var IG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/></svg>';
  var HEART = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  var SP = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  var SOUND = '<svg class="s-off" ' + SP + '><path d="M11 5L6 9H3v6h3l5 4z"/><path d="M16 9l5 6M21 9l-5 6"/></svg>' +
              '<svg class="s-on" ' + SP + '><path d="M11 5L6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';

  grid.innerHTML = D.reels.slice(0, limit).map(function (r, i) {
    var bg = r.poster ? "background:url(" + r.poster + ") center/cover" : "background:linear-gradient(160deg," + D.tints[i % 4] + ",#3B2A20)";
    var video = r.video ? '<video muted loop playsinline preload="none"' + (r.poster ? ' poster="' + r.poster + '"' : "") + ' src="' + r.video + '"></video>' : "";
    var sound = r.video ? '<button class="snd" type="button" aria-pressed="false" aria-label="Turn sound on for ' + r.title + '">' + SOUND + "</button>" : "";
    var stats = (r.likes || r.views) ? '<div class="st">' + (r.likes ? "<span>" + HEART + r.likes + "</span>" : "") + (r.views ? "<span>" + PLAY + r.views + "</span>" : "") + "</div>" : "";
    return '<div class="reel" style="--r:' + (r.ratio || "9/16") + '">' +
      '<div class="rm" style="' + bg + '">' + (r.poster ? "" : r.client) + "</div>" + video + sound +
      '<a class="rl" href="' + r.instagram + '" target="_blank" rel="noopener" aria-label="Watch reel: ' + r.title + ' on Instagram">' +
      '<span class="ig">' + IG + '</span><span class="pl">' + PLAY + '</span><span class="bt"><b>' + r.title + "</b>" + stats + "</span></a></div>";
  }).join("");

  function setBtn(b, on) {
    if (!b) return;
    b.classList.toggle("on", on);
    b.setAttribute("aria-pressed", on ? "true" : "false");
    b.setAttribute("aria-label", (on ? "Turn sound off for " : "Turn sound on for ") + b.parentNode.querySelector("b").textContent);
  }

  /* sound on/off: only one reel has sound at a time */
  grid.addEventListener("click", function (e) {
    var b = e.target.closest(".snd"); if (!b) return;
    var v = b.parentNode.querySelector("video"); if (!v) return;
    if (v.muted) {
      RV.$$("video", grid).forEach(function (o) { if (o !== v) { o.muted = true; setBtn(o.parentNode.querySelector(".snd"), false); } });
      v.muted = false;
      var p = v.play(); if (p && p.catch) p.catch(function () {});
      setBtn(b, true);
    } else {
      v.muted = true; setBtn(b, false);
    }
  });

  /* preview videos play only while on screen, and not at all with reduced motion */
  var vids = RV.$$("video", grid);
  if (vids.length && !RV.reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { var p = e.target.play(); if (p && p.catch) p.catch(function () {}); } else e.target.pause();
      });
    }, { threshold: 0.5 });
    vids.forEach(function (v) { io.observe(v); });
  }
})();