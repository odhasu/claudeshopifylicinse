/* OGVendors Theme - Global JavaScript */

// Scroll reveal
document.addEventListener('DOMContentLoaded', function() {
  var reveals = document.querySelectorAll('.scroll-reveal');
  if (reveals.length === 0) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  reveals.forEach(function(el) { observer.observe(el); });
});
