import type { RendererFunction } from '../types';
import headerMinimal from './headerMinimal';
import urgency from './urgency';
import productGrid from './productGrid';
import testimonials from './testimonials';
import faq from './faq';
import chat from './chat';
import reviews from './reviews';
import liveSales from './liveSales';
import footer from './footer';

const renderers: Record<string, RendererFunction> = {};

renderers['header-minimal'] = headerMinimal;
renderers['urgency'] = urgency as RendererFunction;
renderers['product-grid'] = productGrid;
renderers['testimonials'] = testimonials as RendererFunction;
renderers['faq'] = faq as RendererFunction;
renderers['chat'] = chat as RendererFunction;
renderers['reviews'] = reviews as RendererFunction;
renderers['live-sales'] = liveSales as RendererFunction;
renderers['footer'] = footer as RendererFunction;

export default renderers;
