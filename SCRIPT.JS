/**
 * TIRUTANI MOON LIGHT BIRIYANI - Core Interactive Script
 * Features:
 * - App-style tab switching (Home, Menu, Reviews, Contact) without page scrolling
 * - Clean Reviews system (Zero default reviews, live dynamic score, alerts Balaji on WhatsApp)
 * - Corner Lightbox modal for special offer poster preview
 * - Chicken Biriyani (₹120) & Beef Biriyani (₹120), Starters on Request
 * - WhatsApp Order Checkout to Balaji (9585207044)
 */

// ===============================
// 1. MENU DATA
// ===============================
const menuItems = [
    {
        id: "cb_dum",
        name: "Chicken Biriyani",
        category: "biriyani",
        price: 120,
        hasPrice: true,
        badge: "Hot & Spicy",
        badgeType: "spicy",
        icon: "🍗",
        description: "Authentic wood-fired dum chicken biriyani served piping hot with raitha and signature spicy gravy."
    },
    {
        id: "bb_dum",
        name: "Beef Biriyani",
        category: "biriyani",
        price: 120,
        hasPrice: true,
        badge: "Chef Special",
        badgeType: "special",
        icon: "🥩",
        description: "Juicy, tender dum beef biriyani seasoned with rich traditional spices, served with raitha and gravy."
    },
    {
        id: "beef_tawa",
        name: "Beef Tawa Curry",
        category: "sides",
        price: 0,
        hasPrice: false,
        badge: "Tawa Hot",
        badgeType: "spicy",
        icon: "🍳",
        description: "Succulent beef roasted fresh on the tawa with caramelized onions, green chilies, and aromatic spices."
    },
    {
        id: "chicken_fry",
        name: "Chicken Fry",
        category: "sides",
        price: 0,
        hasPrice: false,
        badge: "Crispy Starter",
        badgeType: "spicy",
        icon: "🍗",
        description: "Crispy deep-fried chicken bites tossed with freshly tempered curry leaves and South Indian spices."
    },
    {
        id: "beef_fry",
        name: "Beef Fry",
        category: "sides",
        price: 0,
        hasPrice: false,
        badge: "Spicy & Hot",
        badgeType: "special",
        icon: "🔥",
        description: "Slow roasted dry beef fry loaded with freshly crushed black pepper, shallots, and fragrant herbs."
    }
];

// ===============================
// 2. STATE (ZERO DEFAULT REVIEWS)
// ===============================
let cart = [];
let reviews = [];

// ===============================
// 3. HTML ELEMENTS
// ===============================
const menuGrid = document.getElementById("menuGrid");
const filterBtns = document.querySelectorAll(".filter-btn");
const openCartBtn = document.getElementById("openCartBtn");
const closeCartBtn = document.getElementById("closeCartBtn");
const cartOverlay = document.getElementById("cartOverlay");
const cartDrawer = document.getElementById("cartDrawer");
const cartCount = document.getElementById("cartCount");
const cartItemsList = document.getElementById("cartItemsList");
const cartSubtotal = document.getElementById("cartSubtotal");
const whatsappCheckoutBtn = document.getElementById("whatsappCheckoutBtn");

// Poster Lightbox
const posterModalOverlay = document.getElementById("posterModalOverlay");

// Reviews Elements
const reviewsGrid = document.getElementById("reviewsGrid");
const writeReviewBtn = document.getElementById("writeReviewBtn");
const reviewModalOverlay = document.getElementById("reviewModalOverlay");
const closeReviewModalBtn = document.getElementById("closeReviewModalBtn");
const reviewForm = document.getElementById("reviewForm");
const starSelector = document.getElementById("starSelector");
const ratingValueInput = document.getElementById("ratingValue");
const totalReviewsCount = document.getElementById("totalReviewsCount");
const avgRatingNum = document.getElementById("avgRatingNum");

