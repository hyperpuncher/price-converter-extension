const selectors = [
	'[data-testid="card-price"]',
	'[class^="styles-module-"][class$="__price"]',
	'[class*="__brief_wrapper__price"]',
	"[class^=styles_price__]",
	"[class^=styles_discountPrice]",
	"[class*=styles_brief_wrapper__price]",
	".account_ads__price",
].join(",");

let rate;

(async () => {
	rate = await window.getExchangeRate();
	if (rate) {
		addConversion();
		initializeObserver();
	}
})();

function addConversion() {
	for (const element of document.querySelectorAll(selectors)) {
		// Convert the current price, not a wrapper with old prices or discounts.
		if (element.querySelector(selectors)) continue;

		let usdSpan = element.querySelector(":scope > .price-converter-usd");
		const text = Array.from(element.childNodes)
			.filter((node) => node !== usdSpan)
			.map((node) => node.textContent)
			.join("");
		const price = convertToDollars(text);

		if (price === null) {
			usdSpan?.remove();
			continue;
		}

		if (!usdSpan) {
			usdSpan = document.createElement("span");
			usdSpan.className = "price-converter-usd";
			element.append(usdSpan);
		}
		const convertedText = `${price} $*`;
		if (usdSpan.textContent !== convertedText) {
			usdSpan.textContent = convertedText;
		}
	}
}

function convertToDollars(text) {
	if (text.includes("%") || text.includes("$")) return null;

	const match = text.match(/(\d[\d\s]*(?:[.,]\d+)?)\s*(?:р\.|ƃ)/);
	if (!match) return null;

	const price = Number(match[1].replace(/\s/g, "").replace(",", "."));
	const conversion = price / rate;
	if (!Number.isFinite(conversion)) return null;

	return conversion >= 10 ? Math.round(conversion) : Math.round(conversion * 100) / 100;
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
