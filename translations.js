// ==========================================
// DATA TRANSLATION (BAHASA)
// ==========================================

const translations = {
    id: {
        nav: {
            install: "Install",
            cart: "Keranjang"
        },
        hero: {
            prev: "Sebelumnya",
            next: "Selanjutnya"
        },
        flash_sale: {
            label: "FLASH SALE",
            title: "Diskon Gila-Gilaan Hingga 70%",
            ends_in: "Berakhir dalam:",
            hours: "Jam",
            minutes: "Menit",
            seconds: "Detik",
            shop_now: "Belanja Sekarang"
        },
        products: {
            title: "Koleksi Terbaru",
            search_placeholder: "Cari produk...",
            sort: {
                default: "Relevansi",
                price_asc: "Harga Terendah",
                price_desc: "Harga Tertinggi",
                name_asc: "Nama (A-Z)"
            },
            filters: {
                all: "Semua",
                favorites: "Favorit"
            },
            load_more: "Muat Lebih Banyak",
            empty: "Tidak ada produk yang cocok. Coba kata kunci atau kategori lain.",
            badges: {
                sale: "SALE",
                best_seller: "Best Seller",
                limited_stock: "Stok Terbatas"
            }
        },
        testimonials: {
            title: "Apa Kata Mereka?"
        },
        features: {
            free_shipping: {
                title: "Gratis Ongkir",
                desc: "Minimal belanja Rp 500rb"
            },
            secure_payment: {
                title: "Pembayaran Aman",
                desc: "Transaksi 100% terproteksi"
            },
            quality_guarantee: {
                title: "Jaminan Kualitas",
                desc: "Produk original & premium"
            },
            service_247: {
                title: "Layanan 24/7",
                desc: "Bantuan kapan saja"
            }
        },
        footer: {
            about: "Platform belanja modern dengan pilihan fashion dan gadget premium. Temukan gaya terbaik Anda bersama kami.",
            links_title: "Tautan",
            links: {
                about_us: "Tentang Kami",
                terms: "Syarat & Ketentuan",
                contact: "Hubungi Kami",
                install: "Cara Install"
            },
            newsletter_title: "Berlangganan",
            newsletter_desc: "Dapatkan info promo spesial!",
            email_placeholder: "Email Anda...",
            copyright: "© 2026 Baz-On Store. All rights reserved.",
            made_with: "Made with"
        },
        modal: {
            stock: "Stok:",
            stock_available: "Tersedia",
            stock_empty: "Stok Habis",
            specs: "Spesifikasi:",
            add_to_cart: "Tambah ke Keranjang",
            share: "Bagikan:",
            variant_size: "Ukuran / Tipe:",
            variant_color: "Warna:",
            variant_flavor: "Rasa:",
            reviews: "Ulasan"
        },
        cart: {
            title: "Keranjang Belanja",
            empty: "Keranjang Anda kosong",
            coupon_placeholder: "Kode Promo (opsional)",
            apply: "Pakai",
            subtotal: "Subtotal",
            discount: "Diskon",
            total: "Total",
            checkout: "Checkout Sekarang"
        },
        checkout: {
            title: "Data Pemesanan",
            name: "Nama Lengkap",
            name_placeholder: "Nama Anda",
            phone: "Nomor WhatsApp",
            phone_placeholder: "08xxxxxxxxxx",
            address: "Alamat Lengkap",
            address_placeholder: "Jalan, RT/RW, Kelurahan, Kecamatan, Kota, Kode Pos",
            payment: "Metode Pembayaran",
            payment_transfer: "Transfer Bank (BCA/Mandiri)",
            payment_cod: "COD (Bayar di Tempat)",
            save_address: "Simpan alamat untuk pesanan berikutnya",
            submit: "Kirim Pesan Pemesanan"
        },
        toast: {
            welcome: "Selamat datang di Baz-On Store!",
            added_to_cart: "Berhasil ditambahkan ke keranjang",
            removed_from_cart: "Produk dihapus dari keranjang",
            select_variant: "Silakan pilih varian terlebih dahulu",
            select_size: "Pilih ukuran terlebih dahulu!",
            select_color: "Pilih warna terlebih dahulu!",
            select_flavor: "Pilih rasa terlebih dahulu!",
            coupon_applied: "Kupon diterapkan!",
            coupon_invalid: "Kode kupon tidak valid!",
            coupon_removed: "Kupon dihapus",
            fill_data: "Mohon lengkapi semua data!",
            redirecting: "Mengarahkan ke WhatsApp...",
            link_copied: "Link berhasil disalin!"
        }
    },
    en: {
        nav: {
            install: "Install",
            cart: "Cart"
        },
        hero: {
            prev: "Previous",
            next: "Next"
        },
        flash_sale: {
            label: "FLASH SALE",
            title: "Crazy Discounts Up To 70%",
            ends_in: "Ends in:",
            hours: "Hours",
            minutes: "Mins",
            seconds: "Secs",
            shop_now: "Shop Now"
        },
        products: {
            title: "New Arrivals",
            search_placeholder: "Search products...",
            sort: {
                default: "Relevance",
                price_asc: "Lowest Price",
                price_desc: "Highest Price",
                name_asc: "Name (A-Z)"
            },
            filters: {
                all: "All",
                favorites: "Favorites"
            },
            load_more: "Load More",
            empty: "No products match. Try another keyword or category.",
            badges: {
                sale: "SALE",
                best_seller: "Best Seller",
                limited_stock: "Limited Stock"
            }
        },
        testimonials: {
            title: "What They Say"
        },
        features: {
            free_shipping: {
                title: "Free Shipping",
                desc: "Min. spend IDR 500k"
            },
            secure_payment: {
                title: "Secure Payment",
                desc: "100% protected transactions"
            },
            quality_guarantee: {
                title: "Quality Guarantee",
                desc: "Original & premium products"
            },
            service_247: {
                title: "24/7 Support",
                desc: "Help whenever you need"
            }
        },
        footer: {
            about: "Modern shopping platform with premium fashion and gadget choices. Find your best style with us.",
            links_title: "Links",
            links: {
                about_us: "About Us",
                products: "Products",
                terms: "Terms & Conditions",
                contact: "Contact Us",
                install: "How to Install"
            },
            newsletter_title: "Subscribe",
            newsletter_desc: "Get special promo info!",
            email_placeholder: "Your Email...",
            copyright: "© 2026 Baz-On Store. All rights reserved.",
            made_with: "Made with"
        },
        modal: {
            stock: "Stock:",
            stock_available: "Available",
            stock_empty: "Out of Stock",
            specs: "Specifications:",
            add_to_cart: "Add to Cart",
            share: "Share:",
            variant_size: "Size / Type:",
            variant_color: "Color:",
            variant_flavor: "Flavor:",
            reviews: "Reviews"
        },
        cart: {
            title: "Shopping Cart",
            empty: "Your cart is empty",
            coupon_placeholder: "Promo Code (optional)",
            apply: "Apply",
            subtotal: "Subtotal",
            discount: "Discount",
            total: "Total",
            checkout: "Checkout Now"
        },
        checkout: {
            title: "Order Details",
            name: "Full Name",
            name_placeholder: "Your Name",
            phone: "WhatsApp Number",
            phone_placeholder: "08xxxxxxxxxx",
            address: "Full Address",
            address_placeholder: "Street, District, City, Zip Code",
            payment: "Payment Method",
            payment_transfer: "Bank Transfer (BCA/Mandiri)",
            payment_cod: "COD (Cash On Delivery)",
            save_address: "Save address for next order",
            submit: "Send Order Message"
        },
        toast: {
            welcome: "Welcome to Baz-On Store!",
            added_to_cart: "Successfully added to cart",
            removed_from_cart: "Product removed from cart",
            select_variant: "Please select a variant first",
            select_size: "Please select a size first!",
            select_color: "Please select a color first!",
            select_flavor: "Please select a flavor first!",
            coupon_applied: "Coupon applied!",
            coupon_invalid: "Invalid coupon code!",
            coupon_removed: "Coupon removed",
            fill_data: "Please fill in all data!",
            redirecting: "Redirecting to WhatsApp...",
            link_copied: "Link successfully copied!"
        }
    }
};
