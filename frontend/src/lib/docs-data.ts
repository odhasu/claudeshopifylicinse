import { Rocket, Key, Palette, Zap, Wrench, FileText } from "lucide-react";

export const SIDEBAR_NAV = [
  {
    id: "getting-started",
    section: "Getting Started",
    items: [
      "Quick Start Guide",
      "Downloading Your Theme",
      "Installing in Shopify",
      "After Your Purchase",
    ],
  },
  {
    id: "license-domain",
    section: "License & Domain",
    items: [
      "Understanding Your License",
      "Auto-Generated Shopify Domains",
      "License Activation Step-by-Step",
      "Finding Your Auto-Generated Domain",
      "Activated on Wrong Domain?",
      "Custom Domains and Your License",
    ],
  },
  {
    id: "theme-customization",
    section: "Theme Customization",
    items: [
      "Colors & Branding Setup",
      "Accessing the Theme Editor",
      "Changing Theme Language",
    ],
  },
  {
    id: "feature-guides",
    section: "Feature Guides",
    items: [
      "AI Chatbot Setup",
      "Spin Wheel Setup",
      "Bundle Builder Setup",
      "Urgency Elements Setup",
      "Product Grid Setup",
      "Reviews & Testimonials",
    ],
  },
];

export const CATEGORIES = [
  {
    icon: Rocket,
    title: "Getting Started",
    subtitle: "Purchase to live store in 15 min",
    count: 4,
    iconClass: "text-violet-600 bg-violet-50",
    firstArticle: "Quick Start Guide",
  },
  {
    icon: Key,
    title: "License & Domain",
    subtitle: "Understanding your license and activation",
    count: 6,
    iconClass: "text-blue-600 bg-blue-50",
    firstArticle: "Understanding Your License",
  },
  {
    icon: Palette,
    title: "Theme Customization",
    subtitle: "Colors, branding, and feature setup",
    count: 3,
    iconClass: "text-pink-600 bg-pink-50",
    firstArticle: "Colors & Branding Setup",
  },
  {
    icon: Zap,
    title: "Feature Guides",
    subtitle: "AI chatbot, spin wheel, bundles, and more",
    count: 6,
    iconClass: "text-amber-600 bg-amber-50",
    firstArticle: "AI Chatbot Setup",
  },
  {
    icon: Wrench,
    title: "Troubleshooting",
    subtitle: "Common issues and how to fix them",
    count: 5,
    iconClass: "text-red-600 bg-red-50",
    firstArticle: "Troubleshooting",
  },
  {
    icon: FileText,
    title: "Plans & Policies",
    subtitle: "Lite vs Pro, bans, and refunds",
    count: 5,
    iconClass: "text-emerald-600 bg-emerald-50",
    firstArticle: "Understanding Your License",
  },
];

export const POPULAR_ARTICLES = [
  "Quick Start Guide",
  "Understanding myshopify.com domains",
  "License Activation Step-by-Step",
  "AI Chatbot Setup",
  "Colors & Branding Setup",
];

export const ARTICLE_CONTENT: Record<string, { section: string; paragraphs: string[] }> = {
  "Quick Start Guide": {
    section: "Getting Started",
    paragraphs: [
      "Welcome to Vexel! This guide walks you through getting your store live in under 15 minutes. Before you begin, make sure you have access to your purchase confirmation email — it contains your theme download link and license key.",
      "Step 1 — Download your theme: Open the confirmation email and click 'Download Theme'. Save the .zip file to your computer. Do not unzip it.",
      "Step 2 — Upload to Shopify: Log in to your Shopify admin, navigate to Online Store → Themes, click 'Add theme' → 'Upload zip file', and select the file you downloaded.",
      "Step 3 — Activate & customize: Once uploaded, click 'Actions' → 'Publish' to make it your active theme. Then click 'Customize' to open the theme editor and configure colors, add your logo, and set up your product pages.",
      "Congratulations — your store is live! For detailed customization options, browse the sections in the sidebar.",
    ],
  },
  "Downloading Your Theme": {
    section: "Getting Started",
    paragraphs: [
      "Your theme file is available immediately after purchase. You'll receive a confirmation email with a direct download link within minutes of completing your order.",
      "If you can't find the email, check your spam folder or log in to your Account dashboard and navigate to Purchases — your download link will always be available there.",
      "The theme downloads as a .zip archive. Keep this file as-is; Shopify requires the compressed format when uploading. Do not unzip or rezip the file as this may corrupt the package.",
      "If your download link has expired or you've lost access, contact support and we'll generate a fresh link for you right away.",
    ],
  },
  "Installing in Shopify": {
    section: "Getting Started",
    paragraphs: [
      "Installing Vexel in Shopify takes about 2 minutes. Go to your Shopify Admin and navigate to Online Store → Themes.",
      "Click 'Add theme' in the top-right corner, then select 'Upload zip file'. Choose the Vexel .zip file from your computer and click 'Upload'.",
      "Shopify will process the upload (usually takes 10–30 seconds). Once complete, your new theme will appear in the theme library under 'Unpublished themes'.",
      "Click 'Actions' → 'Publish' to make Vexel your active storefront theme. You can now click 'Customize' to start configuring it.",
    ],
  },
  "After Your Purchase": {
    section: "Getting Started",
    paragraphs: [
      "Right after your purchase you'll receive two emails: a payment receipt and a separate theme delivery email with your download link and license key.",
      "Your license key is a unique alphanumeric string that activates your theme on one Shopify store. Keep it somewhere safe — you'll need it if you ever re-install or change domains.",
      "You also gain access to the Vexel community where you can ask questions, share your store, and get tips from other successful resellers. The invite link is included in your delivery email.",
      "If you purchased the Pro plan, a member of our team will reach out within 24 hours to schedule your 1-on-1 setup call.",
    ],
  },
  "Understanding Your License": {
    section: "License & Domain",
    paragraphs: [
      "Your Vexel license grants you the right to use the theme on one active Shopify store at a time. The license is tied to your Shopify store's domain — either an auto-generated myshopify.com domain or a custom domain you've connected.",
      "A single license does NOT cover multiple stores. If you want to run two separate stores, you'll need two separate licenses.",
      "Your license includes lifetime updates for the version tier you purchased (Lite or Pro). If we release a new major version, existing license holders receive a discounted upgrade path.",
      "License transfers are possible — contact support if you need to move your license to a different store or if your store was banned.",
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
  "Colors & Branding Setup": {
    section: "Theme Customization",
    paragraphs: [
      "Vexel's color system lets you match your store's branding in minutes. All color controls are accessible from the Theme Editor — no code required.",
      "Open Shopify Admin → Online Store → Themes → Customize. In the left sidebar, click 'Theme settings' → 'Colors'. You'll see controls for primary, secondary, background, and text colors.",
      "For best results, use your brand's hex color codes. Set the Primary color to your main brand color — this affects buttons, links, and accent elements throughout the theme.",
      "Logo upload is under Theme settings → Header. We recommend a PNG with a transparent background at 400×120px or similar wide format.",
      "Changes are previewed live in the editor. Click 'Save' when you're happy with the result.",
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
