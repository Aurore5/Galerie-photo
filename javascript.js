document.addEventListener('DOMContentLoaded', () => {

  // ---------- dropdown (inchangé) ----------
  document.querySelectorAll('.dropdown > a').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentElement.classList.toggle('open');
    });
  });

  // ---------- CAROUSEL (sécurisé) ----------
  const mainImage = document.getElementById("mainImage");
  const thumbnailsLeft = document.querySelector(".thumbnails-left");
  const thumbnailsRight = document.querySelector(".thumbnails-right");

  if (mainImage && thumbnailsLeft && thumbnailsRight) {
    // assure une transition si tu veux un fondu propre
    if (!mainImage.style.transition) mainImage.style.transition = 'opacity 0.5s ease';

    let images = [
      mainImage.src,
      ...Array.from(document.querySelectorAll(".thumbnails-left img, .thumbnails-right img")).map(img => img.src)
    ].filter(Boolean);

    function renderCarousel() {
      if (!images.length) return;
      mainImage.src = images[0];

      thumbnailsLeft.innerHTML = "";
      thumbnailsRight.innerHTML = "";

      const thumbs = images.slice(1);
      const half = Math.ceil(thumbs.length / 2);

      thumbs.slice(0, half).forEach(src => thumbnailsLeft.appendChild(createThumbnail(src)));
      thumbs.slice(half).forEach(src => thumbnailsRight.appendChild(createThumbnail(src)));
    }

    function createThumbnail(src) {
      const img = document.createElement("img");
      // si ta règle de taille fonctionne, sinon tu peux simplement img.src = src;
      img.src = src.replace(/\/\d+\/\d+/, "/180/240");
      img.addEventListener("click", () => rotateTo(src));
      return img;
    }

    function fadeOut(element, callback) {
      element.style.opacity = 0;
      setTimeout(callback, 200);
    }
    function fadeIn(element) {
      setTimeout(() => element.style.opacity = 1, 50);
    }

    function rotate() {
      if (images.length <= 1) return;
      fadeOut(mainImage, () => {
        images.push(images.shift());
        renderCarousel();
        fadeIn(mainImage);
      });
    }

    function rotateTo(src) {
      if (images.length <= 1) return;
      // protège la boucle: si la miniature n'existe pas, on retourne
      if (images.indexOf(src) === -1) return;
      // faire tourner jusqu'à ce que src soit en position 1
      while (images[1] !== src && images.length > 1) {
        images.push(images.shift());
      }
      rotate();
      resetInterval();
    }

    let intervalId;
    function startInterval() {
      if (intervalId) clearInterval(intervalId);
      if (images.length > 1) intervalId = setInterval(rotate, 3000);
    }
    function resetInterval() {
      clearInterval(intervalId);
      startInterval();
    }

    renderCarousel();
    startInterval();
  } else {
    console.warn('Carousel : éléments manquants. mainImage, thumbnails-left ou thumbnails-right introuvable.');
  }

  // ---------- SLIDESHOW ----------
  const slides = document.querySelectorAll('.slideshow .slide');
  if (slides.length > 0) {
    let slideIndex = 0;
    slides[0].classList.add('active');
    function changeSlide() {
      slides[slideIndex].classList.remove('active');
      slideIndex = (slideIndex + 1) % slides.length;
      slides[slideIndex].classList.add('active');
    }
    setInterval(changeSlide, 4000);
  }

  // ---------- SHUFFLE DES GALERIES ----------
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const galleries = document.querySelectorAll('.gallery');
  galleries.forEach(gallery => {
    const imgs = Array.from(gallery.querySelectorAll('img'));
    if (imgs.length > 0) {
      const shuffledImages = shuffle(imgs.slice());
      gallery.innerHTML = '';
      shuffledImages.forEach(img => gallery.appendChild(img));
    }
  });

  // ---------- LIGHTBOX GLOBAL (s'il existe) ----------
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox ? lightbox.querySelector('img') : null;
  const leftArrow = document.querySelector('.arrow.left');
  const rightArrow = document.querySelector('.arrow.right');
  let currentIndex = 0;
  let currentGallery = [];

  if (lightbox && lightboxImg) {
    // attache les handlers après le shuffle (on re-lit les images dans leur nouvel ordre)
    galleries.forEach(gallery => {
      const imgs = Array.from(gallery.querySelectorAll('img'));
      imgs.forEach((img, i) => {
        img.addEventListener('click', e => {
          e.stopPropagation();
          currentGallery = imgs;
          showImage(i);
          lightbox.classList.add('active');
        });
      });
    });

    function showImage(index) {
      if (!lightboxImg || !currentGallery.length) return;
      const img = currentGallery[index];
      if (!img) return;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || '';
      currentIndex = index;
    }

    if (rightArrow) {
      rightArrow.addEventListener('click', e => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % currentGallery.length;
        showImage(currentIndex);
      });
    }
    if (leftArrow) {
      leftArrow.addEventListener('click', e => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
        showImage(currentIndex);
      });
    }

    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) lightbox.classList.remove('active');
    });

    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'ArrowRight') {
        currentIndex = (currentIndex + 1) % currentGallery.length;
        showImage(currentIndex);
      } else if (e.key === 'ArrowLeft') {
        currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
        showImage(currentIndex);
      } else if (e.key === 'Escape') {
        lightbox.classList.remove('active');
      }
    });
  } else {
    console.info('Lightbox absent : le comportement d\'ouverture en grand est désactivé.');
  }

  // ---------- SCROLL OFFSET (header fixe) ----------
  const header = document.querySelector('header');
  const navLinks = document.querySelectorAll('nav a[href^="#"]');

  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      if (!targetSection) return;

      const headerHeight = header ? header.offsetHeight : 0;

      let extraOffset = 0;
      if (targetId === "separation") extraOffset = 50;

      const targetPosition = targetSection.offsetTop - headerHeight - extraOffset;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    });
  });

}); // DOMContentLoaded
