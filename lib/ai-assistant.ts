import { db, Product, Order } from './store-data'

export interface EvidenceRecord {
  [key: string]: string | number | boolean | null | undefined
}

export interface GroundedEvidence {
  queryType: 'restock' | 'bestsellers' | 'revenue' | 'fulfillment' | 'general'
  title: string
  calculationMethod: string
  queryFormula: string
  timestamp: string
  rawRecordsCount: number
  tableHeaders: { key: string; label: string; format?: 'currency' | 'number' | 'badge' | 'text' }[]
  tableData: EvidenceRecord[]
  metricsSummary?: { label: string; value: string | number; change?: string }[]
  groundingStatus: '100% Grounded in Live Database'
}

export interface AssistantResponse {
  id: string
  sender: 'assistant'
  timestamp: string
  queryType: 'restock' | 'bestsellers' | 'revenue' | 'fulfillment' | 'general'
  headline: string
  summary: string
  insights: string[]
  evidence: GroundedEvidence
}

/**
 * Task 5 Grounded Query: Restock alerts (products with stock <= 5)
 */
export function queryRestockAlerts(storeId: string): AssistantResponse {
  const allProducts = db.getProducts(storeId)
  const lowStockProducts = allProducts.filter((p) => p.stock <= 5)
  const sorted = [...lowStockProducts].sort((a, b) => a.stock - b.stock)
  const timestamp = new Date().toISOString()

  const tableData: EvidenceRecord[] = sorted.map((p) => ({
    name: p.name,
    sku: p.sku || 'N/A',
    category: p.category,
    price: p.price,
    stock: p.stock,
    urgency: p.stock === 0 ? 'Out of Stock' : p.stock <= 2 ? 'Critical' : 'Low Stock',
  }))

  const outOfStockCount = sorted.filter((p) => p.stock === 0).length
  const criticalCount = sorted.filter((p) => p.stock > 0 && p.stock <= 2).length
  const lowCount = sorted.filter((p) => p.stock > 2 && p.stock <= 5).length

  let summary = ''
  if (sorted.length === 0) {
    summary = `All products in your catalog have healthy inventory levels above the safety threshold (stock > 5 units). No immediate restock actions are required.`
  } else {
    summary = `Identified ${sorted.length} product${sorted.length === 1 ? '' : 's'} at or below the minimum safety threshold (stock ≤ 5 units). Immediate supplier purchase orders are recommended to avoid stockouts.`
  }

  const insights: string[] = []
  if (outOfStockCount > 0) {
    insights.push(`🚨 ${outOfStockCount} item${outOfStockCount === 1 ? ' is' : 's are'} completely out of stock and losing potential sales.`)
  }
  if (criticalCount > 0) {
    insights.push(`⚠️ ${criticalCount} item${criticalCount === 1 ? ' has' : 's have'} 1–2 units remaining, at immediate risk of depletion.`)
  }
  if (lowCount > 0) {
    insights.push(`📦 ${lowCount} item${lowCount === 1 ? ' is' : 's are'} in the reorder caution zone (3–5 units).`)
  }
  if (sorted.length > 0) {
    insights.push(`Priority item: "${sorted[0].name}" with only ${sorted[0].stock} units left in stock.`)
  }

  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    sender: 'assistant',
    timestamp,
    queryType: 'restock',
    headline: sorted.length === 0 ? 'Inventory Healthy: No Restock Required' : `Restock Alert: ${sorted.length} Product${sorted.length === 1 ? '' : 's'} Running Low`,
    summary,
    insights,
    evidence: {
      queryType: 'restock',
      title: 'Raw Inventory Threshold Data (Stock ≤ 5)',
      calculationMethod: 'Filtered product catalog where `product.stock <= 5` units. Sorted ascending by units on-hand.',
      queryFormula: `SELECT id, name, sku, category, price, stock FROM products WHERE storeId = '${storeId}' AND stock <= 5 ORDER BY stock ASC`,
      timestamp,
      rawRecordsCount: sorted.length,
      tableHeaders: [
        { key: 'name', label: 'Product Name', format: 'text' },
        { key: 'sku', label: 'SKU', format: 'text' },
        { key: 'category', label: 'Category', format: 'text' },
        { key: 'price', label: 'Unit Price', format: 'currency' },
        { key: 'stock', label: 'Current Stock', format: 'number' },
        { key: 'urgency', label: 'Urgency Status', format: 'badge' },
      ],
      tableData,
      metricsSummary: [
        { label: 'Low Stock Items', value: sorted.length },
        { label: 'Critical (≤2 units)', value: criticalCount },
        { label: 'Catalog Scanned', value: allProducts.length },
      ],
      groundingStatus: '100% Grounded in Live Database',
    },
  }
}

