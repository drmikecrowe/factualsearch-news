<script lang="ts">
	import { onMount } from 'svelte';

	interface SearchEngine {
		id: string;
		name: string;
		description: string;
		gcs: string;
	}

	const engines: SearchEngine[] = [
		{ id: 'mostly-center',    name: 'Mostly Center',     description: 'Left-Center, Least & Right-Center sources', gcs: '011275290256739755566:edrcsadz-rs'  },
		{ id: 'center-only',      name: 'Least Bias Only',   description: 'Minimal bias, highly credible sources',     gcs: '011275290256739755566:o6ptd9svldm'  },
		{ id: 'left-leaning',     name: 'Left Leaning',      description: 'Combined Left & Left-Center sources',       gcs: '011275290256739755566:kc_w38uag7c'  },
		{ id: 'right-leaning',    name: 'Right Leaning',     description: 'Combined Right & Right-Center sources',     gcs: '011275290256739755566:btqtxauwvlo'  },
		{ id: 'left-center-only', name: 'Left Center Only',  description: 'Slight to moderate liberal bias',           gcs: '011275290256739755566:2xtbkb1ovjy'  },
		{ id: 'right-center-only',name: 'Right Center Only', description: 'Slight to moderate conservative bias',      gcs: '011275290256739755566:pqps6ira0uc'  },
		{ id: 'left-only',        name: 'Left Only',         description: 'Moderate to strong liberal bias',           gcs: '011275290256739755566:ja-tvmyikac'  },
		{ id: 'right-only',       name: 'Right Only',        description: 'Moderate to strong conservative bias',      gcs: '011275290256739755566:xk81hllivx0'  },
		{ id: 'pro-science-only', name: 'Pro-Science',       description: 'Evidence-based scientific sources',         gcs: '011275290256739755566:crffvuonj6s'  },
		{ id: 'fact-checking',    name: 'Fact Checking',     description: 'Fact-checking sources',                     gcs: '011275290256739755566:bc28ezirric'  },
	];

	let selectedEngine = $state('mostly-center');
	let gcseLoaded = $state(false);

	// Check if there's a search query anywhere in URL (including GCSE hash)
	function hasSearchQuery(): boolean {
		return window.location.href.includes('q=') || hasGcseSearchQuery();
	}

	// Get URL without GCSE hash (for comparison)
	function getUrlWithoutGcseHash(): string {
		const url = window.location.href;
		const hashIndex = url.indexOf('#gsc');
		return hashIndex >= 0 ? url.substring(0, hashIndex) : url;
	}

	// Update hero visibility based on URL
	function updateHeroVisibility(): boolean {
		const heroSection = document.getElementById('hero-section');
		if (heroSection) {
			heroSection.style.display = hasSearchQuery() ? 'none' : '';
			return true;
		}
		return false;
	}

	// Check if hashchange is a GCSE hash change
	function isGcseHashChange(): boolean {
		return window.location.hash.startsWith('#gsc');
	}

	// Check if GCSE hash contains a search query
	function hasGcseSearchQuery(): boolean {
		const hash = window.location.hash;
		return hash.includes('gsc.q=');
	}

	// Load saved preference from localStorage
	onMount(() => {
		// Only run on home page
		if (window.location.pathname !== '/') {
			return;
		}

		const saved = localStorage.getItem('searchEngine');
		if (saved && engines.find(e => e.id === saved)) {
			selectedEngine = saved;
		}
		loadGCSE();

		// Poll for URL changes - fast until q= detected, then slow down
		let urlPollInterval: ReturnType<typeof setInterval>;
		let lastUrl = getUrlWithoutGcseHash();
		let lastHadSearch = hasSearchQuery();

		const startPolling = (interval: number) => {
			if (urlPollInterval) clearInterval(urlPollInterval);
			urlPollInterval = setInterval(() => {
				const currentUrl = getUrlWithoutGcseHash();
				const currentHasSearch = hasSearchQuery();

				// Update if URL changed OR if search query appeared/disappeared in hash
				if (currentUrl !== lastUrl || currentHasSearch !== lastHadSearch) {
					lastUrl = currentUrl;
					lastHadSearch = currentHasSearch;
					updateHeroVisibility();
					// Once q= detected, slow down polling
					if (currentHasSearch) {
						startPolling(1000);
					}
				}
			}, interval);
		};

		// Start fast polling (100ms) to detect search quickly
		startPolling(100);

		// Initial check - retry until hero is found
		const heroCheckInterval = setInterval(() => {
			if (updateHeroVisibility()) {
				clearInterval(heroCheckInterval);
			}
		}, 50);

		setTimeout(() => clearInterval(heroCheckInterval), 2000);

		// Listen to hashchange - always update hero visibility on hash changes
		// (GCSE hash changes include search queries we need to detect)
		const handleHashChange = () => {
			updateHeroVisibility();
		};
		window.addEventListener('hashchange', handleHashChange);
		window.addEventListener('popstate', updateHeroVisibility);

		return () => {
			clearInterval(urlPollInterval);
			clearInterval(heroCheckInterval);
			window.removeEventListener('hashchange', handleHashChange);
			window.removeEventListener('popstate', updateHeroVisibility);

			// Clean up GCSE script and global state
			const gcseScript = document.querySelector('script[src*="cse.js"]');
			if (gcseScript) {
				gcseScript.remove();
			}
			// Clear GCSE hash from URL
			if (window.location.hash.startsWith('#gsc')) {
				history.replaceState(null, '', window.location.pathname);
			}
		};
	});

	function loadGCSE() {
		const engine = engines.find(e => e.id === selectedEngine) ?? engines[0];
		const cx = engine.gcs;

		// Remove any existing GCSE scripts
		document.querySelectorAll('script[src*="cse.js"]').forEach(s => s.remove());

		// Clear GCSE global state so the reloaded script initializes fresh
		// @ts-expect-error - Google CSE global not typed
		delete window.__gcse;
		// @ts-expect-error - Google CSE global not typed
		delete window.google;

		// Reset the container — no defaultToRefinement, each engine is its own cx
		const container = document.getElementById('gcse-container');
		if (container) {
			container.innerHTML = `<gcse:search></gcse:search>`;
		}

		// Load fresh GCSE script for the selected engine's cx
		const gcse = document.createElement('script');
		gcse.type = 'text/javascript';
		gcse.async = true;
		gcse.src = 'https://cse.google.com/cse.js?cx=' + cx;
		const s = document.getElementsByTagName('script')[0];
		s.parentNode?.insertBefore(gcse, s);

		gcse.onload = () => {
			gcseLoaded = true;
		};

		gcse.onerror = () => { /* silent — search simply won't render */ };
	}

	function handleEngineChange(newEngine: string) {
		selectedEngine = newEngine;
		localStorage.setItem('searchEngine', newEngine);
		loadGCSE();
	}
