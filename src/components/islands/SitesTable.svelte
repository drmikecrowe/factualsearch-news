<script lang="ts">
	import { onMount } from 'svelte';

	interface Source {
		domain: string;
		name: string;
		url: string;
		bias: string;
		reporting: string;
		credibility: string;
	}

	interface CachedSources {
		sources: Source[];
		timestamp: number;
	}

	const SOURCES_URL = 'https://raw.githubusercontent.com/drmikecrowe/mbfcext/refs/heads/main/docs/v5/data/sources.json';
	const CACHE_KEY = 'mbfc-sources-cache';
	const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds

	let sources = $state<Source[]>([]);
	let filteredSources = $state<Source[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let searchQuery = $state('');
	let selectedBias = $state<string>('all');

	// Pagination
	const ITEMS_PER_PAGE = 50;
	let currentPage = $state(1);

	// Sort
	type SortColumn = 'name' | 'bias';
	type SortDirection = 'asc' | 'desc';
	let sortColumn = $state<SortColumn>('name');
	let sortDirection = $state<SortDirection>('asc');

	// Bias options for filter
	const biasOptions = [
		{ value: 'all', label: 'All Biases' },
		{ value: 'left', label: 'Left' },
		{ value: 'left-center', label: 'Left-Center' },
		{ value: 'center', label: 'Center' },
		{ value: 'right-center', label: 'Right-Center' },
		{ value: 'right', label: 'Right' },
		{ value: 'pro-science', label: 'Pro-Science' }
	];

	// Stats - only count included sources (very-high, high, mostly-factual)
	let includedSources = $derived(sources.filter(s => isIncluded(s)));

	let stats = $derived({
		total: includedSources.length,
		left: includedSources.filter(s => s.bias === 'left').length,
		leftCenter: includedSources.filter(s => s.bias === 'left-center').length,
		center: includedSources.filter(s => s.bias === 'center').length,
		rightCenter: includedSources.filter(s => s.bias === 'right-center').length,
		right: includedSources.filter(s => s.bias === 'right').length,
		proScience: includedSources.filter(s => s.bias === 'pro-science').length
	});

	onMount(() => {
		fetchSources();
	});

	function getCachedSources(): Source[] | null {
		try {
			const cached = localStorage.getItem(CACHE_KEY);
			if (!cached) return null;

			const data: CachedSources = JSON.parse(cached);
			const age = Date.now() - data.timestamp;

			if (age < CACHE_TTL && data.sources?.length > 0) {
				return data.sources;
			}
		} catch (e) {
			console.error('Cache read error:', e);
		}
		return null;
	}

	function cacheSources(sourcesList: Source[]): void {
		try {
			const data: CachedSources = {
				sources: sourcesList,
				timestamp: Date.now()
			};
			localStorage.setItem(CACHE_KEY, JSON.stringify(data));
		} catch (e) {
			console.error('Cache write error:', e);
		}
	}

	async function fetchSources() {
		// Try cache first
		const cached = getCachedSources();
		if (cached) {
			sources = filterDisplayableSources(cached);
			loading = false;
			return;
		}

		// Fetch fresh data
		try {
			const response = await fetch(SOURCES_URL);
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const data: Source[] = await response.json();
			cacheSources(data);
			sources = filterDisplayableSources(data);
		} catch (e) {
			error = 'Failed to load sources';
			console.error('Sources fetch error:', e);
		} finally {
			loading = false;
		}
	}

	function filterDisplayableSources(sourcesList: Source[]): Source[] {
		// Exclude satire and fake-news from the table
		return sourcesList.filter(s =>
			s.bias !== 'satire' && s.bias !== 'fake-news'
		);
	}

	function isIncluded(source: Source): boolean {
		const includedLevels = ['very-high', 'high', 'mostly-factual'];
		return includedLevels.includes(source.reporting);
	}

	function formatReporting(reporting: string): string {
		const labels: Record<string, string> = {
			'very-high': 'Very High',
			'high': 'High',
			'mostly-factual': 'Mostly Factual',
			'mixed': 'Mixed',
			'low': 'Low',
			'very-low': 'Very Low'
		};
		return labels[reporting] || reporting;
	}

	function getReportingClass(reporting: string): string {
		const classes: Record<string, string> = {
			'very-high': 'reporting-very-high',
			'high': 'reporting-high',
			'mostly-factual': 'reporting-mostly-factual',
			'mixed': 'reporting-mixed',
			'low': 'reporting-low',
			'very-low': 'reporting-very-low'
		};
		return classes[reporting] || '';
	}

	// Filter and search
	$effect(() => {
		let result = sources;

		// Filter by bias
		if (selectedBias !== 'all') {
			result = result.filter(s => s.bias === selectedBias);
		}

		// Search by name or domain
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			result = result.filter(s =>
				s.name.toLowerCase().includes(query) ||
				s.domain.toLowerCase().includes(query)
			);
		}

		// Sort
		result = [...result].sort((a, b) => {
			let comparison = 0;
			if (sortColumn === 'name') {
				comparison = a.name.localeCompare(b.name);
			} else if (sortColumn === 'bias') {
				comparison = a.bias.localeCompare(b.bias);
			}
			return sortDirection === 'asc' ? comparison : -comparison;
		});

		filteredSources = result;
		currentPage = 1; // Reset to first page when filter changes
	});

	// Pagination
	let totalPages = $derived(Math.ceil(filteredSources.length / ITEMS_PER_PAGE));

	let paginatedSources = $derived(filteredSources.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE));

	function handleSort(column: SortColumn) {
		if (sortColumn === column) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = column;
			sortDirection = 'asc';
		}
		currentPage = 1;
	}

	function goToPage(page: number) {
		currentPage = Math.max(1, Math.min(page, totalPages));
	}

	function getSortIndicator(column: SortColumn): string {
		if (sortColumn !== column) return '';
		return sortDirection === 'asc' ? ' ▲' : ' ▼';
	}

	function formatBiasLabel(bias: string): string {
		const labels: Record<string, string> = {
			'left': 'Left',
			'left-center': 'Left-Center',
			'center': 'Center',
			'right-center': 'Right-Center',
			'right': 'Right',
			'pro-science': 'Pro-Science'
		};
		return labels[bias] || bias;
	}

	function getBiasClass(bias: string): string {
		const classes: Record<string, string> = {
			'left': 'bias-left',
			'left-center': 'bias-left-center',
			'center': 'bias-center',
			'right-center': 'bias-right-center',
			'right': 'bias-right',
			'pro-science': 'bias-science'
		};
		return classes[bias] || '';
	}

	function computeVisiblePages(current: number, total: number): number[] {
		const pages: number[] = [];
		const maxVisible = 5;
		let start = Math.max(1, current - Math.floor(maxVisible / 2));
		const end = Math.min(total, start + maxVisible - 1);

		if (end - start + 1 < maxVisible) {
			start = Math.max(1, end - maxVisible + 1);
		}

		for (let i = start; i <= end; i++) {
			pages.push(i);
		}

		return pages;
	}

	let visiblePages = $derived(computeVisiblePages(currentPage, totalPages));