// ===============================
// 4. INSTANT VIEW SWITCHING (NO SCROLL)
// ===============================
window.switchView = function(viewName) {
    document.querySelectorAll(".view-panel").forEach(panel => {
        panel.classList.remove("active");
    });

    const targetPanel = document.getElementById(`view-${viewName}`);
    if (targetPanel) {
        targetPanel.classList.add("active");
    }

    document.querySelectorAll(".nav-tab-btn").forEach(btn => {
        btn.classList.remove("active");
        if (btn.getAttribute("onclick")?.includes(viewName)) {
            btn.classList.add("active");
        }
    });

    document.querySelectorAll(".mobile-tab-btn").forEach(btn => {
        btn.classList.remove("active");
        if (btn.getAttribute("onclick")?.includes(viewName)) {
            btn.classList.add("active");
        }
    });

    window.scrollTo({ top: 0, behavior: 'instant' });
};

// ===============================
// 5. POSTER LIGHTBOX CONTROLS
// ===============================
window.openPosterModal = function() {
    if (posterModalOverlay) {
        posterModalOverlay.classList.add("active");
    }
};

window.closePosterModal = function() {
    if (posterModalOverlay) {
        posterModalOverlay.classList.remove("active");
    }
};

// ===============================
// 6. PAGE INITIALIZATION
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    renderMenu(menuItems);
    loadReviews();
    loadCartFromStorage();
    setupEventListeners();
    updateCartUI();
});

