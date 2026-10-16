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

let rate;

(async () => {
	rate = await window.getExchangeRate();
	if (rate) {
		addConversion();
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
	for (const element of document.querySelectorAll(selectors)) {
		// Some price selectors overlap. Convert only the innermost match.
		if (element.querySelector(selectors)) continue;

		let priceSpan = element.querySelector(":scope > .price-converter-usd");
		const text = Array.from(element.childNodes)
			.filter((node) => node !== priceSpan)
			.map((node) => node.textContent)
			.join("");
		const price = convertToDollars(text);

		if (price === null) {
			priceSpan?.remove();
			continue;
		}

		if (!priceSpan) {
			priceSpan = document.createElement("span");
			priceSpan.className = "price-converter-usd";
			element.append(priceSpan);
		}
		const convertedText = `${price} $`;
		if (priceSpan.textContent === convertedText) continue;

		if (element.matches(".js-description-price-link")) {
			priceSpan.classList.add("h_txt_tl0");
			priceSpan.textContent = price;
			const currencySpan = document.createElement("span");
			currencySpan.className = "h_txt_tl2";
			currencySpan.textContent = " $";
			priceSpan.append(currencySpan);
		} else {
			priceSpan.textContent = convertedText;
		}
	}
}

function convertToDollars(text) {
	if (text.includes("$") || !text.includes("ƃ")) return null;

	if (text.includes("–") && !text.includes("%")) {
		// price range: 115,00 – 190,64 ƃ
		const range = text
			.split("–")
			.map((price) => roundPrice(parsePrice(price) / rate));
		return range.length === 2 && range.every(Number.isFinite)
			? range.join(" – ")
			: null;
	}

	// regular price: 845,00 ƃ
	let priceText = text;
	if (text.includes(":")) {
		// cart total: 4 товара на сумму: 1681,35 ƃ
		priceText = text.split(":").pop();
	} else if ((text.includes("-") || text.includes("−")) && text.includes("%")) {
		// sale price: -9% 5899,00 ƃ 5399,00 ƃ
		priceText = text.match(/\d[\d\s]*(?:,\d+)?\s*ƃ/g)?.at(-1) ?? "";
	}

	const conversion = parsePrice(priceText) / rate;
	return Number.isFinite(conversion) ? roundPrice(conversion) : null;
}

const observer = new MutationObserver((mutations) => {
	const priceChanged = mutations.some(
		({ target, addedNodes }) =>
			(target instanceof Element ? target : target.parentElement)?.closest(
				selectors,
			) ||
			Array.from(addedNodes).some(
				(node) =>
					node instanceof Element &&
					(node.matches(selectors) || node.querySelector(selectors)),
			),
	);
	if (!priceChanged) return;
	// Batch page changes and do not observe our own DOM updates.
	observer.disconnect();
	requestAnimationFrame(() => {
		addConversion();
		initializeObserver();
	});
});

function initializeObserver() {
	observer.observe(document, {
		subtree: true,
		childList: true,
		characterData: true,
	});
}
