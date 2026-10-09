'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  Package
} from 'lucide-react'
import { useStorecraft } from '@/lib/use-storecraft'
import { Product } from '@/lib/store-data'

type ImportStep = 1 | 2 | 3 | 4 | 5

interface ParsedRow {
  raw: Record<string, string>
  mapped: {
    name: string
    sku: string
    category: string
    price: number
    stock: number
    description: string
    imageUrl: string
  }
  isValid: boolean
  errors: string[]
}

const SUPPORTED_FIELDS = [
  { id: 'name', label: 'Product Name', required: true, aliases: ['product name', 'name', 'title', 'product_title', 'item_name', 'product'] },
  { id: 'sku', label: 'SKU', required: true, aliases: ['sku', 'item_sku', 'code', 'product_code', 'id', 'item_code'] },
  { id: 'price', label: 'Price', required: true, aliases: ['price', 'retail price', 'unit price', 'cost', 'amount', 'retail_price'] },
  { id: 'stock', label: 'Stock / Quantity', required: true, aliases: ['stock', 'quantity', 'inventory', 'qty', 'stock_count', 'inventory_quantity'] },
  { id: 'category', label: 'Category', required: false, aliases: ['category', 'type', 'department', 'collection', 'group'] },
  { id: 'description', label: 'Description', required: false, aliases: ['description', 'desc', 'details', 'body', 'product_description'] },
  { id: 'imageUrl', label: 'Image URL', required: false, aliases: ['image', 'image url', 'images', 'image_url', 'photo', 'img'] },
]

