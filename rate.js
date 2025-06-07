(function () {
	const CACHE_KEY = "exchange_rate";
	const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

	window.getExchangeRate = async function () {
		// Cache check
		const { [CACHE_KEY]: cached } = await chrome.storage.local.get(CACHE_KEY);
		if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
			return cached.rate;
		}

		// Fresh fetch
		try {
			const response = await fetch("https://api.nbrb.by/exrates/rates/431");
			const freshRate = (await response.json()).Cur_OfficialRate;

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
