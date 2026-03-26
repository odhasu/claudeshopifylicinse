const escapeHtml = require('../utils/escapeHtml');

const renderers = {};

renderers['header-minimal'] = require('./headerMinimal');
renderers['urgency'] = require('./urgency');
renderers['product-grid'] = require('./productGrid');
renderers['testimonials'] = require('./testimonials');
renderers['faq'] = require('./faq');
renderers['chat'] = require('./chat');
renderers['reviews'] = require('./reviews');
renderers['live-sales'] = require('./liveSales');
renderers['footer'] = require('./footer');

module.exports = renderers;
