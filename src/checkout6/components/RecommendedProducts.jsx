import { h } from 'preact';
import { useRef } from 'preact/hooks';

const RecommendedProducts = ({ products = [], onAddToCart }) => {
  const sliderRef = useRef(null);

  const formatPrice = (price) => {
    if (price == null) return '';
    try {
      return price.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
    } catch (_) {
      return `$${Number(price).toLocaleString('es-CO')}`;
    }
  };

  const handleAddToCartClick = (p) => {
    if (typeof onAddToCart === 'function') onAddToCart(p);
  };

  const scrollByCards = (dir = 1) => {
    const el = sliderRef.current;
    if (!el) return;
    const card = el.querySelector('.recommended-products__item');
    const delta = card ? card.getBoundingClientRect().width + 16 : 300;
    el.scrollBy({ left: dir * delta * 2, behavior: 'smooth' });
  };

  return (
    <div className="recommended-products">
      <h2 className="recommended-products__title">Productos recomendados</h2>

      <div className="recommended-products__container">
        <button
          className="recommended-products__nav recommended-products__nav--prev"
          aria-label="Anterior"
          onClick={() => scrollByCards(-1)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="recommended-products__slider" ref={sliderRef} style={{ overflowX: 'auto', scrollSnapType: 'x proximity' }}>
          {products.map((product) => (
            <div key={`${product.skuId || product.id}`} className="recommended-products__item" style={{ scrollSnapAlign: 'start' }}>
              <div className="recommended-products__card">
                <div className="recommended-products__image-container">
                  <button className="recommended-products__wishlist" aria-label="Agregar a favoritos">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  {product.freeShipping && (
                    <span className="recommended-products__badge recommended-products__badge--shipping">
                      Envío gratis
                    </span>
                  )}

                  {product.discountPercentage > 0 && (
                    <span className="recommended-products__badge recommended-products__badge--discount">
                      -{Math.round(product.discountPercentage)}%
                    </span>
                  )}

                  {product.badge && (
                    <span className="recommended-products__badge recommended-products__badge--special">
                      {product.badge}
                    </span>
                  )}

                  <img
                    src={product.image}
                    alt={product.name}
                    className="recommended-products__image"
                    loading="lazy"
                  />
                </div>

                <div className="recommended-products__content">
                  <h3 className="recommended-products__name">{product.name}</h3>
                  <p className="recommended-products__brand">{product.brand}</p>

                  <div className="recommended-products__price">
                    <span className="recommended-products__current-price">
                      {formatPrice(product.currentPrice)}
                    </span>
                    {product.listPrice > product.currentPrice && (
                      <span className="recommended-products__original-price">
                        {formatPrice(product.listPrice)}
                      </span>
                    )}
                  </div>

                  {product.installmentsLabel && (
                    <div className="recommended-products__installments">
                      <span className="recommended-products__vtex-logo">VTEX</span>
                      {product.installmentsLabel}
                    </div>
                  )}

                  {product.sellerName && (
                    <p className="recommended-products__seller">Vendido por: {product.sellerName}</p>
                  )}

                  {product.outOfStock ? (
                    <button className="recommended-products__button recommended-products__button--disabled" disabled>
                      Agotado online, ver en tienda
                    </button>
                  ) : (
                    <button
                      className="recommended-products__button"
                      onClick={() => handleAddToCartClick(product)}
                    >
                      Agregar
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V16.5M9 19.5A1.5 1.5 0 1 1 12 19.5A1.5 1.5 0 0 1 9 19.5ZM20 19.5A1.5 1.5 0 1 1 23 19.5A1.5 1.5 0 0 1 20 19.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          className="recommended-products__nav recommended-products__nav--next"
          aria-label="Siguiente"
          onClick={() => scrollByCards(1)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default RecommendedProducts;