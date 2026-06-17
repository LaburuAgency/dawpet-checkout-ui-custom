// eslint-disable-next-line no-unused-vars
import { h, render } from 'preact'
import { $ } from '../utils/dom.js'
// eslint-disable-next-line no-unused-vars
import RecommendedProducts from '../components/RecommendedProducts.jsx'

let recommendedProductsContainer = null
const COLLECTION_ID = 138 // configurable

function formatVariantLabel(item, index) {
  const variationValue = item?.variations
    ?.map((variation) => {
      const value = item[variation]
      return Array.isArray(value) ? value[0] : value
    })
    .filter(Boolean)
    .join(' / ')

  return variationValue || item?.name || item?.nameComplete || `Opción ${index + 1}`
}

function mapSkuVariant(item, index) {
  if (!item?.itemId) return null

  const seller = (item.sellers && item.sellers[0]) || {}
  const offer = seller.commertialOffer || {}
  const installments = (offer.Installments || []).find((i) => i.NumberOfInstallments > 1)
  const currentPrice = offer.Price || 0
  const listPrice = offer.ListPrice || currentPrice
  const discountPercentage = listPrice > currentPrice && listPrice > 0 ? ((listPrice - currentPrice) / listPrice) * 100 : 0
  const availableQuantity = Number(offer.AvailableQuantity || 0)

  return {
    skuId: item.itemId,
    label: formatVariantLabel(item, index),
    image: (item.images && item.images[0] && (item.images[0].imageUrl || item.images[0].imageUrlHttps)) || '',
    currentPrice,
    listPrice,
    discountPercentage: discountPercentage > 0 ? discountPercentage : 0,
    sellerId: seller.sellerId || '1',
    sellerName: seller.sellerName || '',
    outOfStock: availableQuantity <= 0,
    installmentsLabel: installments ? `${installments.NumberOfInstallments}x sin interés` : '',
    availableQuantity,
    freeShipping: Boolean(offer && offer.freightCalculator && offer.freightCalculator === 0),
  }
}

async function fetchCollectionProducts(collectionId, from = 0, to = 9) {
  try {
    const url = `/api/catalog_system/pub/products/search?fq=H:${collectionId}&_from=${from}&_to=${to}`
    const res = await fetch(url, { credentials: 'same-origin' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()

    // Map VTEX product search to UI model while preserving every SKU option.
    const products = []
    for (const p of data) {
      const variants = (p.items || []).map(mapSkuVariant).filter(Boolean)
      if (!variants.length) continue

      const defaultVariant = variants.find((variant) => !variant.outOfStock) || variants[0]
      products.push({
        id: p.productId,
        name: p.productName,
        brand: p.brand,
        ...defaultVariant,
        freeShipping: variants.some((variant) => variant.freeShipping),
        variants,
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
      await addToCartVTEX({ skuId: p.skuId, sellerId: p.sellerId, quantity: p.quantity || 1 })
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
