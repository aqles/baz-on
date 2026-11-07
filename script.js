// Mengambil data dari global scope (data.js)
// Termasuk: heroSlides, products, testimonials


let currentTestimonialSlide = 0;

function renderTestimonials() {
    const testimonialTrack = document.getElementById('testimonialTrack');
    const prevBtn = document.getElementById('testiPrevBtn');
    const nextBtn = document.getElementById('testiNextBtn');

    if (!testimonialTrack) return;

    testimonialTrack.innerHTML = testimonials.map(item => `
        <div class="testimonial-card">
            <div class="testimonial-header">
                <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" class="testimonial-avatar">
                <div>
                    <h4 class="testimonial-name">${escapeHtml(item.name)}</h4>
                    <span class="testimonial-role">${escapeHtml(item.role)}</span>
                </div>
            </div>
            <div class="testimonial-rating">
                ${Array(Math.max(0, Math.min(5, Number(item.rating) || 0))).fill('<i class="fa-solid fa-star"></i>').join('')}
            </div>
            <p class="testimonial-text">"${escapeHtml(item.text)}"</p>
        </div>
    `).join('');

    // Event Listeners for Nav
    prevBtn.addEventListener('click', () => {
        moveTestimonialSlide(-1);
    });

    nextBtn.addEventListener('click', () => {
        moveTestimonialSlide(1);
    });

    // Resize listener to reset position if screen size changes
    window.addEventListener('resize', updateTestimonialPosition);
}

function moveTestimonialSlide(direction) {
    const totalSlides = testimonials.length;
    let cardsPerView = 1;

    if (window.innerWidth >= 1024) cardsPerView = 3;
    else if (window.innerWidth >= 768) cardsPerView = 2;

    const maxSlide = totalSlides - cardsPerView;

    // Boundary Check
    if (direction === 1 && currentTestimonialSlide >= maxSlide) {
        currentTestimonialSlide = 0; // Loop back to start
    } else if (direction === -1 && currentTestimonialSlide <= 0) {
        currentTestimonialSlide = maxSlide; // Loop to end
    } else {
        currentTestimonialSlide += direction;
    }

    updateTestimonialPosition();
}

function updateTestimonialPosition() {
    const track = document.getElementById('testimonialTrack');
    let cardWidth = 100; // Percentage

    if (window.innerWidth >= 1024) cardWidth = 33.333;
    else if (window.innerWidth >= 768) cardWidth = 50;

    track.style.transform = `translateX(-${currentTestimonialSlide * cardWidth}%)`;
}



/**
 * State & Variabel Global
 * Menyimpan status aplikasi seperti keranjang, wishlist, dan bahasa.
 */
let cart = JSON.parse(localStorage.getItem('bazon_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('bazon_wishlist')) || [];
let activeCoupon = null;
let currentVariant = {}; // Menyimpan varian yang dipilih user
let currentLang = localStorage.getItem('bazon_lang') || 'id'; // Bahasa default

// --- Referensi Elemen DOM ---
const productGrid = document.getElementById('productGrid');
const cartBtn = document.getElementById('cartBtn');
const cartModal = document.getElementById('cartModal');
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckout = document.getElementById('closeCheckout');
const filterBtns = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('searchInput');
const productModal = document.getElementById('productModal');
const closeProductModal = document.getElementById('closeProductModal');
const modalProductImage = document.getElementById('modalProductImage');
const modalProductCategory = document.getElementById('modalProductCategory');
const modalProductTitle = document.getElementById('modalProductTitle');
const modalProductPrice = document.getElementById('modalProductPrice');
const modalProductDesc = document.getElementById('modalProductDesc');
const modalAddToCartBtn = document.getElementById('modalAddToCartBtn');

const closeCart = document.getElementById('closeCart');
const cartItemsContainer = document.getElementById('cartItems');
const cartCountElement = document.getElementById('cartCount');
const cartSummary = document.getElementById('cartSummary');
const checkoutBtn = document.getElementById('checkoutBtn');

// --- Elemen Kupon ---
const couponInput = document.getElementById('couponInput');
const applyCouponBtn = document.getElementById('applyCouponBtn');
const removeCouponBtn = document.getElementById('removeCouponBtn');

// --- Fungsi Bantuan (Helpers) ---
const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(price);
};

// Escape semua data sebelum masuk ke innerHTML (nama produk, testimoni, varian, dll)
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

function saveWishlist() {
    localStorage.setItem('bazon_wishlist', JSON.stringify(wishlist));
}

function saveCart() {
    localStorage.setItem('bazon_cart', JSON.stringify(cart));
    if (cartCountElement) cartCountElement.textContent = cart.reduce((total, item) => total + item.quantity, 0);
}

function showToast(message, type = 'info') {
    // Toast WAJIB masuk #toastContainer (fixed, z-index 3000) — dulu nempel ke body
    // jadi blok statis di dasar halaman dan tidak pernah terlihat user.
    const container = document.getElementById('toastContainer') || document.body;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 30);

    // Remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Kunci scroll halaman selama ada modal/drawer terbuka — dulu halaman belakang ikut scroll.
function syncScrollLock() {
    const anyOpen = [productModal, cartModal, checkoutModal].some(m => m && m.classList.contains('active'));
    document.body.style.overflow = anyOpen ? 'hidden' : '';
}
[productModal, cartModal, checkoutModal].forEach(m => {
    if (m) new MutationObserver(syncScrollLock).observe(m, { attributes: true, attributeFilter: ['class'] });
});

// --- Logika "Muat Lebih Banyak" ---
let currentProductLimit = config.maxProducts || 8;
const loadMoreContainer = document.getElementById('loadMoreContainer');
const loadMoreBtn = document.getElementById('loadMoreBtn');

if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
        currentProductLimit += 4; // Load 4 more
        renderProducts(activeCategory, searchInput ? searchInput.value : '');
    });
}

