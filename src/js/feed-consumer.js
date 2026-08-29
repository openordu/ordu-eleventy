/* GAF-277 T19 — feed consumer
   Fetch /feed.xml (Atom) and render the latest posts into any [data-feed-list]
   element. Degrades silently (non-fatal) when absent or unparseable.
   Dependency-free, classic script (no modules). */
(function () {
  'use strict';

  function toText(node) {
    return node ? (node.textContent || '').trim() : '';
  }

  var containers = document.querySelectorAll('[data-feed-list]');
  if (!containers.length) {
    return; // consumer not mounted on this page — no-op
  }

  function render(entries) {
    Array.prototype.forEach.call(containers, function (container) {
      var ul = document.createElement('ul');
      ul.className = 'feed-consumer-list';
      entries.forEach(function (entry) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = entry.link || '/';
        a.textContent = entry.title || '(untitled)';
        a.className = 'feed-consumer-link';
        li.appendChild(a);
        ul.appendChild(li);
      });
      container.appendChild(ul);
    });
  }

  fetch('/feed.xml', { headers: { accept: 'application/atom+xml' } })
    .then(function (res) {
      if (!res.ok) throw new Error('feed fetch ' + res.status);
      return res.text();
    })
    .then(function (xml) {
      var doc = new DOMParser().parseFromString(xml, 'application/xml');
      if (doc.querySelector('parsererror')) throw new Error('feed is not well-formed XML');
      var entries = Array.prototype.map.call(doc.querySelectorAll('entry'), function (e) {
        var link = e.querySelector('link');
        return {
          title: toText(e.querySelector('title')),
          link: link ? (link.getAttribute('href') || '/') : '/'
        };
      });
      render(entries);
    })
    .catch(function (err) {
      // non-fatal: silent no-op for pages without a feed widget
      if (window.console && console.warn) console.warn('feed-consumer:', err.message);
    });
})();