export default function ProductImportPage() {
  const router = useRouter()
  const { activeStore, products, actions } = useStorecraft()

  const [step, setStep] = useState<ImportStep>(1)
  const [file, setFile] = useState<File | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [fileHeaders, setFileHeaders] = useState<string[]>([])
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [validatedRows, setValidatedRows] = useState<ParsedRow[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [importSummary, setImportSummary] = useState<{ imported: number; skipped: number } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Download sample CSV template
  const downloadTemplate = () => {
    const csvContent = 
`Product Name,SKU,Category,Price,Stock,Description,Image URL
Forma Table Lamp,NG-LMP-04,Lighting,128.00,18,Hand-finished spun aluminum desk lamp with ambient dimmer.,https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80
Speckled Ceramic Vase,NG-CRM-05,Ceramics,48.50,12,High-fired stoneware vase with natural matte speckled glaze.,https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80
Woven Wool Blanket,NG-TXT-02,Textiles,165.00,3,100% Merino wool heirloom throw with fringed borders.,https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&w=800&q=80`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'storecraft_products_template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Parse CSV Line handling quoted fields
  const parseCsvLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"' || char === "'") {
        if (inQuotes && line[i + 1] === char) {
          current += char
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
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

  const processUploadedFile = (uploadedFile: File) => {
    setParseError(null)

    // Validate extension
    const ext = uploadedFile.name.split('.').pop()?.toLowerCase()
    if (ext !== 'csv' && ext !== 'txt') {
      setParseError('Unsupported file type. Please upload a .csv file.')
      return
    }

    // Validate size (max 5MB)
    if (uploadedFile.size > 5 * 1024 * 1024) {
      setParseError('File size exceeds 5MB limit. Please upload a smaller file.')
      return
    }

    setFile(uploadedFile)

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setFileContent(text)
      parseCsvContent(text)
    }
    reader.onerror = () => {
      setParseError('Failed to read the file. Please check file permissions and format.')
    }
    reader.readAsText(uploadedFile)
  }

  // Parse CSV Content & Auto-map
  const parseCsvContent = (content: string) => {
    try {
      const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0)
      if (lines.length < 2) {
        setParseError('The uploaded file must contain a header row and at least one product row.')
        return
      }

      const headers = parseCsvLine(lines[0])
      if (headers.length === 0 || headers.every(h => !h)) {
        setParseError('Could not detect valid column headers in the first row.')
        return
      }

      setFileHeaders(headers)

      const parsedData: Record<string, string>[] = []
      for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i])
        const row: Record<string, string> = {}
        headers.forEach((h, idx) => {
          row[h] = values[idx] || ''
        })
        parsedData.push(row)
      }

      setRawRows(parsedData)

      // Auto-match headers to fields
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
      setParseError(`Parsing error: ${err.message || 'Malformed CSV content'}`)
    }
  }

  // Confirm Column Mapping & Run Validation
  const handleProceedToPreview = () => {
    // Check required fields
    const missingRequired = SUPPORTED_FIELDS.filter(f => f.required && !columnMapping[f.id])
    if (missingRequired.length > 0) {
      setParseError(`Please map all required fields: ${missingRequired.map(f => f.label).join(', ')}`)
      return
    }

    setParseError(null)

    // Existing SKUs in current store
    const existingSkus = new Set(products.map(p => p.sku?.toLowerCase().trim()).filter(Boolean))
    const seenCsvSkus = new Set<string>()

    const validated: ParsedRow[] = rawRows.map((rawRow, idx) => {
      const errors: string[] = []

      // Name
      const nameCol = columnMapping['name']
      const name = rawRow[nameCol]?.trim() || ''
      if (!name) errors.push('Missing product name')

      // SKU
      const skuCol = columnMapping['sku']
      const sku = rawRow[skuCol]?.trim().toUpperCase() || ''
      if (!sku) {
        errors.push('Missing SKU')
      } else {
        if (seenCsvSkus.has(sku)) {
          errors.push(`Duplicate SKU in file: ${sku}`)
        } else {
          seenCsvSkus.add(sku)
        }
        if (existingSkus.has(sku.toLowerCase())) {
          errors.push(`SKU already exists in store catalog: ${sku}`)
        }
      }

      // Price
      const priceCol = columnMapping['price']
      const rawPrice = rawRow[priceCol]?.replace(/[$,]/g, '').trim() || ''
      const priceNum = parseFloat(rawPrice)
      if (isNaN(priceNum) || priceNum < 0) {
        errors.push(`Invalid price: "${rawRow[priceCol] || ''}"`)
      }

      // Stock
      const stockCol = columnMapping['stock']
      const rawStock = rawRow[stockCol]?.trim() || ''
      const stockNum = parseInt(rawStock, 10)
      if (isNaN(stockNum) || stockNum < 0) {
        errors.push(`Invalid stock quantity: "${rawRow[stockCol] || ''}"`)
      }

      // Category, Description, Image
      const catCol = columnMapping['category']
      const category = rawRow[catCol]?.trim() || 'General'

      const descCol = columnMapping['description']
      const description = rawRow[descCol]?.trim() || ''

      const imgCol = columnMapping['imageUrl']
      const imageUrl = rawRow[imgCol]?.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'

      return {
        raw: rawRow,
        mapped: {
          name,
          sku,
          category,
          price: isNaN(priceNum) ? 0 : priceNum,
          stock: isNaN(stockNum) ? 0 : stockNum,
          description,
          imageUrl
        },
        isValid: errors.length === 0,
        errors
      }
    })

    setValidatedRows(validated)
    setStep(3) // Move to preview & validate step
  }

  // Execute Import
  const handleExecuteImport = () => {
    if (!activeStore) return
    setIsProcessing(true)

    const validItems = validatedRows.filter(r => r.isValid)

    const newProducts: Product[] = validItems.map((r, idx) => ({
      id: `prod-imp-${Date.now()}-${idx}`,
      storeId: activeStore.id,
      name: r.mapped.name,
      slug: r.mapped.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      description: r.mapped.description,
      category: r.mapped.category,
      price: r.mapped.price,
      stock: r.mapped.stock,
      sku: r.mapped.sku,
      images: [r.mapped.imageUrl],
      createdAt: new Date().toISOString()
    }))

    // Save to shared store database
    actions.importProducts(newProducts)

    setImportSummary({
      imported: validItems.length,
      skipped: validatedRows.length - validItems.length
    })

    setIsProcessing(false)
    setStep(5) // Summary screen
  }

  const validCount = validatedRows.filter(r => r.isValid).length
  const invalidCount = validatedRows.length - validCount

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header with Breadcrumb Back link */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link 
          href="/dashboard/products" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--slate)', textDecoration: 'none', fontWeight: 600 }}
        >
          <ArrowLeft size={13} /> Back to Products
        </Link>
        <button 
          onClick={downloadTemplate}
          className="button button-light"
          style={{ padding: '6px 12px', fontSize: '11px', border: '1px solid var(--line)' }}
        >
          <Download size={13} /> Download CSV Template
        </button>
      </div>

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
          { num: 1, label: 'Upload File' },
          { num: 2, label: 'Map Columns' },
          { num: 3, label: 'Validate & Preview' },
          { num: 4, label: 'Confirm Import' },
          { num: 5, label: 'Complete' }
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
            <span style={{ fontWeight: step === s.num ? 800 : 500, color: step === s.num ? 'var(--navy)' : 'var(--slate)', display: 'none' }} className="sm:inline">
              {s.label}
            </span>
            {i < 4 && <ChevronRight size={14} color="#CBD5E1" style={{ margin: '0 4px', display: 'none' }} className="sm:inline" />}
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
              padding: '48px 24px',
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
              accept=".csv,text/csv,text/plain" 
              style={{ display: 'none' }} 
            />
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#E4F8F0', color: '#07875D', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Upload size={22} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 6px', color: 'var(--navy)' }}>
              Choose a CSV file or drag and drop it here
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--slate)', margin: '0 0 20px' }}>
              Supports CSV format up to 5MB. Must contain a header row with product titles, SKUs, and pricing.
            </p>
            <button 
              type="button" 
              className="button button-green" 
              style={{ padding: '8px 20px', fontSize: '11px' }}
            >
              Browse Files
            </button>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '24px', fontSize: '11px', color: 'var(--slate)' }}>
            <span>✓ Client-side row validation</span>
            <span>✓ Auto column header recognition</span>
            <span>✓ Instant preview before saving</span>
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
              Map CSV Columns to StoreCraft Fields
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--slate)', margin: 0 }}>
              File <strong>{file?.name}</strong> parsed ({rawRows.length} rows found). Match your spreadsheet headers to required product fields.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {SUPPORTED_FIELDS.map((field) => {
              const currentMapped = columnMapping[field.id] || ''
              return (
                <div 
                  key={field.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '180px 30px 1fr 100px',
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
                      {field.required ? 'Required field' : 'Optional field'}
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
                      <span style={{ fontSize: '10px', color: '#EF4444', fontWeight: 600 }}>Missing</span>
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
                Review detected values before saving to your store inventory.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ padding: '6px 14px', borderRadius: '20px', backgroundColor: '#E4F8F0', color: '#07875D', fontSize: '11px', fontWeight: 700 }}>
                ✓ {validCount} Valid Row{validCount !== 1 ? 's' : ''}
              </div>
              {invalidCount > 0 && (
                <div style={{ padding: '6px 14px', borderRadius: '20px', backgroundColor: '#FEE2E2', color: '#B91C1C', fontSize: '11px', fontWeight: 700 }}>
                  ⚠ {invalidCount} Invalid Row{invalidCount !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>

          {/* Preview Table */}
          <div style={{ overflowX: 'auto', maxHeight: '420px', border: '1px solid var(--line)', borderRadius: '6px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '11px' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#F8FAFC', zIndex: 10 }}>
                <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--slate)', fontSize: '10px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 14px', width: '50px' }}>Row</th>
                  <th style={{ padding: '10px 14px' }}>Title</th>
                  <th style={{ padding: '10px 14px' }}>SKU</th>
                  <th style={{ padding: '10px 14px' }}>Category</th>
                  <th style={{ padding: '10px 14px' }}>Price</th>
                  <th style={{ padding: '10px 14px' }}>Stock</th>
                  <th style={{ padding: '10px 14px' }}>Status & Issues</th>
                </tr>
              </thead>
              <tbody>
                {validatedRows.map((r, i) => (
                  <tr 
                    key={i} 
                    style={{
                      borderBottom: '1px solid var(--line)',
                      backgroundColor: r.isValid ? '#FFFFFF' : '#FFF5F5'
                    }}
                  >
                    <td style={{ padding: '10px 14px', color: 'var(--slate)' }}>#{i + 1}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--navy)' }}>
                      {r.mapped.name || <span style={{ color: '#EF4444' }}>[Missing]</span>}
                    </td>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace' }}>
                      {r.mapped.sku || <span style={{ color: '#EF4444' }}>[Missing]</span>}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--slate)' }}>{r.mapped.category}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>${r.mapped.price.toFixed(2)}</td>
                    <td style={{ padding: '10px 14px' }}>{r.mapped.stock} units</td>
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
                No valid rows to import. Please check file formatting or mapping.
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
            {invalidCount > 0 && ` Note: ${invalidCount} invalid row(s) will be excluded.`}
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
          maxWidth: '540px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#DCFCE7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Check size={28} />
          </div>

          <h3 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 8px', color: 'var(--navy)' }}>
            Import Successful!
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--slate)', margin: '0 0 24px', lineHeight: '1.6' }}>
            <strong>{importSummary.imported} product{importSummary.imported !== 1 ? 's' : ''}</strong> have been successfully imported and added to your store inventory.
            {importSummary.skipped > 0 && ` ${importSummary.skipped} invalid rows were skipped.`}
          </p>

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

    </div>
  )
}