</script>

<main class="search-container w-full max-w-full">
	<!-- Engine Selector -->
	<div class="engine-selector">
		<div class="selector-inner">
			<label for="engine-select" class="selector-label">Search Type:</label>
			<select
				id="engine-select"
				bind:value={selectedEngine}
				onchange={() => handleEngineChange(selectedEngine)}
				class="selector-dropdown"
			>
				{#each engines as engine}
					<option value={engine.id}>{engine.name}</option>
				{/each}
			</select>
			{#if engines.find(e => e.id === selectedEngine)?.description}
				<span class="selector-hint">
					{engines.find(e => e.id === selectedEngine)?.description}
				</span>
			{/if}
		</div>
	</div>

	<!-- Google Search Container -->
	<div id="gcse-container" class="w-full max-w-full">
	</div>
</main>

<style>
	.search-container {
		width: 100%;
	}

	.engine-selector {
		background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
		border: 1px solid rgba(37, 99, 235, 0.15);
		border-radius: 1rem;
		padding: 1rem 1.5rem;
		margin-bottom: 1.5rem;
	}

	.selector-inner {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		gap: 0.75rem 1rem;
	}

	.selector-label {
		font-weight: 600;
		color: #374151;
		font-size: 0.95rem;
	}

	.selector-dropdown {
		padding: 0.625rem 2.5rem 0.625rem 1rem;
		border: 2px solid #e5e7eb;
		border-radius: 0.75rem;
		background: white;
		color: #1f2937;
		font-weight: 500;
		font-size: 0.95rem;
		cursor: pointer;
		transition: all 0.2s ease;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.75rem center;
		background-size: 1.25rem;
	}

	.selector-dropdown:hover {
		border-color: #2563eb;
	}

	.selector-dropdown:focus {
		outline: none;
		border-color: #2563eb;
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
	}

	.selector-hint {
		font-size: 0.875rem;
		color: #6b7280;
	}

	#gcse-container {
		width: 100%;
		display: flex;
		justify-content: center;
	}

	/* Center and style GCSE when searching */
	.search-container:global(.searching) #gcse-container,
	#gcse-container:has(.gsc-resultsbox-visible) {
		display: flex;
		justify-content: center;
	}

	/* Style the GCSE elements */
	:global(.gsc-control-cse) {
		border: none !important;
		background: transparent !important;
		width: 100% !important;
		max-width: 100% !important;
	}

	:global(.gsc-control-wrapper-cse) {
		width: 100% !important;
		max-width: 100% !important;
		margin: 0 auto !important;
	}

	:global(.gsc-search-box) {
		width: 80% !important;
		margin: 0 auto 1.5rem auto !important;
	}

	:global(.gsc-search-box-tools),
	:global(.gsc-input-box) {
		width: 100% !important;
	}

	:global(.gsc-input-box) {
		border-radius: 0.75rem !important;
		border: 2px solid #e5e7eb !important;
		transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
	}

	:global(.gsc-input-box:focus-within) {
		border-color: #2563eb !important;
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15) !important;
	}

	:global(.gsc-search-button) {
		border-radius: 0 0.75rem 0.75rem 0 !important;
		background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%) !important;
		border: none !important;
	}

	:global(.gsc-search-button:hover) {
		opacity: 0.9 !important;
	}

	:global(.gsc-table-result) {
		margin: 0 auto !important;
	}

	/* Center results */
	:global(.gsc-wrapper) {
		width: 100% !important;
		max-width: 100% !important;
		margin: 0 auto !important;
	}

	:global(.gsc-results) {
		width: 100% !important;
	}

	:global(.gsc-result) {
		padding: 1rem !important;
		margin-bottom: 0.75rem !important;
		border-radius: 0.5rem !important;
		border: 1px solid #e5e7eb !important;
		background: white !important;
		transition: box-shadow 0.2s ease !important;
	}

	:global(.gsc-result:hover) {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
	}

	/* Responsive search box and results */
	@media (max-width: 768px) {
		/* Force GCSE children to fit container */
		#gcse-container :global(*) {
			max-width: 100% !important;
		}

		:global(.gsc-search-box) {
			width: 95% !important;
		}

		:global(.gsc-result) {
			padding: 0.75rem !important;
		}

		.selector-inner {
			flex-direction: column;
			gap: 0.5rem;
		}

		.selector-hint {
			text-align: center;
		}
	}

	@media (max-width: 480px) {
		:global(.gsc-search-box) {
			width: 95% !important;
		}

		:global(.gsc-result) {
			padding: 0.5rem !important;
		}

		.engine-selector {
			padding: 0.75rem 1rem;
		}
	}

	/* Hide GCSE refinement/annotations bar */
	:global(.gsc-refinementsArea),
	:global(.gsc-refinementHeader),
	:global(.gsc-tabsArea),
	:global(.gsc-above-wrapper-area-container) {
		display: none !important;
	}
</style>
