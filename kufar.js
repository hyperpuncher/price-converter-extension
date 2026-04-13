const selectors = [
	"[class*=styles_price__]",
	"[class*=styles_discountPrice]",
	"[class*=styles_brief_wrapper__price]",
	".account_ads__price",
].join(",");

let rate;

(async () => {
	rate = await window.getExchangeRate();
	addConversion();
})();

function addConversion() {
	const elements = document.querySelectorAll(selectors);

	if (elements) {
		for (const element of elements) {
			// Пропускаем уже обработанные элементы
			if (element.dataset.rubDone) continue;

			const price = convertToDollars(element);

			if (!isNaN(price)) {
				element.dataset.rubDone = "1";

				const formatted = price.toLocaleString("ru-RU");
				const rubSpan = document.createElement("span");
				rubSpan.textContent = `≈ ${formatted} ₽`;
				rubSpan.style.color = "gray";
				rubSpan.style.whiteSpace = "nowrap";
				rubSpan.style.display = "block";
				rubSpan.style.fontSize = "13px";

				if (element.className.includes("brief_wrapper")) {
					rubSpan.style.fontSize = "13px";
					rubSpan.style.lineHeight = "20px";
				}

				// Добавляем после первого span (цена в BYN), на новой строке
				const mainSpan = element.querySelector("span");
				if (mainSpan) {
					mainSpan.after(rubSpan);
				} else {
					element.append(rubSpan);
				}
			}
		}
	}
}

function convertToDollars(element) {
	// Берём только прямой текстовый узел элемента, игнорируя вложенные spans с $ и €
	const text = [...element.childNodes]
		.filter(n => n.nodeType === Node.TEXT_NODE)
		.map(n => n.textContent)
		.join("") || element.firstChild?.textContent || "";

	if (!text.includes("%") && text.includes("р.")) {
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
