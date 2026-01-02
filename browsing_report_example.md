Below is a focused, scraper-oriented crawling report for DATAROMA’s mobile site.

---

## 1. Website Overview

**Website:** DATAROMA (mobile) – https://www.dataroma.com/m/  
**Purpose:** Tracks “superinvestor” (famous fund managers) portfolios, holdings, and activity; plus aggregate views, insider activity, and commentary.

**Main sections (from navigation and links):**
- Home: `https://www.dataroma.com/m/home.php`
- Commentaries/Articles: `https://www.dataroma.com/m/comm.php`
- Superinvestors (Managers list): `https://www.dataroma.com/m/managers.php`
- Activity (all managers): `https://www.dataroma.com/m/allact.php?typ=a`
- S&P500 Grid: `https://www.dataroma.com/m/grid.php`
- Grand Portfolio (aggregate holdings): `https://www.dataroma.com/m/g/portfolio.php`
- RealTime: `https://www.dataroma.com/m/rt.php`
- Insider: `https://www.dataroma.com/m/ins/ins.php`
- Manager holdings/portfolio pages: `https://www.dataroma.com/m/holdings.php?m=CODE` and `https://www.dataroma.com/m/portfolio.php?m=CODE`
- Manager activity pages: `https://www.dataroma.com/m/activity.php?m=CODE`
- Stock pages: `https://www.dataroma.com/m/stock.php?sym=SYMBOL`

**Key content types:**
1. **Manager summary rows** (on `/managers.php`):  
   - For each superinvestor: name, firm, portfolio value, number of stocks, top holdings with weights and reported prices.
2. **Manager portfolio / holdings** (on `holdings.php` / `portfolio.php?m=...`):  
   - Full list of holdings for a given manager, with detailed per-position stats (inferred from links and site purpose).
3. **Manager activity** (on `activity.php?m=...` and `allact.php?typ=a`):  
   - Buys/sells with dates, share counts, prices, and position changes.
4. **Stock-level view** (on `stock.php?sym=...`):  
   - For a given ticker, which managers hold it and how.
5. **Home: Updates + latest insider buys** (home page):  
   - List of managers and last update dates.  
   - Latest significant insider buys of stocks that are also superinvestor holdings.
6. **Insider activity** (on `/ins/ins.php`):  
   - Broader insider transactions.
7. **Aggregate views**:
   - S&P500 grid, grand portfolio: aggregated across managers.

---

## 2. Valuable Data to Crawl

### High-priority data

**A. Manager master data**
- `managerCode` (e.g., `BRK`, `AKO`, from `m` query param in holdings URLs)
- `managerName` (e.g., “Warren Buffett”)
- `firmName` (e.g., “Berkshire Hathaway”)
- `portfolioUrl` (`/m/holdings.php?m=CODE` or `/m/portfolio.php?m=CODE`)
- `activityUrl` (`/m/activity.php?m=CODE`)
- `portfolioValue` (normalized number, e.g., 36.6 B → 36600000000)
- `numberOfStocks`
- `topHoldings` (array of up to 10 holdings, each with: `ticker`, `companyName`, `portfolioWeightPercent`, `reportedPrice`, `reportedPriceCurrency` if available)
- `lastUpdatedDate` (from home and/or portfolio page)

**B. Manager holdings (position-level)**
For each manager & stock:
- `managerCode`
- `managerName`
- `ticker`
- `companyName`
- `cusip` / identifier (if present)
- `sector`, `industry` (if present)
- `portfolioWeightPercent`
- `shareCount`
- `marketValue`
- `reportedPrice` (per share)
- `reportedDate` / `filingDate` (most recent 13F period)
- `positionType` (long / put / call, if indicated)
- `isNewPosition`, `isIncreased`, `isReduced`, `isSoldOut` flags (if indicated)
- `sourceFormType` (e.g., 13F, 13D, etc. if indicated)

