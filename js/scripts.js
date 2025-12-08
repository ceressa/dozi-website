// ========================================
        // INTERACTIVE FEATURES
        // ========================================
        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, observerOptions);

        // Observe all fade-in sections
        document.querySelectorAll('.fade-in-section').forEach(el => {
            observer.observe(el);
        });

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // ========================================
        // SCREENSHOT CAROUSEL
        // ========================================
        let currentSlideIndex = 1;
        showSlide(currentSlideIndex);

        function moveCarousel(n) {
            showSlide(currentSlideIndex += n);
        }

        function currentSlide(n) {
            showSlide(currentSlideIndex = n);
        }

        function showSlide(n) {
            const slides = document.querySelectorAll('.carousel-slide');
            const dots = document.querySelectorAll('.dot');

            if (n > slides.length) { currentSlideIndex = 1; }
            if (n < 1) { currentSlideIndex = slides.length; }

            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));

            if (slides[currentSlideIndex - 1]) {
                slides[currentSlideIndex - 1].classList.add('active');
            }
            if (dots[currentSlideIndex - 1]) {
                dots[currentSlideIndex - 1].classList.add('active');
            }
        }

        // Auto-advance carousel every 5 seconds
        setInterval(() => {
            moveCarousel(1);
        }, 5000);

        // ========================================
        // FAQ ACCORDION
        // ========================================
        function toggleFAQ(element) {
            const faqItem = element.parentElement;
            const isActive = faqItem.classList.contains('active');

            // Close all FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });

            // Open clicked item if it wasn't active
            if (!isActive) {
                faqItem.classList.add('active');
            }
        }

        // ========================================
        // STICKY CTA BUTTON
        // ========================================
        window.addEventListener('scroll', () => {
            const stickyCTA = document.getElementById('stickyCTA');
            const heroSection = document.querySelector('.hero');

            if (heroSection) {
                const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;

                if (window.scrollY > heroBottom) {
                    stickyCTA.classList.add('show');
                } else {
                    stickyCTA.classList.remove('show');
                }
            }
        });