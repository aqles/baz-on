// Menambahkan event listener untuk menangani klik
document.addEventListener('DOMContentLoaded', function() {
  const imageLink = document.querySelector('.image-zoom-link');

  imageLink.addEventListener('click', function(event) {
    event.preventDefault(); // Mencegah perilaku default untuk mengklik tautan
    this.querySelector('.image-zoom').classList.toggle('zoomed'); // Menambahkan atau menghapus kelas 'zoomed' saat diklik
  });
});
