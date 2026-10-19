# Colloquium — Academic Conference Directory

A web application for discovering Computer Science and Technology conferences across Asia and worldwide. Built with React 19, Vite, and Tailwind CSS.

## Features

- **Verified Registration Fees**: Displayed in USD and Philippine Pesos (PHP) with live conversion rates.
- **Client-Side SWR Caching**: Instantaneous page loads (0ms) using `sessionStorage` and memory caching with automatic background revalidation.
- **Instant Search & Filtering**: Multi-tag filtering by attendance format (Hybrid, Virtual, In-person), deadlines, publisher sources (IEEE, ACM, etc.), and predatory organizer protection.
- **Detailed Modal Breakdown**: Full fee breakdown (student, member, early bird), publication history with direct DOI links, and deadlines.
- **Exporting**: Download filtered lists directly to Excel (`.xlsx`) or CSV (`.csv`).

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm / yarn

### Installation

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
2. Open `.env.local` and add your Conference API key:
   ```env
   VITE_CONFERENCE_API_URL=https://conference-scraper-api.dcism.org
   VITE_CONFERENCE_API_KEY=your_key_here
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the local development server:
   ```bash
   npm run dev
   ```

### Production Build

```bash
npm run build
npm run preview
```

## Attribution

Exchange rate conversions provided by [ExchangeRate-API](https://www.exchangerate-api.com) in compliance with their free terms.

# Credits

Backend and Scraper - Joenell de Pedro
Frontend - Dustin Jesse Balansag