import './style.css'
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const nav = document.querySelector('.nav');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        nav.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
    });
}

// Close mobile menu
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
    });
});

// ==========================================
// 1. DYNAMIC ASSET LOADING (Vite Glob)
// ==========================================
// This finds all images in these folders.
// The key is the path, value is the import function (or URL in eager mode).
// We use eager: true to get the URLs directly.

const projects = {
    'social-media': import.meta.glob('./assets/projects/social-media/*.{png,jpg,jpeg,webp,svg}', { eager: true }),
    'flyers': import.meta.glob('./assets/projects/flyers/*.{png,jpg,jpeg,webp,svg}', { eager: true }),
    'thumbnails': import.meta.glob('./assets/projects/thumbnails/*.{png,jpg,jpeg,webp,svg}', { eager: true }),
    'other': import.meta.glob('./assets/projects/other/*.{png,jpg,jpeg,webp,svg}', { eager: true }),
};

// Container
const galleryGrid = document.querySelector('.gallery-grid');
const VISIBLE_COUNT_ALL = 6; // How many to show in 'All' view
let showAllProjects = false;

const seeAllBtn = document.querySelector('#gallery-cta .btn');

if (seeAllBtn) {
    seeAllBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showAllProjects = true;
        // Re-run filter to update visibility
        filterProjects('all');
        // Hide button as all are shown
        seeAllBtn.parentElement.style.display = 'none';
    });
}

// Helper to create HTML for an item
function createWorkItem(src, category, title) {
    const div = document.createElement('div');
    div.className = 'work-item';
    div.setAttribute('data-category', category);

    // Clean up path for display (Vite handles the URL)
    const cleanSrc = src;

    div.innerHTML = `
    <img src="${cleanSrc}" alt="${title}" loading="lazy">
    <div class="gallery-overlay">
       <div class="icon">↗</div>
    </div>
  `;
    return div;
}

// Render ALL items initially into the DOM, then filter them.
function renderGallery() {
    galleryGrid.innerHTML = ''; // Clear static HTML

    for (const [category, files] of Object.entries(projects)) {
        for (const path in files) {
            const mod = files[path];
            const src = mod.default || mod; // Handle Vite module structure

            // Simple title derived from filename
            const title = path.split('/').pop().split('.')[0].replace(/[-_]/g, ' ');

            const item = createWorkItem(src, category, title);
            galleryGrid.appendChild(item);
        }
    }
}

// Run render
renderGallery();


// ==========================================
// 2. FILTERING LOGIC
// ==========================================
const workItems = document.querySelectorAll('.work-item'); // Re-select after dynamic render
const filterBtns = document.querySelectorAll('.filter-btn');

function filterProjects(filterValue) {
    const currentItems = document.querySelectorAll('.work-item'); // Always get fresh list
    let visibleCount = 0;

    currentItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        item.classList.remove('visible', 'hidden');

        let shouldShow = false;

        if (filterValue === 'all') {
            // In "All", show recent items up to limit, or show all if requested
            if (showAllProjects || visibleCount < VISIBLE_COUNT_ALL) {
                shouldShow = true;
            }
        } else {
            // In Category, show EVERY item from that category
            if (itemCategory === filterValue) {
                shouldShow = true;
            }
        }

        if (shouldShow) {
            item.classList.add('visible');
            visibleCount++;
        } else {
            item.classList.add('hidden');
        }
    });
}

// Initial filter
filterProjects('all');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterProjects(btn.getAttribute('data-filter'));
    });
});





// ==========================================
// 4. DYNAMIC CLIENTS CAROUSEL
// ==========================================
const clientImages = import.meta.glob('./assets/clients/*.{png,jpg,jpeg,svg}', { eager: true });
const clientsTrack = document.getElementById('clients-track');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