</script>

{#if loading}
	<div class="loading-state">
		<div class="loading-spinner"></div>
		<span>Loading sources...</span>
	</div>
{:else if error}
	<div class="error-state">{error}</div>
{:else}
	<!-- Stats Cards - all counts are for included sources only -->
	<div class="stats-grid">
		<div class="stat-card stat-included">
			<span class="stat-number">{stats.total}</span>
			<span class="stat-label">Included Sources</span>
		</div>
		<div class="stat-card stat-left">
			<span class="stat-number">{stats.left}</span>
			<span class="stat-label">Left</span>
		</div>
		<div class="stat-card stat-left-center">
			<span class="stat-number">{stats.leftCenter}</span>
			<span class="stat-label">Left-Center</span>
		</div>
		<div class="stat-card stat-center">
			<span class="stat-number">{stats.center}</span>
			<span class="stat-label">Center</span>
		</div>
		<div class="stat-card stat-right-center">
			<span class="stat-number">{stats.rightCenter}</span>
			<span class="stat-label">Right-Center</span>
		</div>
		<div class="stat-card stat-right">
			<span class="stat-number">{stats.right}</span>
			<span class="stat-label">Right</span>
		</div>
		<div class="stat-card stat-science">
			<span class="stat-number">{stats.proScience}</span>
			<span class="stat-label">Pro-Science</span>
		</div>
	</div>

	<!-- Filters -->
	<div class="filters-container">
		<div class="search-wrapper">
			<svg xmlns="http://www.w3.org/2000/svg" class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
			<input
				type="text"
				placeholder="Search by name or domain..."
				bind:value={searchQuery}
				class="search-input"
			/>
		</div>

		<div class="bias-filter">
			{#each biasOptions as option}
				<button
					class="filter-btn"
					class:active={selectedBias === option.value}
					onclick={() => selectedBias = option.value}
				>
					{option.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- Results Count -->
	<div class="results-info">
		Showing {filteredSources.length} sources ({filteredSources.filter(s => isIncluded(s)).length} with Included = ✓)
	</div>

	<!-- Table -->
	<div class="table-container">
		<table class="sites-table">
			<thead>
				<tr>
					<th
						class="sortable"
						onclick={() => handleSort('name')}
						role="columnheader"
					>
						Site{getSortIndicator('name')}
					</th>
					<th
						class="sortable"
						onclick={() => handleSort('bias')}
						role="columnheader"
					>
						Bias{getSortIndicator('bias')}
					</th>
					<th>Reporting</th>
					<th>Included</th>
				</tr>
			</thead>
			<tbody>
				{#each paginatedSources as source}
					<tr>
						<td>
							<a
								href={source.url}
								target="_blank"
								rel="noopener noreferrer"
								class="site-link"
							>
								{source.name}
							</a>
							<span class="domain">{source.domain}</span>
						</td>
						<td>
							<span class="bias-tag {getBiasClass(source.bias)}">
								{formatBiasLabel(source.bias)}
							</span>
						</td>
						<td>
							<span class="reporting-tag {getReportingClass(source.reporting)}">
								{formatReporting(source.reporting)}
							</span>
						</td>
						<td class="included-cell">
							{#if isIncluded(source)}
								<span class="checkmark" title="Included in search">✓</span>
							{:else}
								<span class="no-check" title="Not included in search">—</span>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Pagination -->
	{#if totalPages > 1}
		<div class="pagination">
			<button
				class="page-btn"
				onclick={() => goToPage(currentPage - 1)}
				disabled={currentPage === 1}
			>
				Previous
			</button>

			{#each visiblePages as page}
				<button
					class="page-btn"
					class:active={page === currentPage}
					onclick={() => goToPage(page)}
				>
					{page}
				</button>
			{/each}

			{#if totalPages > visiblePages[visiblePages.length - 1]}
				<span class="ellipsis">...</span>
			{/if}

			<button
				class="page-btn"
				onclick={() => goToPage(currentPage + 1)}
				disabled={currentPage === totalPages}
			>
				Next
			</button>
		</div>
	{/if}
{/if}

<style>
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 3rem;
		color: #6b7280;
	}

	.loading-spinner {
		width: 2.5rem;
		height: 2.5rem;
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
		padding: 2rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.stat-card {
		background: white;
		border-radius: 0.75rem;
		padding: 1rem;
		text-align: center;
		border: 1px solid rgba(37, 99, 235, 0.1);
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.stat-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 16px rgba(37, 99, 235, 0.1);
	}

	.stat-card.stat-left { border-left: 3px solid #2563eb; }
	.stat-card.stat-left-center { border-left: 3px solid #6366f1; }
	.stat-card.stat-center { border-left: 3px solid #10b981; }
	.stat-card.stat-right-center { border-left: 3px solid #ec4899; }
	.stat-card.stat-right { border-left: 3px solid #ef4444; }
	.stat-card.stat-science { border-left: 3px solid #06b6d4; }
	.stat-card.stat-included { border-left: 3px solid #16a34a; }

	.stat-number {
		display: block;
		font-size: 1.5rem;
		font-weight: 700;
		color: #1f2937;
	}

	.stat-label {
		font-size: 0.75rem;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.filters-container {
		background: white;
		border-radius: 1rem;
		padding: 1.5rem;
		margin-bottom: 1.5rem;
		border: 1px solid rgba(37, 99, 235, 0.1);
	}

	.search-wrapper {
		position: relative;
		margin-bottom: 1rem;
	}

	.search-icon {
		position: absolute;
		left: 1rem;
		top: 50%;
		transform: translateY(-50%);
		width: 1.25rem;
		height: 1.25rem;
		color: #9ca3af;
	}

	.search-input {
		width: 100%;
		padding: 0.75rem 1rem 0.75rem 3rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		font-size: 1rem;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}

	.search-input:focus {
		outline: none;
		border-color: #2563eb;
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
	}

	.bias-filter {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.filter-btn {
		padding: 0.5rem 1rem;
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 500;
		border: 1px solid #e5e7eb;
		background: white;
		color: #4b5563;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.filter-btn:hover {
		background: #f3f4f6;
	}

	.filter-btn.active {
		background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
		color: white;
		border-color: transparent;
	}

	.results-info {
		font-size: 0.875rem;
		color: #6b7280;
		margin-bottom: 1rem;
	}

	.table-container {
		overflow-x: auto;
		background: white;
		border-radius: 1rem;
		border: 1px solid rgba(37, 99, 235, 0.1);
	}

	.sites-table {
		width: 100%;
		border-collapse: collapse;
	}

	.sites-table th {
		background: #f8fafc;
		padding: 1rem;
		text-align: left;
		font-weight: 600;
		color: #374151;
		border-bottom: 1px solid #e5e7eb;
	}

	.sites-table th.sortable {
		cursor: pointer;
		user-select: none;
		transition: background 0.2s ease;
	}

	.sites-table th.sortable:hover {
		background: #f1f5f9;
	}

	.sites-table td {
		padding: 1rem;
		border-bottom: 1px solid #f3f4f6;
		vertical-align: middle;
	}

	.sites-table tr:last-child td {
		border-bottom: none;
	}

	.sites-table tr:hover {
		background: #f8fafc;
	}

	.site-link {
		color: #2563eb;
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s ease;
	}

	.site-link:hover {
		color: #1d4ed8;
		text-decoration: underline;
	}

	.domain {
		display: block;
		font-size: 0.75rem;
		color: #9ca3af;
		margin-top: 0.25rem;
	}

	.bias-tag {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.bias-left {
		background: #dbeafe;
		color: #1d4ed8;
	}

	.bias-left-center {
		background: #e0e7ff;
		color: #3730a3;
	}

	.bias-center {
		background: #d1fae5;
		color: #047857;
	}

	.bias-right-center {
		background: #fce7f3;
		color: #be185d;
	}

	.bias-right {
		background: #fee2e2;
		color: #b91c1c;
	}

	.bias-science {
		background: #cffafe;
		color: #0e7490;
	}

	.reporting-tag {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.reporting-very-high {
		background: #dcfce7;
		color: #166534;
	}

	.reporting-high {
		background: #d1fae5;
		color: #047857;
	}

	.reporting-mostly-factual {
		background: #fef3c7;
		color: #92400e;
	}

	.reporting-mixed {
		background: #fee2e2;
		color: #991b1b;
	}

	.reporting-low {
		background: #fecaca;
		color: #7f1d1d;
	}

	.reporting-very-low {
		background: #fca5a5;
		color: #7f1d1d;
	}

	.included-cell {
		text-align: center;
	}

	.checkmark {
		color: #16a34a;
		font-weight: bold;
		font-size: 1.25rem;
	}

	.no-check {
		color: #d1d5db;
		font-size: 1rem;
	}

	.pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin-top: 1.5rem;
	}

	.page-btn {
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		border: 1px solid #e5e7eb;
		background: white;
		color: #4b5563;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.page-btn:hover:not(:disabled) {
		background: #f3f4f6;
	}

	.page-btn.active {
		background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
		color: white;
		border-color: transparent;
	}

	.page-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.ellipsis {
		padding: 0 0.5rem;
		color: #9ca3af;
	}
</style>
