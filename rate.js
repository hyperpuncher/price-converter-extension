(function () {
	const CACHE_KEY = "exchange_rate";
	const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

	window.getExchangeRate = async function () {
		// Cache check
		const { [CACHE_KEY]: cached } = await chrome.storage.local.get(CACHE_KEY);
		if (cached && !isNaN(cached.rate) && Date.now() - cached.timestamp < CACHE_DURATION) {
			console.log("[kufar-rub] using cached rate:", cached.rate);
			return cached.rate;
		}

		// Fresh fetch
		try {
			const response = await fetch("https://api.nbrb.by/exrates/rates/456");
			const data = await response.json();
			const freshRate = data.Cur_OfficialRate / data.Cur_Scale; // BYN за 1 RUB (scale=100)

			await chrome.storage.local.set({
				[CACHE_KEY]: {
					rate: freshRate,
					timestamp: Date.now(),
				},
			});

			return freshRate;
		} catch (error) {
			console.error("Rate fetch failed, using stale cache:", error);
			return cached?.rate || null;
		}
	};
})();
