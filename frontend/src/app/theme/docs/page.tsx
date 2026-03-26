"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown, ChevronRight, ChevronLeft, Search, Rocket, Key,
  Palette, Zap, Wrench, FileText, ArrowRight, BookOpen,
  ArrowLeft, ThumbsUp, ThumbsDown, Menu, X,
} from "lucide-react";
import { ChatWidget } from "@/components/ChatWidget";

// ─── Article content ──────────────────────────────────────────────────────────
const ARTICLES: Record<string, { section: string; htmlContent: string }> = {
  "Quick Start Guide": {
    section: "Getting Started",
    htmlContent: `<h2>Welcome to Vexel</h2><p>Get your Shopify store live in under 15 minutes by following these steps.</p><ol><li><strong>Purchase a license</strong> — Choose Lite or Pro from the pricing page and complete checkout.</li><li><strong>Download your theme</strong> — Log in to your account portal and click <strong>Download Theme</strong>.</li><li><strong>Install in Shopify</strong> — Go to <em>Shopify Admin → Online Store → Themes → Add Theme → Upload ZIP file</em>.</li><li><strong>Enter your license key</strong> — In the Shopify Theme Editor, find the <strong>License & Protection</strong> section and paste your key.</li><li><strong>Publish</strong> — Click <strong>Publish</strong> in the Shopify Theme Editor. Your store is live!</li></ol><p>If you run into any issues, check the Troubleshooting section or contact support.</p>`,
  },
  "Downloading Your Theme": {
    section: "Getting Started",
    htmlContent: `<h2>Downloading Your Theme</h2><p>After purchasing Vexel, you'll need to download the theme files to install in your Shopify store.</p><h2>Where to Download</h2><p>Your theme is available in the <strong>Customer Portal</strong>:</p><ol><li>Go to your account page on this site</li><li>Log in with your license key</li><li>Click the <strong>Download Theme</strong> button</li></ol><p>A ZIP file will download to your computer.</p><h2>Common Download Issues</h2><h3>"Forbidden" Error</h3><p>If you see a "Forbidden" error when trying to download:</p><ul><li>Make sure you are logged in with a valid license key</li><li>Check that your license has not expired</li><li>Contact support if the issue persists</li></ul><h3>File Won't Open</h3><p>Make sure you don't extract the ZIP file before uploading to Shopify. Shopify requires the ZIP file to be uploaded as-is.</p>`,
  },
  "Installing in Shopify": {
    section: "Getting Started",
    htmlContent: `<h2>Installing in Shopify</h2><p>Follow these steps to install your Vexel theme in Shopify.</p><ol><li>Go to your <strong>Shopify Admin</strong></li><li>Navigate to <strong>Online Store → Themes</strong></li><li>Click <strong>Add theme → Upload ZIP file</strong></li><li>Select the Vexel ZIP file you downloaded</li><li>Wait for the upload to complete</li><li>Click <strong>Customize</strong> to open the Theme Editor</li></ol><h2>After Uploading</h2><p>Your theme will appear under "Theme library." It won't be live until you click <strong>Publish</strong>. Before publishing, make sure to enter your license key in the Theme Editor.</p><h2>License Key Setup</h2><p>In the Theme Editor, look for the <strong>License & Protection</strong> section in the left sidebar. Paste your license key and save. The theme will validate the key automatically.</p>`,
  },
  "After Your Purchase": {
    section: "Getting Started",
    htmlContent: `<h2>After Your Purchase</h2><p>Here's what to do right after completing your purchase.</p><h2>Check Your Email</h2><p>You should receive a confirmation email with your license key. If you don't see it within a few minutes, check your spam folder.</p><h2>Your License Key</h2><p>Your license key looks like this: <code>XXXX-XXXX-XXXX-XXXX</code>. Keep it safe — you'll need it to activate your theme and log into the customer portal.</p><h2>What's Included</h2><ul><li>Full Vexel theme ZIP file (download from your account)</li><li>License key for store activation</li><li>Access to all documentation</li><li>Support via the chat or support form</li><li><strong>Pro only:</strong> 1-on-1 setup call, 5-store license, private community</li></ul><h2>Next Step</h2><p>Download your theme and follow the <strong>Quick Start Guide</strong> to get your store live.</p>`,
  },
  "Understanding Your License": {
    section: "License & Domain",
    htmlContent: `<h2>Understanding Your License</h2><p>Your Vexel license key activates and protects your Shopify theme. Here's everything you need to know.</p><h2>License Types</h2><ul><li><strong>Lite</strong> — 1 store license. Can be transferred to a new store if your store is banned.</li><li><strong>Pro</strong> — 5 store licenses. Use on up to 5 stores simultaneously.</li></ul><h2>How It Works</h2><p>When your store loads, the theme sends your license key to our validation server. If valid, the theme displays normally. If invalid, the theme will not function.</p><h2>Domain Binding</h2><p>The first time your license key is used on a Shopify store, it automatically binds to that store's domain. This protects you and prevents unauthorized use of your key.</p><h2>Transferring Your License</h2><p>If your store gets banned, contact support to transfer your license to your new store domain.</p>`,
  },
  "Auto-Generated Shopify Domains": {
    section: "License & Domain",
    htmlContent: `<h2>Auto-Generated Shopify Domains</h2><p>Every Shopify store has an auto-generated domain ending in <code>.myshopify.com</code>. This is your store's permanent domain and is used by Vexel for license validation.</p><h2>What Is a myshopify.com Domain?</h2><p>When you create a Shopify store, you choose a store name. Shopify creates a permanent domain like <code>yourstore.myshopify.com</code>. This never changes, even if you add a custom domain.</p><h2>Why It Matters for Your License</h2><p>Vexel binds your license to your <code>.myshopify.com</code> domain, not your custom domain. This means:</p><ul><li>Your license works even if you change custom domains</li><li>If you have a new Shopify store, it will have a different <code>.myshopify.com</code> domain</li></ul><h2>Finding Your myshopify.com Domain</h2><p>Go to <strong>Shopify Admin → Settings → Domains</strong>. You'll see your myshopify.com domain listed there.</p>`,
  },
  "License Activation Step-by-Step": {
    section: "License & Domain",
    htmlContent: `<h2>License Activation Step-by-Step</h2><p>Follow these exact steps to activate your Vexel license.</p><ol><li>Download and install your Vexel theme in Shopify (see <em>Installing in Shopify</em>)</li><li>In Shopify, go to <strong>Online Store → Themes</strong></li><li>Click <strong>Customize</strong> on the Vexel theme</li><li>In the left sidebar, find <strong>License & Protection</strong></li><li>Paste your license key (format: <code>XXXX-XXXX-XXXX-XXXX</code>)</li><li>Click <strong>Save</strong></li><li>Publish the theme</li></ol><h2>Verifying Activation</h2><p>Visit your store. If the theme loads normally and you don't see a license error, you're activated. The license binds automatically to your store's domain on first successful validation.</p><h2>Common Errors</h2><ul><li><strong>"Invalid license key"</strong> — Double-check the key is copied correctly with no extra spaces</li><li><strong>"Domain mismatch"</strong> — Your license is already bound to a different store. Contact support.</li></ul>`,
  },
  "Finding Your Auto-Generated Domain": {
    section: "License & Domain",
    htmlContent: `<h2>Finding Your Auto-Generated Domain</h2><p>If you need to find your Shopify store's auto-generated domain, follow these steps.</p><ol><li>Log into your <strong>Shopify Admin</strong></li><li>Click <strong>Settings</strong> in the bottom-left corner</li><li>Click <strong>Domains</strong></li><li>Look for the domain ending in <strong>.myshopify.com</strong></li></ol><p>This is your store's permanent domain. It's the domain your Vexel license is bound to.</p><h2>Why You Might Need This</h2><p>You'll need your myshopify.com domain when:</p><ul><li>Contacting support about a license issue</li><li>Transferring your license to a new store</li><li>Troubleshooting a domain mismatch error</li></ul>`,
  },
  "Activated on Wrong Domain?": {
    section: "License & Domain",
    htmlContent: `<h2>Activated on Wrong Domain?</h2><p>If your license was activated on the wrong Shopify store, contact our support team to reset and transfer your license.</p><h2>How to Get Help</h2><ol><li>Use the chat widget on this page or go to the Support page</li><li>Provide your license key and the correct store's myshopify.com domain</li><li>We'll reset your license binding so it works on the correct store</li></ol><h2>Preventing This</h2><p>Before entering your license key, make sure you're customizing the correct Shopify store. Double-check by looking at the store name in the top-left of the Shopify Admin dashboard.</p>`,
  },
  "Custom Domains and Your License": {
    section: "License & Domain",
    htmlContent: `<h2>Custom Domains and Your License</h2><p>Vexel licenses are tied to your <code>.myshopify.com</code> domain, not your custom domain. This means your theme works regardless of which custom domain you use.</p><h2>Changing Custom Domains</h2><p>If you change your custom domain (e.g., from <code>mystore.com</code> to <code>mystore.co</code>), your license will continue to work without any changes.</p><h2>What Breaks the License</h2><p>Your license will stop working only if:</p><ul><li>You install it on a different Shopify store (different <code>.myshopify.com</code> domain)</li><li>You use an invalid or expired license key</li></ul><h2>New Shopify Store</h2><p>If you move to a completely new Shopify store, contact support to transfer your license to the new store's domain.</p>`,
  },
  "Colors & Branding Setup": {
    section: "Theme Customization",
    htmlContent: `<h2>Colors & Branding Setup</h2><p>Customize your store's colors and branding directly in the Shopify Theme Editor.</p><h2>Accessing Colors</h2><ol><li>Go to <strong>Shopify Admin → Online Store → Themes</strong></li><li>Click <strong>Customize</strong> on Vexel</li><li>In the left sidebar, click <strong>Theme Settings</strong></li><li>Select <strong>Colors</strong></li></ol><h2>Main Color Options</h2><ul><li><strong>Primary color</strong> — Used for buttons, links, and accents</li><li><strong>Background color</strong> — Main page background</li><li><strong>Text color</strong> — Body text color</li><li><strong>Button text color</strong> — Text on primary buttons</li></ul><h2>Logo Setup</h2><p>To add your logo, go to <strong>Theme Settings → Logo</strong> and upload your logo image. Recommended size: 200×60px, PNG with transparent background.</p>`,
  },
  "Accessing the Theme Editor": {
    section: "Theme Customization",
    htmlContent: `<h2>Accessing the Theme Editor</h2><p>The Shopify Theme Editor lets you customize every part of your Vexel store visually.</p><h2>How to Open It</h2><ol><li>Go to your <strong>Shopify Admin</strong></li><li>Click <strong>Online Store</strong> in the left sidebar</li><li>Click <strong>Themes</strong></li><li>Find the Vexel theme and click <strong>Customize</strong></li></ol><h2>Editor Layout</h2><ul><li><strong>Left sidebar</strong> — Sections list and settings</li><li><strong>Center</strong> — Live preview of your store</li><li><strong>Top bar</strong> — Device preview toggle, undo/redo, save</li></ul><h2>Saving Changes</h2><p>Always click <strong>Save</strong> after making changes. Changes are not live until you both save and publish the theme.</p>`,
  },
  "Changing Theme Language": {
    section: "Theme Customization",
    htmlContent: `<h2>Changing Theme Language</h2><p>Vexel supports multiple languages. You can translate all theme text through the Shopify Theme Editor.</p><h2>How to Edit Text</h2><ol><li>Open the <strong>Theme Editor</strong> (Customize)</li><li>Click the <strong>three dots (···)</strong> menu in the top-right</li><li>Select <strong>Edit default theme content</strong></li><li>Search for any text and update it</li><li>Click <strong>Save</strong></li></ol><h2>Full Translation</h2><p>For a full translation to another language, go to <strong>Shopify Admin → Online Store → Themes → ··· → Edit languages</strong>. You can export translation files and import translated versions.</p>`,
  },
  "AI Chatbot Setup": {
    section: "Feature Guides",
    htmlContent: `<h2>AI Chatbot Setup</h2><p>Vexel includes a built-in AI chatbot that can answer customer questions and help drive sales.</p><h2>Enabling the Chatbot</h2><ol><li>Open the <strong>Theme Editor</strong></li><li>In the left sidebar, find <strong>Theme Settings → Chatbot</strong></li><li>Toggle <strong>Enable Chatbot</strong> on</li><li>Enter a chatbot name (e.g., "Support Bot")</li><li>Add your welcome message</li><li>Click <strong>Save</strong></li></ol><h2>Customizing Responses</h2><p>You can configure common Q&A pairs in the chatbot settings. The bot will match customer questions to your answers automatically.</p><h2>Chatbot Appearance</h2><p>Customize the chatbot's color, position, and avatar in <strong>Theme Settings → Chatbot → Appearance</strong>.</p>`,
  },
  "Spin Wheel Setup": {
    section: "Feature Guides",
    htmlContent: `<h2>Spin Wheel Setup</h2><p>The Spin Wheel is a gamified discount widget that captures emails and boosts conversions.</p><h2>Enabling the Spin Wheel</h2><ol><li>Open the <strong>Theme Editor</strong></li><li>Go to <strong>Theme Settings → Spin Wheel</strong></li><li>Toggle <strong>Enable Spin Wheel</strong> on</li><li>Set the trigger (time delay or exit intent)</li></ol><h2>Configuring Prizes</h2><p>Add up to 8 prizes to the wheel. For each prize:</p><ul><li>Set the prize label (e.g., "10% OFF")</li><li>Set the discount code to show when won</li><li>Set the probability (higher = appears more often)</li></ul><h2>Email Collection</h2><p>Customers must enter their email to spin. These emails are automatically added to your Shopify customer list.</p>`,
  },
  "Bundle Builder Setup": {
    section: "Feature Guides",
    htmlContent: `<h2>Bundle Builder Setup</h2><p>The Bundle Builder lets customers create product bundles and get a discount for buying multiple items together.</p><h2>Enabling Bundles</h2><ol><li>Open the <strong>Theme Editor</strong></li><li>Go to <strong>Theme Settings → Bundle Builder</strong></li><li>Toggle <strong>Enable Bundle Builder</strong> on</li><li>Set the bundle discount percentage</li><li>Set the minimum number of items for a bundle</li></ol><h2>Adding Products</h2><p>Select which products can be added to bundles. You can allow all products or restrict to specific collections.</p><h2>Bundle Display</h2><p>The bundle builder appears on product pages as a "Build Your Bundle" section. Customers add products and the discount applies automatically at checkout.</p>`,
  },
  "Urgency Elements Setup": {
    section: "Feature Guides",
    htmlContent: `<h2>Urgency Elements Setup</h2><p>Urgency elements encourage customers to buy now by showing stock levels, countdown timers, and social proof.</p><h2>Available Urgency Elements</h2><ul><li><strong>Low stock counter</strong> — Shows "Only X left!" on product pages</li><li><strong>Countdown timer</strong> — Counts down to a sale end or shipping cutoff</li><li><strong>Live visitor count</strong> — Shows "X people viewing this now"</li><li><strong>Recent sales popup</strong> — Shows recent purchase notifications</li></ul><h2>Enabling Urgency Elements</h2><ol><li>Open the <strong>Theme Editor</strong></li><li>Go to <strong>Theme Settings → Urgency</strong></li><li>Enable the elements you want</li><li>Configure each element's settings</li><li>Click <strong>Save</strong></li></ol>`,
  },
  "Product Grid Setup": {
    section: "Feature Guides",
    htmlContent: `<h2>Product Grid Setup</h2><p>Customize how products appear in collection pages and the homepage product grid.</p><h2>Grid Settings</h2><ol><li>Open the <strong>Theme Editor</strong></li><li>Select a collection page or homepage section</li><li>Click on the <strong>Product Grid</strong> section</li><li>Adjust columns (2–4 on desktop, 1–2 on mobile)</li><li>Toggle product features: quick-add button, sale badge, reviews, etc.</li></ol><h2>Product Card Options</h2><ul><li><strong>Image ratio</strong> — Square, portrait, or landscape</li><li><strong>Show vendor</strong> — Display brand/supplier name</li><li><strong>Show price</strong> — Always on by default</li><li><strong>Hover effect</strong> — Show second image on hover</li></ul>`,
  },
  "Reviews & Testimonials": {
    section: "Feature Guides",
    htmlContent: `<h2>Reviews & Testimonials</h2><p>Display customer reviews and testimonials to build trust and increase conversions.</p><h2>Adding a Testimonials Section</h2><ol><li>Open the <strong>Theme Editor</strong></li><li>Click <strong>Add section</strong> on the homepage</li><li>Select <strong>Testimonials</strong></li><li>Add your testimonial blocks (name, review text, star rating, photo)</li><li>Click <strong>Save</strong></li></ol><h2>Product Reviews</h2><p>Vexel is compatible with the Shopify Product Reviews app and Judge.me. Install one of these apps from the Shopify App Store to enable product-level reviews.</p><h2>Review Display</h2><p>Reviews appear on product pages below the product description. The average star rating also shows in product cards on collection pages.</p>`,
  },
  "Troubleshooting Overview": {
    section: "Troubleshooting",
    htmlContent: `<h2>Troubleshooting Overview</h2><p>If something isn't working as expected, start here.</p><h2>Most Common Issues</h2><ul><li><strong>License shows invalid</strong> — Check your license key is entered correctly</li><li><strong>Theme not loading</strong> — Check your internet connection; try clearing browser cache</li><li><strong>Can't access account</strong> — Make sure you're using your license key, not an email/password</li><li><strong>Didn't receive email</strong> — Check spam; email may take up to 10 minutes</li></ul><h2>Before Contacting Support</h2><p>Please check the relevant troubleshooting article first. This helps us resolve your issue faster. If you still need help, use the chat widget or submit a support request.</p>`,
  },
  "License Shows Invalid": {
    section: "Troubleshooting",
    htmlContent: `<h2>License Shows Invalid</h2><p>If your store shows a license error, here's how to fix it.</p><h2>Step 1: Check Your License Key</h2><p>Go to the Theme Editor → <strong>License & Protection</strong> and verify your key is entered correctly. The format should be <code>XXXX-XXXX-XXXX-XXXX</code> with no extra spaces.</p><h2>Step 2: Check Domain Binding</h2><p>Your license may be bound to a different store's domain. If you recently moved to a new Shopify store, contact support to transfer the binding.</p><h2>Step 3: Check License Expiry</h2><p>Log into your account portal and check your license status. If it shows expired, contact support.</p><h2>Still Not Working?</h2><p>Use the chat widget or support form to contact us. Provide your license key and your store's myshopify.com domain.</p>`,
  },
  "Theme Not Loading Properly": {
    section: "Troubleshooting",
    htmlContent: `<h2>Theme Not Loading Properly</h2><p>If your Vexel theme is stuck on a loading screen or looks broken, try these steps.</p><h2>Clear Cache</h2><p>Press <code>Ctrl+Shift+R</code> (Windows) or <code>Cmd+Shift+R</code> (Mac) to hard-refresh your browser and clear the cache.</p><h2>Check License Key</h2><p>A missing or invalid license key causes the theme to display a loading screen indefinitely. Make sure your key is entered in the Theme Editor.</p><h2>Check Your Internet</h2><p>The theme needs to contact our validation server. If your internet is down or the server is temporarily unavailable, the theme may not load.</p><h2>Try Incognito Mode</h2><p>Open your store in an incognito/private browser window. If it loads there, a browser extension is causing the issue.</p><h2>Contact Support</h2><p>If none of the above work, contact us with your store URL and license key.</p>`,
  },
  "Can't Access My Account": {
    section: "Troubleshooting",
    htmlContent: `<h2>Can't Access My Account</h2><p>Your Vexel account is accessed using your <strong>license key</strong>, not an email and password.</p><h2>How to Log In</h2><ol><li>Go to the <strong>Account</strong> page on this site</li><li>Enter your license key (format: <code>XXXX-XXXX-XXXX-XXXX</code>)</li><li>Click <strong>Log In</strong></li></ol><h2>Can't Find Your License Key?</h2><p>Your license key was sent in your purchase confirmation email. Search your inbox for "Vexel" or check your spam folder.</p><h2>Still Can't Log In?</h2><p>Contact support via the chat widget with proof of purchase and we'll retrieve your license key for you.</p>`,
  },
  "Didn't Receive Email": {
    section: "Troubleshooting",
    htmlContent: `<h2>Didn't Receive Your Email?</h2><p>If you didn't receive your purchase confirmation or license key email, here's what to do.</p><h2>Check Spam</h2><p>Check your spam or junk folder. Emails from payment processors sometimes get filtered.</p><h2>Wait a Few Minutes</h2><p>Emails can sometimes take up to 10 minutes to arrive depending on your email provider.</p><h2>Check the Right Inbox</h2><p>Make sure you're checking the email address you used at checkout.</p><h2>Contact Support</h2><p>If it's been more than 30 minutes and you still haven't received anything, contact support with your order confirmation number or the email address you used at checkout. We'll resend your license key manually.</p>`,
  },
  "Lite vs Pro Comparison": {
    section: "Plans & Policies",
    htmlContent: `<h2>Lite vs Pro Comparison</h2><p>Both plans include the full Vexel theme. Here's what's different.</p><table style="width:100%;border-collapse:collapse;margin:16px 0"><thead><tr style="background:#f8fafc"><th style="padding:10px 12px;text-align:left;border:1px solid #e2e8f0;font-size:13px">Feature</th><th style="padding:10px 12px;text-align:center;border:1px solid #e2e8f0;font-size:13px">Lite</th><th style="padding:10px 12px;text-align:center;border:1px solid #e2e8f0;font-size:13px">Pro</th></tr></thead><tbody><tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px">Full theme with 140+ features</td><td style="padding:10px 12px;text-align:center;border:1px solid #e2e8f0">✓</td><td style="padding:10px 12px;text-align:center;border:1px solid #e2e8f0">✓</td></tr><tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px">Store licenses</td><td style="padding:10px 12px;text-align:center;border:1px solid #e2e8f0">1</td><td style="padding:10px 12px;text-align:center;border:1px solid #e2e8f0">5</td></tr><tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px">1-on-1 store setup call</td><td style="padding:10px 12px;text-align:center;border:1px solid #e2e8f0">—</td><td style="padding:10px 12px;text-align:center;border:1px solid #e2e8f0">✓</td></tr><tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px">Private Vexel community</td><td style="padding:10px 12px;text-align:center;border:1px solid #e2e8f0">—</td><td style="padding:10px 12px;text-align:center;border:1px solid #e2e8f0">✓</td></tr><tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px">Price</td><td style="padding:10px 12px;text-align:center;border:1px solid #e2e8f0">$179</td><td style="padding:10px 12px;text-align:center;border:1px solid #e2e8f0">$379</td></tr></tbody></table>`,
  },
  "What If My Store Gets Banned?": {
    section: "Plans & Policies",
    htmlContent: `<h2>What If My Store Gets Banned?</h2><p>Shopify sometimes bans stores. Here's how Vexel protects you.</p><h2>License Transfer</h2><p>If your Shopify store gets banned and you create a new one, contact support and we'll transfer your license to your new store's domain at no extra cost.</p><h2>Lite Plan</h2><p>Lite includes 1 store license with the ability to transfer to a new store if banned. You can only use the license on one store at a time.</p><h2>Pro Plan</h2><p>Pro includes 5 store licenses. If one store gets banned, you still have remaining licenses for other stores. Contact support to transfer a banned store's license to a new domain.</p><h2>How to Request a Transfer</h2><p>Use the support chat or form. Provide your license key, the banned store's domain, and the new store's domain. We process transfers within 24 hours.</p>`,
  },
  "Using Vexel on Multiple Stores": {
    section: "Plans & Policies",
    htmlContent: `<h2>Using Vexel on Multiple Stores</h2><p>Your license determines how many stores you can run Vexel on simultaneously.</p><h2>Lite — 1 Store</h2><p>The Lite plan allows 1 active store at a time. You can transfer to a new store (e.g., after a ban), but cannot run 2 stores simultaneously.</p><h2>Pro — 5 Stores</h2><p>The Pro plan allows up to 5 stores running Vexel at the same time. Each store has its own domain binding.</p><h2>Need More Than 5 Stores?</h2><p>Contact support to discuss custom licensing options for larger operations.</p>`,
  },
  "Refund Policy": {
    section: "Plans & Policies",
    htmlContent: `<h2>Refund Policy</h2><p>Due to the digital nature of theme files, all sales are final. We do not offer refunds after the theme has been downloaded.</p><h2>Before Purchasing</h2><p>We encourage you to review all documentation, watch any available demos, and contact support with questions before purchasing. This ensures Vexel is the right fit for your store.</p><h2>Exceptions</h2><p>In rare cases where the theme is fundamentally broken and cannot be fixed through support, we may offer a refund at our discretion. Contact support within 7 days of purchase in this case.</p><h2>Need Help Instead?</h2><p>Most issues can be resolved through our support team. Before requesting a refund, please contact us — we're happy to help.</p>`,
  },
  "Contact & Support": {
    section: "Plans & Policies",
    htmlContent: `<h2>Contact & Support</h2><p>We're here to help. Here's how to reach us.</p><h2>Chat Support</h2><p>Use the chat widget in the bottom-left corner of any page on this site. Enter your name, phone number, and message. We aim to respond within a few hours.</p><h2>Support Form</h2><p>Go to the <strong>Support</strong> page and fill in the form. Provide as much detail as possible including your license key and store URL.</p><h2>Response Times</h2><ul><li><strong>Chat messages</strong> — Usually within a few hours during business hours</li><li><strong>Support form</strong> — Within 24 hours</li><li><strong>Pro customers</strong> — Priority support, faster response times</li></ul><h2>Before Contacting Us</h2><p>Please check the documentation first — most common questions are answered here. This helps us focus on cases that truly need human support.</p>`,
  },
};

