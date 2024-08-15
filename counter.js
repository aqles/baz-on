function animateCounter(id, duration) {
    const counter = document.getElementById(id);
    const target = +counter.getAttribute('data-target');
    const increment = target / duration;

    let current = 1000;

    const updateCounter = () => {
        current += increment;

        if (current < target) {
            counter.innerText = Math.floor(current);
            requestAnimationFrame(updateCounter);
        } else {
            counter.innerText = target;
        }
    };

    updateCounter();
}

// Inisiasi animasi saat halaman sudah di-load
window.onload = function() {
    animateCounter('counter', 3000); // 2000ms = 2 detik
};