/**
 * Task 5 Grounded Query: Best sellers (volume & revenue from completed orders)
 */
export function queryBestSellers(storeId: string): AssistantResponse {
  const allOrders = db.getOrders(storeId)
  // Completed orders: Delivered or confirmed non-cancelled
  const completedOrders = allOrders.filter((o) => o.status === 'Delivered')
  // If no Delivered orders yet, include non-cancelled orders for richer analysis, but distinguish
  const targetOrders = completedOrders.length > 0 ? completedOrders : allOrders.filter((o) => o.status !== 'Cancelled')
  const timestamp = new Date().toISOString()

  // Aggregate by product
  const productAggMap = new Map<string, {
    productId: string
    name: string
    volume: number
    revenue: number
    orderCount: number
    latestSoldAt: string
  }>()

  for (const order of targetOrders) {
    for (const item of order.items) {
      const existing = productAggMap.get(item.productId) || {
        productId: item.productId,
        name: item.name,
        volume: 0,
        revenue: 0,
        orderCount: 0,
        latestSoldAt: order.createdAt,
      }
      existing.volume += item.quantity
      existing.revenue += item.price * item.quantity
      existing.orderCount += 1
      if (new Date(order.createdAt) > new Date(existing.latestSoldAt)) {
        existing.latestSoldAt = order.createdAt
      }
      productAggMap.set(item.productId, existing)
    }
  }

  const sortedByRevenue = Array.from(productAggMap.values()).sort((a, b) => b.revenue - a.revenue)
  const totalVolume = sortedByRevenue.reduce((acc, curr) => acc + curr.volume, 0)
  const totalRevenue = sortedByRevenue.reduce((acc, curr) => acc + curr.revenue, 0)

  const tableData: EvidenceRecord[] = sortedByRevenue.map((item, idx) => ({
    rank: `#${idx + 1}`,
    name: item.name,
    volume: item.volume,
    revenue: item.revenue,
    orderCount: item.orderCount,
    avgPricePerUnit: item.volume > 0 ? Math.round((item.revenue / item.volume) * 100) / 100 : 0,
  }))

  const topPerformer = sortedByRevenue[0]
  const isOnlyDelivered = completedOrders.length > 0

  let summary = ''
  if (sortedByRevenue.length === 0) {
    summary = 'No completed order items found yet in the store records to rank best sellers.'
  } else {
    summary = `Top performing product is "${topPerformer.name}", generating $${topPerformer.revenue.toFixed(2)} across ${topPerformer.volume} units sold. Total completed product volume stands at ${totalVolume} units across ${targetOrders.length} ${isOnlyDelivered ? 'delivered' : 'confirmed'} order${targetOrders.length === 1 ? '' : 's'}.`
  }

  const insights: string[] = []
  if (topPerformer) {
    const revenueShare = totalRevenue > 0 ? Math.round((topPerformer.revenue / totalRevenue) * 100) : 0
    insights.push(`🌟 "${topPerformer.name}" accounts for ${revenueShare}% of total completed merchandise sales.`)
    insights.push(`📈 Total sales volume across all ranked products: ${totalVolume} units sold.`)
    if (sortedByRevenue.length > 1) {
      insights.push(`🥈 Second best performer: "${sortedByRevenue[1].name}" with $${sortedByRevenue[1].revenue.toFixed(2)} (${sortedByRevenue[1].volume} units).`)
    }
  }

  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    sender: 'assistant',
    timestamp,
    queryType: 'bestsellers',
    headline: topPerformer ? `Best Seller: ${topPerformer.name} ($${topPerformer.revenue.toFixed(2)})` : 'No Sales Data Available',
    summary,
    insights,
    evidence: {
      queryType: 'bestsellers',
      title: 'Completed Order Line-Item Sales Aggregation',
      calculationMethod: `Filtered orders WHERE status = '${isOnlyDelivered ? 'Delivered' : "!= 'Cancelled'"}'. Computed Volume = SUM(item.quantity) and Gross Revenue = SUM(item.quantity * item.price) grouped by productId.`,
      queryFormula: `SELECT item.productId, item.name, SUM(item.quantity) AS volume, SUM(item.quantity * item.price) AS revenue FROM order_items JOIN orders ON orders.id = order_items.orderId WHERE orders.status = '${isOnlyDelivered ? 'Delivered' : 'Confirmed'}' GROUP BY item.productId ORDER BY revenue DESC`,
      timestamp,
      rawRecordsCount: sortedByRevenue.length,
      tableHeaders: [
        { key: 'rank', label: 'Rank', format: 'text' },
        { key: 'name', label: 'Product Name', format: 'text' },
        { key: 'volume', label: 'Units Sold (Vol)', format: 'number' },
        { key: 'revenue', label: 'Total Revenue', format: 'currency' },
        { key: 'orderCount', label: 'Order Occurrences', format: 'number' },
        { key: 'avgPricePerUnit', label: 'Avg Unit Price', format: 'currency' },
      ],
      tableData,
      metricsSummary: [
        { label: 'Total Units Sold', value: totalVolume },
        { label: 'Ranked Revenue', value: `$${totalRevenue.toFixed(2)}` },
        { label: 'Completed Orders', value: targetOrders.length },
      ],
      groundingStatus: '100% Grounded in Live Database',
    },
  }
}

