import { co2 } from '@tgwf/co2'

// Initialize CO2.js with the Sustainable Web Design model
const co2Emission = new co2({ model: 'swd' })

// Middleware to calculate carbon footprint per request/response cycle
const carbonFootprint = (req, res, next) => {
  let requestBytes = 0
  let responseBytes = 0

  // Calculate request size (body + query + headers)
  if (req.body) {
    requestBytes = Buffer.byteLength(JSON.stringify(req.body), 'utf8')
  }
  if (req.query) {
    requestBytes += Buffer.byteLength(JSON.stringify(req.query), 'utf8')
  }
  if (req.headers) {
    requestBytes += Buffer.byteLength(JSON.stringify(req.headers), 'utf8')
  }

  // Override res.write to measure streamed response chunks
  const originalWrite = res.write.bind(res)
  const originalEnd = res.end.bind(res)

  res.write = function (chunk, ...args) {
    if (chunk) {
      responseBytes += Buffer.byteLength(chunk, 'utf8')
    }
    return originalWrite(chunk, ...args)
  }

  res.end = function (chunk, ...args) {
    if (chunk) {
      responseBytes += Buffer.byteLength(chunk, 'utf8')
    }

    // Store total bytes so downstream handlers can read it
    res.locals.totalBytes = requestBytes + responseBytes

    // Set to true if your server is hosted on a certified green host
    const greenHost = false
    const emissions = co2Emission.perByte(res.locals.totalBytes, greenHost)

    // Log to server console
    console.log(
      `[CarbonFootprint] ${req.method} ${req.originalUrl} | ` +
        `Data: ${res.locals.totalBytes} bytes | ` +
        `CO2: ${emissions.toFixed(3)} g`
    )

    // Attach emission value to response headers for observability
    res.setHeader('X-CO2-Emissions-g', emissions.toFixed(6))
    res.setHeader('X-Data-Transfer-bytes', res.locals.totalBytes)

    return originalEnd(chunk, ...args)
  }

  next()
}

export default carbonFootprint
