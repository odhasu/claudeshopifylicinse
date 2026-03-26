/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

// All articles from the original ARTICLE_CONTENT
const articles = {
  "After Your Purchase": {
    section: "Getting Started",
    paragraphs: [
      "Right after your purchase you'll receive two emails: a payment receipt and a separate theme delivery email with your download link and license key.",
      "Your license key is a unique alphanumeric string that activates your theme on one Shopify store. Keep it somewhere safe — you'll need it if you ever re-install or change domains.",
      "You also gain access to the Vexel community where you can ask questions, share your store, and get tips from other successful resellers. The invite link is included in your delivery email.",
      "If you purchased the Pro plan, a member of our team will reach out within 24 hours to schedule your 1-on-1 setup call.",
    ],
  },
  "Auto-Generated Shopify Domains": {
    section: "License & Domain",
    paragraphs: [
      "When you create a Shopify store, it's automatically assigned a free subdomain in the format yourstore.myshopify.com. This is your permanent store URL and it never changes — even if you add a custom domain later.",
      "Your Vexel license is activated against this auto-generated domain. Every Shopify store has a unique myshopify.com URL that cannot be changed, which is why we use it as the license anchor.",
      "You can find your auto-generated domain at any time in Shopify Admin → Settings → Domains. It's listed as your 'Primary domain (myshopify.com)'.",
      "Even after connecting a custom domain (e.g. mystore.com), your myshopify.com domain continues to exist and your license remains valid.",
    ],
  },
  "License Activation Step-by-Step": {
    section: "License & Domain",
    paragraphs: [
      "Open your Shopify Admin and navigate to Online Store → Themes. Click 'Customize' on your active Vexel theme.",
      "In the theme editor, look for the 'Vexel License' section in the left sidebar. Click it to expand the license panel.",
      "Paste your license key into the 'License Key' field exactly as it appears in your purchase email — including any uppercase letters and hyphens.",
      "Click 'Activate'. You should see a green confirmation message within a few seconds. If you see an error, double-check that you copied the full key and that the domain shown matches the store you purchased for.",
      "Once activated, the license panel will display your activation date and the domain the license is bound to.",
    ],
  },
  "Finding Your Auto-Generated Domain": {
    section: "License & Domain",
    paragraphs: [
      "Your auto-generated Shopify domain is the unique yourstore.myshopify.com address assigned to your store when it was created.",
      "To find it: go to Shopify Admin → Settings → Domains. Your myshopify.com address is always listed — it appears even if you have a custom domain active.",
      "You can also find it in the browser address bar when you're in your Shopify admin — the URL always starts with yourstore.myshopify.com.",
      "This domain is permanent. It cannot be changed or deleted, which makes it the most reliable anchor for your license.",
    ],
  },
  "Activated on Wrong Domain?": {
    section: "License & Domain",
    paragraphs: [
      "If you accidentally activated your license on the wrong store, don't worry — contact our support team and we'll transfer the activation for you at no charge.",
      "Include your order number, the domain you activated on, and the domain you intended to use. We process transfer requests within 24 hours.",
      "Note: if your original store was suspended or banned by Shopify, Pro plan users are eligible for unlimited store remakes — meaning we'll generate a new license activation for your replacement store.",
      "Lite plan users who need a transfer due to a ban should also contact support — we handle these on a case-by-case basis.",
    ],
  },
  "Custom Domains and Your License": {
    section: "License & Domain",
    paragraphs: [
      "Connecting a custom domain (e.g. mystore.com) to your Shopify store does not affect your Vexel license. Your license is anchored to your permanent myshopify.com domain, not the custom one.",
      "You can change or remove your custom domain at any time without needing to re-activate your license.",
      "To connect a custom domain, go to Shopify Admin → Settings → Domains → 'Connect existing domain' and follow the DNS instructions for your domain registrar.",
      "If you purchased a domain through Shopify, it will be automatically connected. Your Vexel license remains valid regardless.",
    ],
  },
  "Accessing the Theme Editor": {
    section: "Theme Customization",
    paragraphs: [
      "The Shopify Theme Editor is where you configure all visual aspects of your Vexel store — no coding needed.",
      "To access it: Shopify Admin → Online Store → Themes. Find Vexel in your theme list and click 'Customize'.",
      "The editor opens in a split-screen view with a live preview on the right and a settings panel on the left. You can click any element in the preview to jump directly to its settings.",
      "Vexel sections include a Hero, Product Grid, Feature Highlights, Testimonials, and more. Each section can be reordered by dragging in the sidebar.",
    ],
  },
  "Changing Theme Language": {
    section: "Theme Customization",
    paragraphs: [
      "Vexel supports multiple languages through Shopify's built-in translation system. You can translate every piece of text in the theme without editing code.",
      "Go to Shopify Admin → Online Store → Themes → Actions (on Vexel) → 'Edit default theme content'. Every text string in the theme is listed here and can be overridden.",
      "If you need a full language translation, Shopify also supports apps like Langify or Weglot that automatically translate your storefront content.",
      "For right-to-left (RTL) languages, contact support — we have RTL-compatible builds available for certain language packs.",
    ],
  },
  "AI Chatbot Setup": {
    section: "Feature Guides",
    paragraphs: [
      "Vexel's built-in AI chatbot can answer common customer questions automatically — reducing your support load and increasing conversions.",
      "To set it up, open the Theme Editor and navigate to 'Vexel Settings' → 'AI Chatbot'. Toggle 'Enable AI Chatbot' to on.",
      "You can customize the chatbot's welcome message, personality tone, and knowledge base. The knowledge base accepts plain text — paste in your FAQs, product info, and policies.",
      "The chatbot widget appears as a floating button in the bottom-right corner of your store. It opens a compact chat panel when clicked.",
      "Response quality improves the more detailed your knowledge base text is. We recommend at least 300 words covering your most common customer questions.",
    ],
  },
  "Spin Wheel Setup": {
    section: "Feature Guides",
    paragraphs: [
      "The Spin Wheel is a gamified discount popup that increases email capture rates by up to 3×. Visitors spin for a chance to win discounts before leaving.",
      "Enable it from Theme Editor → Vexel Settings → Spin Wheel. Toggle 'Enable Spin Wheel' to on.",
      "Configure the wheel segments with discount codes and labels. You control the win probability for each segment — we recommend making one segment a guaranteed 5% off to ensure every player gets something.",
      "The spin wheel triggers automatically based on your configured rule: on page load after X seconds, on exit intent, or after scrolling 50% of the page.",
    ],
  },
  "Bundle Builder Setup": {
    section: "Feature Guides",
    paragraphs: [
      "The Bundle Builder lets customers create custom product bundles and receive an automatic discount, increasing average order value.",
      "Go to Theme Editor → Vexel Settings → Bundle Builder. Enable the feature and configure which products are eligible for bundling.",
      "Set your bundle discount tiers: e.g. Buy 2 get 10% off, Buy 3 get 20% off. These are applied automatically at checkout.",
      "The bundle section appears on product pages. Customers can add complementary products directly from a product listing without visiting each page individually.",
    ],
  },
  "Urgency Elements Setup": {
    section: "Feature Guides",
    paragraphs: [
      "Urgency elements — countdown timers, stock counters, and live visitor badges — create FOMO and push hesitant visitors to purchase.",
      "Enable them from Theme Editor → Vexel Settings → Urgency. Toggle individual elements on/off: Countdown Timer, Low Stock Warning, Live Visitor Count.",
      "The countdown timer can be set to a fixed end date (for flash sales) or a rolling timer that resets per visitor session.",
      "Stock counters show a 'Only X left!' message below the Add to Cart button. You can set a threshold — the counter only shows when real inventory drops below that number.",
    ],
  },
  "Product Grid Setup": {
    section: "Feature Guides",
    paragraphs: [
      "Vexel's product grid supports multiple layout styles, quick-view overlays, and custom sorting.",
      "Configure the grid from Theme Editor → Sections → Product Grid. Choose between 2, 3, or 4 column layouts, and enable/disable features like Quick View, Wishlist, and Compare.",
      "You can create multiple collection pages with different grid configurations — useful if you sell different product types.",
      "The grid supports lazy loading for performance, meaning images load as the visitor scrolls rather than all at once on page load.",
    ],
  },
  "Reviews & Testimonials": {
    section: "Feature Guides",
    paragraphs: [
      "Social proof is critical for conversions. Vexel includes a flexible testimonials section and integrates with Shopify's native review apps.",
      "For manual testimonials, go to Theme Editor → Sections → Testimonials. Add up to 12 testimonial cards with customer name, photo, star rating, and review text.",
      "For real product reviews, install a reviews app like Judge.me or Yotpo from the Shopify App Store. Vexel's product pages automatically display review widgets from these apps.",
      "The homepage testimonials section supports a carousel view on mobile and a grid view on desktop, automatically switching based on screen size.",
    ],
  },
  "Understanding myshopify.com domains": {
    section: "License & Domain",
    paragraphs: [
      "Every Shopify store receives a permanent, unique subdomain ending in .myshopify.com when it's created. This URL is your store's unchangeable identifier within the Shopify platform.",
      "Even after you connect a custom domain like yourbrand.com, the myshopify.com URL continues to work in parallel. Shopify uses it internally for admin access, app integrations, and license verification.",
      "Your Vexel license is bound to this myshopify.com domain because it's permanent — unlike custom domains which can be changed at any time.",
      "If you ever forget your myshopify.com address: go to Shopify Admin → Settings → Domains. It's always listed there.",
    ],
  },
  "Troubleshooting": {
    section: "Troubleshooting",
    paragraphs: [
      "If something isn't working as expected, start with the basics: clear your browser cache and try in an incognito window. Many display issues are caused by cached assets.",
      "For license activation errors: double-check you've copied the full license key, including all characters and hyphens. The key is case-sensitive.",
      "If theme sections look broken or images aren't loading, re-upload the theme file. Shopify occasionally has upload issues that corrupt partial files.",
      "For any issue you can't resolve on your own, contact our support team via the Support page. Include your order number, store URL, and a brief description of the problem for the fastest response.",
    ],
  },
};

function titleToSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function createMarkdownFile(title, data) {
  const slug = titleToSlug(title);
  const content = `---
title: ${title}
section: ${data.section}
---

${data.paragraphs.join('\n\n')}
`;

  const docsDir = path.join(__dirname, '..', '..', 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  const filePath = path.join(docsDir, `${slug}.md`);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Created ${slug}.md`);
}

// Main execution
console.log('Converting articles to markdown...\n');

Object.entries(articles).forEach(([title, data]) => {
  createMarkdownFile(title, data);
});

console.log(`\n✨ Done! Created ${Object.keys(articles).length} markdown files in /docs`);
