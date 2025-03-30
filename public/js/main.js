document.addEventListener('DOMContentLoaded', function() {
  // Navbar scroll effect
  const navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", function() {
    if (window.scrollY > 50) {
      navbar.style.padding = "10px 0";
      navbar.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";
    } else {
      navbar.style.padding = "15px 0";
      navbar.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.05)";
    }
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener("click", function(e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const el = document.querySelector(targetId);
      if (el) {
        const offsetTop = el.offsetTop - 70;
        window.scrollTo({top: offsetTop, behavior: "smooth"});
      }
    });
  });

  // Scroll animation
  const observerOptions = {threshold: 0.25};
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const elements = [
    ...document.querySelectorAll(".section-title"),
    ...document.querySelectorAll(".project-card"),
    ...document.querySelectorAll(".experience-item"),
    ...document.querySelectorAll(".skill-category")
  ];
  
  elements.forEach(function(el) {
    el.classList.add("animate-on-scroll");
    observer.observe(el);
  });
});
