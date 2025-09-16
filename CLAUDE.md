# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a VTEX IO Checkout UI Settings app for the HomeSentry store. It's a specialized VTEX app that allows customization of the checkout experience through CSS and JavaScript files, providing an alternative to direct admin interface customization with the benefits of version control, A/B testing, and rollback capabilities.

## Key Architecture

- **VTEX IO App**: Uses the `checkout-ui-custom` builder to deploy checkout customizations
- **File-based Customizations**: CSS and JavaScript files in the `checkout-ui-custom/` directory are automatically applied to checkout pages
- **Version-controlled Deployments**: Scripts are linked to specific app versions, enabling safe rollbacks
- **Multi-checkout Support**: Supports different checkout versions (checkout5, checkout6, checkout-confirmation, checkout-instore)

## Development Commands

This project uses VTEX CLI and Yarn for development and deployment:

```bash
# Development workflow:
vtex link              # Link local app to development workspace for testing
vtex publish           # Publish new app version
vtex install           # Install app in current workspace

# Pre-publish checks (from manifest.json):
bash lint.sh           # Runs yarn, yarn format, and yarn lint
yarn                   # Install dependencies
yarn format            # Format code
yarn lint              # Lint code

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

## File Structure

- `manifest.json` - VTEX app configuration with checkout-ui-custom builder
- `checkout-ui-custom/` - Checkout customization files:
  - `checkout5-custom.css/js` - Legacy checkout (VTEX Checkout v5)
  - `checkout6-custom.css/js` - Current checkout (VTEX Checkout v6)
  - `checkout-confirmation-custom.css/js` - Order confirmation page
  - `checkout-instore-custom.css/js` - In-store checkout interface
- `docs/README.md` - Detailed setup and configuration instructions
- `lint.sh` - Pre-publish script for code quality checks
- `CHANGELOG.md` - Version history and changes

## Checkout Customization Architecture

**File Targeting**: Each file targets specific checkout contexts:
- `checkout5-*` - Legacy checkout interface (older VTEX stores)
- `checkout6-*` - Modern checkout interface (current default)
- `checkout-confirmation-*` - Post-purchase confirmation page
- `checkout-instore-*` - Physical store checkout (VTEX inStore)

**CSS Customizations**: Common patterns in existing customizations:
- `.document-box { display: block; }` - Enable foreign document input
- `.phone-box { display: block; }` - Enable international phone input
- Checkout6 inherits styles from checkout5 with version-specific overrides

**JavaScript Customizations**: Currently minimal, but supports:
- Custom checkout behavior modifications
- Form validation enhancements
- Third-party integrations (analytics, payment methods)

## Development Guidelines

**Making Customizations**:
- Edit CSS/JS files in `checkout-ui-custom/` directory
- Target the appropriate checkout version (checkout5 vs checkout6)
- Test changes in development workspace before publishing
- Always run `bash lint.sh` before publishing (enforced by manifest.json)

**Version Management**:
- Each published version becomes immutable
- Checkout scripts are tied to specific app versions
- Use semantic versioning for releases
- Update CHANGELOG.md for all releases

**Safety Considerations**:
- Custom scripts are not officially supported by VTEX
- Always test thoroughly in development workspace
- Scripts can potentially break checkout functionality
- Keep customizations minimal and well-documented

**Deployment Workflow**:
1. Create development workspace
2. Link app to workspace for testing
3. Test checkout functionality thoroughly
4. Create production workspace
5. Install app in production workspace
6. Verify functionality in production environment
7. Promote workspace to master

## Important Notes

**Checkout Version Compatibility**: This app supports multiple checkout versions. Checkout6 is the current standard, but checkout5 files are maintained for backward compatibility.

**Script Warnings**: All JavaScript files include VTEX disclaimers about unsupported usage and potential risks to store functionality.

**Housekeeper Integration**: VTEX's Housekeeper service automatically updates app versions in accounts, ensuring stores receive the latest customizations.

**Account-specific Vendor**: The `vendor` field in manifest.json must match the VTEX account name where the app will be installed.

## Current Customizations

**Document and Phone Fields**: The primary customization enables display of foreign document and international phone input fields in the checkout form, supporting international customers.

**Version Inheritance**: Checkout6 inherits base styles from checkout5 with additional version-specific customizations applied on top.