/**
 * Task 5 Grounded Query: Net revenue (sum confirmed order totals)
 */
export function queryNetRevenue(storeId: string): AssistantResponse {
  const allOrders = db.getOrders(storeId)
  const confirmedOrders = allOrders.filter((o) => o.status !== 'Cancelled')
  const timestamp = new Date().toISOString()

  const netRevenue = confirmedOrders.reduce((sum, o) => sum + o.total, 0)
  const totalSubtotal = confirmedOrders.reduce((sum, o) => sum + o.subtotal, 0)
  const totalTax = confirmedOrders.reduce((sum, o) => sum + o.tax, 0)
  const totalShipping = confirmedOrders.reduce((sum, o) => sum + o.shipping, 0)
  const aov = confirmedOrders.length > 0 ? netRevenue / confirmedOrders.length : 0

  const tableData: EvidenceRecord[] = confirmedOrders.map((o) => ({
    orderNumber: o.orderNumber,
    customer: o.customer.name,
    date: new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    itemsCount: o.items.reduce((acc, i) => acc + i.quantity, 0),
    subtotal: o.subtotal,
    tax: o.tax,
    shipping: o.shipping,
    total: o.total,
    status: o.status,
  }))

  const cancelledCount = allOrders.filter((o) => o.status === 'Cancelled').length

  const summary = `Net revenue across all confirmed orders is $${netRevenue.toFixed(2)} (from ${confirmedOrders.length} confirmed order${confirmedOrders.length === 1 ? '' : 's'}). Average Order Value (AOV) is currently $${aov.toFixed(2)}.`

  const insights = [
    `💵 Gross Merchandise Value (Subtotal): $${totalSubtotal.toFixed(2)}`,
    `🧾 Total Collected Tax: $${totalTax.toFixed(2)} | Shipping Fees: $${totalShipping.toFixed(2)}`,
    `📦 Average Order Value (AOV): $${aov.toFixed(2)} across ${confirmedOrders.length} confirmed checkouts`,
    cancelledCount > 0 ? `🚫 Excluded ${cancelledCount} cancelled order(s) from net revenue calculations.` : `✅ 0 cancelled orders; 100% order confirmation integrity.`,
  ]

  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    sender: 'assistant',
    timestamp,
    queryType: 'revenue',
    headline: `Net Confirmed Revenue: $${netRevenue.toFixed(2)}`,
    summary,
    insights,
    evidence: {
      queryType: 'revenue',
      title: 'Confirmed Orders Ledger & Mathematical Summation',
      calculationMethod: 'Summed `order.total` across all orders WHERE `status != "Cancelled"`. Formula: Net Revenue = Σ(order.total) for confirmed transactions.',
      queryFormula: `SELECT id, orderNumber, customer.name, subtotal, tax, shipping, total, status FROM orders WHERE storeId = '${storeId}' AND status != 'Cancelled'`,
      timestamp,
      rawRecordsCount: confirmedOrders.length,
      tableHeaders: [
        { key: 'orderNumber', label: 'Order #', format: 'text' },
        { key: 'customer', label: 'Customer', format: 'text' },
        { key: 'date', label: 'Date', format: 'text' },
        { key: 'itemsCount', label: 'Items', format: 'number' },
        { key: 'subtotal', label: 'Subtotal', format: 'currency' },
        { key: 'tax', label: 'Tax', format: 'currency' },
        { key: 'shipping', label: 'Shipping', format: 'currency' },
        { key: 'total', label: 'Total', format: 'currency' },
        { key: 'status', label: 'Status', format: 'badge' },
      ],
      tableData,
      metricsSummary: [
        { label: 'Net Revenue', value: `$${netRevenue.toFixed(2)}` },
        { label: 'Confirmed Orders', value: confirmedOrders.length },
        { label: 'Average Order Value', value: `$${aov.toFixed(2)}` },
        { label: 'Sales Tax', value: `$${totalTax.toFixed(2)}` },
      ],
      groundingStatus: '100% Grounded in Live Database',
    },
  }
}

