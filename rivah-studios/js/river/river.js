/* river.js: WebGL setup for the river background. The shader itself lives in river-shader.js.
   Smoothness: the page height is eased (never jumps), the canvas keeps a fixed size, and the render
   resolution lowers itself automatically on a slow device and rises again when there is room. */
(function () {
  "use strict";
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cv = document.getElementById("c");
  var gl = cv.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" });
  if (!gl || !window.RIVER_FRAG) return; /* page still works on the plain cream background */

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  var vs = compile(gl.VERTEX_SHADER, "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}");
  var fs = compile(gl.FRAGMENT_SHADER, window.RIVER_FRAG);
  if (!vs || !fs) return;

  var prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs);
  gl.linkProgram(prog); gl.useProgram(prog);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var U = {};
  ["R", "dpr", "sy", "t", "H", "Wd", "N", "ms", "mv"].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
  var M = window.RIVAH_MOUSE || { x: -999, y: -999, v: 0 };

  var q = innerWidth < 700 ? 0.7 : 0.85;           /* render scale, adjusts itself */
  var cur = { H: 0, N: 3 }, tgt = { H: 0, N: 3 }, first = true;

  function targets() {
    var H = document.documentElement.scrollHeight, vh = cv.clientHeight || innerHeight;
    tgt.H = H; tgt.N = Math.max(3, H / (vh * 1.15));   /* number of bends, continuous so it never jumps */
    if (first) { cur.H = tgt.H; cur.N = tgt.N; first = false; }
  }
  function size() {
    var W = cv.clientWidth || innerWidth, vh = cv.clientHeight || innerHeight;
    var d = Math.min(devicePixelRatio || 1, 1.5) * q;
    var cw = Math.round(W * d), ch = Math.round(vh * d);
    if (cv.width !== cw || cv.height !== ch) { cv.width = cw; cv.height = ch; gl.viewport(0, 0, cw, ch); }
    gl.uniform2f(U.R, W, vh);
    gl.uniform1f(U.dpr, cw / W);
    gl.uniform1f(U.Wd, W);
  }

  var last = 0, acc = 0, frames = 0, good = 0, warm = 0;
  function adapt(dt) {
    if (dt > 250 || ++warm < 30) return;                /* ignore the first frames and tab switches */
    acc += dt; frames++;
    if (frames < 40) return;
    var avg = acc / frames; acc = 0; frames = 0;
    if (avg > 24 && q > 0.45) { q = Math.max(0.45, q - 0.1); good = 0; size(); }
    else if (avg < 17.5 && q < 1) { if (++good >= 4) { q = Math.min(1, q + 0.05); good = 0; size(); } }
    else good = 0;
  }

  function draw(ms) {
    var dt = last ? ms - last : 16; last = ms;
    if (reduce) { cur.H = tgt.H; cur.N = tgt.N; }
    else {
      cur.H += (tgt.H - cur.H) * 0.12; cur.N += (tgt.N - cur.N) * 0.12;
      if (Math.abs(tgt.H - cur.H) < 0.5) cur.H = tgt.H;
      if (Math.abs(tgt.N - cur.N) < 0.002) cur.N = tgt.N;
      adapt(dt);
    }
    M.v *= 0.975;
    gl.uniform1f(U.H, cur.H);
    gl.uniform1f(U.N, cur.N);
    gl.uniform2f(U.ms, M.x, M.y + scrollY);
    gl.uniform1f(U.mv, M.v);
    gl.uniform1f(U.sy, scrollY);
    gl.uniform1f(U.t, reduce ? 0 : ms / 1000);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (!reduce && !document.hidden) requestAnimationFrame(draw);
  }

  function onResize() { size(); targets(); if (reduce) draw(0); }
  document.addEventListener("visibilitychange", function () { if (!document.hidden && !reduce) { last = 0; requestAnimationFrame(draw); } });
  addEventListener("resize", onResize);
  addEventListener("load", onResize);
  if (window.ResizeObserver) new ResizeObserver(targets).observe(document.body);   /* content grew or shrank: ease, do not jump */
  if (reduce) addEventListener("scroll", function () { draw(0); }, { passive: true });
  size(); targets();
  if (reduce) draw(0); else requestAnimationFrame(draw);
})();