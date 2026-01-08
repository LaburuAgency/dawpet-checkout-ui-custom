/**
 * Module: paymentLabels
 * Updates payment method labels for better clarity
 * - Addi: "Crédito o PSE con Addi"
 * - Mercado Pago: "Tarjeta Crédito/débito, PSE con Mercado Pago"
 */

let paymentLabelObserver = null

const updatePaymentLabels = () => {
  // Only execute in payment step
  if (!window.location.hash.includes('payment')) {
    return
  }

  // ===== ADDI PAYMENT LABELS =====
  // Find all elements that contain "Addi" text in payment section
  const addiPaymentGroupText = document.querySelector('#payment-group-AddiPaymentGroup .payment-group-item-text')
  const addiPaymentGroupH3 = document.querySelector('.box-payment-option.AddiPaymentGroup h3')

  // Update payment group item text (the clickable tab)
  if (addiPaymentGroupText && addiPaymentGroupText.textContent.trim() === 'Addi') {
    addiPaymentGroupText.textContent = 'Crédito o PSE con Addi'
  }

  // Update h3 title inside payment option box
  if (addiPaymentGroupH3 && addiPaymentGroupH3.textContent.trim() === 'Addi') {
    addiPaymentGroupH3.textContent = 'Crédito o PSE con Addi'
  }

  // ===== MERCADO PAGO PAYMENT LABELS =====
  // Find all elements that contain "Mercado Pago" text in payment section
  const mpPaymentGroupText = document.querySelector(
    '#payment-group-MercadoPagoProPaymentGroup .payment-group-item-text'
  )
  const mpPaymentGroupH3 = document.querySelector('.box-payment-mercadopago-banner .payment-mercadopago-title h3')

  // Update payment group item text (the clickable tab)
  if (mpPaymentGroupText && mpPaymentGroupText.textContent.trim() === 'Mercado Pago') {
    mpPaymentGroupText.textContent = 'Tarjeta Crédito/débito, PSE con Mercado Pago'
  }

  // Update h3 title inside payment option box
  if (mpPaymentGroupH3) {
    const originalText = mpPaymentGroupH3.textContent.trim()
    // Only update if it's the default text
    if (originalText === 'Descubre la practicidad de Mercado Pago' || originalText === 'Mercado Pago') {
      mpPaymentGroupH3.textContent = 'Tarjeta Crédito/débito, PSE con Mercado Pago'
    }
  }
}

const setupPaymentLabelObserver = () => {
  // Only execute in payment step
  if (!window.location.hash.includes('payment')) {
    cleanupPaymentLabelObserver()
    return
  }

  // If observer already exists, don't create another
  if (paymentLabelObserver) {
    return
  }

  const paymentDataContainer = document.querySelector('#payment-data')
  if (!paymentDataContainer) {
    // Try again after a short delay if payment-data not available yet
    setTimeout(() => {
      if (window.location.hash.includes('payment')) {
        setupPaymentLabelObserver()
      }
    }, 500)
    return
  }

  // Initial update
  updatePaymentLabels()

  // Create observer to watch for changes in payment section
  paymentLabelObserver = new MutationObserver(() => {
    updatePaymentLabels()
  })

  // Observe changes in payment-data container
  paymentLabelObserver.observe(paymentDataContainer, {
    childList: true,
    subtree: true,
    characterData: true,
  })
}

const cleanupPaymentLabelObserver = () => {
  if (paymentLabelObserver) {
    paymentLabelObserver.disconnect()
    paymentLabelObserver = null
  }
}

// Export with old names for backwards compatibility
export {
  setupPaymentLabelObserver as setupAddiLabelObserver,
  cleanupPaymentLabelObserver as cleanupAddiLabelObserver,
  updatePaymentLabels as updateAddiLabels,
}
