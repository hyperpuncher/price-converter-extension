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
	".product-aside__description_huge-default",
	".product-aside__description_huge-fringe",
	".product-aside__description_huge-other",
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
	".product_details",
].join(",");

let rate;

(async () => {
	rate = await window.getExchangeRate();
	if (rate) {
		addConversion();
		setTimeout(addConversion, 2500);
		initializeObserver();
	}
})();

function roundPrice(price) {
	return price >= 10 ? Math.round(price) : Math.round(price * 100) / 100;
}

function parsePrice(price) {
	return parseFloat(price.replace(/[^0-9,]/g, "").replace(",", "."));
}

function addConversion() {
	const elements = document.querySelectorAll(selectors);

	for (const element of elements) {
		const price = convertToDollars(element);

		if (price) {
			const lineBreak = document.createElement("br");
			const priceSpan = document.createElement("span");
			priceSpan.textContent = price + " $";
			element.append(lineBreak, priceSpan);
		}
	}
}

function convertToDollars(element) {
	const text = element.textContent;

	if (!text.includes("$") && text.includes("р.")) {
		let price;

		if (text.includes("–") && !text.includes("%")) {
			// Handle price ranges: 115,00 – 190,64 р.
			const range = text.split("–");
			const rangeDollar = [];

			for (element of range) {
				const price = parsePrice(element);
				const conversion = price / rate;
				rangeDollar.push(roundPrice(conversion));
			}

			let dollar = rangeDollar[0] + " – " + rangeDollar[1];
			dollar = dollar.replace("$", "");
			return dollar;
		} else if (text.includes(":")) {
			// Handle prices with a colon separator: 4 товара на сумму: 1681,35 р.
			price = parsePrice(text.split(":").pop());
		} else if (text.includes("-") && text.includes("%")) {
			// Handle sale prices:  -9% 5899,00 р. 5399,00 р.
			price = parsePrice(text.split("  ").pop());
		} else {
			// Handle regular prices: 845,00 р.
			price = parsePrice(text);
		}

		const conversion = price / rate;
		return roundPrice(conversion);
	}
	return null;
}

const observer = new MutationObserver(() => {
	if (rate) addConversion();
});

function initializeObserver() {
	const targetElements = document.querySelector(selectorsForObserver);
	if (targetElements) {
		observer.observe(targetElements, {
			subtree: true,
			childList: true,
		});
	}
}
