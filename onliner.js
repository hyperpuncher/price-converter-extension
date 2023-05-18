const selectors = [
  ".cart-form__description_ellipsis",
  ".cart-form__description_extended",
  ".js-short-price-link",
  ".offers-description__price",
  ".offers-list__description_nodecor",
  ".offers-list__price_primary",
  ".offers-list__price_secondary",
  ".ppricevalue",
  ".price-primary",
  ".product-recommended__price",
  ".product-summary__price-value",
  ".schema-product__button",
  ".schema-product__price-value",
].join(",");

const selectorsForObserver = [
  ".b-offers-list",
  ".cart-form",
  ".js-schema-results",
  ".offers-filter__part",
].join(",");

let rate;

(async () => {
  const response = await fetch("https://myfin.by/currency/usd");
  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  rate = parseFloat(
    doc.querySelector("tbody tr:first-child td:nth-child(2)").textContent
  );
  addConversion();
})();

const formatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "USD",
});

function addConversion() {
  let elements = document.querySelectorAll(selectors);

  for (let element of elements) {
    let price = convertToDollars(element);

    if (price) {
      element.innerHTML +=
        '<br><span style="text-shadow: 0px 0px 0.8px">' + price + "</span>";
    }
  }
}

function convertToDollars(element) {
  let text = element.textContent;

  if (!text.includes("$") && text.includes("р.")) {
    // Handle price ranges: 115,00 – 190,64 р.
    if (text.includes("–") && !text.includes("%")) {
      const range = text.split("–");
      const rangeDollar = [];

      for (element of range) {
        let price = parseFloat(
          element.replace(/[^0-9,]/g, "").replace(",", ".")
        );
        let conversion = price / rate;
        rangeDollar.push(formatter.format(conversion));
      }

      let dollar = rangeDollar[0] + " – " + rangeDollar[1];
      dollar = dollar.replace("$", "");
      return dollar;

      // Handle prices with a colon separator: 4 товара на сумму: 1681,35 р.
    } else if (text.includes(":")) {
      let price = parseFloat(
        text
          .split(":")
          .pop()
          .replace(/[^0-9,]/g, "")
          .replace(",", ".")
      );
      let conversion = price / rate;
      let dollar = formatter.format(conversion);
      return dollar;
    }

    // Handle regular prices: 845,00 р.
    let price = parseFloat(text.replace(/[^0-9,]/g, "").replace(",", "."));
    let conversion = price / rate;
    let dollar = formatter.format(conversion);
    return dollar;
  }
  return null;
}

const observer = new window.MutationObserver(() => {
  console.log("yo");
  if (rate) {
    addConversion();
  }
});

const targetElements = document.querySelector(selectorsForObserver);

observer.observe(targetElements, {
  subtree: true,
  attributes: true,
  characterData: true,
});
