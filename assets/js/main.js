document.querySelectorAll('a.page-link').forEach(link => {
    const normalize = url => url.replace(/\/$/, '');

    if (normalize(link.href) === normalize(window.location.href)) {
        link.classList.add('active');
    }
});