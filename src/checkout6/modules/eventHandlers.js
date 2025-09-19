import { checkoutStepsReader } from './checkoutSteps.js'
import { addPlaceholder, addTermsAndConditions, changePlaceholder } from './formEnhancements.js'
import { addCartCheckboxes } from './cartCheckboxes.js'
import { addShippingInfo } from './shippingInfo.js'
import { addRecommendedProducts } from './recommendedProducts.js'
import { insertCartTitle } from './cartTitle.js'
import { insertCouponTitle } from './couponTitle.js'

export const initializeCheckout = () => {
  checkoutStepsReader()
  insertCartTitle()
  insertCouponTitle()
  addCartCheckboxes()
  addRecommendedProducts()

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

  const hash = window.location.hash

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
