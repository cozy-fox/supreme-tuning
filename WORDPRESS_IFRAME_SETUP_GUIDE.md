# Supreme Tuning - WordPress Iframe Integration Guide

This guide will help you embed the Supreme Tuning calculator into your WordPress website with **dynamic height adjustment**.

## 📋 Overview

The Supreme Tuning app automatically sends its height to the parent WordPress page, and the WordPress page adjusts the iframe height accordingly. This ensures:
- ✅ No scrollbars inside the iframe
- ✅ Smooth height transitions when navigating
- ✅ Perfect fit on all devices (mobile, tablet, desktop)

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Add the JavaScript to WordPress

You have **3 options** to add the JavaScript:

#### **Option A: Using a Plugin (Easiest)**
1. Install the plugin **"Insert Headers and Footers"** or **"Code Snippets"**
2. Go to **Settings → Insert Headers and Footers**
3. Paste the script from `public/wordpress-iframe-integration.js` into the **Footer** section
4. Save changes

#### **Option B: Add to Theme Functions**
1. Go to **Appearance → Theme File Editor**
2. Open `functions.php`
3. Add this code at the end:

```php
function supreme_tuning_iframe_script() {
    ?>
    <script>
    // Paste the content of wordpress-iframe-integration.js here
    </script>
    <?php
}
add_action('wp_footer', 'supreme_tuning_iframe_script');
```

#### **Option C: Enqueue as External File**
1. Upload `wordpress-iframe-integration.js` to your theme folder (e.g., `/wp-content/themes/your-theme/js/`)
2. Add to `functions.php`:

```php
function supreme_tuning_enqueue_scripts() {
    wp_enqueue_script(
        'supreme-tuning-iframe',
        get_template_directory_uri() . '/js/wordpress-iframe-integration.js',
        array(),
        '1.0.0',
        true
    );
}
add_action('wp_enqueue_scripts', 'supreme_tuning_enqueue_scripts');
```

---

### Step 2: Add the Iframe to Your Page

1. Create or edit a WordPress page
2. Switch to **HTML/Code editor** (not Visual editor)
3. Add this iframe code:

```html
<iframe 
    id="supreme-tuning-iframe"
    src="https://your-supreme-tuning-domain.com"
    style="width: 100%; border: none; overflow: hidden; min-height: 400px;"
    scrolling="no"
    frameborder="0"
    title="Supreme Tuning Calculator">
</iframe>
```

**Important:** 
- The `id="supreme-tuning-iframe"` is **required** (the script looks for this ID)
- Replace `https://your-supreme-tuning-domain.com` with your actual Supreme Tuning app URL

---

### Step 3: Test It!

1. Save and publish your WordPress page
2. Open the page in your browser
3. Open browser console (F12) and check for messages:
   - ✅ `Supreme Tuning: WordPress iframe integration initialized`
   - ✅ `Supreme Tuning: Iframe resized to XXXpx`

4. Navigate through the calculator and watch the iframe height adjust automatically

---

## 🎨 Styling Options

### Full Width Container
```html
<div style="width: 100%; max-width: 1200px; margin: 0 auto;">
    <iframe id="supreme-tuning-iframe" src="..."></iframe>
</div>
```

### With Padding
```html
<div style="padding: 20px;">
    <iframe id="supreme-tuning-iframe" src="..."></iframe>
</div>
```

### Responsive Container
```html
<div class="supreme-tuning-container">
    <iframe id="supreme-tuning-iframe" src="..."></iframe>
</div>

<style>
.supreme-tuning-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 15px;
}

@media (max-width: 768px) {
    .supreme-tuning-container {
        padding: 0;
    }
}
</style>
```

---

## ⚙️ Configuration Options

You can customize the script behavior by editing these values in `wordpress-iframe-integration.js`:

```javascript
const config = {
    iframeId: 'supreme-tuning-iframe',  // Change if you use a different ID
    minHeight: 400,                      // Minimum iframe height (px)
    maxHeight: 10000,                    // Maximum iframe height (px)
    transitionDuration: '0.3s',          // Smooth transition speed
    debug: true                          // Set to false to hide console logs
};
```

---

## 🔧 Troubleshooting

### Issue: Iframe height not updating
**Solutions:**
1. Check browser console for errors
2. Verify the iframe has `id="supreme-tuning-iframe"`
3. Make sure the JavaScript is loaded (check Network tab in DevTools)
4. Clear WordPress cache (if using a caching plugin)

### Issue: Console shows "Iframe not found"
**Solution:** The iframe ID doesn't match. Either:
- Change iframe to `id="supreme-tuning-iframe"`, OR
- Change `iframeId` in the config to match your iframe ID

### Issue: Height jumps or flickers
**Solution:** Adjust the `transitionDuration` in config:
```javascript
transitionDuration: '0.5s'  // Slower, smoother
```

### Issue: Too much white space below iframe
**Solution:** Reduce `minHeight` in config:
```javascript
minHeight: 300  // Smaller minimum height
```

---

## 📱 Mobile Optimization

The iframe is already optimized for mobile, but you can add these CSS rules for better mobile experience:

```css
@media (max-width: 768px) {
    #supreme-tuning-iframe {
        min-height: 600px !important;
    }
}
```

---

## ✅ Checklist

- [ ] JavaScript added to WordPress (footer)
- [ ] Iframe added to page with correct ID
- [ ] Iframe src points to your Supreme Tuning app URL
- [ ] Page published and tested
- [ ] Console shows initialization message
- [ ] Height adjusts when navigating through calculator
- [ ] Tested on mobile, tablet, and desktop
- [ ] No scrollbars inside iframe
- [ ] Smooth transitions between pages

---

## 🆘 Need Help?

If you encounter any issues:
1. Check browser console (F12) for error messages
2. Verify all steps above are completed
3. Test in different browsers
4. Disable WordPress caching plugins temporarily
5. Check that your Supreme Tuning app is accessible

---

**That's it!** Your Supreme Tuning calculator should now be fully integrated with dynamic height adjustment. 🚀

