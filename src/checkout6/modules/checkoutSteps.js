import { $ } from '../utils/dom.js'

// Checkout step management constants
const STEP_CLASSES = {
  cart: 'cart-step',
  info: 'info-step',
  shipping: 'shipping-step',
  payment: 'payment-step',
}

const ALL_STEPS_CLASS = 'step2 step3 step4 active done'

const setStepState = (wrapper, steps, stepClass, doneSteps, activeStep) => {
  wrapper.classList.add(stepClass)

  doneSteps.forEach((step) => {
    steps.forEach((stepEl) => {
      if (stepEl.classList.contains(step)) {
        stepEl.classList.add('done')
      }
    })
  })

  steps.forEach((stepEl) => {
    if (stepEl.classList.contains(activeStep)) {
      stepEl.classList.add('active')
    }
  })
}

export const checkoutStepsReader = () => {
  console.log('📈 checkoutStepsReader() - Reading and updating checkout steps')

  const hash = window.location.hash
  console.log(`🌐 Current hash: ${hash}`)

  const wrapper = $.select('.checkout-steps-custom')
  const steps = $.selectAll('.checkout-steps-custom .checkout-step')

  console.log(`📦 Found wrapper: ${!!wrapper}, Found steps: ${steps.length}`)

  if (!wrapper || !steps.length) {
    console.log('⚠️ Checkout steps wrapper or steps not found - skipping step update')
    return
  }

  // Remove all step classes
  wrapper.className = wrapper.className.replace(new RegExp(ALL_STEPS_CLASS.split(' ').join('|'), 'g'), '')

  steps.forEach((step) => {
    step.className = step.className.replace(new RegExp(ALL_STEPS_CLASS.split(' ').join('|'), 'g'), '')
  })

  // Set appropriate step state based on hash
  if (hash.includes('cart')) {
    steps.forEach((step) => {
      if (step.classList.contains(STEP_CLASSES.cart)) {
        step.classList.add('active')
      }
    })
  } else if (hash.includes('email') || hash.includes('profile')) {
    setStepState(wrapper, steps, 'step2', [STEP_CLASSES.cart], STEP_CLASSES.info)
  } else if (hash.includes('shipping')) {
    setStepState(wrapper, steps, 'step3', [STEP_CLASSES.cart, STEP_CLASSES.info], STEP_CLASSES.shipping)
  } else if (hash.includes('payment')) {
    setStepState(
      wrapper,
      steps,
      'step4',
      [STEP_CLASSES.cart, STEP_CLASSES.info, STEP_CLASSES.shipping],
      STEP_CLASSES.payment
    )
  }
}