**C. Manager activity (transactions)**
For each transaction on `activity.php?m=...` / `allact.php?typ=a`:
- `managerCode`
- `managerName`
- `ticker`
- `companyName`
- `transactionType` (buy, sell, add, reduce, new, etc.)
- `transactionDate` (as ISO)
- `filingDate` (if separate)
- `shareCount`
- `price`
- `value`
- `portfolioWeightChangePercent` (if displayed)
- `positionBeforeShares`, `positionAfterShares` (if available)
- `isNewPosition`, `isSoldOut`

**D. Stock-level view**
On `/stock.php?sym=...`:
- `ticker`
- `companyName`
- `currentPrice` (if displayed)
- `sector`, `industry` (if displayed)
- Per-manager holdings:
  - `managerCode`
  - `managerName`
  - `portfolioWeightPercent`
  - `shareCount`
  - `marketValue`
  - `reportedDate`

**E. Aggregate views**
- Grand portfolio & S&P 500 grid:
  - `ticker`
  - `companyName`
  - `numManagersHolding`
  - `totalMarketValueAcrossManagers`
  - `averageWeightPercent`
  - Any popularity / concentration metrics

**F. Insider data (esp. on home & /ins/ins.php)**
- `filingDate`
- `transactionDate`
- `ticker`
- `companyName`
- `insiderName`
- `insiderRole` (CEO, director, etc.)
- `transactionType` (purchase, sale)
- `price`
- `shareCount`
- `transactionValue`
- `isSuperinvestorHolding` flag if indicated

### Medium-priority data

- **Commentaries/Articles**:
  - Article ID, title, author, publish date, URL, tags, related tickers.
- **RealTime page**:
  - Real-time noted trades, with minimal fields (ticker, manager, type, size, timestamp).

### Low-priority data

- Presentational-only details (CSS classes, layout text).
- Advertising or non-data UI text.

### Estimated volume

- Managers: ~80–100.
- Holdings:
  - Roughly 30–100 positions per manager → order of 3,000–8,000 holdings rows.
- Activity / transactions:
  - Potentially thousands of transaction rows per year.
- Insider & aggregate views:
  - Hundreds to a few thousand rows.

---

## 3. Recommended Database Schema

You can use either relational (e.g., PostgreSQL) or document; below is a relational-style schema with clear keys.

### Table: `managers`

- `id` (PK, integer, auto-increment)
- `managerCode` (VARCHAR, unique, indexed) – e.g. “BRK”, “AKO”
- `managerName` (VARCHAR)
- `firmName` (VARCHAR)
- `portfolioValue` (NUMERIC(20,2))
- `numberOfStocks` (INTEGER)
- `lastUpdatedDate` (DATE or TIMESTAMP)
- `portfolioUrl` (TEXT)
- `activityUrl` (TEXT)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

**Indexes:**
- `idx_managers_code` on (`managerCode`)
- `idx_managers_name` on (`managerName`)

---

### Table: `stocks`

- `id` (PK)
- `ticker` (VARCHAR, unique, indexed)
- `companyName` (VARCHAR)
- `sector` (VARCHAR, nullable)
- `industry` (VARCHAR, nullable)
- `exchange` (VARCHAR, nullable)
- `currentPrice` (NUMERIC(20,4), nullable)
- `currency` (VARCHAR(10), nullable)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

**Indexes:**
- `idx_stocks_ticker` on (`ticker`)

---

### Table: `manager_holdings`

Represents a snapshot position for a given 13F period.

- `id` (PK)
- `managerId` (FK → managers.id, indexed)
- `stockId` (FK → stocks.id, indexed)
- `reportDate` (DATE) – 13F reporting date / period end
- `shareCount` (NUMERIC(20,4))
- `marketValue` (NUMERIC(20,2))
- `portfolioWeightPercent` (NUMERIC(10,4))
- `reportedPrice` (NUMERIC(20,4))
- `sourceFormType` (VARCHAR, nullable)
- `positionType` (VARCHAR, e.g., “LONG”, “CALL”, “PUT”, nullable)
- `isNewPosition` (BOOLEAN)
- `isSoldOut` (BOOLEAN)
- `isIncreased` (BOOLEAN)
- `isReduced` (BOOLEAN)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

**Unique constraint:**
- (`managerId`, `stockId`, `reportDate`)

