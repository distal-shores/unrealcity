document.querySelectorAll('a.page-link').forEach(link => {
    if (link.href === window.location.href) {
        link.classList.add('active');
    }
});