// --- Fungsi Render (Tampilan) ---
function renderProducts(category = 'all', searchTerm = '') {
    if (!productGrid) return;
    // Keep track of active category for Load More
    activeCategory = category;

    let filteredProducts = [...products]; // Create copy

    // Filter by Category
    if (category === 'favorites') {
        filteredProducts = filteredProducts.filter(p => wishlist.includes(p.id));
    } else if (category !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    // Filter by Search Term
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(term) ||
            p.description.toLowerCase().includes(term)
        );
    }

    // Sort Products
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        const sortMethod = sortSelect.value;
        if (sortMethod === 'price_asc') {
            filteredProducts.sort((a, b) => a.price - b.price);
        } else if (sortMethod === 'price_desc') {
            filteredProducts.sort((a, b) => b.price - a.price);
        } else if (sortMethod === 'name_asc') {
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        }
    }

    const totalFiltered = filteredProducts.length;

    // Limit Products (apply limit only if we are in 'all' or specific categories where pagination is desired)
    // We apply pagination generally now if limit > 0
    if (currentProductLimit > 0) {
        filteredProducts = filteredProducts.slice(0, currentProductLimit);
    }

    // Manage Load More Button Visibility
    if (loadMoreContainer) {
        if (filteredProducts.length < totalFiltered) {
            loadMoreContainer.style.display = 'block';
        } else {
            loadMoreContainer.style.display = 'none';
        }
    }

    if (filteredProducts.length === 0) {
        // Dulu grid cuma kosong melompong (mis. filter Favorit tanpa favorit) tanpa penjelasan.
        productGrid.innerHTML = `<div class="empty-products">${escapeHtml(translations[currentLang].products.empty)}</div>`;
        return;
    }

    productGrid.innerHTML = filteredProducts.map(product => {
        const isWishlist = wishlist.includes(product.id);
        const hasDiscount = product.originalPrice && product.originalPrice > product.price;
        const hasBadge = !!product.badge;

        let badgeHtml = '';
        const badgeClass = product.badge === 'best-seller' || product.badge === 'limited' ? product.badge : '';

        // Logika Badge: Bergantian jika ada diskon & badge, statis jika cuma satu
        if (hasDiscount && hasBadge && badgeClass) {
            const badgeLabel = product.badge === 'best-seller' ? translations[currentLang].products.badges.best_seller : translations[currentLang].products.badges.limited_stock;
            badgeHtml = `
                <div class="sale-badge badge-anim-1">${escapeHtml(translations[currentLang].products.badges.sale)}</div>
                <div class="product-badge ${badgeClass} badge-anim-2">${escapeHtml(badgeLabel)}</div>
             `;
        } else if (hasDiscount) {
            badgeHtml = `<div class="sale-badge">${escapeHtml(translations[currentLang].products.badges.sale)}</div>`;
        } else if (hasBadge && badgeClass) {
            const badgeLabel = product.badge === 'best-seller' ? translations[currentLang].products.badges.best_seller : translations[currentLang].products.badges.limited_stock;
            badgeHtml = `<div class="product-badge ${badgeClass}">${escapeHtml(badgeLabel)}</div>`;
        }

        return `
        <div class="product-card">
            ${badgeHtml}
            <div class="product-image-container">
                <img src="${escapeHtml(product.image)}" loading="lazy" alt="${escapeHtml(product.name)}" class="product-image">
            </div>
            <div class="product-info">
                <div class="product-category">${escapeHtml(product.category)}</div>
                <h3 class="product-title">${escapeHtml(product.name)}</h3>

                <div class="product-price-container">
                    ${hasDiscount ? `<div class="original-price">${formatPrice(product.originalPrice)}</div>` : ''}
                    <div class="current-price ${hasDiscount ? 'discounted' : ''}">${formatPrice(product.price)}</div>
                </div>

                <div class="product-action-buttons">
                    <button class="btn-add-cart" data-action="add" data-id="${Number(product.id)}">
                        <i class="fa-solid fa-cart-plus"></i> <span>${escapeHtml(translations[currentLang].modal.add_to_cart)}</span>
                    </button>
                    <button class="btn-wishlist ${isWishlist ? 'active' : ''}" data-action="wishlist" data-id="${Number(product.id)}" aria-label="Wishlist ${escapeHtml(product.name)}" aria-pressed="${isWishlist}">
                        <i class="fa-${isWishlist ? 'solid' : 'regular'} fa-heart"></i>
                    </button>
                    <button class="btn-secondary btn-detail" data-action="detail" data-id="${Number(product.id)}">
                        Detail
                    </button>
                </div>
            </div>
        </div>
    `;
    }).join('');
}
function renderCart() {
    if (cartCountElement) cartCountElement.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    if (!cartItemsContainer || !cartSummary) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-message">Keranjang Anda kosong</div>';
        cartSummary.innerHTML = `
            <span>Total:</span>
            <span>${formatPrice(0)}</span>
        `;
        return;
    }

    // Render Items
    cartItemsContainer.innerHTML = cart.map(item => {
        const product = products.find(p => p.id === item.id);
        const currentPrice = item.price || (product ? product.price : 0);

        if (!product) return '';

        // Variant Text
        let variantText = '';
        if (item.variants) {
            const parts = [];
            if (item.variants.size) parts.push(`Size: ${escapeHtml(item.variants.size)}`);
            if (item.variants.color) parts.push(`Color: ${escapeHtml(item.variants.color)}`);
            if (item.variants.flavor) parts.push(`Rasa: ${escapeHtml(item.variants.flavor)}`);
            variantText = parts.length > 0 ? `<div class="cart-variant-info">${parts.join(', ')}</div>` : '';
        }

        // We need a unique composite ID for removing items from cart
        const cartItemId = item.cartId || String(item.id); // Backward compatibility

        return `
            <div class="cart-item">
                <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" class="cart-item-img">
                <div class="cart-item-details">
                    <div class="cart-item-title">${escapeHtml(product.name)}</div>
                    ${variantText}
                    <div class="cart-item-price">${formatPrice(currentPrice)}</div>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button class="btn-qty" data-cart-action="dec" data-cart-id="${escapeHtml(cartItemId)}" aria-label="Kurangi jumlah"><i class="fa-solid fa-minus"></i></button>
                            <span>${Number(item.quantity) || 0}</span>
                            <button class="btn-qty" data-cart-action="inc" data-cart-id="${escapeHtml(cartItemId)}" aria-label="Tambah jumlah"><i class="fa-solid fa-plus"></i></button>
                        </div>
                        <button class="btn-remove" data-cart-action="remove" data-cart-id="${escapeHtml(cartItemId)}" aria-label="Hapus dari keranjang"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Calculate Totals using stored price or product price
    let total = cart.reduce((sum, item) => {
        const product = products.find(p => p.id === item.id);
        const price = item.price || (product ? product.price : 0);
        return sum + (price * item.quantity);
    }, 0);

    let discountAmount = 0;
    if (activeCoupon) {
        if (activeCoupon.type === 'percent') {
            discountAmount = total * (activeCoupon.value / 100);
        } else if (activeCoupon.type === 'fixed') {
            discountAmount = activeCoupon.value;
        }
    }

    if (discountAmount > total) discountAmount = total;
    const grandTotal = total - discountAmount;

    cartSummary.innerHTML = `
        <div class="cart-subtotal">
            <span>${translations[currentLang].cart.subtotal}</span>
            <span>${formatPrice(total)}</span>
        </div>
        ${activeCoupon ? `
        <div class="cart-discount">
            <span>${translations[currentLang].cart.discount} (${escapeHtml(activeCoupon.code)})</span>
            <span>- ${formatPrice(discountAmount)}</span>
        </div>
        ` : ''}
        <div class="cart-grand-total">
            <span>${translations[currentLang].cart.total}</span>
            <span>${formatPrice(grandTotal)}</span>
        </div>
    `;

    // Manage Coupon UI State
    if (!couponInput || !applyCouponBtn || !removeCouponBtn) return;
    if (activeCoupon) {
        couponInput.value = activeCoupon.code;
        couponInput.disabled = true;
        applyCouponBtn.classList.add('hidden');
        removeCouponBtn.classList.remove('hidden');
    } else {
        // Jangan timpa couponInput.value di sini: renderCart terpicu banyak hal
        // (qty, tambah item) dan dulu kode yang sedang diketik user ikut terhapus.
        couponInput.disabled = false;
        applyCouponBtn.classList.remove('hidden');
        removeCouponBtn.classList.add('hidden');
    }
}

// --- Logika Tambah ke Keranjang ---
window.addToCart = (productId, fromModal = false) => {
    const product = products.find(p => p.id === productId);

    // If adding from grid, and product has variants, open modal instead
    // (flavors ikut dicek: produk rasa-saja dulu lolos dan masuk keranjang tanpa rasa terpilih)
    if (!fromModal && product.variants && (product.variants.sizes || product.variants.colors || product.variants.flavors)) {
        openProductModal(productId);
        showToast(translations[currentLang].toast.select_variant, 'info');
        return;
    }

    // Identify Cart Item ID (Composite for variants)
    let cartItem = {
        id: productId,
        quantity: 1,
        variants: fromModal ? { ...currentVariant } : {},
        price: (fromModal && currentVariant.selectedPrice) ? currentVariant.selectedPrice : product.price
    };

    // Generate a unique ID for the cart item based on product ID + variants
    // Simple hash: id-size-color
    const variantKey = Object.values(cartItem.variants).join('-');
    cartItem.cartId = `${productId}-${variantKey}`;

    const existingItem = cart.find(item => item.cartId === cartItem.cartId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push(cartItem);
    }

    saveCart();
    renderCart();

    showToast(translations[currentLang].toast.added_to_cart, 'success');
};

const cartKey = (item) => item.cartId || String(item.id);

window.updateQuantity = (cartItemId, change) => {
    const item = cart.find(item => cartKey(item) === String(cartItemId));
    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        removeFromCart(cartItemId);
    } else {
        saveCart();
        renderCart();
    }
};

window.removeFromCart = (cartItemId) => {
    cart = cart.filter(item => cartKey(item) !== String(cartItemId));
    saveCart();
    renderCart();
    showToast(translations[currentLang].toast.removed_from_cart, 'error');
};

// Wishlist: tadinya tombolnya manggil fungsi yang tidak pernah ada — sekarang beneran jalan + persisten
window.toggleWishlist = (productId) => {
    const id = Number(productId);
    wishlist = wishlist.includes(id) ? wishlist.filter(w => w !== id) : [...wishlist, id];
    saveWishlist();
    renderProducts(activeCategory, searchInput ? searchInput.value : '');
};


// --- Modal Checkout & Auto-fill Alamat ---
function openCheckoutModal() {
    if (cart.length === 0) {
        showToast(translations[currentLang].cart.empty, 'error');
        return;
    }
    cartModal.classList.remove('active');
    checkoutModal.classList.add('active');

    // Auto-fill address
    const savedData = localStorage.getItem('bazon_user_data');
    if (savedData) {
        const userData = JSON.parse(savedData);
        if (userData.name) document.getElementById('customerName').value = userData.name;
        if (userData.phone) document.getElementById('customerPhone').value = userData.phone;
        if (userData.address) document.getElementById('customerAddress').value = userData.address;
    }

    // Check if checkbox exists, if not create it
    const form = document.getElementById('checkoutForm');
    if (!document.getElementById('saveAddressCheckbox')) {
        const checkboxGroup = document.createElement('div');
        checkboxGroup.className = 'save-address-group';
        checkboxGroup.innerHTML = `
            <input type="checkbox" id="saveAddressCheckbox" checked>
            <label for="saveAddressCheckbox">${escapeHtml(translations[currentLang].checkout.save_address)}</label>
         `;
        // Insert before submit button (last element)
        form.insertBefore(checkboxGroup, form.lastElementChild);
    }
}

window.processOrder = () => {
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    const address = document.getElementById('customerAddress').value;
    const payment = document.getElementById('paymentMethod').value;
    const shouldSave = document.getElementById('saveAddressCheckbox')?.checked;

    if (!name || !phone || !address) {
        showToast(translations[currentLang].toast.fill_data, 'error');
        return;
    }

    // Save Data if requested
    if (shouldSave) {
        const userData = { name, phone, address };
        localStorage.setItem('bazon_user_data', JSON.stringify(userData));
    }

    let message = 'Halo Admin, saya ingin memesan:\n\n';
    let total = 0;

    cart.forEach((item, index) => {
        const product = products.find(p => p.id === item.id);
        if (!product) return;
        const unitPrice = item.price || product.price;
        const itemTotal = unitPrice * item.quantity;
        total += itemTotal;

        let variantInfo = '';
        if (item.variants) {
            const parts = [];
            if (item.variants.size) parts.push(`Size: ${item.variants.size}`);
            if (item.variants.color) parts.push(`Color: ${item.variants.color}`);
            if (item.variants.flavor) parts.push(`Rasa: ${item.variants.flavor}`);
            if (parts.length > 0) variantInfo = ` (${parts.join(', ')})`;
        }

        message += `${index + 1}. ${product.name}${variantInfo} (x${item.quantity}) - ${formatPrice(itemTotal)}\n`;
    });

    message += `\nTotal: *${formatPrice(total)}*\n`;

    if (activeCoupon) {
        let discountAmount = 0;
        if (activeCoupon.type === 'percent') {
            discountAmount = total * (activeCoupon.value / 100);
        } else {
            discountAmount = activeCoupon.value;
        }
        if (discountAmount > total) discountAmount = total;

        message += `Diskon (${activeCoupon.code}): -${formatPrice(discountAmount)}\n`;
        message += `*Grand Total: ${formatPrice(total - discountAmount)}*\n\n`;
    } else {
        message += `\n`;
    }
    message += `Data Pemesan:\n`;
    message += `Nama: ${name}\n`;
    message += `No. HP: ${phone}\n`;
    message += `Alamat: ${address}\n`;
    message += `Pembayaran: ${payment}\n`;
    message += `\nMohon diproses. Terima kasih!`;

    const whatsappUrl = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    showToast(translations[currentLang].toast.redirecting, 'success');
};


// --- Logika Modal Produk ---
window.openProductModal = (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    // Reset current variant
    currentVariant = {};

    modalProductImage.src = product.image;
    modalProductCategory.textContent = product.category;
    modalProductTitle.textContent = product.name;
    modalProductPrice.textContent = formatPrice(product.price);
    modalProductDesc.textContent = product.description;

    // ... (Rating logic same) ...
    const starCount = Math.round(product.rating || 0);
    const starHtml = Array(5).fill(0).map((_, i) =>
        `<i class="fa-${i < starCount ? 'solid' : 'regular'} fa-star"></i>`
    ).join('');

    document.getElementById('modalProductRating').innerHTML = `
        ${starHtml}
        <span>(${Number(product.reviews) || 0} Ulasan)</span>
    `;

    // ... (Stock logic same) ...
    const stockElem = document.getElementById('modalProductStock');
    if (product.stock > 0) {
        stockElem.textContent = `${translations[currentLang].modal.stock} ${product.stock} ${translations[currentLang].modal.stock_available}`;
        stockElem.classList.remove('low');
        stockElem.style.display = 'block';
        if (product.stock < 10) stockElem.classList.add('low');
    } else {
        stockElem.textContent = translations[currentLang].modal.stock_empty;
        stockElem.classList.add('low');
    }

    // Render Variants
    const variantsContainer = document.getElementById('modalVariants');
    variantsContainer.innerHTML = ''; // Clear previous

    if (product.variants) {
        // Sizes (or Types)
        if (product.variants.sizes && product.variants.sizes.length > 0) {
            const sizeGroup = document.createElement('div');
            sizeGroup.className = 'variant-group';
            sizeGroup.dataset.variantGroup = 'size';
            sizeGroup.innerHTML = `
                <span class="variant-label">${escapeHtml(translations[currentLang].modal.variant_size)}</span>
                <div class="variant-options" id="sizeOptions">
                    ${product.variants.sizes.map(size => {
                const isObject = typeof size === 'object';
                const val = isObject ? size.name : size;
                const price = isObject ? size.price : null;
                return `<button type="button" class="variant-btn" data-variant-type="size" data-variant-value="${escapeHtml(val)}"${price ? ` data-variant-price="${Number(price)}"` : ''}>${escapeHtml(val)}</button>`;
            }).join('')}
                </div>
             `;
            variantsContainer.appendChild(sizeGroup);
        }

        // Colors
        if (product.variants.colors && product.variants.colors.length > 0) {
            const colorGroup = document.createElement('div');
            colorGroup.className = 'variant-group';
            colorGroup.dataset.variantGroup = 'color';
            colorGroup.innerHTML = `
                <span class="variant-label">${escapeHtml(translations[currentLang].modal.variant_color)}</span>
                <div class="variant-options" id="colorOptions">
                    ${product.variants.colors.map(color => {
                const isObject = typeof color === 'object';
                const val = isObject ? color.name : color;
                const price = isObject ? color.price : null;
                return `<button type="button" class="variant-btn" data-variant-type="color" data-variant-value="${escapeHtml(val)}"${price ? ` data-variant-price="${Number(price)}"` : ''}>${escapeHtml(val)}</button>`;
            }).join('')}
                </div>
             `;
            variantsContainer.appendChild(colorGroup);
        }

        // Flavors
        if (product.variants.flavors && product.variants.flavors.length > 0) {
            const flavorGroup = document.createElement('div');
            flavorGroup.className = 'variant-group';
            flavorGroup.dataset.variantGroup = 'flavor';
            flavorGroup.innerHTML = `
                <span class="variant-label">${escapeHtml(translations[currentLang].modal.variant_flavor)}</span>
                <div class="variant-options" id="flavorOptions">
                    ${product.variants.flavors.map(flavor => {
                const isObject = typeof flavor === 'object';
                const val = isObject ? flavor.name : flavor;
                const price = isObject ? flavor.price : null;
                return `<button type="button" class="variant-btn" data-variant-type="flavor" data-variant-value="${escapeHtml(val)}"${price ? ` data-variant-price="${Number(price)}"` : ''}>${escapeHtml(val)}</button>`;
            }).join('')}
                </div>
             `;
            variantsContainer.appendChild(flavorGroup);
        }
    }

    // Spec logic same
    const specsList = document.getElementById('modalProductSpecs');
    if (product.specs && product.specs.length > 0) {
        specsList.innerHTML = product.specs.map(spec => `<li>${escapeHtml(spec)}</li>`).join('');
        document.querySelector('.modal-specs-container').style.display = 'block';
    } else {
        document.querySelector('.modal-specs-container').style.display = 'none';
    }

    // Update Add to Cart button
    modalAddToCartBtn.onclick = () => {
        // Validate Variants: tandai grup yang belum dipilih + gulir ke grup itu,
        // supaya user melihat persis apa yang kurang (bukan cuma toast).
        if (product.variants) {
            const missing = [
                ['sizes', 'size', 'select_size'],
                ['colors', 'color', 'select_color'],
                ['flavors', 'flavor', 'select_flavor']
            ].find(([key, type]) => product.variants[key] && !currentVariant[type]);

            if (missing) {
                const group = variantsContainer.querySelector(`[data-variant-group="${missing[1]}"]`);
                if (group) {
                    group.classList.add('variant-error');
                    group.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                showToast(translations[currentLang].toast[missing[2]], 'error');
                return;
            }
        }
        addToCart(product.id, true);
        productModal.classList.remove('active');
    };

    // ... (Share Logic same) ...
    const shareText = `Cek produk keren ini: ${product.name} - ${formatPrice(product.price)} di Baz-On Store!`;
    const shareUrl = window.location.href.split('#')[0]; // Clean URL

    document.getElementById('shareWa').onclick = () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
    };

    document.getElementById('shareTw').onclick = () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    };

    document.getElementById('shareCopy').onclick = () => {
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`).then(() => {
            showToast(translations[currentLang].toast.link_copied, 'success');
        });
    };

    productModal.classList.add('active');
};