if (clientsTrack) {
    // Render Clients
    for (const path in clientImages) {
        const mod = clientImages[path];
        const src = mod.default || mod;
        const cleanSrc = src;

        const div = document.createElement('div');
        div.className = 'client-logo-item';
        div.innerHTML = `<img src="${cleanSrc}" alt="Client Logo">`;
        clientsTrack.appendChild(div);
    }

    // Scroll Logic
    if (prevBtn && nextBtn) {
        const scrollAmount = 300;

        prevBtn.addEventListener('click', () => {
            clientsTrack.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            clientsTrack.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    }
}



// ==========================================
// 5. TESTIMONIAL SLIDER & MODAL
// ==========================================

// Initial Data
// Initial Data
const defaultReviews = [
    {
        name: "Nuwan Singhalage",
        role: "Client",
        text: "I strongly recommend Gayantha for designing work as I have got few of my works done such as posters, Banners, and social media posts, He has done a great job beyond the expectation and top of that I really appreciate his creativity. I wish him great success..🥰",
        rating: 5
    },
    {
        name: "Marketing Manager",
        role: "Organica",
        text: "Working with Owl Creatives has been a game-changer for our social media presence. Gayantha really understood the natural, organic aesthetic we wanted for the Organica brand. The designs were not only visually stunning but also consistent with our identity, which helped our feed look much more professional. Highly recommend him for anyone looking to elevate their brand's online look.",
        rating: 5
    },
    {
        name: "Marketing Team",
        role: "SG Lanka Tours",
        text: "We needed a promotional flyer that could showcase our tour packages clearly without looking cluttered, and Gayantha delivered exactly that. The design was eye-catching and professional, making it easy for our customers to understand our offers at a glance. Excellent communication and fast turnaround from Owl Creatives!",
        rating: 5
    }
];

// Load from LocalStorage if available, otherwise use defaults
let reviewsData = JSON.parse(localStorage.getItem('owlReviews')) || defaultReviews;

const testimonialsTrack = document.getElementById('testimonials-track');
const prevTestiBtn = document.querySelector('.prev-testi-btn');
const nextTestiBtn = document.querySelector('.next-testi-btn');

function renderReviews() {
    if (!testimonialsTrack) return;

    testimonialsTrack.innerHTML = '';
    // Reset classes/styles
    testimonialsTrack.classList.remove('centered');

    // We will determine buttons visibility after rendering

    reviewsData.forEach(review => {
        // Create Initials
        const initials = review.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        // Create Stars
        const starsStr = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

        const card = document.createElement('div');
        card.className = 'testimonial-card';
        card.innerHTML = `
            <div class="client-info">
                <div class="client-avatar-placeholder">${initials}</div>
                <div>
                    <h4>${review.name}</h4>
                    <span>${review.role}</span>
                </div>
            </div>
            <div class="stars" style="color:gold;">${starsStr}</div>
            <p>"${review.text}"</p>
        `;
        testimonialsTrack.appendChild(card);
    });

    // Determine scrolling/buttons AFTER rendering
    setTimeout(() => {
        // Calculate total width of children vs container width
        const containerWidth = testimonialsTrack.clientWidth;
        const scrollWidth = testimonialsTrack.scrollWidth;

        // Strict check: if scrollWidth is significantly larger than clientWidth, we scroll.
        // Otherwise, we center.
        const isOverflowing = scrollWidth > containerWidth + 5; // +5px buffer

        if (isOverflowing) {
            // Show buttons and align left
            if (prevTestiBtn) prevTestiBtn.style.display = 'flex';
            if (nextTestiBtn) nextTestiBtn.style.display = 'flex';
            testimonialsTrack.classList.remove('centered');
            testimonialsTrack.style.justifyContent = 'flex-start';
        } else {
            // Hide buttons and align center
            if (prevTestiBtn) prevTestiBtn.style.display = 'none';
            if (nextTestiBtn) nextTestiBtn.style.display = 'none';
            testimonialsTrack.classList.add('centered');
            testimonialsTrack.style.justifyContent = 'center'; // Force center
        }
    }, 50);
}

// Initial Render
renderReviews();

// Update on resize
window.addEventListener('resize', () => {
    // Re-run the positioning logic without re-rendering everything
    const containerWidth = testimonialsTrack.clientWidth;
    const scrollWidth = testimonialsTrack.scrollWidth;
    const isOverflowing = scrollWidth > containerWidth + 5;

    if (isOverflowing) {
        if (prevTestiBtn) prevTestiBtn.style.display = 'flex';
        if (nextTestiBtn) nextTestiBtn.style.display = 'flex';
        testimonialsTrack.classList.remove('centered');
        testimonialsTrack.style.justifyContent = 'flex-start';
    } else {
        if (prevTestiBtn) prevTestiBtn.style.display = 'none';
        if (nextTestiBtn) nextTestiBtn.style.display = 'none';
        testimonialsTrack.classList.add('centered');
        testimonialsTrack.style.justifyContent = 'center';
    }
});

if (testimonialsTrack && prevTestiBtn && nextTestiBtn) {
    prevTestiBtn.addEventListener('click', () => {
        testimonialsTrack.scrollBy({ left: -350, behavior: 'smooth' });
    });

    nextTestiBtn.addEventListener('click', () => {
        testimonialsTrack.scrollBy({ left: 350, behavior: 'smooth' });
    });
}

// Modal Logic
const modal = document.getElementById("review-modal");
const btn = document.getElementById("add-review-btn");
const span = document.getElementsByClassName("close-modal")[0];
const form = document.getElementById("review-form");

if (btn && modal) {
    btn.onclick = function () {
        modal.classList.add('active');
    }

    span.onclick = function () {
        modal.classList.remove('active');
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.classList.remove('active');
        }
    }
}

// Handle Submission
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('reviewer-name').value;
        const role = document.getElementById('reviewer-role').value || 'Client';
        const text = document.getElementById('reviewer-text').value;
        const rating = parseInt(document.getElementById('reviewer-rating').value);

        // Add to data array
        reviewsData.push({
            name,
            role,
            text,
            rating
        });

        // Save to LocalStorage
        localStorage.setItem('owlReviews', JSON.stringify(reviewsData));

        // Re-render
        renderReviews();

        // Scroll to end if needed
        if (reviewsData.length > 3) {
            setTimeout(() => {
                testimonialsTrack.scrollTo({ left: testimonialsTrack.scrollHeight, behavior: 'smooth' });
            }, 100);
        }

        // Close and Reset
        modal.classList.remove('active');
        form.reset();
        alert('Thank you! Your review has been added.');
    });
}


// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// ==========================================
// 6. CONTACT FORM HANDLING
// ==========================================
const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get Values
        const name = document.getElementById('contact-name').value;
        const email = document.getElementById('contact-email').value;
        const service = document.getElementById('contact-service').value;
        const message = document.getElementById('contact-message').value;

        // Construct Subject and Body
        const subject = encodeURIComponent(`New Inquiry from ${name} - ${service}`);
        const body = encodeURIComponent(
            `Name: ${name}\n` +
            `Email: ${email}\n` +
            `Service Needed: ${service}\n\n` +
            `Message:\n${message}`
        );

        // Open Mail Client
        window.location.href = `mailto:owlcretives11@gmail.com?subject=${subject}&body=${body}`;

        // Optional: Reset form
        contactForm.reset();
        // Notify user about what happened
        alert('Thank you! Your default email client should open now with the message ready to send.');
    });
}
