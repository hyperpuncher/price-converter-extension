const selectors = [
	".card__price-button",
	".listing-item__price-primary",
	".listing-top__price-primary",
].join(",");

let rate;

(async () => {
	rate = await window.getExchangeRate();
})();

function addConversion() {
	const elements = document.querySelectorAll(selectors);

	if (elements) {
		for (const element of elements) {
			const price = convertToDollars(element);

			if (!isNaN(price)) {
				usdSpan = document.createElement("div");
				element.append(document.createElement("br"), usdSpan);
				usdSpan.textContent = `${price} $`;
				usdSpan.style.color = "gray";
				usdSpan.style.whiteSpace = "nowrap";
			}
		}
	}
}

function convertToDollars(element) {
	const text = element.textContent;

	if (!text.includes("%") && !text.includes("$") && text.includes("р.")) {
		const price = parseFloat(text.replace(/[^0-9.]/g, ""));
		const conversion = price / rate;
		return conversion >= 10
			? Math.round(conversion)
			: Math.round(conversion * 100) / 100;
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
