# Supreme Tuning - WordPress Iframe Integration Guide

This guide explains how to embed the Supreme Tuning calculator in your WordPress website with **automatic height adjustment**.

## 🎯 Features

- ✅ **Dynamic Height Adjustment** - Iframe automatically resizes based on content
- ✅ **Smooth Transitions** - No jumpy resizing, smooth animations
- ✅ **Route Change Detection** - Height updates when user navigates
- ✅ **Mobile Responsive** - Works perfectly on all devices
- ✅ **No Manual Configuration** - Automatic detection and setup

## 📋 Installation Steps

### Step 1: Add the Receiver Script to WordPress

Add this code to your WordPress page where you want to embed the calculator.

**Option A: Using Custom HTML Block (Recommended)**

1. Edit your WordPress page
2. Add a "Custom HTML" block
3. Paste the following code:

```html
<script>
(function() {
  'use strict';
  
  const config = {
    iframeSelector: '#supreme-tuning-iframe',
    minHeight: 400,
    maxHeight: 10000,
    animationDuration: 300,
  };

  let iframe = null;

  function findIframe() {
    iframe = document.querySelector(config.iframeSelector);
    if (!iframe) {
      const iframes = document.querySelectorAll('iframe');
      for (let i = 0; i < iframes.length; i++) {
        if (iframes[i].src && (iframes[i].src.includes('supreme-tuning') || iframes[i].src.includes('localhost:3000'))) {
          iframe = iframes[i];
          break;
        }
      }
    }
    if (iframe) {
      iframe.setAttribute('scrolling', 'no');
      iframe.style.overflow = 'hidden';
      iframe.style.width = '100%';
      iframe.style.border = 'none';
    }
    return iframe;
  }

  function resizeIframe(height) {
    if (!iframe) return;
    const newHeight = Math.min(Math.max(height, config.minHeight), config.maxHeight);
    if (!iframe.style.transition) {
      iframe.style.transition = `height ${config.animationDuration}ms ease-out`;
    }
    iframe.style.height = newHeight + 'px';
  }

  function handleMessage(event) {
    const data = event.data;
    if (data && data.type === 'supremeTuningResize' && data.height) {
      resizeIframe(data.height);
    }
  }

  function init() {
    if (!findIframe()) {
      setTimeout(findIframe, 1000);
    }
    window.addEventListener('message', handleMessage, false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
</script>
```

**Option B: Using Theme Footer**

1. Go to Appearance → Theme File Editor
2. Open `footer.php`
3. Add the script above before the closing `</body>` tag

### Step 2: Add the Iframe to Your Page

Add another "Custom HTML" block with your iframe:

```html
<iframe 
  id="supreme-tuning-iframe"
  src="https://your-supreme-tuning-domain.com"
  width="100%"
  height="600"
  frameborder="0"
  scrolling="no"
  style="border: none; overflow: hidden; width: 100%;">
</iframe>
```

**Important:** 
- Replace `https://your-supreme-tuning-domain.com` with your actual domain
- The `id="supreme-tuning-iframe"` must match the `iframeSelector` in the script
- Initial height (600) will be automatically adjusted

### Step 3: Test the Integration

1. Save and preview your WordPress page
2. Open browser console (F12)
3. You should see messages like: `Supreme Tuning: Height sent to parent: 1234`
4. Navigate through the calculator - height should adjust automatically

## 🔧 Configuration Options

You can customize the behavior by modifying the `config` object:

```javascript
const config = {
  iframeSelector: '#supreme-tuning-iframe',  // CSS selector for your iframe
  minHeight: 400,                             // Minimum iframe height in pixels
  maxHeight: 10000,                           // Maximum iframe height in pixels
  animationDuration: 300,                     // Resize animation speed in ms
};
```

## 🎨 Styling Tips

### Remove Extra Space Around Iframe

Add this CSS to your WordPress page:

```css
<style>
#supreme-tuning-iframe {
  display: block;
  margin: 0;
  padding: 0;
}
</style>
```

### Add Container Padding

```css
<style>
.supreme-tuning-container {
  padding: 20px 0;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
```

## 🐛 Troubleshooting

### Iframe Not Resizing

1. Check browser console for errors
2. Verify the iframe `id` matches the `iframeSelector`
3. Make sure both scripts are loaded (check Network tab)
4. Verify the iframe `src` is correct

### Height Too Large/Small

Adjust `minHeight` and `maxHeight` in the config:

```javascript
minHeight: 500,  // Increase minimum
maxHeight: 5000, // Decrease maximum
```

### Jumpy Resizing

Increase the animation duration:

```javascript
animationDuration: 500,  // Slower, smoother
```

## 📱 Mobile Optimization

The calculator is fully responsive. For best mobile experience:

1. Ensure your WordPress theme is mobile-responsive
2. Don't set fixed widths on the iframe container
3. Test on actual mobile devices, not just browser resize

## ✅ Checklist

- [ ] Receiver script added to WordPress
- [ ] Iframe added with correct `id`
- [ ] Iframe `src` points to correct domain
- [ ] `scrolling="no"` attribute set on iframe
- [ ] Tested on desktop
- [ ] Tested on mobile
- [ ] Console shows height messages
- [ ] Height adjusts when navigating

## 🆘 Support

If you encounter issues:

1. Check browser console for error messages
2. Verify both scripts are loaded
3. Test with a simple iframe first
4. Contact support with console logs

---

**Last Updated:** 2025-12-17

