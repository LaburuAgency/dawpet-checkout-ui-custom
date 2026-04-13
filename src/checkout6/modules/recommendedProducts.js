import { h, render } from 'preact'
import { $ } from '../utils/dom.js'
import RecommendedProducts from '../components/RecommendedProducts.jsx'

let recommendedProductsContainer = null
const COLLECTION_ID = 138 // configurable

async function fetchCollectionProducts(collectionId, from = 0, to = 9) {
  try {
    const url = `/api/catalog_system/pub/products/search?fq=H:${collectionId}&_from=${from}&_to=${to}`
    const res = await fetch(url, { credentials: 'same-origin' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()

    // Map VTEX product search to simplified UI model
    const products = []
    for (const p of data) {
      const item = (p.items && p.items[0]) || null
      if (!item) continue
      const seller = (item.sellers && item.sellers[0]) || {}
      const offer = seller.commertialOffer || {}

      const installments = (offer.Installments || []).find((i) => i.NumberOfInstallments > 1)
      const discountPercentage = offer.ListPrice > 0 ? ((offer.ListPrice - offer.Price) / offer.ListPrice) * 100 : 0

      products.push({
        id: p.productId,
        skuId: item.itemId,
        name: p.productName,
        brand: p.brand,
        image: (item.images && item.images[0] && (item.images[0].imageUrl || item.images[0].imageUrlHttps)) || '',
        currentPrice: offer.Price || 0,
        listPrice: offer.ListPrice || offer.Price || 0,
        discountPercentage: discountPercentage > 0 ? discountPercentage : 0,
        installmentsLabel: installments ? `${installments.NumberOfInstallments}x sin interés` : '',
        sellerId: seller.sellerId || '1',
        sellerName: seller.sellerName || '',
        outOfStock: (offer.AvailableQuantity || 0) <= 0,
        freeShipping: Boolean(offer && offer.freightCalculator && offer.freightCalculator === 0),
      })
    }

    return products
  } catch (err) {
    console.error('[recommendedProducts] fetch error', err)
    return []
  }
}

function addToCartVTEX({ skuId, sellerId = '1', quantity = 1 }) {
  if (window.vtexjs && window.vtexjs.checkout && typeof window.vtexjs.checkout.addToCart === 'function') {
    console.table({ id: skuId, quantity, seller: String(sellerId) })
    return window.vtexjs.checkout.addToCart([{ id: skuId, quantity, seller: String(sellerId) }])
  }
  // Fallback to Checkout v2 endpoint
  return fetch('/checkout/cart/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ id: skuId, quantity, seller: String(sellerId) }],
    }),
    credentials: 'same-origin',
  })
}

export const addRecommendedProducts = async () => {
  const hash = window.location.hash

  // Only show on cart step
  if (!hash.includes('cart')) {
    removeRecommendedProducts()
    return
  }

  // Check if already exists
  if (recommendedProductsContainer && document.contains(recommendedProductsContainer)) {
    return
  }

  // Find the checkout container
  const checkoutContainer = $.select('.checkout-container')
  if (!checkoutContainer) {
    return
  }

  // Create container for recommended products
  recommendedProductsContainer = document.createElement('div')
  recommendedProductsContainer.id = 'recommended-products-container'

  // Insert after checkout container
  checkoutContainer.parentNode.insertBefore(recommendedProductsContainer, checkoutContainer.nextSibling)

  const products = await fetchCollectionProducts(COLLECTION_ID, 0, 9)

  const handleAdd = async (p) => {
    try {
      await addToCartVTEX({ skuId: p.skuId, sellerId: p.sellerId, quantity: 1 })
      // Trigger a refresh of orderForm so totals/cards update
      if (window.jQuery) {
        window.jQuery(window).trigger('orderFormUpdated.vtex')
      }
    } catch (e) {
      console.error('Error adding to cart', e)
    }
  }

  // Render the component
  render(<RecommendedProducts products={products} onAddToCart={handleAdd} />, recommendedProductsContainer)
}

export const removeRecommendedProducts = () => {
  if (recommendedProductsContainer && document.contains(recommendedProductsContainer)) {
    recommendedProductsContainer.remove()
    recommendedProductsContainer = null
  }
}
