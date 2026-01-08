/**
 * Module to update delivery option texts
 * Customizes the delivery time descriptions while preserving prices
 */

const updateDeliveryOptions = () => {
  // Solo ejecutar en el paso del carrito y shipping
  if (!window.location.hash.includes('cart') && !window.location.hash.includes('shipping')) {
    return
  }

  // Helper function to extract and preserve price from original text
  const extractPrice = (text) => {
    const priceMatch = text.match(/\$\s*[\d.,]+/)
    return priceMatch ? priceMatch[0] : ''
  }

  // ===== UPDATE SELECT OPTIONS =====
  // Update "Envio Siguiente día" option in select
  const siguienteDiaOption = document.getElementById('sla-option-Envio Siguiente día')
  if (siguienteDiaOption) {
    const price = extractPrice(siguienteDiaOption.textContent)
    siguienteDiaOption.textContent = price ? `1 día hábil - ${price}` : '1 día hábil'
  }

  // Update "Envio Express" option in select
  const expressOption = document.getElementById('sla-option-Envio Express')
  if (expressOption) {
    const price = extractPrice(expressOption.textContent)
    expressOption.textContent = price ? `Hasta en 3 horas - ${price}` : 'Hasta en 3 horas'
  }

  // Update "Entrega Tradicional" option in select
  const tradicionalOption = document.getElementById('sla-option-Entrega Tradicional')
  if (tradicionalOption) {
    const price = extractPrice(tradicionalOption.textContent)
    tradicionalOption.textContent = price ? `BOG: 1-3 días hábiles, resto país 3-8 días hábiles - ${price}` : 'BOG: 1-3 días hábiles, resto país 3-8 días hábiles'
  }

  // ===== UPDATE DETAILED SHIPPING OPTIONS =====
  // Update "Envio Siguiente día" in detailed options
  const siguienteDiaLabel = document.querySelector('label[id="Envio Siguiente día"]')
  if (siguienteDiaLabel) {
    const packageSpan = siguienteDiaLabel.querySelector('.shp-option-text-package span')
    if (packageSpan && packageSpan.textContent.trim() === 'Mismo día') {
      packageSpan.textContent = '1 día hábil'
    }
  }

  // Update "Envio Express" in detailed options
  const expressLabel = document.querySelector('label[id="Envio Express"]')
  if (expressLabel) {
    const packageSpan = expressLabel.querySelector('.shp-option-text-package span')
    if (packageSpan && packageSpan.textContent.trim() === 'En 1 día hábil') {
      packageSpan.textContent = 'Hasta en 3 horas'
    }
  }

  // Update "Entrega Tradicional" in detailed options
  const tradicionalLabel = document.querySelector('label[id="Entrega Tradicional"]')
  if (tradicionalLabel) {
    const packageSpan = tradicionalLabel.querySelector('.shp-option-text-package span')
    if (packageSpan && packageSpan.textContent.trim() === 'En 1 día') {
      packageSpan.textContent = 'BOG: 1-3 días hábiles, resto país 3-8 días hábiles'
    }
  }
}

export { updateDeliveryOptions }