**Indexes:**
- `idx_holdings_manager_stock` on (`managerId`, `stockId`)
- `idx_holdings_stock` on (`stockId`)
- `idx_holdings_reportdate` on (`reportDate`)

---

### Table: `transactions` (manager activity)

- `id` (PK)
- `managerId` (FK → managers.id)
- `stockId` (FK → stocks.id)
- `transactionDate` (DATE)
- `filingDate` (DATE, nullable)
- `transactionType` (VARCHAR) – e.g., BUY, SELL, NEW, ADD, REDUCE
- `shareCount` (NUMERIC(20,4))
- `price` (NUMERIC(20,4))
- `value` (NUMERIC(20,2))
- `portfolioWeightChangePercent` (NUMERIC(10,4), nullable)
- `positionBeforeShares` (NUMERIC(20,4), nullable)
- `positionAfterShares` (NUMERIC(20,4), nullable)
- `isNewPosition` (BOOLEAN)
- `isSoldOut` (BOOLEAN)
- `sourcePageUrl` (TEXT)
- `createdAt` (TIMESTAMP)

**Indexes:**
- `idx_tx_manager_date` on (`managerId`, `transactionDate`)
- `idx_tx_stock_date` on (`stockId`, `transactionDate`)

---

### Table: `aggregated_holdings` (for grand portfolio / S&P 500 grid)

- `id` (PK)
- `stockId` (FK → stocks.id)
- `asOfDate` (DATE)
- `numManagersHolding` (INTEGER)
- `totalMarketValue` (NUMERIC(20,2))
- `avgPortfolioWeightPercent` (NUMERIC(10,4))
- `createdAt` (TIMESTAMP)

**Unique:**
- (`stockId`, `asOfDate`)

---

### Table: `insider_transactions`

- `id` (PK)
- `stockId` (FK → stocks.id)
- `insiderName` (VARCHAR)
- `insiderRole` (VARCHAR, nullable)
- `transactionType` (VARCHAR) – BUY/SELL/etc.
- `transactionDate` (DATE)
- `filingDate` (DATE)
- `shareCount` (NUMERIC(20,4))
- `price` (NUMERIC(20,4))
- `transactionValue` (NUMERIC(20,2))
- `isSuperinvestorHolding` (BOOLEAN)
- `sourcePageUrl` (TEXT)
- `createdAt` (TIMESTAMP)

---

### (Optional) `articles`

- `id` (PK)
- `title` (VARCHAR)
- `url` (TEXT)
- `author` (VARCHAR, nullable)
- `publishedDate` (DATE, nullable)
- `content` (TEXT)
- `relatedTickers` (JSONB or separate join table)

---

## 4. Data Relationships

- **Managers ↔ Holdings (1-to-many)**  
  One manager has many `manager_holdings` rows (per stock, per reporting date).
- **Stocks ↔ Holdings (1-to-many)**  
  One stock has many manager holdings.
- **Managers ↔ Transactions (1-to-many)**  
  Each manager executes many transactions.
- **Stocks ↔ Transactions (1-to-many)**  
  Each stock appears in many transactions.
- **Stocks ↔ InsiderTransactions (1-to-many)**
- **Stocks ↔ AggregatedHoldings (1-to-many over time)**

Key foreign keys:
- `manager_holdings.managerId` → `managers.id`
- `manager_holdings.stockId` → `stocks.id`
- `transactions.managerId` → `managers.id`
- `transactions.stockId` → `stocks.id`
- `insider_transactions.stockId` → `stocks.id`
- `aggregated_holdings.stockId` → `stocks.id`

Many-to-many conceptual relationships (realized through join tables):
- Managers ↔ Stocks via `manager_holdings`.
- Articles ↔ Stocks via `relatedTickers`.

---

## 5. Crawling Recommendations

### Crawl depth & coverage

- **Depth 1–2 from main sections is enough**:
  - Start from `/m/home.php` and `/m/managers.php`.
  - From `/m/managers.php`, follow:
    - Manager holdings URLs: `/m/holdings.php?m=CODE` or `/m/portfolio.php?m=CODE`
    - Manager activity URLs: `/m/activity.php?m=CODE`
  - From holdings & activity pages, you may optionally follow stock URLs `/m/stock.php?sym=SYMBOL` to enrich stock info.

