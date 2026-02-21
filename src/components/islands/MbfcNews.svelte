<script lang="ts">
	import { onMount } from 'svelte';

	interface NewsItem {
		title: string;
		link: string;
		pubDate: string;
		description: string;
		content?: string;
		creator?: string;
	}

	interface CachedNews {
		items: NewsItem[];
		timestamp: number;
	}

	let news = $state<NewsItem[]>([]);
	let currentIndex = $state(0);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let isPaused = $state(false);

	const SLIDE_INTERVAL = 4000;
	const CACHE_KEY = 'mbfc-news-cache';
	const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds
	let intervalId: ReturnType<typeof setInterval>;

	onMount(() => {
		fetchNews();

		return () => {
			if (intervalId) clearInterval(intervalId);
		};
	});

	function getCachedNews(): NewsItem[] | null {
		try {
			const cached = localStorage.getItem(CACHE_KEY);
			if (!cached) return null;

			const data: CachedNews = JSON.parse(cached);
			const age = Date.now() - data.timestamp;

			if (age < CACHE_TTL && data.items?.length > 0) {
				return data.items;
			}
		} catch (e) {
			console.error('Cache read error:', e);
		}
		return null;
	}

	function cacheNews(items: NewsItem[]): void {
		try {
			const data: CachedNews = {
				items,
				timestamp: Date.now()
			};
			localStorage.setItem(CACHE_KEY, JSON.stringify(data));
		} catch (e) {
			console.error('Cache write error:', e);
		}
	}

	async function fetchNews() {
		// Try cache first
		const cached = getCachedNews();
		if (cached) {
			news = cached;
			loading = false;
			startSlider();
			return;
		}

		// Fetch fresh data
		try {
			const response = await fetch('/api/rss.xml');

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const data = await response.json();

			if (data.status === 'ok' && data.items?.length > 0) {
				news = data.items;
				cacheNews(data.items);
				startSlider();
			} else {
				error = data.message || 'No news available';
			}
		} catch (e) {
			error = 'Failed to load news';
			console.error('RSS fetch error:', e);
		} finally {
			loading = false;
		}
	}

	function startSlider() {
		if (intervalId) clearInterval(intervalId);
		intervalId = setInterval(() => {
			if (!isPaused && news.length > 0) {
				currentIndex = (currentIndex + 1) % news.length;
			}
		}, SLIDE_INTERVAL);
	}

	function goToSlide(index: number) {
		currentIndex = index;
		startSlider();
	}

	function nextSlide() {
		currentIndex = (currentIndex + 1) % news.length;
		startSlider();
	}

	function prevSlide() {
		currentIndex = (currentIndex - 1 + news.length) % news.length;
		startSlider();
	}

	function formatDate(dateStr: string): string {
		try {
			return new Date(dateStr).toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric'
			});
		} catch {
			return '';
		}
	}
</script>

<section
	class="news-section"
	onmouseenter={() => isPaused = true}
	onmouseleave={() => isPaused = false}
>
	<div class="container mx-auto px-4 py-8">
		<div class="news-header">
			<svg xmlns="http://www.w3.org/2000/svg" class="news-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
			</svg>
			<h2 class="news-title">
				<a
					href="https://mediabiasfactcheck.com/"
					target="_blank"
					rel="noopener"
					class="hover:text-blue-600 transition-colors"
				>
					Latest from Media Bias/Fact Check
				</a>
			</h2>
		</div>

		{#if loading}
			<div class="loading-state">
				<div class="loading-spinner"></div>
				<span>Loading news...</span>
			</div>
		{:else if error}
			<div class="error-state">{error}</div>
		{:else if news.length > 0}
			<div class="carousel-container">
				<!-- Navigation Arrows -->
				<button
					onclick={prevSlide}
					class="nav-arrow nav-arrow-left"
					aria-label="Previous story"
				>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
				</button>

				<button
					onclick={nextSlide}
					class="nav-arrow nav-arrow-right"
					aria-label="Next story"
				>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</button>

				<!-- Slide Content -->
				<div class="slides-wrapper">
					{#each news as item, i (item.link)}
						<div
							class="slide"
							class:active={i === currentIndex}
						>
							{#if i === currentIndex}
								<a
									href={item.link}
									target="_blank"
									rel="noopener"
									class="slide-link"
								>
									<h3 class="slide-title">{item.title}</h3>
									{#if item.description}
										<p class="slide-description">{item.description}</p>
									{/if}
									<div class="slide-meta">
										<time datetime={item.pubDate}>
											{formatDate(item.pubDate)}
										</time>
										{#if item.creator}
											<span class="slide-author">by {item.creator}</span>
										{/if}
									</div>
								</a>
							{/if}
						</div>
					{/each}
				</div>

				<!-- Dot Indicators -->
				<div class="dots-container">
					{#each news.slice(0, 7) as _, i}
						<button
							onclick={() => goToSlide(i)}
							class="dot"
							class:active={i === currentIndex}
							aria-label="Go to story {i + 1}"
						></button>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</section>

<style>
	.news-section {
		background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
		border-top: 1px solid rgba(37, 99, 235, 0.1);
	}

	.news-header {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.news-icon {
		width: 1.5rem;
		height: 1.5rem;
		color: #6366f1;
	}

	.news-title {
		font-size: 1.125rem;
		font-weight: 700;
		color: #1f2937;
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 2rem;
		color: #6b7280;
	}

	.loading-spinner {
		width: 2rem;
		height: 2rem;
		border: 3px solid #e5e7eb;
		border-top-color: #2563eb;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.error-state {
		text-align: center;
		color: #ef4444;
		padding: 1.5rem;
	}

	.carousel-container {
		position: relative;
		max-width: 48rem;
		margin: 0 auto;
	}

	.nav-arrow {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		z-index: 10;
		padding: 0.625rem;
		border-radius: 9999px;
		background: white;
		border: 1px solid #e5e7eb;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.nav-arrow:hover {
		background: #f3f4f6;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
	}

	.nav-arrow svg {
		width: 1.25rem;
		height: 1.25rem;
		color: #4b5563;
	}

	.nav-arrow-left {
		left: 0;
	}

	.nav-arrow-right {
		right: 0;
	}

	.slides-wrapper {
		overflow: hidden;
		padding: 0 3rem;
		min-height: 8rem;
	}

	.slide {
		opacity: 0;
		position: absolute;
		width: calc(100% - 6rem);
		transition: opacity 0.5s ease;
	}

	.slide.active {
		opacity: 1;
		position: relative;
		width: 100%;
	}

	.slide-link {
		display: block;
		text-align: center;
		text-decoration: none;
	}

	.slide-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: #1f2937;
		margin-bottom: 0.5rem;
		transition: color 0.2s ease;
	}

	.slide-link:hover .slide-title {
		color: #2563eb;
	}

	.slide-description {
		color: #6b7280;
		font-size: 0.9rem;
		margin-bottom: 0.75rem;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.slide-meta {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-size: 0.8rem;
		color: #9ca3af;
	}

	.slide-author {
		color: #6b7280;
	}

	.dots-container {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		margin-top: 1.25rem;
	}

	.dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 9999px;
		background: #d1d5db;
		border: none;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.dot:hover {
		background: #9ca3af;
	}

	.dot.active {
		background: #2563eb;
		width: 1.5rem;
	}
</style>
