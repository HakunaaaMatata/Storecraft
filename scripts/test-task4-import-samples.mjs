import * as XLSX from 'xlsx'
import assert from 'assert'

// Test 1: XLSX Generation and Parsing (CSV + XLSX)
console.log('🧪 Testing Task 4: Spreadsheet Generation and Parsing...')

const sampleData = [
  {
    'Product Name': 'Forma Table Lamp',
    'SKU': 'TEST-LMP-01',
    'Category': 'Lighting',
    'Price': 128.00,
    'Stock': 18,
    'Description': 'Cast aluminum task light with balanced counterweight.',
    'Image URL': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c',
    'Variant Name': 'Finish',
    'Variant Options': 'Matte Black, Brushed Bone'
  },
  {
    'Product Name': 'Invalid Price Product',
    'SKU': 'TEST-INV-02',
    'Category': 'Lighting',
    'Price': -15, // Invalid price!
    'Stock': 10,
    'Description': 'Product with negative price',
    'Image URL': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c'
  },
  {
    'Product Name': 'Duplicate SKU Item',
    'SKU': 'TEST-LMP-01', // Duplicate SKU!
    'Category': 'Lighting',
    'Price': 45.00,
    'Stock': 5,
    'Description': 'Item with duplicated SKU',
    'Image URL': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c'
  },
  {
    'Product Name': 'Invalid Stock Product',
    'SKU': 'TEST-STK-03',
    'Category': 'Lighting',
    'Price': 55.00,
    'Stock': 3.5, // Non-integer stock!
    'Description': 'Item with decimal stock',
    'Image URL': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c'
  }
]

// 1. Generate Excel Buffer
const ws = XLSX.utils.json_to_sheet(sampleData)
const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, ws, 'Products')
const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

assert(excelBuffer.length > 0, 'Excel buffer must not be empty')
console.log(`✅ Excel (.xlsx) generated successfully (${excelBuffer.length} bytes)`)

// 2. Parse Excel Buffer back
const parsedWb = XLSX.read(excelBuffer, { type: 'buffer' })
const parsedWs = parsedWb.Sheets[parsedWb.SheetNames[0]]
const rawJson = XLSX.utils.sheet_to_json(parsedWs)

assert.strictEqual(rawJson.length, 4, 'Must parse exactly 4 rows')
console.log(`✅ Excel workbook successfully parsed back: 4 rows detected`)

// 3. Test Row Validation Logic
const seenSkus = new Set()
const validatedRows = rawJson.map((row, idx) => {
  const errors = []
  const name = String(row['Product Name'] || '').trim()
  const sku = String(row['SKU'] || '').trim()
  const price = parseFloat(row['Price'])
  const stock = Number(row['Stock'])

  if (!name) errors.push('Missing name')
  if (!sku) errors.push('Missing SKU')
  else if (seenSkus.has(sku)) errors.push(`Duplicate SKU in file: ${sku}`)
  else seenSkus.add(sku)

  if (isNaN(price) || price < 0) errors.push(`Invalid price: ${row['Price']}`)
  if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) errors.push(`Invalid stock: ${row['Stock']}`)

  return { row: idx + 2, name, sku, isValid: errors.length === 0, errors }
})

const validCount = validatedRows.filter(r => r.isValid).length
const invalidCount = validatedRows.filter(r => !r.isValid).length

assert.strictEqual(validCount, 1, 'Exactly 1 row should be completely valid')
assert.strictEqual(invalidCount, 3, 'Exactly 3 rows should fail validation')
console.log(`✅ Validation rules verified: ${validCount} valid row, ${invalidCount} invalid rows accurately flagged`)

// 4. Test Error Report Generation
const errorReport = validatedRows.filter(r => !r.isValid).map(r => ({
  'Row': r.row,
  'Product': r.name,
  'SKU': r.sku,
  'Errors': r.errors.join('; ')
}))
const errWs = XLSX.utils.json_to_sheet(errorReport)
const errCsv = XLSX.utils.sheet_to_csv(errWs)
assert(errCsv.includes('Duplicate SKU in file'), 'Error report must mention duplicate SKU')
assert(errCsv.includes('Invalid price'), 'Error report must mention invalid price')
assert(errCsv.includes('Invalid stock'), 'Error report must mention invalid stock')
console.log(`✅ Error report generated successfully:\n${errCsv.trim()}`)

console.log('\n🎉 ALL TASK 4 SPREADSHEET & VALIDATION TESTS PASSED!')
