# PWA Icons

This directory contains the icons for the Progressive Web App.

## Required Icons

The following icon sizes need to be generated:

- `icon-72x72.png` - 72x72px
- `icon-96x96.png` - 96x96px
- `icon-128x128.png` - 128x128px
- `icon-144x144.png` - 144x144px
- `icon-152x152.png` - 152x152px
- `icon-192x192.png` - 192x192px
- `icon-384x384.png` - 384x384px
- `icon-512x512.png` - 512x512px
- `icon-512x512-maskable.png` - 512x512px (with safe zone for maskable icons)

Additionally, place `apple-touch-icon.png` (180x180px) in the `/public` directory.

## Icon Design Guidelines

### Base Icon
- Use a dart board or dart as the primary icon
- Colors should match the app theme (primary: #6366f1, background: #0f172a)
- Keep the design simple and recognizable at small sizes

### Maskable Icon
The maskable icon should:
- Have the icon centered in the middle 80% of the canvas
- Leave 10% padding on all sides (safe zone)
- Use a solid background color (#0f172a)

## Generating Icons

You can use the following tools to generate icons:

1. **PWA Asset Generator** (recommended)
   ```bash
   npx pwa-asset-generator [source-image.svg] public/icons --icon-only --padding "10%" --background "#0f172a"
   ```

2. **Figma/Sketch/Adobe XD**
   - Design your icon at 512x512px
   - Export at all required sizes

3. **Online Tools**
   - [RealFaviconGenerator](https://realfavicongenerator.net/)
   - [PWA Image Generator](https://www.pwabuilder.com/imageGenerator)

## Icon Requirements

- Format: PNG
- Color mode: RGB
- Bit depth: 24-bit (with alpha channel)
- Background: Solid color or transparent (depending on purpose)
- Quality: High quality, no compression artifacts

## Testing

After adding icons, test them:

1. Run `npm run build` to build the PWA
2. Serve the production build: `npm run preview`
3. Test on:
   - Chrome DevTools > Application > Manifest
   - iOS Safari > Share > Add to Home Screen
   - Android Chrome > Menu > Install App

## Current Status

⚠️ **Icons need to be generated and added to this directory**

Create the icons using the guidelines above and place them in this directory.
