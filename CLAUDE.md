# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a VTEX IO Checkout UI Settings app for the HomeSentry store that uses modern development tools including Webpack, Preact, and SASS for checkout6 customization. It provides version-controlled checkout customizations with the benefits of A/B testing, rollback capabilities, and modern JavaScript/CSS tooling.

## Key Architecture

- **VTEX IO App**: Uses the `checkout-ui-custom` builder to deploy checkout customizations
- **Modern Development Stack**: Webpack + Preact + SASS for component-based development
- **Modular System**: Event-driven architecture with separate modules for different checkout features
- **Build Process**: Source files in `src/checkout6/` are compiled to `checkout-ui-custom/` for VTEX deployment
- **Component Architecture**: Preact components for dynamic checkout elements with module-based functionality

## Development Commands

### NPM Commands (Primary Development)
```bash
# Build for production
npm run build

# Build for development with source maps
npm run build:dev

# Watch for changes and rebuild automatically
npm run watch

# Format code with Prettier
npm run format

# Lint JavaScript/JSX files
npm run lint
```

### VTEX CLI Commands
```bash
# Development workflow:
vtex link              # Link local app to development workspace for testing
vtex publish           # Publish new app version
vtex install           # Install app in current workspace

# Workspace management:
vtex whoami            # Check current workspace and account
vtex workspace create [workspace-name]  # Create development workspace
vtex workspace use [workspace-name]     # Switch to workspace
vtex workspace delete [workspace-name]  # Delete workspace
vtex list              # List installed apps in current workspace

# Production deployment:
vtex workspace create production --production  # Create production workspace
vtex install           # Install app in production workspace
vtex workspace promote # Promote workspace to master after testing
```

### Development Workflow
1. Edit source files in `src/checkout6/`
2. Run `npm run watch` for automatic rebuilding
3. Test changes with `vtex link`
4. Build production version with `npm run build`
5. Publish with `vtex publish`

## Source Code Architecture

### Core Structure
```
src/checkout6/
├── components/          # Preact components for UI elements
├── modules/            # Feature modules with specific functionality
├── styles/             # Modular SASS stylesheets
├── index.js           # Main entry point and initialization
└── styles.scss        # Main SASS file importing all modules
```

### Component System
- **CartTitle.jsx**: Displays "Resumen de la compra" title in cart step
- **CouponTitle.jsx**: Shows "¿Tienes un cupón de descuento?" in summary section
- **RecommendedProducts.jsx**: Product recommendation carousel with VTEX API integration
- **CheckoutHeader.jsx**: Custom header component (currently disabled)

### Module System (Event-Driven Architecture)
- **eventHandlers.js**: Central event coordination for hash changes and order form updates
- **cartTitle.js**: Manages cart title insertion/removal based on checkout step
- **couponTitle.js**: Handles coupon title display in summary template
- **recommendedProducts.js**: Fetches and displays product recommendations from VTEX API
- **cartCheckboxes.js**: Terms and privacy acceptance checkboxes with form validation
- **checkoutSteps.js**: Visual checkout progress indicator
- **formEnhancements.js**: Placeholder text and form field improvements
- **shippingInfo.js**: Dynamic shipping information display

### Build Output
```
checkout-ui-custom/
├── checkout6-custom.css    # Compiled SASS (12.7 KiB)
├── checkout6-custom.js     # Bundled JavaScript with Preact (29.9 KiB)
└── checkout6-custom.js.LICENSE.txt
```

## Modern SASS Architecture

Uses `@use` instead of deprecated `@import` for better modularity:
- **styles.scss**: Main file using `@use './styles/module' as *;`
- **_recommended-products.scss**: Product carousel styling
- **_cart-title.scss**: Cart summary title styling
- **_coupon-title.scss**: Coupon section title styling

Variables and mixins are properly scoped with modern SASS API.

## Event-Driven System Design

The checkout customization uses a centralized event system that responds to:

### URL Hash Changes
- **Cart step** (`#/cart`): Activates cart title, coupon title, checkboxes, recommended products
- **Email/Profile steps**: Adds form placeholders and terms acceptance
- **Shipping step**: Updates checkout progress indicators
- **Payment step**: Final checkout step indicators

### VTEX Events
- **orderFormUpdated.vtex**: Triggered when cart contents change
- **hashchange**: Browser navigation between checkout steps
- All modules are re-initialized on these events for consistency

### Component Lifecycle
1. **Initialization**: `initializeCheckout()` sets up all modules for current step
2. **Hash Changes**: `handleHashChange()` updates modules based on new step
3. **Order Updates**: `handleOrderFormUpdate()` refreshes components after cart changes
4. **Cleanup**: Components automatically remove themselves when not relevant

## Development Patterns

### Adding New Components
1. Create component in `src/checkout6/components/ComponentName.jsx`
2. Create module in `src/checkout6/modules/componentName.js` with insert/remove functions
3. Import and call functions in `eventHandlers.js`
4. Add SASS file in `src/checkout6/styles/_component-name.scss`
5. Import SASS in `styles.scss` using `@use './styles/component-name' as *;`

### Creating Modules
Each module should export:
- `insertComponentName()`: Checks conditions and inserts component
- `removeComponentName()`: Cleans up component when conditions not met
- Follow pattern: check hash, find target element, create container, render component

### SASS Organization
- Use BEM methodology for class naming
- Create component-specific SASS files with `_filename.scss`
- Use modern `@use` syntax instead of `@import`
- Include responsive breakpoints in component files

## VTEX Integration Details

### Build Process Integration
- **webpack.config.js**: Configured with modern SASS API (`api: 'modern'`)
- **Preact aliases**: React/React-DOM mapped to Preact for smaller bundle size
- **Babel configuration**: JSX transpiled with Preact runtime
- **manifest.json**: VTEX app configuration with `checkout-ui-custom` builder

### VTEX API Integration
- **Product Recommendations**: Uses `/api/catalog_system/pub/products/search` endpoint
- **Cart Operations**: Integrates with `window.vtexjs.checkout.addToCart()` API
- **Order Form**: Responds to VTEX's native `orderFormUpdated.vtex` events

### Deployment Considerations
- **prereleasy script**: Runs `bash lint.sh` before VTEX publishing (configured in manifest.json)
- **Account-specific vendor**: `vendor: "homesentry"` must match VTEX account
- **Version immutability**: Each published version is permanent, enabling safe rollbacks

## Current Active Features

### Cart Step Enhancements
- **Cart Title**: "Resumen de la compra" inserted at start of `.checkout-container`
- **Coupon Title**: "¿Tienes un cupón de descuento?" in `.summary-template-holder`
- **Recommended Products**: VTEX API-powered product carousel after checkout container
- **Terms Checkboxes**: Required acceptance checkboxes with cart button disable logic

### Form Enhancements
- **International Support**: Enabled `.document-box` and `.phone-box` for global customers
- **Placeholder Text**: Spanish placeholders for email, name, and document fields
- **Validation**: Terms and privacy acceptance required before cart progression

### Visual Improvements
- **Empty Cart Styling**: Gradient backgrounds with decorative elements
- **Checkout Steps**: Visual progress indicator with step highlighting
- **Responsive Design**: Mobile-optimized layouts for all components