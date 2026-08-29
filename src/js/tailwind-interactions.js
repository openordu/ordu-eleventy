/*!
 * tailwind-interactions.js
 * --------------------------------------------------------------------------
 * Vanilla-JS replacement for Bootstrap 5's interaction layer (collapse,
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
 * Pure event delegation on `document`. No jQuery, no Popper, no Bootstrap,
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
  function targetOf(trigger) {
    var selector =
      (trigger.dataset && trigger.dataset.bsTarget) ||
      trigger.getAttribute('data-bs-target');
    if (selector) {
      return document.querySelector(selector);
    }
    return null;
  }

  // --- collapse ----------------------------------------------------------
  function collapseToggle(trigger) {
    var panel = targetOf(trigger);
    if (!panel) return;
    var shown = isHidden(panel); // currently hidden -> we are about to show
    setHidden(panel, shown);
    if (trigger) {
      trigger.setAttribute('aria-expanded', shown ? 'true' : 'false');
    }
  }

  // --- offcanvas ----------------------------------------------------------
  // Only one offcanvas may be open at a time; opening one closes any other.
  // Panels are identified by the data-offcanvas attribute (our own contract,
  // not a Bootstrap class).
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

  // --- delegated click handler -------------------------------------------
  document.addEventListener('click', function (event) {
    var target = event.target && event.target.closest
      ? event.target.closest('[data-bs-toggle], [data-bs-dismiss]')
      : null;
    if (!target) return;
    var toggle = target.getAttribute('data-bs-toggle');
    var remove = target.getAttribute('data-bs-dismiss');

    if (toggle === 'collapse') {
      collapseToggle(target);
    } else if (toggle === 'offcanvas') {
      offcanvasToggle(target);
    }

    if (remove) {
      dismiss(target);
    }
  });

  // --- mobile init --------------------------------------------------------
  // Bootstrap hid .offcanvas panels by default and showed them >= lg via CSS.
  // Tailwind CSS carries the >= lg show; the shim owns the mobile initial
  // hide so the sidebar starts closed on small screens.
  if (window.matchMedia('(max-width: 991px)').matches) {
    Array.prototype.forEach.call(
      document.querySelectorAll('[data-offcanvas]'),
      function (panel) { setHidden(panel, true); }
    );
  }
})();