import fs from "fs";
import { JSDOM } from "jsdom";
import HTMLtoJSX from "html-to-jsx";

const html = fs.readFileSync("code.html", "utf-8");
const dom = new JSDOM(html);
const document = dom.window.document;

document
  .querySelectorAll("script, style, meta, title, link, noscript")
  .forEach((el) => el.remove());

const body = document.body;
let bodyHtml = body.innerHTML;

// Apply styles requested: turn bg to black, remove gradients
bodyHtml = bodyHtml.replace(/bg-slate-[0-9]+/g, "bg-black");
bodyHtml = bodyHtml.replace(/bg-white\/[0-9]+/g, "bg-black");
bodyHtml = bodyHtml.replace(/bg-white/g, "bg-black");
bodyHtml = bodyHtml.replace(/bg-\[#fff\]/g, "bg-black");
bodyHtml = bodyHtml.replace(/bg-gray-[0-9]+/g, "bg-black");

bodyHtml = bodyHtml.replace(/text-slate-900/g, "text-white");
bodyHtml = bodyHtml.replace(/text-slate-[89]00/g, "text-white");
bodyHtml = bodyHtml.replace(/text-slate-[567]00/g, "text-gray-300");
bodyHtml = bodyHtml.replace(/text-gray-[89]00/g, "text-white");
bodyHtml = bodyHtml.replace(/text-black/g, "text-white");
bodyHtml = bodyHtml.replace(/text-gray-[567]00/g, "text-gray-300");

bodyHtml = bodyHtml.replace(/\bbg-gradient-to-[a-z0-9-]+\b/g, "");
bodyHtml = bodyHtml.replace(/\bfrom-[a-z0-9-]+(\/[0-9]+)?\b/g, "");
bodyHtml = bodyHtml.replace(/\bvia-[a-z0-9-]+(\/[0-9]+)?\b/g, "");
bodyHtml = bodyHtml.replace(/\bto-[a-z0-9-]+(\/[0-9]+)?\b/g, "");

let jsx = HTMLtoJSX(bodyHtml);

jsx = `import React from 'react';

export default function Page() {
  return (
    <div className="bg-black min-h-screen text-white dark">
      ${jsx}
    </div>
  );
}`;

fs.writeFileSync("src/app/page.tsx", jsx, "utf-8");
console.log("Conversion complete");
