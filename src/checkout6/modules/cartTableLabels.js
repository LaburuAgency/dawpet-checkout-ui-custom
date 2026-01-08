/**
 * Module: cartTableLabels
 * Updates cart table header labels for better clarity
 * - "Precio" → "Precio unitario"
 */

let cartTableObserver = null

const updateCartTableLabels = () => {
  // Only execute in cart step
  if (!window.location.hash.includes('cart')) {
    return
  }

  // Find the product-price header in cart table
  const priceHeader = document.querySelector('.table.cart-items thead th.product-price')

  // Update "Precio" to "Precio unitario"
  if (priceHeader && priceHeader.textContent.trim() === 'Precio') {
    priceHeader.textContent = 'Precio unitario'
  }
}

const setupCartTableObserver = () => {
  // Only execute in cart step
  if (!window.location.hash.includes('cart')) {
    cleanupCartTableObserver()
    return
  }

  // If observer already exists, don't create another
  if (cartTableObserver) {
    return
  }

  const cartContainer = document.querySelector('.cart-template')
  if (!cartContainer) {
    // Try again after a short delay if cart-template not available yet
    setTimeout(() => {
      if (window.location.hash.includes('cart')) {
        setupCartTableObserver()
      }
    }, 500)
    return
  }

  // Initial update
  updateCartTableLabels()

  // Create observer to watch for changes in cart section
  cartTableObserver = new MutationObserver(() => {
    updateCartTableLabels()
  })

  // Observe changes in cart container
  cartTableObserver.observe(cartContainer, {
    childList: true,
    subtree: true,
    characterData: true,
  })
}

const cleanupCartTableObserver = () => {
  if (cartTableObserver) {
    cartTableObserver.disconnect()
    cartTableObserver = null
  }
}

export { setupCartTableObserver, cleanupCartTableObserver, updateCartTableLabels }
