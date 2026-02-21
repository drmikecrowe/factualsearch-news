import type { APIRoute } from 'astro';
import { XMLParser } from 'fast-xml-parser';

// Enable SSR for this API route (required for hybrid output)
export const prerender = false;

const RSS_URL = 'https://mediabiasfactcheck.com/feed/';
const FETCH_TIMEOUT_MS = 5000;

interface RssItem {
	title: string;
	link: string;
	pubDate: string;
	description: string;
	content?: string;
	creator?: string;
}

// Decode HTML entities using String.fromCodePoint for proper Unicode support
function decodeHtmlEntities(text: string): string {
	const entities: Record<string, string> = {
		'&#8217;': "'",
		'&#8216;': "'",
		'&#8220;': '"',
		'&#8221;': '"',
		'&#8230;': '...',
		'&#8211;': '–',
		'&#8212;': '—',
		'&amp;': '&',
		'&lt;': '<',
		'&gt;': '>',
		'&quot;': '"',
		'&#039;': "'",
		'&nbsp;': ' ',
	};

	let decoded = text;
	for (const [entity, char] of Object.entries(entities)) {
		decoded = decoded.split(entity).join(char);
	}
	// Decode any remaining numeric entities using fromCodePoint for proper Unicode support
	decoded = decoded.replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(parseInt(num, 10)));
	// Decode hexadecimal entities
	decoded = decoded.replace(/&#[xX]([0-9a-fA-F]+);/g, (_, hex) => 
		String.fromCodePoint(parseInt(hex, 16))
	);
	return decoded;
}

// Strip HTML tags safely using a proper approach
function stripHtmlTags(html: string): string {
	// Use a simple state machine to properly handle attributes with > characters
	let result = '';
	let inTag = false;
	let inQuote = false;
	let quoteChar = '';
	
	for (let i = 0; i < html.length; i++) {
		const char = html[i];
		
		if (inTag) {
			if (inQuote) {
				if (char === quoteChar && html[i - 1] !== '\\') {
					inQuote = false;
				}
			} else if (char === '"' || char === "'") {
				inQuote = true;
				quoteChar = char;
			} else if (char === '>') {
				inTag = false;
			}
		} else if (char === '<') {
			inTag = true;
		} else {
			result += char;
		}
	}
	
	return result;
}

// Parse RSS XML using a proper XML parser
function parseRss(xml: string): RssItem[] {
	const parser = new XMLParser({
		ignoreAttributes: false,
		attributeNamePrefix: '@_',
		isArray: (name, jpath, isLeafNode, isAttribute) => {
			// Always treat items as an array
			if (name === 'item') return true;
			return false;
		}
	});

	try {
		const parsed = parser.parse(xml);
		const channel = parsed?.rss?.channel || parsed?.channel;
		
		if (!channel || !channel.item) {
			return [];
		}

		const items: RssItem[] = [];
		
		for (const item of channel.item.slice(0, 10)) {
			const title = item.title || '';
			const link = item.link || '';
			const pubDate = item.pubDate || '';
			const description = item.description || '';
			const content = item['content:encoded'] || item.content || '';
			const creator = item['dc:creator'] || item.author || '';

			if (title && link) {
				items.push({
					title: decodeHtmlEntities(title),
					link,
					pubDate,
					description: decodeHtmlEntities(stripHtmlTags(description)).slice(0, 200),
					content,
					creator: decodeHtmlEntities(creator)
				});
			}
		}

		return items;
	} catch (parseError) {
		console.error('RSS parse error:', parseError);
		return [];
	}
}

export const GET: APIRoute = async () => {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

	try {
		const response = await fetch(RSS_URL, {
			signal: controller.signal,
			headers: {
				'User-Agent': 'factualSearch.news RSS Reader',
				'Accept': 'application/rss+xml, application/xml, text/xml'
			}
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			console.error(`RSS fetch failed with status: ${response.status}`);
			return new Response(JSON.stringify({
				status: 'error',
				message: 'Unable to fetch RSS feed',
				items: []
			}), {
				status: 502,
				headers: {
					'Content-Type': 'application/json'
				}
			});
		}

		const xml = await response.text();
		const items = parseRss(xml);

		return new Response(JSON.stringify({
			status: 'ok',
			items,
			fetchedAt: new Date().toISOString()
		}), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
			}
		});
	} catch (error) {
		clearTimeout(timeoutId);
		console.error('RSS API error:', error);
		
		// Return generic error message, never expose internal details
		return new Response(JSON.stringify({
			status: 'error',
			message: 'Unable to fetch RSS feed',
			items: []
		}), {
			status: 502,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
};
