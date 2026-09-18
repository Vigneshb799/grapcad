// ==============================
// LOADER
// ==============================

window.addEventListener("load", () => {
  const loader = document.getElementById("loader");

  if (loader) {
      loader.style.opacity = "0";

      setTimeout(() => {
          loader.style.display = "none";
      }, 600);
  }
});


// ==============================
// CIRCULAR SCROLL PROGRESS & BACK TO TOP
// ==============================

const topBtn = document.getElementById("topBtn");
const progressPath = document.querySelector("#topBtn .progress-path");

if (progressPath) {
  const pathLength = progressPath.getTotalLength();
  
  progressPath.style.transition = progressPath.style.WebkitTransition = "none";
  progressPath.style.strokeDasharray = pathLength + " " + pathLength;
  progressPath.style.strokeDashoffset = pathLength;
  progressPath.getBoundingClientRect();
  progressPath.style.transition = progressPath.style.WebkitTransition = "stroke-dashoffset 10ms linear";
  
  const updateProgress = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = scrollTop / scrollHeight;
    const offset = pathLength - (progress * pathLength);
    progressPath.style.strokeDashoffset = offset;
  };
  
  updateProgress();
  window.addEventListener("scroll", updateProgress);
}

window.addEventListener("scroll", () => {
  if (topBtn) {
    if (window.scrollY > 400) {
      topBtn.classList.add("active-progress");
    } else {
      topBtn.classList.remove("active-progress");
    }
  }
});

topBtn?.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});


// ==============================
// FAQ
// ==============================

const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach(item => {

  const question = item.querySelector(".faq-question");

  question.addEventListener("click", () => {

      faqItems.forEach(i => {

          if (i !== item) {

              i.classList.remove("active");

          }

      });

      item.classList.toggle("active");

  });

});


// ==============================
// COUNTER
// ==============================

const counters = document.querySelectorAll(".counter");

const counterObserver = new IntersectionObserver(entries => {

  entries.forEach(entry => {

      if (entry.isIntersecting) {

          const counter = entry.target;

          const target = +counter.dataset.target;

          let count = 0;

          const speed = target / 80;

          const update = () => {

              count += speed;

              if (count < target) {

                  counter.innerText = Math.ceil(count);

                  requestAnimationFrame(update);

              } else {

                  counter.innerText = target;

              }

          };

          update();

          counterObserver.unobserve(counter);

      }

  });

});

counters.forEach(counter => {

  counterObserver.observe(counter);

});


// ==============================
// REVEAL ANIMATION
// ==============================

const reveals = document.querySelectorAll("section");

const revealObserver = new IntersectionObserver(entries => {

  entries.forEach(entry => {

      if (entry.isIntersecting) {

          entry.target.classList.add("active");

      }

  });

}, {

  threshold: 0.15

});

reveals.forEach(section => {

  section.classList.add("reveal");

  revealObserver.observe(section);

});


// ==============================
// NAVBAR ACTIVE LINK
// ==============================

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-links a");

const hasHashLinks = Array.from(navLinks).some(link => {
  const href = link.getAttribute("href");
  return href && href.startsWith("#");
});

if (hasHashLinks) {
  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      const height = section.offsetHeight;
      const scrollPos = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollPos >= top && scrollPos < top + height) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === "#" + current) {
        link.classList.add("active");
      }
    });
  });
}


// ==============================
// HEADER SHADOW
// ==============================

const header = document.querySelector(".header");

window.addEventListener("scroll", () => {

  if (window.scrollY > 50) {

      header.style.boxShadow = "0 8px 25px rgba(0,0,0,.35)";

  } else {

      header.style.boxShadow = "none";

  }

});


// ==============================
// SIMPLE TESTIMONIAL AUTO HIGHLIGHT
// ==============================

const testimonialCards = document.querySelectorAll(".testimonial-card");

let current = 0;

if (testimonialCards.length > 0) {

  setInterval(() => {

      testimonialCards.forEach(card => {

          card.style.transform = "scale(1)";

          card.style.borderColor = "rgba(255,255,255,.08)";

      });

      testimonialCards[current].style.transform = "scale(1.05)";

      testimonialCards[current].style.borderColor = "#FF7043";

      current++;

      if (current >= testimonialCards.length) {

          current = 0;

      }

  }, 3000);

}
