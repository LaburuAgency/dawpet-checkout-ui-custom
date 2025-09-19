import { $ } from '../utils/dom.js';

// Form placeholder management
export const changePlaceholder = () => {
  // Use waitForElement utility instead of setInterval
  $.waitForElement('#cart-coupon', 5000)
    .then(couponField => {
      couponField.setAttribute('placeholder', 'Introduce el cupón');
    })
    .catch(() => {
      // Element not found within timeout - silent fail
    });
};

export const addPlaceholder = () => {
  const placeholders = {
    '#client-email': 'correo@ejemplo.com',
    '#client-first-name': 'Nombre',
    '#client-last-name': 'Apellido',
    '#client-document': '12345678910'
  };

  Object.entries(placeholders).forEach(([selector, placeholder]) => {
    const field = $.select(selector);
    if (field) {
      field.setAttribute('placeholder', placeholder);
    }
  });
};

export const addTermsAndConditions = () => {
  const customMessage = $.select('.custom-privacy-message');
  if (customMessage) {
    customMessage.remove();
  }
};