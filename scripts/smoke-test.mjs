// scripts/smoke-test.mjs
// Automated route health check & sanity verification for Storecraft

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

const ROUTES_TO_TEST = [
  '/',
  '/onboard',
  '/dashboard',
  '/dashboard/theme',
  '/dashboard/assistant',
  '/dashboard/products',
  '/dashboard/products/import',
  '/dashboard/orders',
  '/store/atelier',
  '/store/forma',
  '/store/market',
  '/store/circuit',
  '/api/db'
]

async function runSmokeTests() {
  console.log(`🚀 Starting Storecraft Smoke Test Suite against ${BASE_URL}\n`)
  let passed = 0
  let failed = 0

  for (const route of ROUTES_TO_TEST) {
    const url = `${BASE_URL}${route}`
    try {
      const start = Date.now()
      const res = await fetch(url)
      const duration = Date.now() - start

      if (res.status >= 200 && res.status < 400) {
        console.log(`✅ [${res.status}] ${route} (${duration}ms)`)
        passed++
      } else {
        console.error(`❌ [${res.status}] ${route} (${duration}ms) - Unexpected status code`)
        failed++
      }
    } catch (err) {
      console.error(`❌ [ERR] ${route} - Connection failed: ${err.message}`)
      failed++
    }
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${ROUTES_TO_TEST.length} routes.`)
  if (failed > 0) {
    process.exit(1)
  }
}

runSmokeTests()
