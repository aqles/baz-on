// Menambahkan event listener untuk menangani klik
        document.addEventListener('DOMContentLoaded', function() {
            const image = document.querySelector('.image-zoom');

            image.addEventListener('click', function() {
                this.classList.toggle('zoomed'); // Menambahkan atau menghapus kelas 'zoomed' saat diklik
            });
        });
