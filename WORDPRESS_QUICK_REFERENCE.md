# WordPress Iframe Integration - Quick Reference

## 📦 Files You Need

1. **`public/wordpress-iframe-integration.js`** - JavaScript for WordPress
2. **`WORDPRESS_IFRAME_SETUP_GUIDE.md`** - Complete setup instructions
3. **`public/wordpress-test-page.html`** - Test page to verify integration

---

## ⚡ Quick Copy-Paste Code

### 1️⃣ JavaScript for WordPress Footer

```javascript
(function() {
  'use strict';
  const config = {
    iframeId: 'supreme-tuning-iframe',
    minHeight: 400,
    maxHeight: 10000,
    transitionDuration: '0.3s',
    debug: false
  };
  function getIframe() {
    return document.getElementById(config.iframeId);
  }
  function resizeIframe(height) {
    const iframe = getIframe();
    if (!iframe) return;
    const validHeight = Math.max(config.minHeight, Math.min(height, config.maxHeight));
    iframe.style.transition = `height ${config.transitionDuration} ease`;
    iframe.style.height = validHeight + 'px';
  }
  function handleMessage(event) {
    const data = event.data;
    if (!data || typeof data !== 'object') return;
    if (data.type === 'supremeTuningResize' && data.height) {
      resizeIframe(data.height);
    }
  }
  function init() {
    window.addEventListener('message', handleMessage, false);
    setTimeout(() => {
      const iframe = getIframe();
      if (iframe) {
        iframe.style.height = config.minHeight + 'px';
        iframe.style.width = '100%';
        iframe.style.border = 'none';
        iframe.style.overflow = 'hidden';
      }
    }, 100);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

### 2️⃣ Iframe HTML for WordPress Page

```html
<iframe 
    id="supreme-tuning-iframe"
    src="https://your-supreme-tuning-url.com"
    style="width: 100%; border: none; overflow: hidden; min-height: 400px;"
    scrolling="no"
    frameborder="0"
    title="Supreme Tuning Calculator">
</iframe>
```

---

## 🎯 Implementation Steps

1. **Add JavaScript to WordPress**
   - Use plugin "Insert Headers and Footers"
   - Paste JavaScript in Footer section
   - Save

2. **Add Iframe to Page**
   - Create/edit WordPress page
   - Switch to HTML editor
   - Paste iframe code
   - Replace `src` with your URL
   - Publish

3. **Test**
   - Open page in browser
   - Press F12 (console)
   - Navigate through calculator
   - Watch height adjust automatically

---

## 🧪 Local Testing

Before deploying to WordPress, test locally:

1. Open `public/wordpress-test-page.html` in browser
2. Make sure your Next.js app is running on `localhost:3000`
3. Navigate through the calculator
4. Check the debug console on the test page

---

## 🔑 Important Notes

- ✅ Iframe ID **must be** `supreme-tuning-iframe` (or update config)
- ✅ Set `scrolling="no"` on iframe
- ✅ Set `overflow: hidden` in iframe style
- ✅ JavaScript must be in footer (after iframe loads)
- ✅ Clear WordPress cache after adding script

---

## 📱 Responsive CSS (Optional)

Add this to your WordPress theme CSS:

```css
#supreme-tuning-iframe {
    width: 100% !important;
    border: none !important;
    overflow: hidden !important;
}

@media (max-width: 768px) {
    #supreme-tuning-iframe {
        min-height: 600px !important;
    }
}
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Height not updating | Check iframe ID matches config |
| Console errors | Verify JavaScript is loaded |
| White space below | Reduce `minHeight` in config |
| Flickering | Increase `transitionDuration` |

---

## 📞 Support

Check browser console (F12) for debug messages:
- `Supreme Tuning: WordPress iframe integration initialized` ✅
- `Supreme Tuning: Iframe resized to XXXpx` ✅

If you see these messages, integration is working correctly!

