(() => {
    const banner = document.querySelector('[data-announcements]');
    if (!banner) return;

    const slides = Array.from(banner.querySelectorAll('.announcement-slide'));
    if (slides.length < 2) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let index = 0;
    let hovered = banner.matches(':hover');
    let timer;

    banner.setAttribute('aria-roledescription', 'carousel');
    slides.forEach((slide, position) => {
        slide.setAttribute('role', 'group');
        slide.setAttribute('aria-roledescription', 'slide');
        slide.setAttribute('aria-label', `${position + 1} of ${slides.length}`);
    });

    const schedule = () => {
        window.clearTimeout(timer);
        if (!reducedMotion.matches && !hovered && !banner.contains(document.activeElement) && !document.hidden) {
            timer = window.setTimeout(() => show(index + 1), 8000);
        }
    };

    const show = (nextIndex) => {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, position) => {
            const active = position === index;
            slide.classList.toggle('is-active', active);
            slide.classList.remove('is-entering');
            slide.toggleAttribute('inert', !active);
            if (active) slide.removeAttribute('aria-hidden');
            else slide.setAttribute('aria-hidden', 'true');
        });
        if (!reducedMotion.matches) slides[index].classList.add('is-entering');
        schedule();
    };

    banner.addEventListener('mouseenter', () => { hovered = true; schedule(); });
    banner.addEventListener('mouseleave', () => { hovered = false; schedule(); });
    banner.addEventListener('focusin', schedule);
    banner.addEventListener('focusout', () => window.setTimeout(schedule, 0));
    document.addEventListener('visibilitychange', schedule);
    reducedMotion.addEventListener('change', schedule);

    schedule();
})();
