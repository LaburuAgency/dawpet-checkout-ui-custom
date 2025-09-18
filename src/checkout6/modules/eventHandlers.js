import { checkoutStepsReader } from './checkoutSteps.js';
import { addPlaceholder, addTermsAndConditions, changePlaceholder } from './formEnhancements.js';
import { addCartCheckboxes } from './cartCheckboxes.js';
import { addShippingInfo } from './shippingInfo.js';

export const initializeCheckout = () => {
  console.log('🔄 initializeCheckout() - Starting checkout initialization');

  console.log('📖 Running checkoutStepsReader...');
  checkoutStepsReader();

  console.log('☑️ Adding cart checkboxes...');
  addCartCheckboxes();

  const hash = window.location.hash;
  console.log(`🌐 Current hash: ${hash}`);

  if (hash.includes('email') || hash.includes('profile')) {
    console.log('📧 Hash contains email/profile - adding placeholders and terms');
    addPlaceholder();
    addTermsAndConditions();
  }

  console.log('✅ initializeCheckout() completed');
};

export const handleHashChange = () => {
  console.log('🔄 handleHashChange() - Hash changed event triggered');

  console.log('📖 Running checkoutStepsReader...');
  checkoutStepsReader();

  console.log('☑️ Adding cart checkboxes...');
  addCartCheckboxes();

  const hash = window.location.hash;
  console.log(`🌐 New hash: ${hash}`);

  if (hash.includes('email') || hash.includes('profile')) {
    console.log('📧 Hash contains email/profile - adding placeholders and terms');
    addPlaceholder();
    addTermsAndConditions();
  }

  console.log('✅ handleHashChange() completed');
};

export const handleOrderFormUpdate = (evt, orderForm) => {
  console.log('🔄 handleOrderFormUpdate() - Order form updated');
  console.log('📊 Order form data:', orderForm);

  const hash = window.location.hash;
  console.log(`🌐 Current hash: ${hash}`);

  setTimeout(() => {
    console.log('⏰ Delayed execution - changing placeholder and adding cart checkboxes');
    changePlaceholder();
    addCartCheckboxes();
  }, 200);

  if (hash.includes('email') || hash.includes('profile')) {
    console.log('📧 Hash contains email/profile - adding placeholders and terms');
    addPlaceholder();
    addTermsAndConditions();
  }

  console.log('🚚 Adding shipping info...');
  addShippingInfo();

  console.log('✅ handleOrderFormUpdate() completed');
};

export const setupEventListeners = () => {
  console.log('🎧 setupEventListeners() - Setting up event listeners');

  // Hash change listener
  console.log('🔗 Adding hashchange event listener');
  window.addEventListener('hashchange', handleHashChange);

  // VTEX-specific event listeners
  console.log('📦 Adding orderFormUpdated.vtex event listener');
  window.addEventListener('orderFormUpdated.vtex', handleOrderFormUpdate);

  // jQuery fallback for VTEX events
  if (window.jQuery) {
    console.log('💰 jQuery detected - adding jQuery-based orderFormUpdated.vtex listener');
    window.jQuery(window).on('orderFormUpdated.vtex', handleOrderFormUpdate);
  } else {
    console.log('⚠️ jQuery not available - using vanilla JS events only');
  }

  console.log('✅ setupEventListeners() completed');
};