**Essential pages:**
- `/m/managers.php`
- All `/m/holdings.php?m=CODE` (or `/m/portfolio.php?m=CODE`)
- All `/m/activity.php?m=CODE`
- `/m/allact.php?typ=a` (global activity)
- `/m/grid.php` and `/m/g/portfolio.php` for aggregates
- `/m/home.php` and `/m/ins/ins.php` for insider and last-update info

**Lower priority pages to crawl less often:**
- `/m/comm.php` (articles)
- `/m/rt.php` (may be volatile; treat like near-real-time stream)

### Rate limiting

- Public site with substantial tabular data; be polite:
  - 1–2 requests/second max, with small random jitter.
  - If you crawl all managers: ~81 managers × (holdings + activity + maybe stock pages) → roughly a few hundred pages; can be done in a few minutes at low rate.
- Implement backoff if non-200 or if responses slow.

### Update strategy

- Holdings and activity are based on regulatory filings (batch updates):
  - **Holdings:** Refresh each manager’s holdings every 1–2 weeks, or when `lastUpdatedDate` changes on home/portfolio pages.
  - **Activity:** Refresh more often, e.g., daily, pulling `allact.php?typ=a` and per-manager pages.
- Insider data:
  - Refresh daily or multiple times per week.
- Aggregates:
  - Recompute or recrawl daily after holdings updates.

### Potential challenges

- **JavaScript:** Some messages mention “Viewing this page requires JavaScript,” but the mobile variant returns HTML tables in the response body (as you see from the raw HTML text), so a simple HTTP client should suffice. If some content does require JS, consider:
  - Using a headless browser OR
  - Inspecting network calls to see if there is a JSON or non-JS fallback.
- **Query parameters:**  
  Manager code `m` and stock symbol `sym` must be parsed carefully.
- **Text normalization:**
  - Portfolio values often appear with shorthand (e.g., “$7.03 B”). Normalize to raw numbers.
  - Percentages like “11.33% of portfolio” → 11.33.
- **Date parsing:**  
  Use consistent UTC ISO dates; some dates may be formatted `14 Nov 2025`, etc.
- **Ticker collisions/odd tickers:**  
  Some international tickers or special characters (e.g., BRK.B) may require escaping or careful treatment.

---

## 6. Extraction Prompts (per Page Type)

Use these prompts with your extraction API. Field names are camelCase. URL patterns follow observed structure.

### 6.1 Managers list page (`/m/managers.php`)

Example URL: `https://www.dataroma.com/m/managers.php`

```
Extract managers as array of {
  managerName,
  firmName,
  managerCode from holdings page URL query param m,
  portfolioValueText,
  portfolioValue as number,
  numberOfStocks as number,
  topHoldings as array of {
    ticker,
    companyName,
    portfolioWeightPercent as number,
    reportedPrice as number,
    reportedPriceCurrency
  }
} from https://www.dataroma.com/m/managers.php
```

---

### 6.2 Home page – manager updates + latest insider buys

Example URL: `https://www.dataroma.com/m/home.php`

```
Extract superinvestorUpdates as array of {
  managerName,
  firmName,
  managerCode from holdings URL query param m,
  lastUpdatedDate as ISO date
},
currentlyTrackingSuperinvestorsCount as number,
latestInsiderBuys as array of {
  filingDate as ISO date,
  ticker,
  companyName,
  transactionValue as number,
  price as number
} from https://www.dataroma.com/m/home.php
```

---

### 6.3 Manager holdings / portfolio detail page

Both patterns:  
- `https://www.dataroma.com/m/holdings.php?m=BRK`  
- `https://www.dataroma.com/m/portfolio.php?m=BRK`

Use one generalized pattern:

```
Extract managerName,
firmName,
managerCode from URL query param m,
lastUpdatedDate as ISO date,
portfolioValueText,
portfolioValue as number,
numberOfStocks as number,
holdings as array of {
  ticker,
  companyName,
  sector,
  industry,
  shareCount as number,
  marketValue as number,
  portfolioWeightPercent as number,
  reportedPrice as number,
  reportedDate as ISO date,
  positionType,
  isNewPosition as boolean,
  isIncreased as boolean,
  isReduced as boolean,
  isSoldOut as boolean
} from https://www.dataroma.com/m/holdings.php?m=[managerCode]
```

(Use same prompt but point to `https://www.dataroma.com/m/portfolio.php?m=[managerCode]` if that variant exposes slightly different layout.)

---

### 6.4 Manager activity page

Pattern: `https://www.dataroma.com/m/activity.php?m=BRK`

```
Extract managerName,
firmName,
managerCode from URL query param m,
transactions as array of {
  transactionDate as ISO date,
  filingDate as ISO date,
  ticker,
  companyName,
  transactionType,
  shareCount as number,
  price as number,
  value as number,
  portfolioWeightChangePercent as number,
  positionBeforeShares as number,
  positionAfterShares as number,
  isNewPosition as boolean,
  isSoldOut as boolean
} from https://www.dataroma.com/m/activity.php?m=[managerCode]
```

---

### 6.5 All activity page (global)

Pattern: `https://www.dataroma.com/m/allact.php?typ=a`

```
Extract transactions as array of {
  managerName,
  firmName,
  managerCode from manager portfolio URL query param m,
  transactionDate as ISO date,
  filingDate as ISO date,
  ticker,
  companyName,
  transactionType,
  shareCount as number,
  price as number,
  value as number,
  portfolioWeightChangePercent as number,
  isNewPosition as boolean,
  isSoldOut as boolean
} from https://www.dataroma.com/m/allact.php?typ=a
```

---

### 6.6 Stock detail page

Pattern example from links: `https://www.dataroma.com/m/stock.php?sym=MSFT`

```
Extract ticker from URL query param sym,
companyName,
sector,
industry,
currentPrice as number,
currency,
holders as array of {
  managerName,
  firmName,
  managerCode from manager portfolio URL query param m,
  portfolioWeightPercent as number,
  shareCount as number,
  marketValue as number,
  reportedDate as ISO date
} from https://www.dataroma.com/m/stock.php?sym=[ticker]
```

---

### 6.7 Grand portfolio page

Pattern: `https://www.dataroma.com/m/g/portfolio.php`

```
Extract asOfDate as ISO date,
aggregateHoldings as array of {
  ticker,
  companyName,
  numManagersHolding as number,
  totalMarketValue as number,
  avgPortfolioWeightPercent as number
} from https://www.dataroma.com/m/g/portfolio.php
```

---

### 6.8 S&P 500 grid page

Pattern: `https://www.dataroma.com/m/grid.php`

```
Extract asOfDate as ISO date,
sp500Grid as array of {
  ticker,
  companyName,
  sector,
  numManagersHolding as number,
  totalMarketValue as number,
  avgPortfolioWeightPercent as number
} from https://www.dataroma.com/m/grid.php
```

---

### 6.9 Insider activity page

Pattern: `https://www.dataroma.com/m/ins/ins.php`

```
Extract insiderTransactions as array of {
  filingDate as ISO date,
  transactionDate as ISO date,
  ticker,
  companyName,
  insiderName,
  insiderRole,
  transactionType,
  shareCount as number,
  price as number,
  transactionValue as number,
  isSuperinvestorHolding as boolean
} from https://www.dataroma.com/m/ins/ins.php
```

---

### 6.10 Articles / commentaries (if needed)

Pattern: `https://www.dataroma.com/m/comm.php` and article URLs linked from it.

For the list page:

```
Extract articles as array of {
  title,
  url,
  publishedDate as ISO date,
  author
} from https://www.dataroma.com/m/comm.php
```

For an individual article page (example placeholder):

```
Extract title,
url,
publishedDate as ISO date,
author,
content,
relatedTickers as array of ticker from https://www.dataroma.com/m/comm.php?id=[articleId]
```

---

If you’d like, I can next derive concrete managerCode and ticker lists from a fresh crawl of `/m/managers.php` and generate a seeding plan (e.g., initial URLs list) for your scraper.