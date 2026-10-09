import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_FILE = path.join(DATA_DIR, 'storecraft-db.json')

export async function GET() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8')
      return NextResponse.json(JSON.parse(content))
    }
  } catch (err) {}
  
  return NextResponse.json({ stores: [], orders: [] })
}

export async function POST(req: Request) {
  const data = await req.json()
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8')
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
