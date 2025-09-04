document.addEventListener('DOMContentLoaded', () => {
  // ---------------- SLIDESHOW ----------------
  const slides = document.querySelectorAll('.slideshow .slide');
  let slideIndex = 0;
  if (slides.length > 0) {
    slides[0].classList.add('active');
    function changeSlide() {
      slides[slideIndex].classList.remove('active');
      slideIndex = (slideIndex + 1) % slides.length;
      slides[slideIndex].classList.add('active');
    }
    setInterval(changeSlide, 4000);
  }

  // ---------------- SHUFFLE ----------------
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const gallery = document.querySelector('.gallery');
  let shuffledImages = [];
  if (gallery) {
    // sélectionne toutes les <img> dans la galerie (robuste même si tu utilises des <a><img></a>)
    const imgs = Array.from(gallery.querySelectorAll('img'));
    if (imgs.length > 0) {
      shuffledImages = shuffle(imgs.slice()); // copie et mélange
      gallery.innerHTML = '';
      shuffledImages.forEach(img => gallery.appendChild(img));
    }
  }

  // ---------------- LIGHTBOX ----------------
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox ? lightbox.querySelector('img') : null;
  const leftArrow = document.querySelector('.arrow.left');   // correspond à <span class="arrow left">…
  const rightArrow = document.querySelector('.arrow.right'); // …et <span class="arrow right">…
  let currentIndex = 0;

  function showImage(index) {
    if (!lightboxImg || !shuffledImages.length) return;
    const img = shuffledImages[index];
    if (!img) return;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || '';
    currentIndex = index;
  }

  if (lightbox && lightboxImg && shuffledImages.length) {
    // ouvrir sur la bonne image
    shuffledImages.forEach((img, i) => {
      img.addEventListener('click', (e) => {
        e.stopPropagation();
        showImage(i);
        lightbox.classList.add('active');
      });
    });

    // flèches (si présentes)
    if (rightArrow) {
      rightArrow.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % shuffledImages.length;
        showImage(currentIndex);
      });
    }
    if (leftArrow) {
      leftArrow.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + shuffledImages.length) % shuffledImages.length;
        showImage(currentIndex);
      });
    }

    // fermer si clic sur le fond
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) lightbox.classList.remove('active');
    });

    // clavier
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'ArrowRight') {
        currentIndex = (currentIndex + 1) % shuffledImages.length;
        showImage(currentIndex);
      } else if (e.key === 'ArrowLeft') {
        currentIndex = (currentIndex - 1 + shuffledImages.length) % shuffledImages.length;
        showImage(currentIndex);
      } else if (e.key === 'Escape') {
        lightbox.classList.remove('active');
      }
    });
  }

  // ---------------- SCROLL AVEC OFFSET (header fixe) ----------------
  const header = document.querySelector('header');
  const navLinks = document.querySelectorAll('nav a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      if (!targetSection) return;
      const headerHeight = header ? header.offsetHeight : 0;
      const targetPosition = targetSection.offsetTop - headerHeight;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    });
  });
});