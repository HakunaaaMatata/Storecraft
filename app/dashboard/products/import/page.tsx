'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
import { 
  Upload, 
  FileSpreadsheet, 
  Check, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft, 
  Download, 
  X, 
  FileText, 
  RefreshCw,
  ChevronRight,
  Package,
  Sparkles,
  HelpCircle,
  FileCheck2
} from 'lucide-react'
import { useStorecraft } from '@/lib/use-storecraft'
import { Product, ProductVariant } from '@/lib/store-data'
import { getSampleProductsForCategories, getSampleProductsSummary } from '@/lib/sample-catalog'

type ImportStep = 1 | 2 | 3 | 4 | 5

interface ParsedRow {
  rowNumber: number
  raw: Record<string, string>
  mapped: {
    name: string
    sku: string
    category: string
    price: number
    compareAtPrice?: number
    stock: number
    description: string
    imageUrl: string
    variantName?: string
    variantOptions?: string
  }
  isValid: boolean
  errors: string[]
}

const SUPPORTED_FIELDS = [
  { id: 'name', label: 'Product Name', required: true, description: 'Title or name of the product', aliases: ['product name', 'name', 'title', 'product_title', 'item_name', 'product'] },
  { id: 'sku', label: 'SKU', required: true, description: 'Unique Stock Keeping Unit identifier', aliases: ['sku', 'item_sku', 'code', 'product_code', 'id', 'item_code'] },
  { id: 'price', label: 'Price ($)', required: true, description: 'Selling price (numeric, e.g. 29.99)', aliases: ['price', 'retail price', 'unit price', 'cost', 'amount', 'retail_price', 'selling price'] },
  { id: 'stock', label: 'Stock / Quantity', required: true, description: 'Available quantity in stock (integer >= 0)', aliases: ['stock', 'quantity', 'inventory', 'qty', 'stock_count', 'inventory_quantity', 'inventory count'] },
  { id: 'category', label: 'Category', required: false, description: 'Store category or collection', aliases: ['category', 'type', 'department', 'collection', 'group', 'product category'] },
  { id: 'compareAtPrice', label: 'Compare-at Price ($)', required: false, description: 'Original MSRP / struck-through price for discounts', aliases: ['compare at price', 'compare_at_price', 'original price', 'regular price', 'msrp', 'list price'] },
  { id: 'description', label: 'Description', required: false, description: 'Full marketing or material description', aliases: ['description', 'desc', 'details', 'body', 'product_description', 'notes'] },
  { id: 'imageUrl', label: 'Image URL', required: false, description: 'Valid HTTP/HTTPS image URL', aliases: ['image', 'image url', 'images', 'image_url', 'photo', 'img', 'thumbnail', 'picture'] },
  { id: 'variantName', label: 'Variant Name', required: false, description: 'Option dimension (e.g. Size, Color, Material)', aliases: ['variant name', 'variant_name', 'option name', 'option 1 name', 'variant attribute'] },
  { id: 'variantOptions', label: 'Variant Values', required: false, description: 'Comma-separated values (e.g. Small, Medium, Large)', aliases: ['variant options', 'variant_options', 'options', 'variant values', 'option values', 'values'] },
]

const SAMPLE_TEMPLATE_ROWS = [
  {
    'Product Name': 'Forma Table Lamp',
    'SKU': 'NG-LMP-04',
    'Category': 'Lighting',
    'Price': 128.00,
    'Compare-at Price': 160.00,
    'Stock': 18,
    'Description': 'Hand-finished spun aluminum desk lamp with ambient dimmer switch.',
    'Image URL': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    'Variant Name': 'Finish',
    'Variant Values': 'Matte Black, Brushed Bone, Terracotta'
  },
  {
    'Product Name': 'Speckled Ceramic Vase',
    'SKU': 'NG-CRM-05',
    'Category': 'Ceramics',
    'Price': 48.50,
    'Compare-at Price': 58.00,
    'Stock': 12,
    'Description': 'High-fired stoneware vase with natural speckled satin glaze.',
    'Image URL': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    'Variant Name': 'Size',
    'Variant Values': 'Small, Medium, Tall'
  },
  {
    'Product Name': 'Woven Wool Blanket',
    'SKU': 'NG-TXT-02',
    'Category': 'Textiles',
    'Price': 165.00,
    'Compare-at Price': 195.00,
    'Stock': 3,
    'Description': '100% Merino wool heirloom throw blanket with fringed borders.',
    'Image URL': 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&w=800&q=80',
    'Variant Name': 'Colorway',
    'Variant Values': 'Natural Oatmeal, Sage Olive, Heather Slate'
  },
  {
    'Product Name': 'Minimalist Leather Card Holder',
    'SKU': 'NG-ACC-07',
    'Category': 'Accessories',
    'Price': 42.00,
    'Compare-at Price': 50.00,
    'Stock': 25,
    'Description': 'Full-grain Italian vegetable tanned leather with beveled hand-waxed edges.',
    'Image URL': 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
    'Variant Name': 'Color',
    'Variant Values': 'Cognac Tan, Espresso, Midnight'
  }
]

