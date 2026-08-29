/*!
 * tailwind-interactions.js
 * --------------------------------------------------------------------------
 * Vanilla-JS replacement for the old CSS framework's interaction layer (collapse,
 * offcanvas, dismiss). Drives the SAME data-* attributes the templates
 * already use, so no markup changes were required:
 *
 *   - data-bs-toggle="collapse"  -> toggles the `hidden` class on
 *                                   document.querySelector(data-bs-target),
 *                                   tracking aria-expanded.
 *   - data-bs-toggle="offcanvas" -> toggles `hidden` on the target element
 *                                   (the #sidebar offcanvas).
 *   - data-bs-dismiss="collapse"/"offcanvas" -> removes the matching panel
 *     (hides it) starting from the closest matching container.
 *
 * Pure event delegation on `document`. No jQuery, no Popper, no vendored framework,
 * no other dependencies.
 */
(function () {
  'use strict';

  function isHidden(el) {
    return el.classList.contains('hidden');
  }

  function setHidden(el, hidden) {
    if (hidden) {
      el.classList.add('hidden');
    } else {
      el.classList.remove('hidden');
    }
  }

  function setAria(el, shown) {
    if (!el) return;
    if (el.getAttribute('aria-expanded') !== null) {
      el.setAttribute('aria-expanded', shown ? 'true' : 'false');
    }
    if (el.getAttribute('aria-hidden') !== null) {
      el.setAttribute('aria-hidden', shown ? 'false' : 'true');
    }
  }

  // Resolve the collapse/offcanvas target referenced by a trigger element.
  // GAF-276 T20: also resolve href="#id" targets — markdown-it-ordu emits tips
  // triggers as <a data-bs-toggle="collapse" href="#md-tips-..."> with no
  // data-bs-target, which the old framework's collapse also accepted.
  function targetOf(trigger) {
    var selector =
      (trigger.dataset && trigger.dataset.bsTarget) ||
      trigger.getAttribute('data-bs-target');
    if (selector) {
      return document.querySelector(selector);
    }
    var href = trigger.getAttribute('href');
    if (href && href.charAt(0) === '#') {
      return document.querySelector(href);
    }
    return null;
  }

  // --- collapse ----------------------------------------------------------
  function collapseToggle(trigger) {
    var panel = targetOf(trigger);
    if (!panel) return;
    // GAF-276 T20: two collapse contracts live here.
    // 1) Content-layer plugin panels (markdown-it-ordu tips) carry the
    //    .collapse class: the old framework hid them by default and toggled .show.
    // 2) Template nav panels carry no .collapse: the T15 contract toggles
    //    the Tailwind `hidden` class.
    if (panel.classList.contains('collapse')) {
      var willShow = !panel.classList.contains('show');
      panel.classList.toggle('show', willShow);
      trigger.setAttribute('aria-expanded', willShow ? 'true' : 'false');
      return;
    }
    var shown = !isHidden(panel); // toggle: currently hidden -> about to show
    setHidden(panel, shown);
    if (trigger) {
      trigger.setAttribute('aria-expanded', shown ? 'true' : 'false');
    }
  }

  // --- offcanvas ----------------------------------------------------------
  // Only one offcanvas may be open at a time; opening one closes any other.
  // Panels are identified by the data-offcanvas attribute (our own contract,
  // not a framework class).
  function closeOtherOffcanvases(exclude) {
    var panels = document.querySelectorAll('[data-offcanvas]');
    for (var i = 0; i < panels.length; i++) {
      if (panels[i] !== exclude && !isHidden(panels[i])) {
        setHidden(panels[i], true);
      }
    }
  }

  function offcanvasToggle(trigger) {
    var panel = targetOf(trigger);
    if (!panel) return;
    var shown = isHidden(panel); // currently hidden -> about to show
    if (!shown) {
      closeOtherOffcanvases(panel);
      panel.classList.add('hidden');
    } else {
      panel.classList.remove('hidden');
    }
    trigger.setAttribute('aria-expanded', shown ? 'true' : 'false');
  }

  // --- dismiss -----------------------------------------------------------
  function dismiss(trigger) {
    var kind = trigger.getAttribute('data-bs-dismiss');
    var panel = null;
    // Prefer the explicit target, if one is set (e.g. a close button with a
    // data-bs-target). Otherwise climb from the trigger to the nearest panel.
    panel = targetOf(trigger);
    if (!panel) {
      panel = trigger.closest(
        kind === 'collapse' ? '.collapse' : '[data-offcanvas]'
      );
    }
    if (panel) {
      setHidden(panel, true);
    }
  }

  // --- carousel (GAF-276 T20) ---------------------------------------------
  // markdown-it-ordu emits plugin carousels with .carousel-item children and
  // prev/next control buttons (data-bs-target="#<carousel-id>",
  // data-bs-slide="prev|next"). The old framework cycled these; the shim owns it now:
  // move the `active` class (compat CSS shows exactly the active slide).
  // A slide toggle means "go to slide N" (not show/hide), so the generic
  // hidden-class toggle must NOT run for these triggers.
  function carouselTo(trigger, dirOverride) {
    var sel =
      (trigger.dataset && trigger.dataset.bsTarget) ||
      trigger.getAttribute('data-bs-target');
    // GAF-276 T21: the plugin emits data-bs-target="#carousel-undefined" when
    // its build-time id variable is undefined — resolve null, then climb to the
    // enclosing carousel so controls still cycle (exceeds old-site parity).
    var root = sel ? document.querySelector(sel) : null;
    if (!root) root = trigger.closest('.carousel');
    if (!root) return;
    var items = root.querySelectorAll('.carousel-item');
    if (!items.length) return;
    var current = 0;
    for (var i = 0; i < items.length; i++) {
      if (items[i].classList.contains('active')) { current = i; break; }
    }
    var dir = dirOverride || trigger.getAttribute('data-bs-slide');
    var next;
    if (dir === 'prev') {
      next = (current - 1 + items.length) % items.length;
    } else if (dir === 'next') {
      next = (current + 1) % items.length;
    } else {
      var n = parseInt(dir, 10);
      next = isNaN(n) ? current : n;
    }
    items[current].classList.remove('active');
    items[next].classList.add('active');
  }

  // Auto-ride (GAF-276 T20): the old framework advanced data-bs-ride carousels
  // on a timer. Plugin pages emit data-bs-interval on the ACTIVE item; cycle
  // at that interval, else the T20 default of 5000ms. Click cycling stops the
  // timer for that carousel (parity with the old pause-on-interaction).
  function rideCarousel(root) {
    var items = root.querySelectorAll('.carousel-item');
    if (!items.length) return;
    var interval = 5000;
    var current = 0;
    for (var i = 0; i < items.length; i++) {
      if (items[i].classList.contains('active')) {
        current = i;
        var v = parseInt(items[i].getAttribute('data-bs-interval'), 10);
        if (!isNaN(v) && v > 0) interval = v;
        break;
      }
    }
    root._rideTimer = setInterval(function () { carouselTo(root, 'next'); }, interval);
    root.addEventListener('click', function () {
      if (root._rideTimer) { clearInterval(root._rideTimer); root._rideTimer = null; }
    });
  }
  Array.prototype.forEach.call(
    document.querySelectorAll('.carousel[data-bs-ride]'),
    rideCarousel
  );

  // --- delegated click handler -------------------------------------------
  document.addEventListener('click', function (event) {
    var target = event.target && event.target.closest
      ? event.target.closest('[data-bs-toggle], [data-bs-dismiss], [data-bs-slide]')
      : null;
    if (!target) return;
    var toggle = target.getAttribute('data-bs-toggle');
    var remove = target.getAttribute('data-bs-dismiss');
    var slide = target.getAttribute('data-bs-slide');

    if (slide) {
      carouselTo(target);
      event.preventDefault();
      return;
    }

    if (toggle === 'collapse') {
      collapseToggle(target);
      // Plugin tips triggers are <a href="#id"> — stop the URL hash jump;
      // real in-page anchors never carry data-bs-toggle="collapse".
      if (target.getAttribute('data-bs-target') === null &&
          (target.getAttribute('href') || '').charAt(0) === '#') {
        event.preventDefault();
      }
    } else if (toggle === 'offcanvas') {
      offcanvasToggle(target);
    }

    if (remove) {
      dismiss(target);
    }
  });

  // --- mobile init --------------------------------------------------------
  // The old framework hid .offcanvas panels by default and showed them >= lg via CSS.
  // Tailwind CSS carries the >= lg show; the shim owns the mobile initial
  // hide so the sidebar starts closed on small screens.
  if (window.matchMedia('(max-width: 991px)').matches) {
    Array.prototype.forEach.call(
      document.querySelectorAll('[data-offcanvas]'),
      function (panel) { setHidden(panel, true); }
    );
  }
})();