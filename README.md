# factualSearch.news

A curated search engine for factual news — powered by [Media Bias/Fact Check](https://mediabiasfactcheck.com) ratings and Google Custom Search.

**Live site:** [factualsearch.news](https://factualsearch.news)

---

## What It Does

Most search engines index everything. This one doesn't.

factualSearch.news restricts results to news sources that Media Bias/Fact Check has rated **Very High**, **High**, or **Mostly Factual** in reporting accuracy. Satire, conspiracy, and low-credibility sources are excluded entirely.

Every source is also labeled with its political bias — Left, Left-Center, Least Biased, Right-Center, Right, or Pro-Science — so you can understand the perspective behind what you're reading, and actively seek out multiple viewpoints.

### Search Categories

| Category | What's included |
|---|---|
| **Mostly Center** *(default)* | Left-Center + Least Biased + Right-Center |
| **Least Bias Only** | Minimally biased, highly credible sources |
| **Left Leaning** | Left + Left-Center combined |
| **Right Leaning** | Right + Right-Center combined |
| **Left Center Only** | Slight to moderate liberal bias |
| **Right Center Only** | Slight to moderate conservative bias |
| **Left Only** | Moderate to strong liberal bias |
| **Right Only** | Moderate to strong conservative bias |
| **Pro-Science** | Evidence-based scientific sources |
| **Fact Checking** | Dedicated fact-checking organizations |

Your last-used category is saved locally in the browser so it persists between visits.

### Source Database

The [/sites](https://factualsearch.news/sites) page lists every source in the index with its bias rating, factual reporting level, and a direct link to its Media Bias/Fact Check entry. The database contains 500+ sources and is filterable and searchable.

---

## Why I Built This

Misinformation spreads because it's easy to share and hard to verify. Most people don't fact-check what they read — not because they don't care, but because finding credible sources takes effort.

This tool removes that friction. Instead of searching the whole web and hoping for the best, you search a pre-vetted corpus of factual sources. You can still choose your preferred bias direction, but everything in the results meets a baseline standard of factual accuracy.

The mission: **Be aware. Be informed. Combat propaganda by researching with purpose.**

---

## Tech Stack

- **[Astro 5](https://astro.build)** — static site framework
- **[Svelte 5](https://svelte.dev)** — interactive islands (search, source table, news feed)
- **[Tailwind CSS 4](https://tailwindcss.com)** — styling
- **[Google Custom Search Engine](https://programmablesearch.google.com)** — search backend, one CSE per bias category
- **[Media Bias/Fact Check](https://mediabiasfactcheck.com)** — source ratings and bias classifications
- **AWS S3 + CloudFront** — hosting and CDN

Deployed as a fully static site. No server, no database, no user accounts.

---

## Data Sources

Bias ratings and factual reporting levels are sourced exclusively from [Media Bias/Fact Check](https://mediabiasfactcheck.com). This project does not assign, modify, or editorialize any ratings — it uses their classifications as-is to determine which sources appear in the search index.