// ===============================
// 7. RENDER MENU
// ===============================
function renderMenu(items) {
    if (!menuGrid) return;

    menuGrid.innerHTML = items.map(item => `
        <div class="food-card" data-category="${item.category}">
            <span class="food-badge ${item.badgeType}">
                ${item.badge}
            </span>

            <div class="food-img-wrap">
                <div class="food-icon-placeholder">
                    ${item.icon}
                </div>
            </div>

            <div class="food-info">
                <h3 class="food-title">${item.name}</h3>
                <p class="food-desc">${item.description}</p>

                <div class="food-bottom">
                    <span class="food-price ${!item.hasPrice ? 'no-price' : ''}">
                        ${item.hasPrice ? `₹${item.price}` : 'Rate on Request'}
                    </span>
                    <button class="add-to-cart-btn" onclick="addToCart('${item.id}')">
                        <i class="fa-solid fa-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join("");
}

// ===============================
// 8. REVIEWS (ZERO DEFAULT REVIEWS)
// ===============================
function renderReviews() {
    if (!reviewsGrid) return;

    if (reviews.length === 0) {
        if (totalReviewsCount) totalReviewsCount.textContent = "Be the first to review!";
        if (avgRatingNum) avgRatingNum.textContent = "5.0";
        reviewsGrid.innerHTML = `
            <div class="empty-reviews-box">
                <i class="fa-regular fa-comment-dots"></i>
                <p>No customer reviews yet. Tap 'Write a Review' to share your experience!</p>
            </div>
        `;
        return;
    }

    const totalScore = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgScore = (totalScore / reviews.length).toFixed(1);

    if (avgRatingNum) avgRatingNum.textContent = avgScore;
    if (totalReviewsCount) {
        totalReviewsCount.textContent = `Based on ${reviews.length} customer review${reviews.length > 1 ? 's' : ''}`;
    }

    reviewsGrid.innerHTML = reviews.map(rev => {
        let starsHtml = "";
        for (let i = 1; i <= 5; i++) {
            if (i <= rev.rating) {
                starsHtml += `<i class="fa-solid fa-star"></i> `;
            } else {
                starsHtml += `<i class="fa-regular fa-star" style="color: #475569;"></i> `;
            }
        }

        return `
            <div class="review-card">
                <div>
                    <div class="review-header">
                        <div class="reviewer-name">${escapeHtml(rev.name)}</div>
                        <div class="reviewer-badge"><i class="fa-solid fa-circle-check"></i> Customer</div>
                    </div>
                    <div class="review-stars">${starsHtml}</div>
                    <span class="review-dish-tag">${escapeHtml(rev.dish)}</span>
                    <p class="review-comment">"${escapeHtml(rev.comment)}"</p>
                </div>
            </div>
        `;
    }).join("");
}

function loadReviews() {
    try {
        const saved = localStorage.getItem("tirutani_clean_reviews");
        reviews = saved ? JSON.parse(saved) : [];
    } catch (e) {
        reviews = [];
    }
    renderReviews();
}

function saveReviewsToStorage() {
    try {
        localStorage.setItem("tirutani_clean_reviews", JSON.stringify(reviews));
    } catch (e) {
        console.warn("LocalStorage unavailable");
    }
}

// ===============================
// 9. EVENT LISTENERS
// ===============================
function setupEventListeners() {
    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const category = btn.getAttribute("data-category");
            if (category === "all") {
                renderMenu(menuItems);
            } else {
                renderMenu(menuItems.filter(item => item.category === category));
            }
        });
    });

    if (openCartBtn) openCartBtn.addEventListener("click", openCart);
    if (closeCartBtn) closeCartBtn.addEventListener("click", closeCart);
    if (cartOverlay) cartOverlay.addEventListener("click", closeCart);

    if (whatsappCheckoutBtn) {
        whatsappCheckoutBtn.addEventListener("click", handleWhatsAppCheckout);
    }

    if (writeReviewBtn && reviewModalOverlay) {
        writeReviewBtn.addEventListener("click", () => reviewModalOverlay.classList.add("active"));
    }
    if (closeReviewModalBtn && reviewModalOverlay) {
        closeReviewModalBtn.addEventListener("click", () => reviewModalOverlay.classList.remove("active"));
    }
    if (reviewModalOverlay) {
        reviewModalOverlay.addEventListener("click", (e) => {
            if (e.target === reviewModalOverlay) reviewModalOverlay.classList.remove("active");
        });
    }

    if (starSelector) {
        const starIcons = starSelector.querySelectorAll(".star-opt");
        starIcons.forEach(star => {
            star.addEventListener("click", () => {
                const selectedRating = parseInt(star.getAttribute("data-rating"), 10);
                if (ratingValueInput) ratingValueInput.value = selectedRating;

                starIcons.forEach(s => {
                    const r = parseInt(s.getAttribute("data-rating"), 10);
                    if (r <= selectedRating) {
                        s.classList.add("active");
                    } else {
                        s.classList.remove("active");
                    }
                });
            });
        });
    }

    if (reviewForm) {
        reviewForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("reviewerName").value.trim();
            const rating = parseInt(ratingValueInput.value, 10) || 5;
            const dish = document.getElementById("reviewerDish").value;
            const comment = document.getElementById("reviewerFeedback").value.trim();

            if (!name || !comment) return;

            reviews.unshift({ name, rating, dish, comment });
            saveReviewsToStorage();
            renderReviews();

            reviewForm.reset();
            if (ratingValueInput) ratingValueInput.value = 5;
            document.querySelectorAll(".star-opt").forEach(s => s.classList.add("active"));
            reviewModalOverlay.classList.remove("active");

            const starsText = "⭐".repeat(rating);
            let reviewMsg = `🌕 *NEW REVIEW - TIRUTANI MOON LIGHT BIRIYANI* 🌕\n`;
            reviewMsg += `-------------------------------------------\n`;
            reviewMsg += `👤 *Customer Name:* ${name}\n`;
            reviewMsg += `⭐ *Rating:* ${starsText} (${rating}/5)\n`;
            reviewMsg += `🍲 *Dish:* ${dish}\n`;
            reviewMsg += `💬 *Review:* "${comment}"\n`;
            reviewMsg += `-------------------------------------------`;

            const whatsappUrl = `https://wa.me/919585207044?text=${encodeURIComponent(reviewMsg)}`;
            window.open(whatsappUrl, "_blank");
        });
    }
}

// ===============================
// 10. CART CONTROLLERS
// ===============================
function openCart() {
    if (cartDrawer) cartDrawer.classList.add("active");
    if (cartOverlay) cartOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeCart() {
    if (cartDrawer) cartDrawer.classList.remove("active");
    if (cartOverlay) cartOverlay.classList.remove("active");
    document.body.style.overflow = "auto";
}

window.addToCart = function(itemId) {
    const product = menuItems.find(item => item.id === itemId);
    if (!product) return;

    const existingIndex = cart.findIndex(item => item.id === itemId);
    if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            hasPrice: product.hasPrice,
            qty: 1
        });
    }

    updateCartUI();
    saveCartToStorage();
    openCart();
};

