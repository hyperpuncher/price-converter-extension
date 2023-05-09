const selectors = [
  ".schema-product__price-value",
  ".product-summary__price-value",
  ".ppricevalue",
  ".js-description-price-link",
  ".js-short-price-link",
  ".product-recommended__price",
  ".price-primary",
  ".offers-description__price",
  ".offers-list__description_nodecor",
  ".offers-list__price_secondary",
  ".offers-list__price_primary",
  ".cart-form__description_ellipsis",
  ".cart-form__description_extended",
  ".schema-product__button",
];

let rate;

(async () => {
  const response = await fetch("https://www.nbrb.by/api/exrates/rates/431");
  const data = await response.json();
  rate = data["Cur_OfficialRate"];
})();

const formatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "USD",
});

function addConversion() {
  for (let selector of selectors) {
    let elements = document.querySelectorAll(selector);

    if (elements) {
      for (let element of elements) {
        let price = convertToDollars(element);

        if (price) {
          element.innerHTML +=
            '<br><span style="text-shadow: 0px 0px 0.8px">' + price + "</span>";
        }
      }
    }
  }
}

function convertToDollars(element) {
  let text = element.innerText;

  if (!text.includes("$") && text.includes("р.")) {
    // Handle price ranges
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
      // Handle prices with a colon separator
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
    // Handle regular prices
    let price = parseFloat(text.replace(/[^0-9,]/g, "").replace(",", "."));
    let conversion = price / rate;
    let dollar = formatter.format(conversion);
    return dollar;
  }
  return null;
}

const observer = new window.MutationObserver(() => {
  if (rate) {
    addConversion();
  }
});

observer.observe(document, {
  subtree: true,
  attributes: true,
});