// --- Helper Pemilihan Varian ---
window.selectVariant = (type, value, btnElement, price = null) => {
    // Update State
    currentVariant[type] = value;
    if (price) {
        currentVariant.selectedPrice = price;
        // Update Modal Price display
        modalProductPrice.textContent = formatPrice(price);
    }

    // Update UI
    // Find parent group and remove active from all siblings
    const parent = btnElement.parentElement;
    const siblings = parent.querySelectorAll('.variant-btn');
    siblings.forEach(el => el.classList.remove('active'));

    // Add active to clicked
    btnElement.classList.add('active');

    // Pilihan valid: bersihkan penanda error di grup ini
    const group = btnElement.closest('.variant-group');
    if (group) group.classList.remove('variant-error');
};



function setCouponError(message) {
    const el = document.getElementById('couponError');
    if (!el) return;
    el.textContent = message || '';
    el.hidden = !message;
    if (couponInput) couponInput.classList.toggle('input-error', !!message);
}

window.applyCoupon = () => {
    const code = couponInput.value.trim().toUpperCase();
    if (!code) {
        setCouponError(translations[currentLang].toast.coupon_invalid);
        showToast(translations[currentLang].toast.coupon_invalid, 'error');
        return;
    }

    // Find coupon in config
    const coupon = config.coupons.find(c => c.code === code);

    if (coupon) {
        activeCoupon = coupon;
        setCouponError('');
        showToast(translations[currentLang].toast.coupon_applied, 'success');
    } else {
        // Kode salah: tampilkan error inline di area kupon + toast, total tidak berubah.
        setCouponError(translations[currentLang].toast.coupon_invalid);
        showToast(translations[currentLang].toast.coupon_invalid, 'error');
        return;
    }

    renderCart();
};