window.updateItemQty = function(itemId, change) {
    const itemIndex = cart.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
        cart[itemIndex].qty += change;
        if (cart[itemIndex].qty <= 0) {
            cart.splice(itemIndex, 1);
        }
    }
    updateCartUI();
    saveCartToStorage();
};

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.hasPrice ? item.price * item.qty : 0), 0);
    const hasUnpriced = cart.some(item => !item.hasPrice);

    if (cartCount) cartCount.textContent = totalItems;
    if (cartSubtotal) {
        cartSubtotal.textContent = hasUnpriced && subtotal > 0 
            ? `₹${subtotal} + Starters` 
            : (hasUnpriced && subtotal === 0 ? 'Rate on Request' : `₹${subtotal}`);
    }

    if (!cartItemsList) return;

    if (cart.length === 0) {
        cartItemsList.innerHTML = `
            <div style="text-align: center; color: #94a3b8; margin: auto 0;">
                <i class="fa-solid fa-cart-arrow-down" style="font-size: 2.5rem; color: rgba(0, 136, 255, 0.4); margin-bottom: 10px;"></i>
                <p>Your biriyani cart is empty.</p>
            </div>
        `;
        return;
    }

    cartItemsList.innerHTML = cart.map(item => `
        <div class="cart-item-row">
            <div>
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">
                    ${item.hasPrice 
                        ? `₹${item.price} each (Total: ₹${item.price * item.qty})` 
                        : 'Rate on Request'}
                </div>
            </div>

            <div class="cart-qty-ctrl">
                <button class="qty-btn" onclick="updateItemQty('${item.id}', -1)">-</button>
                <span class="qty-num">${item.qty}</span>
                <button class="qty-btn" onclick="updateItemQty('${item.id}', 1)">+</button>
            </div>
        </div>
    `).join("");
}

function saveCartToStorage() {
    try {
        localStorage.setItem("tirutani_app_cart", JSON.stringify(cart));
    } catch (e) {
        console.warn("Storage not available");
    }
}

function loadCartFromStorage() {
    try {
        const saved = localStorage.getItem("tirutani_app_cart");
        if (saved) {
            cart = JSON.parse(saved);
            updateCartUI();
        }
    } catch (e) {
        console.warn("Could not load cart");
    }
}

// ===============================
// 11. WHATSAPP CHECKOUT
// ===============================
function handleWhatsAppCheckout() {
    if (cart.length === 0) {
        alert("Please add at least one dish to your cart.");
        return;
    }

    const nameInput = document.getElementById("custName");
    const timeInput = document.getElementById("pickupTime");
    const notesInput = document.getElementById("custNotes");

    const custName = nameInput && nameInput.value.trim() !== "" ? nameInput.value.trim() : "Valued Guest";
    const pickupTime = timeInput && timeInput.value.trim() !== "" ? timeInput.value.trim() : "7:30 PM";
    const notes = notesInput && notesInput.value.trim() !== "" ? notesInput.value.trim() : "None";

    const subtotal = cart.reduce((sum, item) => sum + (item.hasPrice ? item.price * item.qty : 0), 0);
    const hasUnpriced = cart.some(item => !item.hasPrice);

    let message = `🌕 *NEW ORDER - TIRUTANI MOON LIGHT BIRIYANI* 🌕\n`;
    message += `📍 *Tiruttani*\n`;
    message += `-------------------------------------------\n`;
    message += `👤 *Customer Name:* ${custName}\n`;
    message += `⏰ *Pickup Time:* ${pickupTime}\n`;
    message += `📝 *Notes:* ${notes}\n`;
    message += `-------------------------------------------\n`;
    message += `🍲 *ITEMS ORDERED:*\n`;

    cart.forEach((item, index) => {
        const priceText = item.hasPrice ? `₹${item.price * item.qty}` : 'Rate on Request';
        message += `${index + 1}. ${item.name} x ${item.qty} = ${priceText}\n`;
    });

    message += `-------------------------------------------\n`;
    const totalEstimateText = hasUnpriced && subtotal > 0 
        ? `₹${subtotal} (+ Starters Rate on Request)` 
        : (hasUnpriced && subtotal === 0 ? 'Rate on Request' : `₹${subtotal}`);
    message += `💰 *TOTAL ESTIMATE:* ${totalEstimateText}\n`;
    message += `-------------------------------------------\n`;
    message += `_Please confirm my order availability. Thank you!_`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/919585207044?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}