const SIDEBAR_NAV = [
  { id: "getting-started", section: "Getting Started", items: ["Quick Start Guide", "Downloading Your Theme", "Installing in Shopify", "After Your Purchase"] },
  { id: "license-domain", section: "License & Domain", items: ["Understanding Your License", "Auto-Generated Shopify Domains", "License Activation Step-by-Step", "Finding Your Auto-Generated Domain", "Activated on Wrong Domain?", "Custom Domains and Your License"] },
  { id: "theme-customization", section: "Theme Customization", items: ["Colors & Branding Setup", "Accessing the Theme Editor", "Changing Theme Language"] },
  { id: "feature-guides", section: "Feature Guides", items: ["AI Chatbot Setup", "Spin Wheel Setup", "Bundle Builder Setup", "Urgency Elements Setup", "Product Grid Setup", "Reviews & Testimonials"] },
  { id: "troubleshooting", section: "Troubleshooting", items: ["Troubleshooting Overview", "License Shows Invalid", "Theme Not Loading Properly", "Can't Access My Account", "Didn't Receive Email"] },
  { id: "plans-policies", section: "Plans & Policies", items: ["Lite vs Pro Comparison", "What If My Store Gets Banned?", "Using Vexel on Multiple Stores", "Refund Policy", "Contact & Support"] },
];

