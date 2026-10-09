import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { getStoresByOwner } from '@/lib/db'
import { 
  detectPromptInjection, 
  parseQueryIntent, 
  executeAnalyticsOperation,
  AssistantQueryResult
} from '@/lib/server-assistant'

export async function POST(req: Request) {
  try {
    const sessionData = await getSessionUser()
    const body = await req.json()
    const { query, storeId: clientStoreId } = body

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Please provide a valid question for the Storecraft Business Copilot.'
      }, { status: 400 })
    }

    const trimmedQuery = query.trim()

    // 1. Tenant Isolation & Server Store Resolution
    let authorizedStoreId = 'store-northstar' // Default fallback store

    if (sessionData && sessionData.user) {
      const userStores = getStoresByOwner(sessionData.user.id)
      if (userStores.length > 0) {
        // If client specified a storeId, verify user ownership
        if (clientStoreId) {
          const match = userStores.find(s => s.id === clientStoreId || s.slug === clientStoreId)
          if (match) {
            authorizedStoreId = match.id
          } else {
            // Strict Cross-Store Security Denial
            return NextResponse.json({
              success: false,
              error: 'Security Boundary Error: Access to requested store ID is unauthorized for current session.',
              securityBlock: true
            }, { status: 403 })
          }
        } else {
          authorizedStoreId = userStores[0].id
        }
      } else if (clientStoreId) {
        authorizedStoreId = clientStoreId
      }
    } else if (clientStoreId) {
      // In demo mode without active user session, scope to client selected demo store
      authorizedStoreId = clientStoreId
    }

    // 2. Prompt Injection & Security Boundary Inspection
    if (detectPromptInjection(trimmedQuery)) {
      const securityResponse: AssistantQueryResult = {
        id: `sec-${Date.now()}`,
        timestamp: new Date().toISOString(),
        storeId: authorizedStoreId,
        storeName: 'Security Perimeter',
        operation: 'GET_EXECUTIVE_SUMMARY',
        headline: 'Security Perimeter Enforced: Access Blocked',
        summary: 'The submitted query contained patterns requesting system instructions, API credentials, or cross-store data access. The Controlled Analytics Layer rejected the query.',
        insights: [
          '🔒 Tenant Isolation: Storecraft analytics queries are strictly restricted to your authorized store.',
          '🚫 Prompt Injection Defense: Unrestricted system commands, SQL, script execution, or API key requests are forbidden.'
        ],
        periodUsed: 'N/A (Security Perimeter)',
        calculationBasis: 'Controlled Analytics Layer Prompt Injection Inspection',
        providerStatus: {
          isConfigured: true,
          providerName: 'Storecraft Controlled Analytics Guard',
          note: 'Prompt injection attempt blocked by application security layer.'
        },
        evidence: {
          title: 'Security Boundary Inspection Log',
          calculationMethod: 'Pattern match check against prompt injection and secret retrieval keywords.',
          queryFormula: 'DENY ALL UNTRUSTED SYSTEM / CROSS-STORE REQUESTS',
          timestamp: new Date().toISOString(),
          rawRecordsCount: 0,
          tableHeaders: [
            { key: 'rule', label: 'Security Policy', format: 'text' },
            { key: 'status', label: 'Enforcement Action', format: 'badge' }
          ],
          tableData: [
            { rule: 'Tenant Isolation Scoping', status: 'Enforced' },
            { rule: 'System Secrets & API Keys Protection', status: 'Protected' },
            { rule: 'No Unrestricted SQL/Script Execution', status: 'Enforced' }
          ],
          metricsSummary: [
            { label: 'Security Status', value: 'Protected' },
            { label: 'Arbitrary Commands Executed', value: 0 }
          ],
          groundingStatus: 'Security Boundary Blocked Request'
        },
        isSecurityBlock: true
      }

      return NextResponse.json({
        success: true,
        response: securityResponse
      })
    }

    // 3. Controlled Analytics Operation Resolution
    const operation = parseQueryIntent(trimmedQuery)

    // 4. Safe Read-Only Analytics Execution
    const result = executeAnalyticsOperation(authorizedStoreId, operation, trimmedQuery)

    return NextResponse.json({
      success: true,
      response: result
    })

  } catch (err: any) {
    console.error('[ASSISTANT_API_ERROR]', err)
    return NextResponse.json({
      success: false,
      error: `Assistant service error: ${err.message || 'Unable to process analytics request.'}`
    }, { status: 500 })
  }
}
