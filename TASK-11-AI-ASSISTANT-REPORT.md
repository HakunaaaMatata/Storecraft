# TASK 11 — STORECRAFT SECURE AI BUSINESS ASSISTANT REPORT

## 1. Model Provider & Environment Variables
The assistant architecture supports LLM provider synthesis with graceful local fallback:
- **Supported Provider Environment Variables**:
  - `GEMINI_API_KEY` or `GOOGLE_GENERATIVE_AI_API_KEY`: Configures Google Gemini AI model integration.
  - `OPENAI_API_KEY`: Configures OpenAI model integration.
- **Provider Setup Mode**: If no API key environment variable is configured, the Controlled Analytics Layer operates in **"Local Grounded Analytics Engine Mode"**, serving 100% real database grounded analysis with an explicit provider setup status badge. Secret keys are never printed or returned in responses.

---

## 2. Supported Read-Only Analytics Operations

| Operation Enum | Example Natural Language Query | Description & Calculation Basis |
|---|---|---|
| **`GET_TOP_SELLING_PRODUCTS`** | *"What were my top-selling products this month?"* | Aggregates merchandise line-items from confirmed orders ($status \ne \text{'Cancelled'}$). Computes volume sold, gross revenue ($\sum \text{quantity} \times \text{price}$), and average selling price. |
| **`GET_LOW_STOCK_PRODUCTS`** | *"Which products are low on stock?"* | Scopes active store catalog for products with stock $\le 5$ units. Ranks by urgency (*Out of Stock*, *Critical $\le 2$*, *Low $\le 5$*). |
| **`GET_REVENUE_COMPARISON`** | *"Compare revenue this week with last week."* | Compares current 7-day rolling window revenue vs. prior 7-day baseline. Computes dollar delta, WoW growth %, and Average Order Value (AOV). |
| **`GET_PENDING_SHIPMENTS`** | *"How many orders are waiting to be shipped?"* | Filters active orders in `Placed` (Awaiting Packing) or `Packed` (Awaiting Shipping) pipeline stages. |
| **`GET_REVENUE_BY_CATEGORY`** | *"Which category generated the most revenue?"* | Aggregates confirmed sales by product category, calculating gross category revenue and percentage market share. |
| **`GET_CANCELLED_ORDERS`** | *"Show my recent cancelled orders."* | Audits orders with status `Cancelled`. Calculates total lost revenue, cancellation rate %, and status history notes. |
| **`GET_EXECUTIVE_SUMMARY`** | *"Give me an executive overview of store performance."* | Cross-table snapshot of net revenue, low stock alerts, pending fulfillment queue, and active catalog breadth. |

---

## 3. Query Safety & Controlled Analytics Layer
- **No Unrestricted Code/DB Execution**: The AI model is strictly prohibited from generating raw SQL, JavaScript, shell scripts, or arbitrary DB commands.
- **Predefined Read-Only Operations**: Queries pass through `parseQueryIntent()` which maps inputs strictly to one of the 7 predefined read-only analytical routines.
- **Prompt Injection Perimeter**: `detectPromptInjection()` scans for keywords requesting system prompts, passwords, secret keys, or cross-store access. Injections are safely caught and returned as a blocked security perimeter event.

---

## 4. Tenant Isolation & Security
- **Server Authentication**: Resolves session user via `getSessionUser()`.
- **Server-Side Store Authorization**: Verifies store ownership on the server (`getStoresByOwner()`). Client-supplied store IDs are validated; unauthorized cross-store requests are rejected with `HTTP 403 Forbidden`.
- **Customer Privacy**: Redacts customer PII (e.g., `John D.`, `Boston, MA`) in evidence tables and assistant text responses.

---

## 5. Grounded Evidence & Truthfulness
Every assistant response returns a structured **`evidence`** object containing:
- **Date Range / Period Used**: e.g., *"Current Week (Last 7 Days) vs Previous Week Baseline"*
- **Calculation Basis**: Explicit revenue and order definitions (e.g., *"Net Revenue = SUM(total) for confirmed orders where status != 'Cancelled'"*)
- **Metrics Summary**: Key KPI pills (*Net Revenue*, *Units Sold*, *AOV*, *Growth %*)
- **Evidence Data Table**: Formatted responsive columns with status badges and currency formatting
- **Zero vs Unavailable Data**: Explicitly distinguishes 0 matching rows (e.g., *"0 cancelled orders found"*) from missing data.

---

## 6. Test Files & Test Results
- **Task 11 Test Suite** ([`scripts/test-task11-assistant.mjs`](file:///c:/Users/anush/Desktop/storeCraft2/Storecraft/scripts/test-task11-assistant.mjs)):
  - ✅ All 6 example questions parsed to correct operation enums.
  - ✅ All 6 analytical routines executed with valid evidence tables & metrics.
  - ✅ Prompt injection attempts caught and blocked.
  - ✅ Tenant isolation cross-store access control verified.
  - ✅ Read-only immutability verified (0 data mutations).
- **Next.js Production Build**: `npm run build` compiled 100% clean (20 static/dynamic routes).
- **Smoke Test Suite**: `node scripts/smoke-test.mjs` passed 13/13 routes (`HTTP 200 OK`).