if (couponInput) {
    couponInput.addEventListener('input', () => setCouponError(''));
}

window.removeCoupon = () => {
    activeCoupon = null;
    couponInput.value = '';
    setCouponError('');
    showToast(translations[currentLang].toast.coupon_removed, 'success');
    renderCart();
};

// event listener untuk kode promo
if (applyCouponBtn) applyCouponBtn.addEventListener('click', applyCoupon);
if (removeCouponBtn) removeCouponBtn.addEventListener('click', removeCoupon);

let activeCategory = 'all';

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all
        filterBtns.forEach(b => b.classList.remove('active'));
        // Add active to clicked
        btn.classList.add('active');

        // Filter
        activeCategory = btn.dataset.category;
        currentProductLimit = config.maxProducts || 8; // Reset Pagination
        renderProducts(activeCategory, searchInput ? searchInput.value : '');
    });
});

// event listener untuk pencarian
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        currentProductLimit = config.maxProducts || 8; // Reset Pagination
        renderProducts(activeCategory, e.target.value);
    });
}

// --- Logika Slider / Banner ---
let currentSlide = 0;
let slideInterval;

function initSlider() {
    const sliderWrapper = document.getElementById('sliderWrapper');
    const sliderDots = document.getElementById('sliderDots');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (!sliderWrapper) return; // Guard clause

    // Render Slides (judul slide = teks polos dari data.js, selalu di-escape)
    sliderWrapper.innerHTML = heroSlides.map((slide, index) => {
        const link = typeof slide.link === 'string' && slide.link.startsWith('#') ? slide.link : '#products';
        return `
        <div class="slide ${index === 0 ? 'active' : ''}">
            <div class="slide-content">
                <div class="slide-text">
                    ${index === 0 ? `<h1>${escapeHtml(slide.title)}</h1>` : `<h2>${escapeHtml(slide.title)}</h2>`}
                    <p>${escapeHtml(slide.description)}</p>
                    <a href="${escapeHtml(link)}" class="btn-primary">${escapeHtml(slide.cta)}</a>
                </div>
                <div class="slide-image-wrapper">
                    <img src="${escapeHtml(slide.image)}" alt="${escapeHtml(slide.title)}" class="slide-image" width="640" height="640">
                </div>
            </div>
        </div>
    `;
    }).join('');

    // Render Dots
    sliderDots.innerHTML = heroSlides.map((_, index) => `
        <button type="button" class="dot ${index === 0 ? 'active' : ''}" data-slide="${index}" aria-label="Slide ${index + 1}"></button>
    `).join('');

    // Event Listeners
    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoPlay();
    });

    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoPlay();
    });

    // Start AutoPlay
    startAutoPlay();
}