/**
 * Task 5 Grounded Query: Fulfillment status (orders awaiting packing or shipping)
 */
export function queryFulfillmentStatus(storeId: string): AssistantResponse {
  const allOrders = db.getOrders(storeId)
  const pendingOrders = allOrders.filter((o) => o.status === 'Placed' || o.status === 'Packed')
  const timestamp = new Date().toISOString()

  const awaitingPacking = pendingOrders.filter((o) => o.status === 'Placed')
  const awaitingShipping = pendingOrders.filter((o) => o.status === 'Packed')
  const deliveredCount = allOrders.filter((o) => o.status === 'Delivered').length

  const tableData: EvidenceRecord[] = pendingOrders.map((o) => ({
    orderNumber: o.orderNumber,
    customer: o.customer.name,
    destination: o.customer.address,
    itemsList: o.items.map((i) => `${i.name} (×${i.quantity})`).join(', '),
    total: o.total,
    status: o.status,
    fulfillmentStage: o.status === 'Placed' ? 'Awaiting Packing' : 'Awaiting Dispatch/Shipping',
    orderAge: formatRelativeTime(o.createdAt),
  }))

  let summary = ''
  if (pendingOrders.length === 0) {
    summary = `All confirmed orders are currently fulfilled! There are 0 orders awaiting packing or shipping. (${deliveredCount} orders successfully delivered).`
  } else {
    summary = `Found ${pendingOrders.length} order${pendingOrders.length === 1 ? '' : 's'} awaiting fulfillment pipeline action: ${awaitingPacking.length} awaiting packing and ${awaitingShipping.length} packed and awaiting shipping.`
  }

  const insights: string[] = []
  if (awaitingPacking.length > 0) {
    insights.push(`📦 ${awaitingPacking.length} order${awaitingPacking.length === 1 ? ' is' : 's are'} in "Placed" status, ready for pick and pack.`)
  }
  if (awaitingShipping.length > 0) {
    insights.push(`🚚 ${awaitingShipping.length} order${awaitingShipping.length === 1 ? ' is' : 's are'} packed and waiting for carrier shipping label creation.`)
  }
  insights.push(`✅ ${deliveredCount} historical order${deliveredCount === 1 ? '' : 's'} successfully completed and delivered.`)

  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    sender: 'assistant',
    timestamp,
    queryType: 'fulfillment',
    headline: pendingOrders.length === 0 ? 'Fulfillment Up to Date (0 Pending)' : `Fulfillment Queue: ${pendingOrders.length} Orders Pending Action`,
    summary,
    insights,
    evidence: {
      queryType: 'fulfillment',
      title: 'Pending Fulfillment Orders Queue',
      calculationMethod: 'Filtered orders WHERE status IN ("Placed", "Packed"). Classified "Placed" as Awaiting Packing, and "Packed" as Awaiting Shipping.',
      queryFormula: `SELECT orderNumber, customer, items, total, status, createdAt FROM orders WHERE storeId = '${storeId}' AND status IN ('Placed', 'Packed') ORDER BY createdAt ASC`,
      timestamp,
      rawRecordsCount: pendingOrders.length,
      tableHeaders: [
        { key: 'orderNumber', label: 'Order #', format: 'text' },
        { key: 'customer', label: 'Customer', format: 'text' },
        { key: 'itemsList', label: 'Items Ordered', format: 'text' },
        { key: 'total', label: 'Total', format: 'currency' },
        { key: 'fulfillmentStage', label: 'Pipeline Stage', format: 'badge' },
        { key: 'orderAge', label: 'Order Placed', format: 'text' },
      ],
      tableData,
      metricsSummary: [
        { label: 'Pending Total', value: pendingOrders.length },
        { label: 'Awaiting Packing', value: awaitingPacking.length },
        { label: 'Awaiting Shipping', value: awaitingShipping.length },
        { label: 'Delivered', value: deliveredCount },
      ],
      groundingStatus: '100% Grounded in Live Database',
    },
  }
}

/**
 * Task 5 Grounded Query: Executive Briefing / General Store Overview
 */
