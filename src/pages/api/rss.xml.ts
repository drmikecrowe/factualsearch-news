import type { APIRoute } from 'astro';

const RSS_URL = 'https://mediabiasfactcheck.com/feed/';

interface RssItem {
	title: string;
	link: string;
	pubDate: string;
	description: string;
	content?: string;
	creator?: string;
}

// Decode HTML entities
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
	// Decode any remaining numeric entities
	decoded = decoded.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)));
	return decoded;
}

// Parse RSS XML to extract items
function parseRss(xml: string): RssItem[] {
	const items: RssItem[] = [];

	// Simple regex-based parsing (works for standard RSS2.0)
	const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

	for (const itemXml of itemMatches.slice(0, 10)) { // Limit to 10 items
		const getItem = (tag: string): string => {
			const match = itemXml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`)) ||
				itemXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
			return match ? match[1].trim() : '';
		};

		const title = getItem('title');
		const link = getItem('link');
		const pubDate = getItem('pubDate');
		const description = getItem('description');
		const content = getItem('content:encoded') || getItem('content');
		const creator = getItem('dc:creator') || getItem('author');

		if (title && link) {
			items.push({
				title: decodeHtmlEntities(title.replace(/<!\[CDATA\[|\]\]>/g, '')),
				link,
				pubDate,
				description: decodeHtmlEntities(description.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]*>/g, '')).slice(0, 200),
				content,
				creator: decodeHtmlEntities(creator.replace(/<!\[CDATA\[|\]\]>/g, ''))
			});
		}
	}

	return items;
}

export const GET: APIRoute = async () => {
	try {
		const response = await fetch(RSS_URL, {
			headers: {
				'User-Agent': 'factualSearch.news RSS Reader',
				'Accept': 'application/rss+xml, application/xml, text/xml'
			}
		});

		if (!response.ok) {
			throw new Error(`RSS fetch failed: ${response.status}`);
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
		console.error('RSS API error:', error);
		return new Response(JSON.stringify({
			status: 'error',
			message: error instanceof Error ? error.message : 'Failed to fetch RSS',
			items: []
		}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
};
