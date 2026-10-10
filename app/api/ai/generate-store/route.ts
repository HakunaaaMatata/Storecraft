import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import {
  validateGenerateStoreInput,
  generateStorePlan,
  generateDeterministicStorePlan
} from '@/lib/ai-generator'

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate Request using StoreCraft Session Mechanism
    const sessionData = await getSessionUser()
    if (!sessionData || !sessionData.user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required. Please sign in to generate a store website.'
      }, { status: 401 })
    }

    // 2. Validate Request Size Limit (Max 64KB)
    const contentLength = req.headers.get('content-length')
    if (contentLength && parseInt(contentLength, 10) > 65536) {
      return NextResponse.json({
        success: false,
        error: 'Payload Too Large: Request exceeds maximum allowed size of 64KB.'
      }, { status: 413 })
    }

    // 3. Parse JSON Body
    let body: any
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON payload. Please provide a well-formed JSON object.'
      }, { status: 400 })
    }

    // Double check body stringified size
    if (typeof body === 'object' && JSON.stringify(body).length > 65536) {
      return NextResponse.json({
        success: false,
        error: 'Payload Too Large: Request body exceeds maximum allowed size of 64KB.'
      }, { status: 413 })
    }

    // 4. Validate Business Details
    const validation = validateGenerateStoreInput(body)
    if (!validation.isValid || !validation.sanitized) {
      return NextResponse.json({
        success: false,
        errors: validation.errors || { general: 'Validation failed.' }
      }, { status: 400 })
    }

    // 5. Connect to Gemini using Runtime Environment Variable
    const apiKey = process.env.GEMINI_API_KEY

    // Handle Missing API Key safely without crashing or exposing secrets
    if (!apiKey || !apiKey.trim()) {
      if (body.allowFallback) {
        const fallbackPlan = generateDeterministicStorePlan(validation.sanitized)
        return NextResponse.json({
          success: true,
          plan: fallbackPlan,
          warning: 'GEMINI_API_KEY is not configured in server environment. Generated using StoreCraft deterministic design engine.'
        }, { status: 200 })
      }

      return NextResponse.json({
        success: false,
        error: 'GEMINI_API_KEY environment variable is not configured on the server. To generate with AI, configure the environment variable or set allowFallback: true.',
        code: 'MISSING_API_KEY'
      }, { status: 503 })
    }

    // 6. Generate and Validate Structured Website Plan with Gemini
    try {
      const plan = await generateStorePlan(validation.sanitized, apiKey.trim())

      // Do NOT save to database yet (strictly following instructions)
      return NextResponse.json({
        success: true,
        plan
      }, { status: 200 })

    } catch (aiError: any) {
      const rawMessage = aiError?.message || 'AI generation encountered an unexpected error.'
      // Never expose secrets in log or response
      const safeMessage = rawMessage.replace(apiKey, '[REDACTED]')

      console.error('[AI_BACKEND_GENERATOR_ERROR]', safeMessage)

      // Timeouts
      if (safeMessage.includes('timed out')) {
        if (body.allowFallback) {
          const fallbackPlan = generateDeterministicStorePlan(validation.sanitized)
          return NextResponse.json({
            success: true,
            plan: fallbackPlan,
            warning: 'AI generation timed out. Generated using StoreCraft deterministic design engine.'
          }, { status: 200 })
        }

        return NextResponse.json({
          success: false,
          error: 'AI generation timed out. The provider took too long to respond.',
          code: 'TIMEOUT'
        }, { status: 504 })
      }

      // Malformed / Parse errors
      if (safeMessage.includes('parse') || safeMessage.includes('malformed')) {
        if (body.allowFallback) {
          const fallbackPlan = generateDeterministicStorePlan(validation.sanitized)
          return NextResponse.json({
            success: true,
            plan: fallbackPlan,
            warning: 'AI provider returned a malformed response. Reverted to StoreCraft deterministic design engine.'
          }, { status: 200 })
        }

        return NextResponse.json({
          success: false,
          error: 'AI provider returned an unparseable or malformed response. Please retry.',
          code: 'MALFORMED_RESPONSE'
        }, { status: 502 })
      }

      // Provider errors / Quota / Model errors
      if (body.allowFallback) {
        const fallbackPlan = generateDeterministicStorePlan(validation.sanitized)
        return NextResponse.json({
          success: true,
          plan: fallbackPlan,
          warning: `AI generation encountered provider error (${safeMessage}). Reverted to StoreCraft deterministic design engine.`
        }, { status: 200 })
      }

      return NextResponse.json({
        success: false,
        error: `AI provider error: ${safeMessage}`,
        code: 'PROVIDER_ERROR'
      }, { status: 502 })
    }

  } catch (err: any) {
    console.error('[AI_GENERATE_STORE_FATAL]', err?.message || err)
    return NextResponse.json({
      success: false,
      error: 'Internal server error while processing website generation request.'
    }, { status: 500 })
  }
}