function updateSlider() {
    const sliderWrapper = document.getElementById('sliderWrapper');
    const dots = document.querySelectorAll('.dot');
    const slides = document.querySelectorAll('.slide');

    // Update Slider Position
    sliderWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;

    // Update Dots
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });

    // Update Active Class for Animations
    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlide);
    });
}

window.goToSlide = (index) => {
    currentSlide = index;
    updateSlider();
    resetAutoPlay();
};

function nextSlide() {
    currentSlide = (currentSlide + 1) % heroSlides.length;
    updateSlider();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + heroSlides.length) % heroSlides.length;
    updateSlider();
}

function startAutoPlay() {
    slideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
}

function resetAutoPlay() {
    clearInterval(slideInterval);
    startAutoPlay();
}

// --- Event Delegation (pengganti inline onclick di HTML hasil render) ---
if (productGrid) {
    productGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const id = Number(btn.dataset.id);
        if (btn.dataset.action === 'wishlist') toggleWishlist(id);
        else if (btn.dataset.action === 'add') addToCart(id);
        else if (btn.dataset.action === 'detail') openProductModal(id);
    });
}

if (cartItemsContainer) {
    cartItemsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-cart-action]');
        if (!btn) return;
        const cartId = btn.dataset.cartId;
        if (btn.dataset.cartAction === 'inc') updateQuantity(cartId, 1);
        else if (btn.dataset.cartAction === 'dec') updateQuantity(cartId, -1);
        else if (btn.dataset.cartAction === 'remove') removeFromCart(cartId);
    });
}

