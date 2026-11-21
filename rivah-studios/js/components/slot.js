/* components/slot.js: the changing last word in the home headline (sell. hit. stick. convert.). Static with reduced motion. */
(function () {
  "use strict";
  var slot = RV.$("#slot");
  if (!slot || RV.reduce) return;
  var ems = RV.$$("em", slot), n = 0;
  setInterval(function () {
    if (document.hidden) return;
    var cur = ems[n];
    cur.className = "off";
    n = (n + 1) % ems.length;
    var next = ems[n];
    next.style.transition = "none"; next.className = ""; void next.offsetWidth; next.style.transition = ""; next.className = "on";
    setTimeout(function () { cur.className = ""; }, 650);
  }, 2200);
})();