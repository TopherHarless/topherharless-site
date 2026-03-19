/**
 * Category filter for topherharless.com
 * Reads URL hash (#blog, #podcasts, #periscope) and
 * shows/hides .blog-entry articles based on their .meta-cat text.
 */
(function () {
  'use strict';

  // Hashes that should trigger article filtering
  var FILTER_HASHES = ['blog', 'podcasts', 'periscope'];

  function currentFilter() {
    return window.location.hash.replace('#', '').toLowerCase().trim();
  }

  function runFilter() {
    var f = currentFilter();
    var isFilter = FILTER_HASHES.indexOf(f) !== -1;

    document.querySelectorAll('article.blog-entry').forEach(function (art) {
      if (!isFilter) {
        art.style.display = '';
        return;
      }
      var catEl = art.querySelector('.meta-cat a');
      var cat = (catEl ? catEl.textContent : '').trim().toLowerCase();
      // Flexible pluralisation match: "podcast" == "podcasts"
      var matches = cat === f ||
                    cat === f.replace(/s$/, '') ||
                    cat + 's' === f;
      art.style.display = matches ? '' : 'none';
    });

    // Sync the active class on nav links
    document.querySelectorAll('.main-nav a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var aHash = href.includes('#') ? href.split('#')[1].toLowerCase() : '';
      a.classList.remove('active');
      if (isFilter && aHash === f) {
        a.classList.add('active');
      } else if (!isFilter && !aHash) {
        // Home link is active when there is no active filter
        a.classList.add('active');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Apply any filter present in the URL on first load
    runFilter();

    // Intercept clicks on nav links that target a filter hash
    document.querySelectorAll('.main-nav a[href*="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var href = a.getAttribute('href') || '';
        var hash = (href.split('#')[1] || '').toLowerCase();
        if (FILTER_HASHES.indexOf(hash) === -1) return; // not a filter link

        var page = href.split('#')[0];
        var cur = window.location.pathname.split('/').pop() || 'index.html';

        // Only intercept if the link targets the current page
        if (!page || page === cur ||
            (page === 'index.html' && (cur === '' || cur === 'index.html'))) {
          e.preventDefault();
          history.pushState(null, '', '#' + hash);
          runFilter();
        }
        // Otherwise let the browser navigate normally to index.html#blog etc.
      });
    });

    // Home link: clear the filter when clicked from the same page
    document.querySelectorAll('.main-nav a:not([href*="#"])').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var page = href.split('?')[0].split('#')[0];
      var cur = window.location.pathname.split('/').pop() || 'index.html';
      if (page === cur || (page === 'index.html' && (cur === '' || cur === 'index.html'))) {
        a.addEventListener('click', function (e) {
          if (currentFilter()) {
            e.preventDefault();
            history.pushState(null, '', window.location.pathname);
            runFilter();
          }
        });
      }
    });
  });

  window.addEventListener('hashchange', runFilter);

  // Hide broken images gracefully so they don't show as text links
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        var el = this;
        // If the img is the only child of an anchor, hide the anchor too
        var parent = el.parentElement;
        if (parent && parent.tagName === 'A') {
          parent.style.display = 'none';
        } else {
          el.style.display = 'none';
        }
      });
    });
  });
}());