const modalVariantsEl = document.getElementById('modalVariants');
if (modalVariantsEl) {
    modalVariantsEl.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-variant-type]');
        if (!btn) return;
        const price = btn.dataset.variantPrice ? Number(btn.dataset.variantPrice) : null;
        selectVariant(btn.dataset.variantType, btn.dataset.variantValue, btn, price);
    });
}

const sliderDotsEl = document.getElementById('sliderDots');
if (sliderDotsEl) {
    sliderDotsEl.addEventListener('click', (e) => {
        const dot = e.target.closest('[data-slide]');
        if (dot) goToSlide(Number(dot.dataset.slide));
    });
}

const flashShopBtn = document.getElementById('flashShopBtn');
if (flashShopBtn) {
    flashShopBtn.addEventListener('click', () => {
        document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    });
}

if (cartBtn) {
    cartBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            cartModal.classList.add('active');
        }
    });
}

// Dialog tertutup disembunyikan dari accessibility tree, dibuka lagi saat aktif
document.querySelectorAll('.modal-overlay, .cart-modal-overlay').forEach((overlay) => {
    new MutationObserver(() => {
        overlay.setAttribute('aria-hidden', overlay.classList.contains('active') ? 'false' : 'true');
    }).observe(overlay, { attributes: true, attributeFilter: ['class'] });
});

