import { useRef, useState } from 'preact/hooks'

// eslint-disable-next-line no-unused-vars
const CartIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V16.5M9 19.5A1.5 1.5 0 1 1 12 19.5A1.5 1.5 0 0 1 9 19.5ZM20 19.5A1.5 1.5 0 1 1 23 19.5A1.5 1.5 0 0 1 20 19.5Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

// eslint-disable-next-line no-unused-vars
const HeartIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

// eslint-disable-next-line no-unused-vars
const ProductCard = ({ product, formatPrice, onAddToCart }) => {
  const variants = product.variants?.length ? product.variants : [product]
  const defaultVariantIndex = Math.max(
    0,
    variants.findIndex((variant) => variant.skuId === product.skuId)
  )
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(defaultVariantIndex)
  const [quantity, setQuantity] = useState(1)
  const selectedVariant = variants[selectedVariantIndex] || variants[0] || product
  const maxQuantity = selectedVariant.availableQuantity > 0 ? selectedVariant.availableQuantity : null
  const isAtMaxQuantity = maxQuantity != null && quantity >= maxQuantity
  const isOutOfStock = Boolean(selectedVariant.outOfStock)
  const sellerName = selectedVariant.sellerName || product.sellerName
  const image = selectedVariant.image || product.image

  const handleVariantChange = (index) => {
    setSelectedVariantIndex(index)
    setQuantity(1)
  }

  const decrementQuantity = () => {
    setQuantity((currentQuantity) => Math.max(1, currentQuantity - 1))
  }

  const incrementQuantity = () => {
    setQuantity((currentQuantity) => {
      if (maxQuantity != null) return Math.min(maxQuantity, currentQuantity + 1)
      return currentQuantity + 1
    })
  }

  const handleAddToCartClick = () => {
    if (isOutOfStock || typeof onAddToCart !== 'function') return
    onAddToCart({ ...product, ...selectedVariant, quantity })
  }

  return (
    <div className="recommended-products__card">
      <div className="recommended-products__image-container">
        <button className="recommended-products__wishlist" aria-label="Agregar a favoritos">
          <HeartIcon />
        </button>

        {product.freeShipping && (
          <span className="recommended-products__badge recommended-products__badge--shipping">Envío gratis</span>
        )}

        {product.badge && (
          <span className="recommended-products__badge recommended-products__badge--special">{product.badge}</span>
        )}

        <img src={image} alt={product.name} className="recommended-products__image" loading="lazy" />
      </div>

      <div className="recommended-products__content">
        {product.brand && <p className="recommended-products__brand">{product.brand}</p>}
        <h3 className="recommended-products__name">{product.name}</h3>

        <div className="recommended-products__price-row">
          <span className="recommended-products__current-price">{formatPrice(selectedVariant.currentPrice)}</span>
          {selectedVariant.listPrice > selectedVariant.currentPrice && (
            <span className="recommended-products__original-price">{formatPrice(selectedVariant.listPrice)}</span>
          )}
          {selectedVariant.discountPercentage > 0 && (
            <span className="recommended-products__discount-pill">
              -{Math.round(selectedVariant.discountPercentage)}%
            </span>
          )}
        </div>

        {variants.length > 1 && (
          <div className="recommended-products__variants" aria-label="Variantes disponibles">
            {variants.map((variant, index) => (
              <button
                key={variant.skuId}
                type="button"
                className={`recommended-products__variant${
                  index === selectedVariantIndex ? ' recommended-products__variant--selected' : ''
                }`}
                onClick={() => handleVariantChange(index)}
              >
                {variant.label || `Opción ${index + 1}`}
              </button>
            ))}
          </div>
        )}

        {sellerName && <p className="recommended-products__seller">Vendido por: {sellerName}</p>}

        <div className="recommended-products__quantity" aria-label="Cantidad">
          <button
            type="button"
            className="recommended-products__quantity-button"
            onClick={decrementQuantity}
            disabled={isOutOfStock || quantity <= 1}
            aria-label="Reducir cantidad"
          >
            -
          </button>
          <span className="recommended-products__quantity-value">{quantity}</span>
          <button
            type="button"
            className="recommended-products__quantity-button"
            onClick={incrementQuantity}
            disabled={isOutOfStock || isAtMaxQuantity}
            aria-label="Aumentar cantidad"
          >
            +
          </button>
        </div>

        {isOutOfStock ? (
          <button className="recommended-products__button recommended-products__button--disabled" disabled>
            Agotado online, ver en tienda
          </button>
        ) : (
          <button className="recommended-products__button" onClick={handleAddToCartClick}>
            Agregar
            <CartIcon />
          </button>
        )}
      </div>
    </div>
  )
}

const RecommendedProducts = ({ products = [], onAddToCart }) => {
  const sliderRef = useRef(null)

  const formatPrice = (price) => {
    if (price == null) return ''
    try {
      return price.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
    } catch {
      return `$${Number(price).toLocaleString('es-CO')}`
    }
  }

  const scrollByCards = (dir = 1) => {
    const el = sliderRef.current
    if (!el) return
    const card = el.querySelector('.recommended-products__item')
    const delta = card ? card.getBoundingClientRect().width + 16 : 300
    el.scrollBy({ left: dir * delta * 2, behavior: 'smooth' })
  }

  return (
    <div className="recommended-products">
      <h2 className="recommended-products__title">Productos recomendados</h2>

      <div className="recommended-products__container">
        <button
          className="recommended-products__nav recommended-products__nav--prev"
          aria-label="Anterior"
          onClick={() => scrollByCards(-1)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div
          className="recommended-products__slider"
          ref={sliderRef}
          style={{ overflowX: 'auto', scrollSnapType: 'x proximity' }}
        >
          {products.map((product) => (
            <div
              key={`${product.id || product.skuId}`}
              className="recommended-products__item"
              style={{ scrollSnapAlign: 'start' }}
            >
              <ProductCard product={product} formatPrice={formatPrice} onAddToCart={onAddToCart} />
            </div>
          ))}
        </div>

        <button
          className="recommended-products__nav recommended-products__nav--next"
          aria-label="Siguiente"
          onClick={() => scrollByCards(1)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default RecommendedProducts
