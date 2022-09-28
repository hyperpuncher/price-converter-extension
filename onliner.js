const tags = [".schema-product__price-value", ".product-summary__price-value", ".ppricevalue", ".js-description-price-link", ".js-short-price-link", ".product-recommended__price", ".price-primary", ".offers-description__price", ".offers-list__description_nodecor", ".offers-list__price_secondary", ".offers-list__price_primary", ".cart-form__description_condensed-another", ".cart-form__description_font-weight_semibold", ".cart-form__description_extended", ".schema-product__button"];

var formatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'USD'
});

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var observer = new MutationObserver(function (mutations, observer) {
  function conversion(rate) {
    for (tag of tags) {
      if (document.querySelector(tag)) {
        (function () {
          let elts = document.querySelectorAll(tag);
          for (elt of elts) {
            let price = convertor(elt);
            if (price) {
              if (tag != ".cart-form__description_extended") {
                elt.innerHTML += '<br><span style="text-shadow: 0px 0px 0.8px">' + price + '</span>';
              } else {
                elt.innerText += ' ' + price;
              }
            }
          }
        })(tag);
      }
    }
    // Cleans up string to number and converts to dollars
    function convertor(elt) {
      if ((!elt.innerText.includes('$')) && ((elt.innerText.includes('р.')) || (elt.innerText.includes('p.')))) {
        if ((elt.innerText.includes('–')) && (!elt.innerText.includes('%'))) {
          const range = elt.innerText.split('–');
          const rangeDollar = [];
          for (elt of range) {
            let price = parseFloat(elt.replace(/[^0-9,]/g, '').replace(',', '.'));
            let conversion = price / rate;
            rangeDollar.push(formatter.format(conversion));
          }
          let dollar = rangeDollar[0] + ' – ' + rangeDollar[1];
          dollar = dollar.replace('$', '');
          return dollar;
        } else if (elt.innerText.includes(':')) {
          let price = parseFloat(elt.innerText.split(':').pop().replace(/[^0-9,]/g, '').replace(',', '.'));
          let conversion = price / rate;
          let dollar = formatter.format(conversion);
          return dollar;
        }
        let price = parseFloat(elt.innerText.replace(/[^0-9,]/g, '').replace(',', '.'));
        let conversion = price / rate;
        let dollar = formatter.format(conversion);
        return dollar;
      }
      return null;
    }
  }

  fetch('https://www.nbrb.by/api/exrates/rates/431')
    .then(response => response.json())
    .then(data => conversion(data["Cur_OfficialRate"]));

});

observer.observe(document, {
  subtree: true,
  attributes: true
});