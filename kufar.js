const selectors = [
  "[class*=styles_price--main__]",
  "[class*=styles_price__]",
  "[class*=styles_main]",
  "[class*=styles_discountPrice]",
  ".account_ads__price",
];

let rate;

(async () => {
  const response = await fetch("https://www.nbrb.by/api/exrates/rates/431");
  const data = await response.json();
  rate = data["Cur_OfficialRate"];
})();

function addConversion() {
  for (let selector of selectors) {
    let elements = document.querySelectorAll(selector);

    if (elements) {
      for (let element of elements) {
        let price = convertToDollars(element);

        if (!isNaN(price)) {
          element.innerHTML += "<span> " + price.toFixed(2) + " $" + "</span>";
        }
      }
    }
  }
}

function convertToDollars(element) {
  let text = element.innerText;

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