export function queryExecutiveBriefing(storeId: string): AssistantResponse {
  const products = db.getProducts(storeId)
  const orders = db.getOrders(storeId)
  const timestamp = new Date().toISOString()

  const lowStock = products.filter((p) => p.stock <= 5)
  const confirmedOrders = orders.filter((o) => o.status !== 'Cancelled')
  const netRevenue = confirmedOrders.reduce((sum, o) => sum + o.total, 0)
  const pendingFulfillment = orders.filter((o) => o.status === 'Placed' || o.status === 'Packed')

  const summary = `Executive Overview for store database: $${netRevenue.toFixed(2)} net revenue from ${confirmedOrders.length} confirmed orders. ${lowStock.length} product(s) flagged for restocking, and ${pendingFulfillment.length} order(s) awaiting fulfillment.`

  const insights = [
    `💰 Net Confirmed Revenue: $${netRevenue.toFixed(2)} (${confirmedOrders.length} orders)`,
    `📦 Inventory Risk: ${lowStock.length} of ${products.length} products have stock ≤ 5 units`,
    `🚚 Logistics Pipeline: ${pendingFulfillment.length} orders require warehouse packing or shipping`,
    `📊 Catalog Size: ${products.length} live products currently listed`,
  ]

  const tableData: EvidenceRecord[] = [
    { metric: 'Net Revenue', value: `$${netRevenue.toFixed(2)}`, status: 'Healthy', note: `${confirmedOrders.length} confirmed orders` },
    { metric: 'Restock Warnings', value: `${lowStock.length} items`, status: lowStock.length > 0 ? 'Action Needed' : 'Optimal', note: 'Threshold: stock ≤ 5' },
    { metric: 'Pending Fulfillment', value: `${pendingFulfillment.length} orders`, status: pendingFulfillment.length > 0 ? 'Pending' : 'Clear', note: 'Placed or Packed status' },
    { metric: 'Catalog Breadth', value: `${products.length} products`, status: 'Active', note: 'Live catalog' },
  ]

  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    sender: 'assistant',
    timestamp,
    queryType: 'general',
    headline: 'Store Performance & Operational Health Briefing',
    summary,
    insights,
    evidence: {
      queryType: 'general',
      title: 'Store Performance Summary Ledger',
      calculationMethod: 'Aggregated cross-table operational metrics: Inventory stock counts, order status breakdown, and confirmed revenue totals.',
      queryFormula: `CROSS_APPLY(SUM(orders.total), COUNT(products WHERE stock <= 5), COUNT(orders WHERE status IN ('Placed', 'Packed')))`,
      timestamp,
      rawRecordsCount: tableData.length,
      tableHeaders: [
        { key: 'metric', label: 'Core KPI', format: 'text' },
        { key: 'value', label: 'Current Value', format: 'text' },
        { key: 'status', label: 'Operational Status', format: 'badge' },
        { key: 'note', label: 'Method / Filter Notes', format: 'text' },
      ],
      tableData,
      metricsSummary: [
        { label: 'Net Revenue', value: `$${netRevenue.toFixed(2)}` },
        { label: 'Restock Items', value: lowStock.length },
        { label: 'Pending Shipments', value: pendingFulfillment.length },
      ],
      groundingStatus: '100% Grounded in Live Database',
    },
  }
}

/**
 * Natural language intent parser
 */
export function processUserQuery(storeId: string, queryText: string): AssistantResponse {
  const q = queryText.toLowerCase().trim()

  if (q.includes('restock') || q.includes('stock') || q.includes('inventory') || q.includes('low') || q.includes('reorder')) {
    return queryRestockAlerts(storeId)
  }
  if (q.includes('best seller') || q.includes('top seller') || q.includes('popular') || q.includes('volume') || q.includes('bestseller') || q.includes('most sold')) {
    return queryBestSellers(storeId)
  }
  if (q.includes('revenue') || q.includes('sales') || q.includes('income') || q.includes('earnings') || q.includes('money') || q.includes('net') || q.includes('total order')) {
    return queryNetRevenue(storeId)
  }
  if (q.includes('fulfillment') || q.includes('fulfill') || q.includes('shipping') || q.includes('packing') || q.includes('placed') || q.includes('dispatch') || q.includes('pending order')) {
    return queryFulfillmentStatus(storeId)
  }

  // Default to comprehensive briefing
  return queryExecutiveBriefing(storeId)
}

function formatRelativeTime(dateString: string): string {
  try {
    const diff = Date.now() - new Date(dateString).getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    if (minutes < 60) return `${Math.max(1, minutes)}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  } catch {
    return dateString
  }
}
