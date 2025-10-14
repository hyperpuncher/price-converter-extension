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
		// Handle price ranges: 115,00 – 190,64 р.
		if (text.includes("–") && !text.includes("%")) {
			const range = text.split("–");
			const rangeDollar = [];

			for (element of range) {
				const price = parseFloat(
					element.replace(/[^0-9,]/g, "").replace(",", "."),
				);
				const conversion = price / rate;
				rangeDollar.push(roundPrice(conversion));
			}

			let dollar = rangeDollar[0] + " – " + rangeDollar[1];
			dollar = dollar.replace("$", "");
			return dollar;

			// Handle prices with a colon separator: 4 товара на сумму: 1681,35 р.
		} else if (text.includes(":")) {
			const price = parseFloat(
				text
					.split(":")
					.pop()
					.replace(/[^0-9,]/g, "")
					.replace(",", "."),
			);
			const conversion = price / rate;
			return roundPrice(conversion);
		}

		// Handle regular prices: 845,00 р.
		const price = parseFloat(text.replace(/[^0-9,]/g, "").replace(",", "."));
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
