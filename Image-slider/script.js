class ImageGallery {
    constructor() {
        this.currentImageIndex = 0;
        this.filteredImages = [];
        this.allImages = [];
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.setupImages();
        this.filterImages('all');
    }

    setupElements() {
        this.gallery = document.getElementById('gallery');
        this.lightbox = document.getElementById('lightbox');
        this.lightboxImg = document.getElementById('lightboxImg');
        this.lightboxTitle = document.getElementById('lightboxTitle');
        this.lightboxDesc = document.getElementById('lightboxDesc');
        this.closeBtn = document.getElementById('closeBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.filterBtns = document.querySelectorAll('.filter-btn');
    }

    setupEventListeners() {
        // Filter buttons
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setActiveFilter(e.target);
                this.filterImages(e.target.dataset.filter);
            });
        });

        // Gallery items
        this.gallery.addEventListener('click', (e) => {
            const galleryItem = e.target.closest('.gallery-item');
            if (galleryItem && !galleryItem.classList.contains('hidden')) {
                this.openLightbox(galleryItem);
            }
        });

        // Lightbox controls
        this.closeBtn.addEventListener('click', () => this.closeLightbox());
        this.prevBtn.addEventListener('click', () => this.previousImage());
        this.nextBtn.addEventListener('click', () => this.nextImage());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.lightbox.style.display === 'block') {
                switch(e.key) {
                    case 'Escape':
                        this.closeLightbox();
                        break;
                    case 'ArrowLeft':
                        this.previousImage();
                        break;
                    case 'ArrowRight':
                        this.nextImage();
                        break;
                }
            }
        });

        // Close lightbox when clicking outside image
        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) {
                this.closeLightbox();
            }
        });

        // Touch/swipe support for mobile
        this.setupTouchEvents();
    }

    setupTouchEvents() {
        let startX = 0;
        let endX = 0;

        this.lightbox.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        this.lightbox.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            this.handleSwipe(startX, endX);
        });
    }

    handleSwipe(startX, endX) {
        const threshold = 50;
        const diff = startX - endX;

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.nextImage(); // Swipe left - next image
            } else {
                this.previousImage(); // Swipe right - previous image
            }
        }
    }

    setupImages() {
        this.allImages = Array.from(document.querySelectorAll('.gallery-item'));
        this.allImages.forEach((item, index) => {
            const img = item.querySelector('img');
            const title = item.querySelector('.overlay h3').textContent;
            const desc = item.querySelector('.overlay p').textContent;
            
            item.dataset.index = index;
            item.dataset.title = title;
            item.dataset.desc = desc;
        });
    }

    setActiveFilter(activeBtn) {
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
    }

    filterImages(category) {
        // First, show all items temporarily to reset positions
        this.allImages.forEach(item => {
            item.classList.remove('hidden', 'visible');
        });
        
        // Small delay to allow CSS to reset
        setTimeout(() => {
            this.allImages.forEach((item, index) => {
                const itemCategory = item.dataset.category;
                const shouldShow = category === 'all' || itemCategory === category;
                
                if (shouldShow) {
                    item.classList.add('visible');
                    item.style.display = 'block';
                } else {
                    item.classList.add('hidden');
                    item.style.display = 'none';
                }
            });

            // Update filtered images array for lightbox navigation
            this.filteredImages = this.allImages.filter(item => 
                item.classList.contains('visible')
            );
        }, 50);
    }

    openLightbox(galleryItem) {
        const img = galleryItem.querySelector('img');
        const title = galleryItem.dataset.title;
        const desc = galleryItem.dataset.desc;
        
        // Find index in filtered images
        this.currentImageIndex = this.filteredImages.indexOf(galleryItem);
        
        this.lightboxImg.src = img.src;
        this.lightboxImg.alt = img.alt;
        this.lightboxTitle.textContent = title;
        this.lightboxDesc.textContent = desc;
        
        this.lightbox.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Add fade in animation
        this.lightbox.style.opacity = '0';
        setTimeout(() => {
            this.lightbox.style.opacity = '1';
        }, 10);
    }

    closeLightbox() {
        this.lightbox.style.opacity = '0';
        setTimeout(() => {
            this.lightbox.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }

    previousImage() {
        if (this.filteredImages.length === 0) return;
        
        this.currentImageIndex = this.currentImageIndex > 0 
            ? this.currentImageIndex - 1 
            : this.filteredImages.length - 1;
        
        this.updateLightboxImage();
    }

    nextImage() {
        if (this.filteredImages.length === 0) return;
        
        this.currentImageIndex = this.currentImageIndex < this.filteredImages.length - 1 
            ? this.currentImageIndex + 1 
            : 0;
        
        this.updateLightboxImage();
    }

    updateLightboxImage() {
        const currentItem = this.filteredImages[this.currentImageIndex];
        const img = currentItem.querySelector('img');
        const title = currentItem.dataset.title;
        const desc = currentItem.dataset.desc;
        
        // Add slide transition effect
        this.lightboxImg.style.opacity = '0';
        
        setTimeout(() => {
            this.lightboxImg.src = img.src;
            this.lightboxImg.alt = img.alt;
            this.lightboxTitle.textContent = title;
            this.lightboxDesc.textContent = desc;
            this.lightboxImg.style.opacity = '1';
        }, 150);
    }
}

// Initialize the gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ImageGallery();
});

// Add smooth scrolling for better UX
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Lazy loading enhancement
const observerOptions = {
    threshold: 0.1,
    rootMargin: '50px'
};

const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.classList.add('loaded');
            imageObserver.unobserve(img);
        }
    });
}, observerOptions);

// Observe all images for lazy loading
document.querySelectorAll('.gallery-item img').forEach(img => {
    imageObserver.observe(img);
});