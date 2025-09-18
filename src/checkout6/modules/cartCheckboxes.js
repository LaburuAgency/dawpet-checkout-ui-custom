import { $, createElementWithHTML, insertBefore } from '../utils/dom.js';

export const addCartCheckboxes = () => {
  console.log('☑️ addCartCheckboxes() - Setting up cart checkboxes');
  let checkboxesAdded = false;

  const preventClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const checkButtonState = () => {
    const cartLink = $.select('#cart-to-orderform');
    if (!cartLink) {
      console.log('⚠️ Cart link not found (#cart-to-orderform)');
      return;
    }

    const termsChecked = $.select('#terms-checkbox')?.checked || false;
    const privacyChecked = $.select('#privacy-checkbox')?.checked || false;

    console.log(`📋 Checkbox states - Terms: ${termsChecked}, Privacy: ${privacyChecked}`);

    if (termsChecked && privacyChecked) {
      console.log('✅ Both checkboxes checked - enabling cart button');
      cartLink.removeAttribute('disabled');
      cartLink.classList.remove('disabled-link');
      cartLink.style.opacity = '1';
      cartLink.style.pointerEvents = 'auto';
      cartLink.style.cursor = 'pointer';
      cartLink.removeEventListener('click', preventClick);
    } else {
      console.log('❌ Not all checkboxes checked - disabling cart button');
      cartLink.setAttribute('disabled', 'true');
      cartLink.classList.add('disabled-link');
      cartLink.style.opacity = '0.5';
      cartLink.style.pointerEvents = 'none';
      cartLink.style.cursor = 'not-allowed';
      cartLink.addEventListener('click', preventClick);
    }
  };

  const createCheckboxes = (cartLink) => {
    console.log('📦 createCheckboxes() - Creating cart checkboxes');

    const checkboxesHTML = `
      <div class="cart-checkboxes-container">
        <div class="checkbox-item">
          <input type="checkbox" id="terms-checkbox" name="terms-checkbox">
          <label for="terms-checkbox">Acepto los términos y condiciones</label>
        </div>
        <div class="checkbox-item">
          <input type="checkbox" id="privacy-checkbox" name="privacy-checkbox">
          <label for="privacy-checkbox">Acepto la política de tratamiento de datos</label>
        </div>
      </div>
    `;

    const checkboxesContainer = createElementWithHTML(checkboxesHTML);
    insertBefore(checkboxesContainer, cartLink);

    console.log('✅ Checkboxes HTML created and inserted');

    // Add event listeners
    $.select('#terms-checkbox')?.addEventListener('change', checkButtonState);
    $.select('#privacy-checkbox')?.addEventListener('change', checkButtonState);

    console.log('🎧 Event listeners added to checkboxes');

    checkboxesAdded = true;
  };

  const initializeCheckboxes = () => {
    console.log('🔄 initializeCheckboxes() - Starting checkbox initialization');

    const checkInterval = setInterval(() => {
      const cartLink = $.select('#cart-to-orderform');

      if (cartLink) {
        console.log('🔗 Cart link found - setting up initial state');

        // Always disable initially
        cartLink.setAttribute('disabled', 'true');
        cartLink.classList.add('disabled-link');
        cartLink.style.opacity = '0.5';
        cartLink.style.pointerEvents = 'none';
        cartLink.style.cursor = 'not-allowed';
        cartLink.addEventListener('click', preventClick);

        // Add checkboxes if not present
        if (!$.select('#terms-checkbox') && !checkboxesAdded) {
          console.log('📋 Terms checkbox not found - creating checkboxes');
          createCheckboxes(cartLink);
        } else if ($.select('#terms-checkbox')) {
          console.log('✅ Terms checkbox already exists');
        }

        checkButtonState();
      }
    }, 200);

    // Set up mutation observer for dynamic content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const cartLink = $.select('#cart-to-orderform');
          if (cartLink) {
            setTimeout(checkButtonState, 100);
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Clean up after 15 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      observer.disconnect();
    }, 15000);
  };

  // Initialize
  console.log('🏁 Starting addCartCheckboxes initialization');
  initializeCheckboxes();
  console.log('✅ addCartCheckboxes() setup completed');
};