import { h } from 'preact'

const CheckoutHeader = () => {
  console.log('📦 CheckoutHeader component rendering...')

  return (
    <div className="container-custom-header">
      <div className="container-custom-header__content">
        <h1>HomeSentry Checkout</h1>
        <div className="checkout6-progress-indicator">
          <span>Secure Checkout</span>
        </div>
      </div>
    </div>
  )
}

export default CheckoutHeader