// --- Inisialisasi Awal ---
document.addEventListener('DOMContentLoaded', () => {
    initLanguage(); // Initialize Language First
    initSlider(); // Initialize Slider
    initFlashSale(); // Initialize Flash Sale
    initTheme(); // Initialize Theme
    renderProducts();
    renderCart();
    renderTestimonials();
});

// --- Logika Bahasa (Internationalization) ---
function initLanguage() {
    const langToggle = document.getElementById('langToggle');
    updateLanguage(currentLang); // Apply initial language

    if (langToggle) {
        langToggle.textContent = currentLang.toUpperCase();
        langToggle.addEventListener('click', () => {
            // Toggle Logic
            currentLang = currentLang === 'id' ? 'en' : 'id';
            localStorage.setItem('bazon_lang', currentLang);
            langToggle.textContent = currentLang.toUpperCase();
            updateLanguage(currentLang);
        });
    }
}

function updateLanguage(lang) {
    // 1. Update HTML Data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const text = key.split('.').reduce((obj, k) => obj && obj[k], translations[lang]);
        if (text) el.textContent = text;
    });

    // 2. Update Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const text = key.split('.').reduce((obj, k) => obj && obj[k], translations[lang]);
        if (text) el.placeholder = text;
    });

    // 3. Update HTML Lang Attribute
    document.documentElement.lang = lang;

    // 4. Re-render dynamic components to reflect text changes
    renderCart();
    renderProducts(activeCategory, searchInput ? searchInput.value : '');
    // renderTestimonials(); // Testimonials are mostly static data, but title is handled by data-i18n
}

