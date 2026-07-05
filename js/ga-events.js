document.addEventListener('click', function (e) {
  var link = e.target.closest('a[href]');
  if (!link || typeof gtag !== 'function') return;
  var href = link.href;

  if (href.indexOf('lin.ee') !== -1) {
    gtag('event', 'click_line', { link_url: href });
  } else if (href.indexOf('tel:') === 0) {
    gtag('event', 'click_phone', { phone_number: href.replace('tel:', '') });
  } else if (href.indexOf('maps.app.goo.gl') !== -1 || href.indexOf('google.com/maps') !== -1 || href.indexOf('goo.gl/maps') !== -1) {
    gtag('event', 'click_google_map', { link_url: href });
  }
});
