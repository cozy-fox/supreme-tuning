# WordPress Iframe Embedding Guide

## Overview

This guide explains how to embed the Supreme Tuning calculator into your WordPress site with **dynamic height adjustment** and **responsive design**.

## Key Features

✅ **Dynamic Height** - Iframe automatically resizes based on content  
✅ **Single-Stage View** - Shows one tuning stage at a time to reduce vertical space  
✅ **Responsive** - Adapts to all screen sizes  
✅ **Professional Design** - Maintains visual quality  

---

## Step 1: Add the Iframe to WordPress

Add this HTML code to your WordPress page (use HTML block or Custom HTML widget):

```html
<div id="supreme-tuning-container">
  <iframe 
    id="supreme-tuning-iframe"
    src="https://YOUR-DOMAIN.com" 
    width="100%" 
    height="800px"
    style="border: none; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); transition: height 0.3s ease;"
    title="Supreme Tuning Calculator"
    scrolling="no"
  ></iframe>
</div>
```

**Replace `https://YOUR-DOMAIN.com` with your actual domain!**

---

## Step 2: Add Dynamic Height JavaScript

Add this JavaScript code to your WordPress theme (in `footer.php` or use a plugin like "Insert Headers and Footers"):

```html
<script>
(function() {
  // Listen for height messages from the iframe
  window.addEventListener('message', function(event) {
    // Security: Verify the origin (replace with your actual domain)
    // if (event.origin !== 'https://YOUR-DOMAIN.com') return;
    
    if (event.data && event.data.type === 'supremeTuningHeight') {
      const iframe = document.getElementById('supreme-tuning-iframe');
      if (iframe && event.data.height) {
        // Add some padding to prevent scrollbars
        const newHeight = event.data.height + 20;
        iframe.style.height = newHeight + 'px';
      }
    }
  }, false);
})();
</script>
```

---

## Step 3: Optional - Add Responsive Container

For better responsive behavior, wrap the iframe in a responsive container:

```html
<style>
.supreme-tuning-responsive {
  position: relative;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

@media (max-width: 768px) {
  .supreme-tuning-responsive {
    padding: 10px;
  }
}
</style>

<div class="supreme-tuning-responsive">
  <iframe 
    id="supreme-tuning-iframe"
    src="https://YOUR-DOMAIN.com" 
    width="100%" 
    height="800px"
    style="border: none; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); transition: height 0.3s ease;"
    title="Supreme Tuning Calculator"
    scrolling="no"
  ></iframe>
</div>
```

---

## How It Works

### 1. **Dynamic Height Communication**

The app sends its height to WordPress using `postMessage`:

```javascript
window.parent.postMessage({
  type: 'supremeTuningHeight',
  height: document.documentElement.scrollHeight
}, '*');
```

WordPress listens and adjusts the iframe height automatically.

### 2. **Single-Stage Carousel**

Instead of showing all tuning stages at once (which creates a very tall page), the app now shows:
- **One stage at a time**
- **Previous/Next navigation buttons**
- **Stage indicator** (e.g., "Stage 1 ECO (1/3)")

This keeps the height consistent across all pages!

### 3. **Responsive Design**

The app detects the iframe width and adjusts:
- **Desktop**: Full layout with all features
- **Tablet**: Compact layout, single column
- **Mobile**: Ultra-compact, optimized for small screens

---

## Testing

1. **Test on Desktop** - Open WordPress page, verify calculator loads
2. **Test Height Changes** - Navigate through brands/models, verify iframe resizes smoothly
3. **Test on Mobile** - Check responsive behavior on phone/tablet
4. **Test Stage Navigation** - Verify Previous/Next buttons work on results page

---

## Troubleshooting

### Iframe not resizing?

- Check browser console for errors
- Verify the JavaScript is loaded (check footer.php or plugin)
- Uncomment the origin check and set your domain

### Content cut off?

- Increase the padding in JavaScript: `const newHeight = event.data.height + 50;`
- Check if WordPress theme has conflicting CSS

### Scrollbars appearing?

- Add `overflow: hidden;` to iframe style
- Set `scrolling="no"` attribute on iframe

---

## Advanced: Security

For production, uncomment and configure the origin check:

```javascript
if (event.origin !== 'https://supremetuning.nl') return;
```

This prevents other sites from sending fake height messages.

---

## Support

If you encounter issues, check:
1. Browser console for JavaScript errors
2. Network tab to verify iframe loads
3. Responsive design tools to test different screen sizes