// --- Logika Tema (Dark/Light Mode) ---
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    const icon = themeToggle.querySelector('i');
    const savedTheme = localStorage.getItem('bazon_theme') || 'dark';

    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(icon, savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('bazon_theme', newTheme);
        updateThemeIcon(icon, newTheme);
    });
}

function updateThemeIcon(icon, theme) {
    if (theme === 'light') {
        icon.className = 'fa-solid fa-sun';
    } else {
        icon.className = 'fa-solid fa-moon';
    }
}

// --- Logika Install PWA ---
// Tombol Install muncul di navbar saat browser menyatakan aplikasi bisa di-install.
// Tidak ada pop-up melayang: pengunjung sendiri yang memutuskan kapan mengkliknya.
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.classList.remove('hidden');
        installBtn.addEventListener('click', () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(() => {
                deferredPrompt = null;
                installBtn.classList.add('hidden');
            });
        }, { once: true });
    }
});

window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
});

// Scroll to Top Logic
const scrollTopBtn = document.getElementById('scrollTopBtn');

if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Flash Sale Logic
function initFlashSale() {
    const flashSaleSection = document.getElementById('flashSale');

    // Check Config
    if (config.enableFlashSale === false) {
        if (flashSaleSection) {
            flashSaleSection.style.display = 'none';
        }
        return;
    }

    const hoursElem = document.getElementById('timerHours');
    const minutesElem = document.getElementById('timerMinutes');
    const secondsElem = document.getElementById('timerSeconds');

    // If elements don't exist, exit safely
    if (!hoursElem) return;

    // Set end time to midnight of next day, or a specific duration (e.g., 24 hours from now)
    let endTime = localStorage.getItem('bazon_flash_end');

    // Reset if not set or already passed
    if (!endTime || new Date().getTime() > parseInt(endTime)) {
        // Create new end time (24 hours from now)
        const date = new Date();
        date.setHours(date.getHours() + (config.flashSaleDurationHours || 24));
        endTime = date.getTime();
        localStorage.setItem('bazon_flash_end', endTime);
    }

    const updateTimer = () => {
        const now = new Date().getTime();
        const distance = endTime - now;

        if (distance < 0) {
            // Expired
            if (hoursElem) hoursElem.innerText = "00";
            if (minutesElem) minutesElem.innerText = "00";
            if (secondsElem) secondsElem.innerText = "00";
            return;
        }

        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (hoursElem) hoursElem.innerText = hours < 10 ? `0${hours}` : hours;
        if (minutesElem) minutesElem.innerText = minutes < 10 ? `0${minutes}` : minutes;
        if (secondsElem) secondsElem.innerText = seconds < 10 ? `0${seconds}` : seconds;
    };

    updateTimer(); // Initial call
    setInterval(updateTimer, 1000); // 1 second interval
}

// Newsletter Logic
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('newsletterEmail');
        const email = emailInput.value;

        if (email) {
            // Save to localStorage (Mock Database)
            const subscribers = JSON.parse(localStorage.getItem('bazon_subscribers')) || [];

            if (subscribers.includes(email)) {
                showToast('Email ini sudah terdaftar!', 'error');
            } else {
                subscribers.push(email);
                localStorage.setItem('bazon_subscribers', JSON.stringify(subscribers));
                showToast(currentLang === 'id' ? 'Terima kasih telah berlangganan!' : 'Thanks for subscribing!', 'success');
                emailInput.value = ''; // Reset
            }
        }
    });
}



// Product Modal Close Listeners
if (closeProductModal) {
    closeProductModal.addEventListener('click', () => {
        productModal.classList.remove('active');
    });
}

if (productModal) {
    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) {
            productModal.classList.remove('active');
        }
    });

    // Also close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && productModal.classList.contains('active')) {
            productModal.classList.remove('active');
        }
    });
}

// Cart Modal Close Listeners (Verify these exist too)
if (cartBtn) {
    cartBtn.addEventListener('click', () => {
        cartModal.classList.add('active');
    });
}

if (closeCart) {
    closeCart.addEventListener('click', () => {
        cartModal.classList.remove('active');
    });
}

if (cartModal) {
    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.classList.remove('active');
        }
    });
}

// Checkout Modal Close Listeners
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', openCheckoutModal);
}

if (closeCheckout) {
    closeCheckout.addEventListener('click', () => {
        checkoutModal.classList.remove('active');
    });
}

if (checkoutModal) {
    checkoutModal.addEventListener('click', (e) => {
        if (e.target === checkoutModal) {
            checkoutModal.classList.remove('active');
        }
    });
}

// Sort Listener
const sortSelect = document.getElementById('sortSelect');
if (sortSelect) {
    sortSelect.addEventListener('change', () => {
        // use activeCategory from global scope
        renderProducts(activeCategory, searchInput ? searchInput.value : '');
    });
}
