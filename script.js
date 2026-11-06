(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- scroll reveal ---------- */
  if (window.AOS) AOS.init({ duration: 700, once: true, offset: 60, easing: "ease-out-cubic", disable: reduce });

  /* ---------- skills: turn the comma lists into chips ---------- */
  $$(".skill-card").forEach(function (card, idx) {
    var icons = ["bi-code-slash", "bi-robot", "bi-terminal", "bi-diagram-3", "bi-cpu", "bi-cloud-arrow-up",
                 "bi-database", "bi-bug", "bi-tools", "bi-shield-check", "bi-kanban"];
    var h = $("h5", card), p = $("p", card);
    if (h && !$(".skill-ico", h)) {
      var ico = document.createElement("span");
      ico.className = "skill-ico";
      ico.innerHTML = '<i class="bi ' + icons[idx % icons.length] + '"></i>';
      h.insertBefore(ico, h.firstChild);
    }
    if (p) {
      var wrap = document.createElement("div");
      wrap.className = "chips";
      p.textContent.split(/,\s*/).forEach(function (t, i) {
        if (!t.trim()) return;
        var c = document.createElement("span");
        c.className = "chip";
        c.style.setProperty("--i", i);
        c.textContent = t.trim();
        wrap.appendChild(c);
      });
      p.replaceWith(wrap);
    }
  });

  /* ---------- projects: illustrated header on every card ---------- */
  var art = [
    ["bi-heart-pulse", "art-1"], ["bi-bank2", "art-2"], ["bi-compass", "art-3"], ["bi-bullseye", "art-4"],
    ["bi-activity", "art-5"], ["bi-camera-video", "art-6"], ["bi-chat-dots", "art-7"], ["bi-file-earmark-person", "art-8"]
  ];
  $$(".project-card").forEach(function (card, i) {
    var a = art[i % art.length];
    var header = document.createElement("div");
    header.className = "card-art " + a[1];
    header.setAttribute("aria-hidden", "true");
    header.innerHTML = '<span class="art-ico"><i class="bi ' + a[0] + '"></i></span><span class="art-no">' +
      String(i + 1).padStart(2, "0") + "</span>";
    var body = document.createElement("div");
    body.className = "card-body-x";
    while (card.firstChild) body.appendChild(card.firstChild);
    // buttons sit at the bottom of the card
    var btns = $$("a.btn", body);
    if (btns.length) {
      var row = document.createElement("div");
      row.className = "btn-row";
      btns.forEach(function (b) { row.appendChild(b); row.appendChild(document.createTextNode(" ")); });
      $$("br", body).slice(-2).forEach(function (br) { br.remove(); });
      body.appendChild(row);
    }
    // loose tech tags would each become a full-width row in the column layout: group them in one wrapping row
    var loose = Array.prototype.filter.call(body.children, function (el) { return el.classList.contains("badge-tech"); });
    if (loose.length) {
      var tags = document.createElement("div");
      tags.className = "tags";
      body.insertBefore(tags, loose[0]);
      loose.forEach(function (t) { tags.appendChild(t); });
      $$("br", body).forEach(function (br) { br.remove(); });
    }
    card.appendChild(header);
    card.appendChild(body);
  });

  /* ---------- cursor spotlight on cards ---------- */
  document.addEventListener("pointermove", function (e) {
    var card = e.target.closest && e.target.closest(".glass-card");
    if (!card) return;
    var r = card.getBoundingClientRect();
    card.style.setProperty("--mx", e.clientX - r.left + "px");
    card.style.setProperty("--my", e.clientY - r.top + "px");
  });

  /* ---------- nav: solid after scrolling, active link, progress bar, timeline fill ---------- */
  var nav = $("#nav"), bar = $("#progress"), timeline = $(".timeline");
  var links = $$(".nav-link");
  var sections = links.map(function (l) { return $(l.getAttribute("href")); }).filter(Boolean);

  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = "scaleX(" + (h > 0 ? y / h : 0) + ")";
    if (nav) nav.classList.toggle("scrolled", y > 24);

    var current = null, probe = y + window.innerHeight * 0.35;
    sections.forEach(function (s) { if (s.offsetTop <= probe) current = s; });
    links.forEach(function (l) { l.classList.toggle("active", !!current && l.getAttribute("href") === "#" + current.id); });

    if (timeline) {
      var r = timeline.getBoundingClientRect();
      var p = (window.innerHeight * 0.65 - r.top) / r.height;
      timeline.style.setProperty("--tl", Math.max(0, Math.min(1, p)));
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  // close the mobile menu after choosing a link
  links.forEach(function (l) {
    l.addEventListener("click", function () {
      var m = $("#navMenu");
      if (m && m.classList.contains("show") && window.bootstrap) bootstrap.Collapse.getOrCreateInstance(m).hide();
    });
  });

  /* ---------- typed headline ---------- */
  var typed = $("#typed");
  if (typed) {
    var words = ["agentic AI workflows", "RAG pipelines", "LLM-powered applications", "evaluation and observability"];
    if (reduce) {
      typed.textContent = words[0];
    } else {
      var w = 0, c = 0, del = false;
      (function tick() {
        var word = words[w];
        typed.textContent = word.slice(0, c);
        var wait = del ? 28 : 65;
        if (!del && c === word.length) { del = true; wait = 1500; }
        else if (del && c === 0) { del = false; w = (w + 1) % words.length; wait = 350; }
        else c += del ? -1 : 1;
        setTimeout(tick, wait);
      })();
    }
  }

  /* ---------- count-up stats ---------- */
  var counters = $$("[data-count]");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target, to = +el.dataset.count, suffix = el.dataset.suffix || "", t0 = null;
        (function step(t) {
          t0 = t0 || t;
          var k = Math.min((t - t0) / 1100, 1);
          el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))) + suffix;
          if (k < 1) requestAnimationFrame(step);
        })(performance.now());
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { el.textContent = "0" + (el.dataset.suffix || ""); io.observe(el); });
  }

  /* ---------- background: drifting neural network that leans toward the pointer ---------- */
  var cv = $("#net");
  if (cv && cv.getContext) {
    var ctx = cv.getContext("2d"), W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var pts = [], mouse = { x: -999, y: -999 }, running = true;

    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(90, Math.max(28, (W * H) / 24000)));
      pts = [];
      for (var i = 0; i < n; i++) {
        pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: Math.random() * 1.6 + .8 });
      }
    }

    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        if (!reduce) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
        }
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
          if (d < 16000) {
            ctx.strokeStyle = "rgba(129,140,248," + (0.22 * (1 - d / 16000)).toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        var mx = p.x - mouse.x, my = p.y - mouse.y, md = mx * mx + my * my;
        if (md < 28000) {
          ctx.strokeStyle = "rgba(34,211,238," + (0.5 * (1 - md / 28000)).toFixed(3) + ")";
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
        ctx.fillStyle = "rgba(196,181,253,.75)";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
      }
      if (running && !reduce) requestAnimationFrame(frame);
    }

    window.addEventListener("resize", function () { resize(); if (reduce) frame(); });
    window.addEventListener("pointermove", function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
    document.addEventListener("visibilitychange", function () {
      running = !document.hidden;
      if (running) requestAnimationFrame(frame);
    });
    resize(); frame();
  }

  /* ---------- chat widget ---------- */
  window.toggleChat = function () {
    var chat = $("#chat-window"), btn = $("#chat-button");
    if (!chat) return;
    var open = !chat.classList.contains("open");
    chat.classList.toggle("open", open);
    if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
  };
  var cb = $("#chat-button");
  if (cb) cb.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); window.toggleChat(); }
  });
})();
