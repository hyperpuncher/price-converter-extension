const selectors = [
    ".cart-form__description_condensed-another",
    ".cart-form__offers-part_sum div",
    ".catalog-form__description_huge-additional a",
    ".js-description-price-link",
    ".js-short-price-link",
    ".offers-list__description_alter-other",
    ".offers-list__price",
    ".ppricevalue",
    ".price-primary",
    ".product-recommended__price",
    ".product-summary__price-value",
    ".product__price-value",
    ".service-offers__price",
].join(",");

const selectorsForObserver = [
    ".b-offers-list-line-table",
    ".catalog-form__filter-part_2",
    ".offers-filter__part_2",
    ".offers-list__circle-slice",
    ".service-filter__part_2",
].join(",");

let rate;

(async () => {
    try {
        const response = await fetch("https://api.nbrb.by/exrates/rates/431");
        const data = await response.json();
        rate = data["Cur_OfficialRate"];
        addConversion();
        setTimeout(addConversion, 2500);
    } catch (error) {
        console.error(error);

        const interval = setInterval(() => {
            rate = parseFloat(
                document
                    .querySelector(".js-currency-amount")
                    .textContent.split(" ")[1]
                    .replace(",", "."),
            );
            if (rate) {
                clearInterval(interval);
                addConversion();
            }
        }, 50);
    }
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
            element.insertAdjacentHTML(
                "beforeend",
                `<br><span style="text-shadow: 0px 0px 0.8px">${price}</span>`,
            );
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
                    element.replace(/[^0-9,]/g, "").replace(",", "."),
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
                    .replace(",", "."),
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
