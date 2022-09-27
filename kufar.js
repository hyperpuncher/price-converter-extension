const tags = ["[class*=styles_price--main__]", "[class*=styles_price__]", "[class*=styles_main]", "[class*=styles_discountPrice]", ".account_ads__price"];

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var observer = new MutationObserver(function (mutations, observer) {
  function conversion(rate) {
    for (tag of tags) {
      if (document.querySelector(tag)) {
        (function () {
          let elts = document.querySelectorAll(tag);
          for (elt of elts) {
            let price = convertor(elt);
            if (!isNaN(price)) {
              elt.innerHTML += '<span> ' + price.toFixed(2) + ' $' + '</span>';
            }
          }
        })(tag);
      }
    }
    // Cleans up string to number and converts to dollars
    function convertor(elt) {
      if ((!elt.innerText.includes('%')) && (!elt.innerText.includes('$')) && (elt.innerText.includes('р.'))) {
        let price = parseFloat(elt.innerText.replace(/[^0-9.]/g, ''));
        let conversion = price / rate;
        return conversion;
      }
      return NaN;
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