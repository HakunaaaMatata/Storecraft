import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error("No API key")
    return
  }
  const model = 'gemini-3.5-flash'
  const prompt = "hello"
  
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey || '')}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      })
    })
    
    if (!res.ok) {
      const errorText = await res.text()
      console.log("Error response body:", errorText)
    } else {
      const data = await res.json()
      console.log("Success!", data.candidates?.[0]?.content?.parts?.[0]?.text)
    }
  } catch(e) {
    console.error("Crash:", e)
  }
}

testGemini()
