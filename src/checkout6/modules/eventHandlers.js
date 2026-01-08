import { checkoutStepsReader } from './checkoutSteps.js'
import { addPlaceholder, addTermsAndConditions, changePlaceholder } from './formEnhancements.js'
import { addCartCheckboxes } from './cartCheckboxes.js'
import { addShippingInfo } from './shippingInfo.js'
import { addRecommendedProducts } from './recommendedProducts.js'
import { insertCartTitle } from './cartTitle.js'
import { insertCouponTitle } from './couponTitle.js'
import { addDocumentTypeSelector } from './documentTypeSelector.js'
// import { addAddressComposer } from './addressComposer.js' // V1 disabled
import { addAddressComposer2 } from './addressComposer2.js'
import { addPhoneTemplateSelector } from './phoneTemplate.js'
import { updateDeliveryTitle } from './deliveryTitle.js'
import { updateDeliveryOptions } from './deliveryOptions.js'
import { setupAddiLabelObserver, cleanupAddiLabelObserver } from './addiPaymentLabel.js'
import { setupCartTableObserver, cleanupCartTableObserver } from './cartTableLabels.js'

// Helper function to wait for VTEX to be ready
const waitForVtexReady = () => {
  return new Promise((resolve) => {
    // Check if VTEX orderForm is already available
    if (window.vtexjs?.checkout?.orderForm) {
      console.log('✅ VTEX already initialized')
      resolve()
      return
    }

    // Otherwise, wait for orderFormUpdated event
    console.log('⏳ Waiting for VTEX to initialize...')
    const handler = () => {
      console.log('✅ VTEX initialized via orderFormUpdated event')
      window.removeEventListener('orderFormUpdated.vtex', handler)
      resolve()
    }
    window.addEventListener('orderFormUpdated.vtex', handler)

    // Fallback timeout after 3 seconds
    setTimeout(() => {
      console.log('⚠️ VTEX initialization timeout - proceeding anyway')
      window.removeEventListener('orderFormUpdated.vtex', handler)
      resolve()
    }, 3000)
  })
}

export const initializeCheckout = async () => {
  checkoutStepsReader()
  insertCartTitle()
  insertCouponTitle()
  addCartCheckboxes()
  addRecommendedProducts()
  addDocumentTypeSelector()

  // CRITICAL: Wait for VTEX to be ready before manipulating shipping DOM
  await waitForVtexReady()

  // addAddressComposer() // V1 disabled - using V2 only
  addAddressComposer2()
  addPhoneTemplateSelector()
  updateDeliveryTitle()
  updateDeliveryOptions()
  setupAddiLabelObserver()
  setupCartTableObserver()

  const hash = window.location.hash

  if (hash.includes('email') || hash.includes('profile')) {
    addPlaceholder()
    addTermsAndConditions()
  }
}

export const handleHashChange = () => {
  checkoutStepsReader()
  insertCartTitle()
  insertCouponTitle()
  addCartCheckboxes()
  addRecommendedProducts()
  addDocumentTypeSelector()
  // addAddressComposer() // V1 disabled - using V2 only
  addAddressComposer2()
  addPhoneTemplateSelector()
  updateDeliveryTitle()
  updateDeliveryOptions()

  const hash = window.location.hash

  // Setup payment labels observer for payment step
  if (hash.includes('payment')) {
    setupAddiLabelObserver()
  } else {
    cleanupAddiLabelObserver()
  }

  // Setup cart table labels observer for cart step
  if (hash.includes('cart')) {
    setupCartTableObserver()
  } else {
    cleanupCartTableObserver()
  }

  if (hash.includes('email') || hash.includes('profile')) {
    addPlaceholder()
    addTermsAndConditions()
  }
}

export const handleOrderFormUpdate = (evt, orderForm) => {
  const hash = window.location.hash

  setTimeout(() => {
    changePlaceholder()
    insertCartTitle()
    insertCouponTitle()
    addCartCheckboxes()
    addRecommendedProducts()
    addDocumentTypeSelector()
    // addAddressComposer() // V1 disabled - using V2 only
    addAddressComposer2()
    addPhoneTemplateSelector()
    updateDeliveryTitle()
    updateDeliveryOptions()

    // Setup payment labels observer if in payment step
    if (hash.includes('payment')) {
      setupAddiLabelObserver()
    }

    // Setup cart table labels observer if in cart step
    if (hash.includes('cart')) {
      setupCartTableObserver()
    }
  }, 200)

  if (hash.includes('email') || hash.includes('profile')) {
    addPlaceholder()
    addTermsAndConditions()
  }

  addShippingInfo()
}

export const setupEventListeners = () => {
  // Hash change listener
  window.addEventListener('hashchange', handleHashChange)

  // VTEX-specific event listeners
  window.addEventListener('orderFormUpdated.vtex', handleOrderFormUpdate)

  // jQuery fallback for VTEX events
  if (window.jQuery) {
    window.jQuery(window).on('orderFormUpdated.vtex', handleOrderFormUpdate)
  }
}
