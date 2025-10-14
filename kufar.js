const selectors = [
	"[class^=styles_price__]",
	"[class^=styles_discountPrice]",
	"[class*=styles_brief_wrapper__price]",
	".account_ads__price",
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
				let usdSpan;

				if (element.children[1]) {
					usdSpan = element.children[1];
				} else {
					usdSpan = document.createElement("span");
					element.append(usdSpan);
				}

				usdSpan.textContent = `${price} $*`;
				usdSpan.style.color = "gray";
				usdSpan.style.whiteSpace = "nowrap";

				if (element.className.includes("brief_wrapper")) {
					usdSpan.style.fontSize = "14px";
					usdSpan.style.lineHeight = "20px";
					usdSpan.style.marginLeft = "8px";
				}
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