export default function ProductImportPage() {
  const router = useRouter()
  const { activeStore, products, actions } = useStorecraft()

  const [step, setStep] = useState<ImportStep>(1)
  const [file, setFile] = useState<File | null>(null)
  const [fileHeaders, setFileHeaders] = useState<string[]>([])
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [validatedRows, setValidatedRows] = useState<ParsedRow[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [importSummary, setImportSummary] = useState<{ imported: number; skipped: number; reasons: string[] } | null>(null)

  // Sample Generator Modal state
  const [showSampleConfirmModal, setShowSampleConfirmModal] = useState(false)
  const [isGeneratingSamples, setIsGeneratingSamples] = useState(false)
  const [sampleSuccessMessage, setSampleSuccessMessage] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Download sample CSV template
  const downloadCsvTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(SAMPLE_TEMPLATE_ROWS)
    const csvContent = XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'storecraft_products_template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Download sample Excel template (.xlsx)
  const downloadExcelTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(SAMPLE_TEMPLATE_ROWS)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Storecraft Products')
    XLSX.writeFile(wb, 'storecraft_products_template.xlsx')
  }

  // Download Validation Error Report (CSV)
  const downloadErrorReport = () => {
    const invalidRows = validatedRows.filter(r => !r.isValid)
    if (invalidRows.length === 0) return

    const errorData = invalidRows.map(r => ({
      'Row Number': r.rowNumber,
      'Product Name': r.mapped.name || '[Missing Name]',
      'SKU': r.mapped.sku || '[Missing SKU]',
      'Category': r.mapped.category,
      'Price': r.mapped.price,
      'Stock': r.mapped.stock,
      'Validation Errors': r.errors.join(' | ')
    }))

    const ws = XLSX.utils.json_to_sheet(errorData)
    const csvContent = XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `storecraft_import_errors_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) processUploadedFile(selectedFile)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) processUploadedFile(droppedFile)
  }

  // Process uploaded file with XLSX (supports CSV, XLSX, XLS)
  const processUploadedFile = (uploadedFile: File) => {
    setParseError(null)

    // Validate extension
    const ext = uploadedFile.name.split('.').pop()?.toLowerCase()
    if (ext !== 'csv' && ext !== 'xlsx' && ext !== 'xls') {
      setParseError('Unsupported file type. Please upload a .csv or .xlsx / .xls spreadsheet.')
      return
    }

    // Validate size (max 5MB)
    if (uploadedFile.size > 5 * 1024 * 1024) {
      setParseError('File size exceeds the 5MB limit. Please upload a smaller spreadsheet.')
      return
    }

    if (uploadedFile.size === 0) {
      setParseError('The uploaded file is empty (0 bytes). Please upload a file with product rows.')
      return
    }

    setFile(uploadedFile)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result as ArrayBuffer
        const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' })

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          setParseError('The spreadsheet contains no readable sheets.')
          return
        }

        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        // Parse sheet to array of rows
        const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' })

        if (!jsonData || jsonData.length === 0) {
          setParseError('The selected worksheet is completely empty.')
          return
        }

        // Filter out empty rows
        const nonEmptyRows = jsonData.filter(row => 
          Array.isArray(row) && row.some(cell => String(cell).trim().length > 0)
        )

        if (nonEmptyRows.length < 2) {
          setParseError('The uploaded file must contain a header row and at least one product row.')
          return
        }

        // Header row
        const headers = nonEmptyRows[0].map((h: any) => String(h || '').trim()).filter(Boolean)
        if (headers.length === 0) {
          setParseError('Could not detect valid column headers in the first row.')
          return
        }

        setFileHeaders(headers)

        // Data rows
        const parsedData: Record<string, string>[] = []
        for (let i = 1; i < nonEmptyRows.length; i++) {
          const rowVals = nonEmptyRows[i]
          const rowObj: Record<string, string> = {}
          headers.forEach((h, colIdx) => {
            rowObj[h] = rowVals[colIdx] !== undefined ? String(rowVals[colIdx]).trim() : ''
          })
          parsedData.push(rowObj)
        }

        if (parsedData.length === 0) {
          setParseError('No product records found below the header row.')
          return
        }

        setRawRows(parsedData)

        // Automatic Column Matching using aliases
        const initialMap: Record<string, string> = {}
        SUPPORTED_FIELDS.forEach((field) => {
          const matched = headers.find(h => {
            const normH = h.toLowerCase().trim().replace(/[_\s-]+/g, ' ')
            return field.aliases.some(alias => alias === normH || normH.includes(alias))
          })
          if (matched) {
            initialMap[field.id] = matched
          }
        })

        setColumnMapping(initialMap)
        setStep(2) // Move to column mapping step
      } catch (err: any) {
        setParseError(`Failed to parse file: ${err.message || 'Malformed spreadsheet structure'}`)
      }
    }

    reader.onerror = () => {
      setParseError('Failed to read the file from disk. Please check file permissions.')
    }

    reader.readAsArrayBuffer(uploadedFile)
  }

  // Confirm Column Mapping & Run Full Row Validation
  const handleProceedToPreview = () => {
    // Check required fields
    const missingRequired = SUPPORTED_FIELDS.filter(f => f.required && !columnMapping[f.id])
    if (missingRequired.length > 0) {
      setParseError(`Please map all required fields: ${missingRequired.map(f => f.label).join(', ')}`)
      return
    }

    setParseError(null)

    // Existing SKUs in current store to avoid collisions
    const existingSkus = new Set(products.map(p => p.sku?.toLowerCase().trim()).filter(Boolean))
    const seenFileSkus = new Set<string>()

    const validated: ParsedRow[] = rawRows.map((rawRow, idx) => {
      const errors: string[] = []
      const rowNumber = idx + 2 // +1 for 0-index, +1 for header row

      // 1. Product Name (Required)
      const nameCol = columnMapping['name']
      const name = rawRow[nameCol]?.trim() || ''
      if (!name) {
        errors.push('Missing required product name')
      }

      // 2. SKU (Required, unique in store, unique in file)
      const skuCol = columnMapping['sku']
      const sku = rawRow[skuCol]?.trim().toUpperCase() || ''
      if (!sku) {
        errors.push('Missing required SKU')
      } else {
        if (seenFileSkus.has(sku)) {
          errors.push(`Duplicate SKU in spreadsheet: "${sku}"`)
        } else {
          seenFileSkus.add(sku)
        }
        if (existingSkus.has(sku.toLowerCase())) {
          errors.push(`SKU already exists in store catalog: "${sku}"`)
        }
      }

      // 3. Price (Required, numeric >= 0)
      const priceCol = columnMapping['price']
      const rawPrice = rawRow[priceCol]?.replace(/[$€£,]/g, '').trim() || ''
      const priceNum = parseFloat(rawPrice)
      if (rawPrice === '' || isNaN(priceNum) || priceNum < 0) {
        errors.push(`Invalid price value: "${rawRow[priceCol] || 'Empty'}" (must be >= 0)`)
      }

      // 4. Stock (Required, integer >= 0)
      const stockCol = columnMapping['stock']
      const rawStock = rawRow[stockCol]?.trim() || ''
      const stockNum = parseInt(rawStock, 10)
      if (rawStock === '' || isNaN(stockNum) || stockNum < 0 || !Number.isInteger(Number(rawStock))) {
        errors.push(`Invalid stock quantity: "${rawRow[stockCol] || 'Empty'}" (must be integer >= 0)`)
      }

      // 5. Compare at price (Optional, numeric >= 0)
      let compareAtPriceNum: number | undefined = undefined
      const compareCol = columnMapping['compareAtPrice']
      if (compareCol && rawRow[compareCol]) {
        const rawComp = rawRow[compareCol].replace(/[$€£,]/g, '').trim()
        const parsedComp = parseFloat(rawComp)
        if (isNaN(parsedComp) || parsedComp < 0) {
          errors.push(`Invalid compare-at price: "${rawRow[compareCol]}"`)
        } else {
          compareAtPriceNum = parsedComp
        }
      }

      // 6. Category (Optional)
      const catCol = columnMapping['category']
      const category = rawRow[catCol]?.trim() || (activeStore?.categories?.[0] || 'General')

      // 7. Description (Optional)
      const descCol = columnMapping['description']
      const description = rawRow[descCol]?.trim() || ''

      // 8. Image URL (Optional, must be valid URL if provided)
      const imgCol = columnMapping['imageUrl']
      let imageUrl = rawRow[imgCol]?.trim() || ''
      if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('/')) {
        errors.push(`Invalid image URL format: "${imageUrl}" (must start with http:// or https://)`)
      }
      if (!imageUrl) {
        imageUrl = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
      }

      // 9. Variants (Optional)
      const varNameCol = columnMapping['variantName']
      const varOptsCol = columnMapping['variantOptions']
      const variantName = varNameCol ? rawRow[varNameCol]?.trim() : undefined
      const variantOptions = varOptsCol ? rawRow[varOptsCol]?.trim() : undefined

      return {
        rowNumber,
        raw: rawRow,
        mapped: {
          name,
          sku,
          category,
          price: isNaN(priceNum) ? 0 : priceNum,
          compareAtPrice: compareAtPriceNum,
          stock: isNaN(stockNum) ? 0 : stockNum,
          description,
          imageUrl,
          variantName,
          variantOptions
        },
        isValid: errors.length === 0,
        errors
      }
    })

    setValidatedRows(validated)
    setStep(3) // Move to preview & validate step
  }

  // Execute Safe Batch Import
  const handleExecuteImport = () => {
    if (!activeStore) return
    setIsProcessing(true)

    const validItems = validatedRows.filter(r => r.isValid)
    const invalidItems = validatedRows.filter(r => !r.isValid)

    const newProducts: Product[] = validItems.map((r, idx) => {
      // Build variants array if variant fields were provided
      let variants: ProductVariant[] | undefined = undefined
      if (r.mapped.variantName && r.mapped.variantOptions) {
        const opts = r.mapped.variantOptions
          .split(/[,|;]/)
          .map(o => o.trim())
          .filter(Boolean)
        if (opts.length > 0) {
          variants = [{ name: r.mapped.variantName, options: opts }]
        }
      }

      return {
        id: `prod-imp-${Date.now()}-${idx}`,
        storeId: activeStore.id,
        name: r.mapped.name,
        slug: r.mapped.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        description: r.mapped.description,
        category: r.mapped.category,
        price: r.mapped.price,
        compareAtPrice: r.mapped.compareAtPrice,
        stock: r.mapped.stock,
        sku: r.mapped.sku,
        images: [r.mapped.imageUrl],
        variants,
        createdAt: new Date().toISOString()
      }
    })

    // Persist via storecraft actions (saves locally and triggers server sync)
    actions.importProducts(newProducts)

    const distinctReasons = Array.from(new Set(invalidItems.flatMap(r => r.errors)))

    setImportSummary({
      imported: validItems.length,
      skipped: invalidItems.length,
      reasons: distinctReasons
    })

    setIsProcessing(false)
    setStep(5) // Summary screen
  }

  // Trigger Sample Products Generation for active store
  const handleGenerateSamples = () => {
    if (!activeStore || isGeneratingSamples) return
    setIsGeneratingSamples(true)
    setSampleSuccessMessage(null)

    const existingSkus = new Set(products.map(p => p.sku?.toUpperCase()).filter(Boolean))
    const sampleProds = getSampleProductsForCategories(activeStore.categories || ['Home & Living'], activeStore.id, existingSkus)

    actions.importProducts(sampleProds)

    setIsGeneratingSamples(false)
    setShowSampleConfirmModal(false)
    setSampleSuccessMessage(`Successfully generated ${sampleProds.length} sample products for ${activeStore.name}!`)
  }

  const validCount = validatedRows.filter(r => r.isValid).length
  const invalidCount = validatedRows.length - validCount

  const sampleSummary = getSampleProductsSummary(activeStore?.categories || ['Home & Living'])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header with Breadcrumb Back link & Template Downloads */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <Link 
          href="/dashboard/products" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--slate)', textDecoration: 'none', fontWeight: 600 }}
        >
          <ArrowLeft size={13} /> Back to Products
        </Link>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={downloadExcelTemplate}
            className="button button-light"
            style={{ padding: '6px 12px', fontSize: '11px', border: '1px solid var(--line)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            title="Download formatted Excel (.xlsx) file template"
          >
            <Download size={13} /> Download Excel (.xlsx)
          </button>
          <button 
            onClick={downloadCsvTemplate}
            className="button button-light"
            style={{ padding: '6px 12px', fontSize: '11px', border: '1px solid var(--line)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            title="Download formatted CSV file template"
          >
            <Download size={13} /> Download CSV (.csv)
          </button>
        </div>
      </div>

      {/* Success Notification if Sample Products were Generated */}
      {sampleSuccessMessage && (
        <div style={{
          backgroundColor: '#ECFDF5',
          border: '1px solid #A7F3D0',
          color: '#065F46',
          padding: '12px 16px',
          borderRadius: '6px',
          fontSize: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Check size={16} color="#059669" />
            <span>{sampleSuccessMessage}</span>
          </div>
          <Link href="/dashboard/products" style={{ color: '#047857', fontWeight: 700, textDecoration: 'none', fontSize: '11px' }}>
            View in Catalog →
          </Link>
        </div>
      )}

      {/* Step Indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        padding: '14px 20px',
        borderRadius: '6px',
        border: '1px solid var(--line)',
        fontSize: '11px'
      }}>
        {[
          { num: 1, label: 'Upload Spreadsheet' },
          { num: 2, label: 'Map Columns' },
          { num: 3, label: 'Validate & Preview' },
          { num: 4, label: 'Confirm Import' },
          { num: 5, label: 'Results' }
        ].map((s, i) => (
          <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '10px',
              backgroundColor: step === s.num ? '#10B981' : step > s.num ? '#E4F8F0' : '#F1F5F9',
              color: step === s.num ? '#FFFFFF' : step > s.num ? '#07875D' : '#94A3B8'
            }}>
              {step > s.num ? <Check size={12} /> : s.num}
            </div>
            <span style={{ fontWeight: step === s.num ? 800 : 500, color: step === s.num ? 'var(--navy)' : 'var(--slate)' }}>
              {s.label}
            </span>
            {i < 4 && <ChevronRight size={14} color="#CBD5E1" style={{ margin: '0 4px' }} />}
          </div>
        ))}
      </div>

      {/* Parse Error Alert */}
      {parseError && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          color: '#B91C1C',
          padding: '12px 16px',
          borderRadius: '6px',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertTriangle size={16} />
          <span>{parseError}</span>
        </div>
      )}

      {/* STEP 1: SELECT FILE */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid var(--line)',
            padding: '36px 24px',
            textAlign: 'center'
          }}>
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              style={{
                border: '2px dashed #CBD5E1',
                borderRadius: '8px',
                padding: '44px 24px',
                backgroundColor: '#F8FAFC',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv" 
                style={{ display: 'none' }} 
              />
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#E4F8F0', color: '#07875D', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Upload size={22} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 6px', color: 'var(--navy)' }}>
                Choose a CSV or Excel spreadsheet, or drag and drop it here
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--slate)', margin: '0 0 20px', maxWidth: '480px', marginInline: 'auto' }}>
                Supports <strong>.csv</strong> and <strong>.xlsx / .xls</strong> formats up to 5MB. Must contain a header row with product titles, SKUs, and pricing.
              </p>
              <button 
                type="button" 
                className="button button-green" 
                style={{ padding: '8px 20px', fontSize: '11px' }}
              >
                Browse Files
              </button>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '24px', fontSize: '11px', color: 'var(--slate)', flexWrap: 'wrap' }}>
              <span>✓ Excel (.xlsx) & CSV (.csv) parsing</span>
              <span>✓ Duplicate SKU & Collision check</span>
              <span>✓ Downloadable error reporting</span>
              <span>✓ Scoped to {activeStore?.name}</span>
            </div>
          </div>

          {/* Quick Alternative: Sample Product Generator Card */}
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Sparkles size={16} color="#059669" />
                <strong style={{ fontSize: '13px', color: 'var(--navy)' }}>Don't have a spreadsheet ready?</strong>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--slate)', margin: 0 }}>
                Generate {sampleSummary.count} realistic products tailored to your store categories ({activeStore?.categories?.join(', ') || 'General'}).
              </p>
            </div>
            <button 
              onClick={() => setShowSampleConfirmModal(true)}
              className="button button-dark"
              style={{ padding: '8px 16px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Sparkles size={13} /> Generate Sample Products ({sampleSummary.count})
            </button>
          </div>

          {/* Schema & Column Requirements Reference */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '20px 24px',
          }}>
            <h4 style={{ fontSize: '13px', fontWeight: 800, margin: '0 0 12px', color: 'var(--navy)' }}>
              Spreadsheet Field Specifications
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              {SUPPORTED_FIELDS.map(f => (
                <div key={f.id} style={{ fontSize: '11px', padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '4px', border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ color: 'var(--navy)' }}>{f.label}</strong>
                    <span style={{ fontSize: '10px', color: f.required ? '#EF4444' : 'var(--slate)', fontWeight: 700 }}>
                      {f.required ? 'Required *' : 'Optional'}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 4px', color: 'var(--slate)', fontSize: '11px' }}>{f.description}</p>
                  <span style={{ fontSize: '10px', color: '#94A3B8' }}>Common aliases: {f.aliases.slice(0, 3).join(', ')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: COLUMN MAPPING */}
      {step === 2 && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid var(--line)',
          padding: '28px',
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 4px', color: 'var(--navy)' }}>
              Map Spreadsheet Columns to Storecraft Fields
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--slate)', margin: 0 }}>
              File <strong>{file?.name}</strong> parsed ({rawRows.length} rows found). Match your spreadsheet headers to the required Storecraft product attributes.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {SUPPORTED_FIELDS.map((field) => {
              const currentMapped = columnMapping[field.id] || ''
              return (
                <div 
                  key={field.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '220px 24px 1fr 110px',
                    alignItems: 'center',
                    padding: '12px 16px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '6px',
                    border: '1px solid var(--line)',
                    gap: '12px'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '12px', color: 'var(--navy)', display: 'block' }}>
                      {field.label} {field.required && <span style={{ color: '#EF4444' }}>*</span>}
                    </strong>
                    <span style={{ fontSize: '10px', color: 'var(--slate)' }}>
                      {field.description}
                    </span>
                  </div>

                  <ArrowRight size={14} color="#94A3B8" />

                  <select 
                    value={currentMapped}
                    onChange={(e) => setColumnMapping({ ...columnMapping, [field.id]: e.target.value })}
                    style={{
                      padding: '8px 12px',
                      border: `1px solid ${field.required && !currentMapped ? '#EF4444' : 'var(--line)'}`,
                      borderRadius: '4px',
                      fontSize: '11px',
                      backgroundColor: '#FFFFFF',
                      color: 'var(--navy)',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">-- Do not map --</option>
                    {fileHeaders.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>

                  <div style={{ textAlign: 'right' }}>
                    {currentMapped ? (
                      <span style={{ fontSize: '10px', color: '#07875D', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={12} /> Mapped
                      </span>
                    ) : field.required ? (
                      <span style={{ fontSize: '10px', color: '#EF4444', fontWeight: 600 }}>Required</span>
                    ) : (
                      <span style={{ fontSize: '10px', color: '#94A3B8' }}>Skipped</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--line)' }}>
            <button 
              onClick={() => setStep(1)} 
              className="button button-light" 
              style={{ padding: '8px 16px', fontSize: '11px', border: '1px solid var(--line)' }}
            >
              <ArrowLeft size={13} /> Re-upload File
            </button>
            <button 
              onClick={handleProceedToPreview} 
              className="button button-green" 
              style={{ padding: '8px 20px', fontSize: '11px' }}
            >
              Validate & Preview Rows <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PREVIEW AND VALIDATE */}
      {step === 3 && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid var(--line)',
          padding: '24px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 4px', color: 'var(--navy)' }}>
                Catalog Validation Preview
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--slate)', margin: 0 }}>
                Review validated records before adding to store catalog <strong>{activeStore?.name}</strong>.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '6px 14px', borderRadius: '20px', backgroundColor: '#E4F8F0', color: '#07875D', fontSize: '11px', fontWeight: 700 }}>
                ✓ {validCount} Valid Row{validCount !== 1 ? 's' : ''}
              </div>
              {invalidCount > 0 && (
                <div style={{ padding: '6px 14px', borderRadius: '20px', backgroundColor: '#FEE2E2', color: '#B91C1C', fontSize: '11px', fontWeight: 700 }}>
                  ⚠ {invalidCount} Invalid Row{invalidCount !== 1 ? 's' : ''}
                </div>
              )}
              {invalidCount > 0 && (
                <button
                  onClick={downloadErrorReport}
                  className="button button-light"
                  style={{ padding: '6px 12px', fontSize: '11px', border: '1px solid #FECACA', color: '#B91C1C', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  title="Export failed rows and error reasons as CSV"
                >
                  <Download size={12} /> Download Error Report
                </button>
              )}
            </div>
          </div>

          {/* Preview Table */}
          <div style={{ overflowX: 'auto', maxHeight: '440px', border: '1px solid var(--line)', borderRadius: '6px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '11px' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#F8FAFC', zIndex: 10 }}>
                <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--slate)', fontSize: '10px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 14px', width: '50px' }}>Row</th>
                  <th style={{ padding: '10px 14px' }}>Title</th>
                  <th style={{ padding: '10px 14px' }}>SKU</th>
                  <th style={{ padding: '10px 14px' }}>Category</th>
                  <th style={{ padding: '10px 14px' }}>Price</th>
                  <th style={{ padding: '10px 14px' }}>Stock</th>
                  <th style={{ padding: '10px 14px' }}>Variants</th>
                  <th style={{ padding: '10px 14px' }}>Status & Issues</th>
                </tr>
              </thead>
              <tbody>
                {validatedRows.map((r) => (
                  <tr 
                    key={r.rowNumber} 
                    style={{
                      borderBottom: '1px solid var(--line)',
                      backgroundColor: r.isValid ? '#FFFFFF' : '#FFF5F5'
                    }}
                  >
                    <td style={{ padding: '10px 14px', color: 'var(--slate)' }}>#{r.rowNumber}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--navy)' }}>
                      {r.mapped.name || <span style={{ color: '#EF4444' }}>[Missing]</span>}
                    </td>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace' }}>
                      {r.mapped.sku || <span style={{ color: '#EF4444' }}>[Missing]</span>}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--slate)' }}>{r.mapped.category}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>
                      ${r.mapped.price.toFixed(2)}
                      {r.mapped.compareAtPrice && (
                        <span style={{ fontSize: '10px', color: '#94A3B8', textDecoration: 'line-through', marginLeft: '4px' }}>
                          ${r.mapped.compareAtPrice.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px' }}>{r.mapped.stock} units</td>
                    <td style={{ padding: '10px 14px', color: 'var(--slate)' }}>
                      {r.mapped.variantName ? `${r.mapped.variantName}: ${r.mapped.variantOptions}` : '—'}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {r.isValid ? (
                        <span style={{ color: '#07875D', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={12} /> Ready
                        </span>
                      ) : (
                        <div>
                          {r.errors.map((err, errIdx) => (
                            <span 
                              key={errIdx}
                              style={{ 
                                display: 'inline-block', 
                                backgroundColor: '#FEE2E2', 
                                color: '#B91C1C', 
                                padding: '2px 6px', 
                                borderRadius: '4px', 
                                fontSize: '10px', 
                                margin: '2px 4px 2px 0' 
                              }}
                            >
                              {err}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
            <button 
              onClick={() => setStep(2)} 
              className="button button-light" 
              style={{ padding: '8px 16px', fontSize: '11px', border: '1px solid var(--line)' }}
            >
              <ArrowLeft size={13} /> Edit Column Mapping
            </button>

            {validCount > 0 ? (
              <button 
                onClick={() => setStep(4)} 
                className="button button-green" 
                style={{ padding: '8px 20px', fontSize: '11px' }}
              >
                Proceed to Confirmation ({validCount} items) <ArrowRight size={13} />
              </button>
            ) : (
              <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600 }}>
                No valid rows to import. Please review validation errors or edit column mapping.
              </span>
            )}
          </div>
        </div>
      )}

      {/* STEP 4: IMPORT CONFIRMATION */}
      {step === 4 && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid var(--line)',
          padding: '36px',
          maxWidth: '560px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#E4F8F0', color: '#07875D', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Package size={24} />
          </div>

          <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 8px', color: 'var(--navy)' }}>
            Confirm Catalog Import
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--slate)', margin: '0 0 24px', lineHeight: '1.6' }}>
            You are about to import <strong>{validCount} product{validCount !== 1 ? 's' : ''}</strong> into <strong>{activeStore?.name}</strong>.
            {invalidCount > 0 && ` Note: ${invalidCount} invalid row(s) will be excluded from the import.`}
          </p>

          <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '6px', textAlign: 'left', marginBottom: '24px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--slate)' }}>Target Store:</span>
              <strong>{activeStore?.name}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--slate)' }}>Products to Add:</span>
              <strong style={{ color: '#07875D' }}>{validCount} items</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--slate)' }}>Excluded Rows:</span>
              <strong style={{ color: invalidCount > 0 ? '#B91C1C' : 'var(--slate)' }}>{invalidCount} items</strong>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button 
              onClick={() => setStep(3)} 
              className="button button-light" 
              style={{ padding: '9px 18px', fontSize: '11px', border: '1px solid var(--line)' }}
              disabled={isProcessing}
            >
              Cancel & Review
            </button>
            <button 
              onClick={handleExecuteImport} 
              className="button button-green" 
              style={{ padding: '9px 24px', fontSize: '11px' }}
              disabled={isProcessing}
            >
              {isProcessing ? 'Importing Products...' : 'Confirm & Save to Catalog'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: IMPORT RESULT & SUCCESS */}
      {step === 5 && importSummary && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid var(--line)',
          padding: '40px 24px',
          maxWidth: '560px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#DCFCE7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Check size={28} />
          </div>

          <h3 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 8px', color: 'var(--navy)' }}>
            Import Successful!
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--slate)', margin: '0 0 20px', lineHeight: '1.6' }}>
            <strong>{importSummary.imported} product{importSummary.imported !== 1 ? 's' : ''}</strong> have been successfully imported and added to <strong>{activeStore?.name}</strong>'s catalog.
            {importSummary.skipped > 0 && ` ${importSummary.skipped} invalid row(s) were excluded.`}
          </p>

          {importSummary.skipped > 0 && importSummary.reasons.length > 0 && (
            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', padding: '12px 16px', textAlign: 'left', marginBottom: '24px', fontSize: '11px' }}>
              <strong style={{ color: '#991B1B', display: 'block', marginBottom: '4px' }}>Reasons for excluded rows:</strong>
              <ul style={{ margin: 0, paddingLeft: '18px', color: '#B91C1C' }}>
                {importSummary.reasons.map((r, i) => (
                  <li key={i} style={{ marginBottom: '2px' }}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button 
              onClick={() => {
                setStep(1)
                setFile(null)
                setRawRows([])
                setValidatedRows([])
                setImportSummary(null)
              }} 
              className="button button-light" 
              style={{ padding: '9px 18px', fontSize: '11px', border: '1px solid var(--line)' }}
            >
              Import Another File
            </button>
            <button 
              onClick={() => router.push('/dashboard/products')} 
              className="button button-green" 
              style={{ padding: '9px 20px', fontSize: '11px' }}
            >
              View Products in Catalog <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* SAMPLE PRODUCT CONFIRMATION MODAL */}
      {showSampleConfirmModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(16, 24, 40, 0.5)',
          zIndex: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            maxWidth: '520px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#059669" />
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--navy)' }}>
                  Generate Sample Products
                </h3>
              </div>
              <button onClick={() => setShowSampleConfirmModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate)' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--slate)', margin: '0 0 16px', lineHeight: '1.5' }}>
              This will generate <strong>{sampleSummary.count} realistic products</strong> tailored to the categories assigned to <strong>{activeStore?.name}</strong> ({activeStore?.categories?.join(', ')}).
            </p>

            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '6px', padding: '14px', border: '1px solid var(--line)', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--navy)', display: 'block', marginBottom: '6px' }}>
                Category Breakdown:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                {sampleSummary.categoryBreakdown.map(b => (
                  <span key={b.category} style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '12px', backgroundColor: '#E2E8F0', color: '#1E293B', fontWeight: 600 }}>
                    {b.category}: {b.count} items
                  </span>
                ))}
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--navy)', display: 'block', marginBottom: '4px' }}>
                Preview Items:
              </span>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', color: 'var(--slate)' }}>
                {sampleSummary.previewNames.map((name, i) => (
                  <li key={i}>{name}</li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setShowSampleConfirmModal(false)}
                className="button button-light"
                style={{ padding: '8px 16px', fontSize: '11px', border: '1px solid var(--line)' }}
                disabled={isGeneratingSamples}
              >
                Cancel
              </button>
              <button 
                onClick={handleGenerateSamples}
                className="button button-green"
                style={{ padding: '8px 20px', fontSize: '11px' }}
                disabled={isGeneratingSamples}
              >
                {isGeneratingSamples ? 'Generating Catalog...' : `Generate ${sampleSummary.count} Products`}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