const CATEGORIES = [
  { icon: Rocket, title: "Getting Started", subtitle: "Purchase to live store in 15 min", count: 4, firstArticle: "Quick Start Guide" },
  { icon: Key, title: "License & Domain", subtitle: "Understanding your license and activation", count: 6, firstArticle: "Understanding Your License" },
  { icon: Palette, title: "Theme Customization", subtitle: "Colors, branding, and feature setup", count: 3, firstArticle: "Colors & Branding Setup" },
  { icon: Zap, title: "Feature Guides", subtitle: "AI chatbot, spin wheel, bundles, and more", count: 6, firstArticle: "AI Chatbot Setup" },
  { icon: Wrench, title: "Troubleshooting", subtitle: "Common issues and how to fix them", count: 5, firstArticle: "Troubleshooting Overview" },
  { icon: FileText, title: "Plans & Policies", subtitle: "Lite vs Pro, bans, and refunds", count: 5, firstArticle: "Lite vs Pro Comparison" },
];

const POPULAR_ARTICLES = [
  "Quick Start Guide",
  "License Activation Step-by-Step",
  "Auto-Generated Shopify Domains",
  "AI Chatbot Setup",
  "Colors & Branding Setup",
];

export default function DocsPage() {
  const router = useRouter();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "getting-started": true,
    "license-domain": true,
    "theme-customization": false,
    "feature-guides": false,
    "troubleshooting": false,
    "plans-policies": false,
  });
  const [search, setSearch] = useState("");
  const [activeArticle, setActiveArticle] = useState<string | null>(null);
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  function toggleSection(id: string) {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const selectArticle = useCallback((title: string) => {
    setActiveArticle(title);
    setHelpful(null);
    setMobileSidebarOpen(false);
    const sec = SIDEBAR_NAV.find((s) => s.items.includes(title));
    if (sec) setOpenSections((prev) => ({ ...prev, [sec.id]: true }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goHome = useCallback(() => {
    setActiveArticle(null);
    setHelpful(null);
  }, []);

  const filteredNav = search.trim()
    ? SIDEBAR_NAV.map((sec) => ({ ...sec, items: sec.items.filter((item) => item.toLowerCase().includes(search.toLowerCase())) })).filter((sec) => sec.items.length > 0)
    : SIDEBAR_NAV;

  const flatArticles = SIDEBAR_NAV.flatMap((s) => s.items);
  const currentIdx = activeArticle ? flatArticles.indexOf(activeArticle) : -1;
  const prevArticle = currentIdx > 0 ? flatArticles[currentIdx - 1] : null;
  const nextArticle = currentIdx < flatArticles.length - 1 ? flatArticles[currentIdx + 1] : null;
  const articleData = activeArticle ? ARTICLES[activeArticle] ?? null : null;

  const SidebarContent = () => (
    <>
      <div className="p-3 border-b border-slate-100">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input type="text" placeholder="Search docs..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3a0ca3]/30" />
        </div>
      </div>
      <nav className="flex-1 p-2 overflow-y-auto">
        {filteredNav.length === 0 && <p className="px-3 py-4 text-xs text-slate-400 text-center">No results</p>}
        {filteredNav.map((sec) => (
          <div key={sec.id} className="mb-1">
            <button onClick={() => toggleSection(sec.id)}
              className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
              <span>{sec.section}</span>
              {openSections[sec.id] ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
            </button>
            {(openSections[sec.id] || search.trim() !== "") && (
              <ul className="mt-0.5 ml-2 space-y-0.5">
                {sec.items.map((item) => (
                  <li key={item}>
                    <button onClick={() => selectArticle(item)}
                      className={`w-full text-left pl-3 pr-2 py-1 text-xs rounded-md transition-colors truncate ${activeArticle === item ? "text-[#3a0ca3] bg-[#3a0ca3]/5 font-semibold" : "text-slate-500 hover:text-[#3a0ca3] hover:bg-slate-50"}`}>
                      {search.trim() ? <HighlightedText text={item} query={search} /> : item}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>
    </>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top nav */}
      <nav className="bg-white border-b border-slate-200 h-14 flex items-center px-4 sm:px-8 gap-4 sticky top-0 z-30">
        <button onClick={() => setMobileSidebarOpen(true)} className="md:hidden p-1.5 -ml-1 hover:bg-slate-100 rounded-lg transition-colors">
          <Menu className="h-5 w-5 text-slate-600" />
        </button>
        <Link href="/theme" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-[#3a0ca3] transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Vexel</span>
          <span className="sm:hidden">Back</span>
        </Link>
        <div className="flex-1 flex justify-center">
          <button onClick={goHome} className="flex items-center gap-2 text-base font-semibold text-slate-900 hover:text-[#3a0ca3] transition-colors">
            <BookOpen className="h-5 w-5 text-[#3a0ca3]" />
            <span className="hidden sm:inline">Vexel Docs</span>
            <span className="sm:hidden">Docs</span>
          </button>
        </div>
        <button onClick={() => router.push("/theme/support")} className="text-sm font-medium text-[#3a0ca3] hover:underline hidden sm:block">
          Need Help?
        </button>
      </nav>

      <div className="flex flex-1">
        {/* Mobile sidebar */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/30" onClick={() => setMobileSidebarOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col">
              <div className="flex items-center justify-between p-3 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-900">Documentation</span>
                <button onClick={() => setMobileSidebarOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>
              <SidebarContent />
            </aside>
          </div>
        )}

        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-[200px] shrink-0 border-r border-slate-200 bg-white sticky top-14 h-[calc(100vh-3.5rem)]">
          <SidebarContent />
        </aside>

        {/* Main content */}
        <main className="flex-1 px-6 py-8 sm:px-10 sm:py-10 max-w-[860px] mx-auto w-full">
          {activeArticle && articleData ? (
            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-6 flex-wrap">
                <button onClick={goHome} className="hover:text-[#3a0ca3] transition-colors">Docs</button>
                <ChevronRight className="h-3 w-3" />
                <span className="text-slate-500">{articleData.section}</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-slate-700 font-medium">{activeArticle}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-6">{activeArticle}</h1>

              <div
                className="text-slate-600 text-sm leading-relaxed [&_p]:mb-4 [&_strong]:font-semibold [&_strong]:text-slate-800 [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_li]:mb-1.5 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mb-3 [&_h2]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-900 [&_h3]:mb-2 [&_h3]:mt-4 [&_table]:text-sm [&_table]:w-full [&_table]:my-4"
                dangerouslySetInnerHTML={{ __html: articleData.htmlContent }}
              />

              {/* Was this helpful? */}
              <div className="mt-10 pt-6 border-t border-slate-100">
                <p className="text-sm font-semibold text-slate-700 mb-3">Was this article helpful?</p>
                {helpful === null ? (
                  <div className="flex gap-3">
                    <button onClick={() => setHelpful(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:border-emerald-400 hover:text-emerald-600 transition-colors">
                      <ThumbsUp className="h-3.5 w-3.5" /> Yes, helpful
                    </button>
                    <button onClick={() => setHelpful(false)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:border-red-400 hover:text-red-500 transition-colors">
                      <ThumbsDown className="h-3.5 w-3.5" /> Not really
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">{helpful ? "Thanks for the feedback!" : "Sorry to hear that. Use the chat to get help."}</p>
                )}
              </div>

              {/* Prev / Next */}
              <div className="mt-8 flex justify-between gap-4">
                {prevArticle ? (
                  <button onClick={() => selectArticle(prevArticle)} className="flex items-center gap-2 text-xs text-slate-500 hover:text-[#3a0ca3] transition-colors">
                    <ChevronLeft className="h-4 w-4" /><span>{prevArticle}</span>
                  </button>
                ) : <div />}
                {nextArticle ? (
                  <button onClick={() => selectArticle(nextArticle)} className="flex items-center gap-2 text-xs text-slate-500 hover:text-[#3a0ca3] transition-colors">
                    <span>{nextArticle}</span><ChevronRight className="h-4 w-4" />
                  </button>
                ) : <div />}
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#3a0ca3]/10 text-[#3a0ca3] mb-4">
                  <BookOpen className="h-3.5 w-3.5" /> Documentation
                </span>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3">Vexel Theme Documentation</h1>
                <p className="text-slate-500 text-base leading-relaxed max-w-xl mx-auto">Everything you need to set up, customize, and get the most out of your Vexel theme.</p>
              </div>

              {/* CTA banner */}
              <div className="rounded-2xl p-6 mb-8 flex items-center justify-between gap-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #3730d4 0%, #4f46e5 100%)" }}>
                <div className="relative z-10">
                  <p className="text-white font-semibold text-lg mb-1">New to Vexel?</p>
                  <p className="text-indigo-200 text-sm">Follow our quick start guide to get your store live in 15 minutes.</p>
                </div>
                <button onClick={() => selectArticle("Quick Start Guide")} className="shrink-0 inline-flex items-center gap-2 bg-white text-[#3730d4] text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors relative z-10">
                  Quick Start <ArrowRight className="h-4 w-4" />
                </button>
                <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/5" />
                <div className="absolute -right-2 top-6 w-16 h-16 rounded-full bg-white/5" />
              </div>

              {/* Category cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button key={cat.title} onClick={() => selectArticle(cat.firstArticle)}
                      className="group text-left p-5 rounded-xl border border-slate-200 bg-white hover:border-[#3a0ca3]/30 hover:shadow-md transition-all">
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 rounded-xl bg-[#3a0ca3]/8 shrink-0">
                          <Icon className="h-5 w-5 text-[#3a0ca3]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 mb-0.5">{cat.title}</p>
                          <p className="text-xs text-slate-500 leading-snug mb-2">{cat.subtitle}</p>
                          <p className="text-xs text-slate-400">{cat.count} articles</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#3a0ca3] transition-colors mt-1 shrink-0" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Popular Articles */}
              <div className="mb-10">
                <h2 className="text-lg font-bold text-slate-900 mb-4 text-center">Popular Articles</h2>
                <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
                  {POPULAR_ARTICLES.map((article) => (
                    <button key={article} onClick={() => selectArticle(article)}
                      className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors group">
                      <span className="text-sm text-slate-700 group-hover:text-[#3a0ca3] transition-colors">{article}</span>
                      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#3a0ca3] transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl p-6" style={{ backgroundColor: "#1e293b" }}>
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                    <span className="text-white text-base">💬</span>
                  </div>
                  <p className="text-white font-semibold mb-1">Need Support?</p>
                  <p className="text-slate-400 text-sm mb-4">Can&apos;t find what you&apos;re looking for? Our team is here to help.</p>
                  <button onClick={() => router.push("/theme/support")} className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-colors">
                    Contact Us <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="rounded-2xl p-6 border border-slate-200 bg-white">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mb-4">
                    <span className="text-slate-600 text-base font-bold">?</span>
                  </div>
                  <p className="text-slate-900 font-semibold mb-1">Can&apos;t Find What You Need?</p>
                  <p className="text-slate-500 text-sm mb-4">Browse all our documentation or use the chat widget below.</p>
                  <button onClick={goHome} className="inline-flex items-center gap-2 text-sm font-semibold text-[#3a0ca3] bg-[#3a0ca3]/10 hover:bg-[#3a0ca3]/20 px-4 py-2 rounded-xl transition-colors">
                    View All Options <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <ChatWidget />
    </div>
  );
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>{text.slice(0, idx)}<mark className="bg-yellow-200 text-slate-900 rounded-sm">{text.slice(idx, idx + query.length)}</mark>{text.slice(idx + query.length)}</>
  );
}
