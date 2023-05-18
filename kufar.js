const selectors = [
  "[class*=styles_price--main__]",
  "[class*=styles_price__]",
  "[class*=styles_main]",
  "[class*=styles_discountPrice]",
  ".account_ads__price",
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

function addConversion() {
  let elements = document.querySelectorAll(selectors);

  if (elements) {
    for (let element of elements) {
      let price = convertToDollars(element);

      if (!isNaN(price)) {
        element.innerHTML += "<span> " + price.toFixed(2) + " $" + "</span>";
      }
    }
  }
}

function convertToDollars(element) {
  let text = element.textContent;

  if (!text.includes("%") && !text.includes("$") && text.includes("р.")) {
    let price = parseFloat(text.replace(/[^0-9.]/g, ""));
    let conversion = price / rate;
    return conversion;
  }
  return NaN;
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
