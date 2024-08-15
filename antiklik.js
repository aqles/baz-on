// Menambahkan event listener untuk menangani klik
        document.addEventListener('DOMContentLoaded', function() {
            const imageLink = document.querySelector('.image-zoom-link');

            imageLink.addEventListener('click', function() {
                this.querySelector('.image-zoom').classList.toggle('zoomed'); // Menambahkan atau menghapus kelas 'zoomed' saat diklik
                return false; // Mencegah perilaku default
            });
        });
