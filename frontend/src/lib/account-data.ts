import { BookOpen, MessageCircle, Download, ExternalLink } from "lucide-react";

// Static changelog entries \u2014 update these as new theme versions ship
export const UPDATES = [
  {
    version: "v2.4.1",
    date: "Feb 2026",
    notes: [
      "Improved AI image gen — faster generation and better prompt adherence",
      "Fixed checkout upsell widget overlap on mobile",
      "Performance: reduced initial JS bundle by 18 kB",
    ],
  },
  {
    version: "v2.3.0",
    date: "Jan 2026",
    notes: [
      "New color presets — 6 additional curated palettes",
      "Added countdown timer section with timezone support",
      "Improved Metafield support for product variants",
    ],
  },
  {
    version: "v2.2.0",
    date: "Dec 2025",
    notes: [
      "Launched AI Product Description Generator",
      "New sticky add-to-cart bar for product pages",
      "Accessibility pass — WCAG 2.1 AA compliance improvements",
    ],
  },
];

export const QUICK_LINKS = [
  { href: "/theme/docs", icon: BookOpen, label: "Docs" },
  { href: "/theme/support", icon: MessageCircle, label: "Support" },
  { href: "#download", icon: Download, label: "Download Theme" },
  { href: "#changelog", icon: ExternalLink, label: "Changelog" },
];
