# TASK 4 — STORECRAFT SAMPLE PRODUCTS AND SPREADSHEET IMPORT REPORT

## 1. Executive Summary
Task 4 introduces a complete **Sample Product Generator** and **Spreadsheet Import System** for Storecraft. Store owners can generate realistic, category-tailored sample products with one click during onboarding or within the dashboard, as well as import product catalogs from CSV and Excel spreadsheets with interactive column mapping, row-by-row validation, collision detection, and downloadable error reporting.

---

## 2. Supported File Formats
- **CSV (`.csv`, `text/csv`)**: Standard comma-separated values with quote-escaping for descriptions and multi-word fields.
- **Excel (`.xlsx`)**: Microsoft Excel OpenXML workbook format.
- **Legacy Excel (`.xls`)**: Excel 97–2004 binary format.
- **Validation Limits**: Maximum file size **5MB**, non-empty check, first-row header requirement.

---

## 3. Schema & Mapping Specification

| Storecraft Field | Required / Optional | Description | Auto-Mapped Aliases |
|---|---|---|---|
| **`Product Name`** | **Required** | Product title | `name`, `product name`, `title`, `product_title`, `item_name` |
| **`SKU`** | **Required** | Unique Stock Keeping Unit | `sku`, `item_sku`, `code`, `product_code`, `item_code` |
| **`Price ($)`** | **Required** | Retail price (numeric $\ge 0$) | `price`, `retail price`, `unit price`, `cost`, `amount` |
| **`Stock`** | **Required** | Quantity on hand (integer $\ge 0$) | `stock`, `quantity`, `inventory`, `qty`, `stock_count` |
| **`Category`** | Optional | Catalog taxonomy | `category`, `type`, `department`, `collection`, `group` |
| **`Compare-at Price`** | Optional | Original MSRP / struck-through price | `compare at price`, `compare_at_price`, `msrp`, `original price` |
| **`Description`** | Optional | Marketing copy & specifications | `description`, `desc`, `details`, `body`, `notes` |
| **`Image URL`** | Optional | Valid HTTP/HTTPS photography link | `image`, `image url`, `images`, `image_url`, `photo`, `img` |
| **`Variant Name`** | Optional | Option dimension (e.g. *Size*, *Color*) | `variant name`, `variant_name`, `option name` |
| **`Variant Values`** | Optional | Delimited values (e.g. *S, M, L*) | `variant options`, `variant_options`, `options`, `values` |

---

## 4. Libraries & Dependencies
- **`xlsx` (SheetJS v0.18.5)**: High-performance spreadsheet engine for parsing `.xlsx`, `.xls`, and `.csv` files in the browser and generating downloadable templates and error reports.
- **`lucide-react`**: UI icons for file uploads, step progress indicators, and validation alerts.
- **`motion/react`**: Fluid step navigation animations during onboarding.

---

## 5. Validation Rules & Error Reporting

1. **Required Fields**: Ensures `Product Name`, `SKU`, `Price`, and `Stock` are mapped and non-empty.
2. **Numeric Price**: Strips currency formatting (`$`, `€`, `£`, `,`) and validates price is numeric and $\ge 0$.
3. **Integer Stock**: Validates stock is a non-negative integer ($\ge 0$).
4. **Duplicate SKU Detection**: Identifies duplicate SKUs within the upload file.
5. **Catalog Collision Check**: Compares incoming SKUs against existing store inventory to prevent duplicate entries.
6. **Compare-at Price**: Validates numeric non-negative compare-at prices.
7. **Image URL Validation**: Ensures image links start with `http://`, `https://`, or `/`; applies high-res Unsplash fallbacks when omitted.
8. **Downloadable Error Report**: Generates a downloadable CSV listing affected row numbers, titles, SKUs, and exact error reasons when rows fail validation.

---

## 6. One-Click Sample Product Generator

- **File**: `lib/sample-catalog.ts`
- **Category Blueprints**: Curated blueprints for 9 store categories (*Home & Living, Fashion, Electronics, Beauty, Food & Beverages, Sports, Books, Jewelry, Crafts*).
- **Collision Avoidance**: Inspects existing store SKUs and generates deterministic, unique identifiers (`HL-LMP-01`, `FA-OUT-01`, etc.).
- **Confirmation Flow**: Displays modal preview with product counts, category breakdown, and item titles before persisting to prevent accidental repeated clicks.

---

## 7. Integration & Persistence
- **Client Database**: Persists via `db.importProducts` in `lib/store-data.ts` and `lib/use-storecraft.ts`.
- **Server Database Sync**: Fires background updates to `/api/sync-onboard` and `data/storecraft-db.json` so server-rendered storefront pages (`/store/[slug]`) reflect new products immediately.

---

## 8. Verification & Test Results
- **Task 4 Test Suite**: `node scripts/test-task4-import-samples.mjs` passed all test cases.
- **Next.js Production Build**: `npm run build` compiled 100% cleanly (19/19 routes).
- **Smoke Test Suite**: `node scripts/smoke-test.mjs` passed 13/13 routes (`HTTP 200 OK`).
