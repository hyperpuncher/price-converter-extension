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
	let elements = document.querySelectorAll(selectors);

	if (elements) {
		for (let element of elements) {
			let price = convertToDollars(element);

			if (!isNaN(price)) {
				let usdSpan;

				if (element.children[1]) {
					usdSpan = element.children[1];
				} else {
					usdSpan = document.createElement("span");
					element.append(usdSpan);
				}

				usdSpan.textContent = `${price.toFixed(2)} $*`;
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
