document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. ЛОГИКА ЗАГРУЗЧИКА (МГНОВЕННОЕ ИСЧЕЗНОВЕНИЕ)
    // ==========================================
    window.addEventListener('load', () => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.add('hidden');
            setTimeout(() => { loader.remove(); }, 500); 
        }
    });

    // ==========================================
    // 2. АНИМАЦИЯ ПОЯВЛЕНИЯ ПРИ СКРОЛЛЕ
    // ==========================================
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

    // ==========================================
    // 3. ИЗМЕНЕНИЕ ШАПКИ ПРИ СКРОЛЛЕ
    // ==========================================
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('header--scrolled');
            header.classList.remove('header--transparent');
        } else {
            header.classList.remove('header--scrolled');
            header.classList.add('header--transparent');
        }
    });

    // ==========================================
    // 4. МОБИЛЬНОЕ МЕНЮ
    // ==========================================
    const burger = document.querySelector('.burger-menu');
    const nav = document.querySelector('.nav');
    if (burger) {
        burger.addEventListener('click', () => {
            if (nav.style.display === 'block') { nav.style.display = 'none'; } 
            else {
                nav.style.display = 'block';
                nav.style.position = 'absolute'; nav.style.top = '100%'; nav.style.left = '0'; nav.style.width = '100%';
                nav.style.background = '#111'; nav.style.padding = '20px';
                const list = nav.querySelector('ul'); list.style.flexDirection = 'column'; list.style.gap = '20px';
                document.querySelectorAll('.nav__link').forEach(link => { link.style.color = '#fff'; });
            }
        });
    }

    // ==========================================
    // 5. ПЛАВНЫЙ СКРОЛЛ ПО ЯКОРЯМ
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                if (nav && nav.style.display === 'block') nav.style.display = 'none';
            }
        });
    });
});

// ==========================================
// 6. ФИЛЬТРАЦИЯ ТОВАРОВ В КАТАЛОГЕ
// ==========================================
function applyFilters() {
    const typeFilter = document.getElementById('filter-type')?.value;
    const capacityFilter = document.getElementById('filter-capacity')?.value;
    const products = document.querySelectorAll('.product-card');

    products.forEach(product => {
        const productCategory = product.getAttribute('data-category');
        const productCapacity = product.getAttribute('data-capacity');

        let showType = (typeFilter === 'all') || (productCategory === typeFilter);
        let showCapacity = (capacityFilter === 'all') || (productCapacity === capacityFilter) || (productCapacity === 'all');

        if (showType && showCapacity) {
            product.style.display = 'flex';
            product.style.opacity = '0';
            setTimeout(() => { product.style.transition = 'opacity 0.5s ease'; product.style.opacity = '1'; }, 50);
        } else {
            product.style.display = 'none';
        }
    });
}

// ==========================================
// 7. ЛОГИКА МОДАЛЬНОГО ОКНА
// ==========================================
const modal = document.getElementById('productModal');
const closeModalBtn = document.querySelector('.modal-close');
const openModalBtns = document.querySelectorAll('.open-modal-btn');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalSpecsList = document.getElementById('modalSpecs');
const modalCertsList = document.getElementById('modalCerts');

function openModal(productCard) {
    const title = productCard.getAttribute('data-title');
    const desc = productCard.getAttribute('data-desc');
    const specsJson = productCard.getAttribute('data-specs');
    const certsJson = productCard.getAttribute('data-certificates');
    const imageSrc = productCard.getAttribute('data-image');

    modalTitle.textContent = title;
    modalDesc.textContent = desc;
    modalImg.src = imageSrc || '';

    try {
        const specs = JSON.parse(specsJson);
        modalSpecsList.innerHTML = '';
        specs.forEach(item => { const li = document.createElement('li'); li.textContent = item; modalSpecsList.appendChild(li); });
    } catch (e) { console.error("Ошибка парсинга характеристик", e); }

    try {
        const certs = JSON.parse(certsJson);
        modalCertsList.innerHTML = '';
        certs.forEach(item => { const li = document.createElement('li'); li.textContent = item; modalCertsList.appendChild(li); });
    } catch (e) { console.error("Ошибка парсинга сертификатов", e); }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function closeModalAndScroll() {
    closeModal();
    scrollToOrder(modalTitle.textContent);
}

if (openModalBtns.length > 0) {
    openModalBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = this.closest('.product-card');
            if (card) openModal(card);
        });
    });
}

if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (modal) {
    modal.addEventListener('click', function(e) { if (e.target === modal) closeModal(); });
}
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) closeModal();
});

// ==========================================
// 8. ПРОКРУТКА К ФОРМЕ И ВЫБОР ТОВАРА
// ==========================================
function scrollToOrder(equipmentName) {
    const formSection = document.getElementById('order-form');
    const selectBox = document.getElementById('equipment');
    if (formSection) formSection.scrollIntoView({ behavior: 'smooth' });
    if (selectBox && equipmentName) {
        selectBox.value = ""; 
        for (let i = 0; i < selectBox.options.length; i++) {
            if (selectBox.options[i].text.includes(equipmentName.split(' ')[0])) {
                selectBox.selectedIndex = i;
                break;
            }
        }
    }
}

// ==========================================
// 9. ОБРАБОТКА ОТПРАВКИ ФОРМЫ
// ==========================================
function submitForm(event) {
    event.preventDefault();
    const btn = event.target.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    btn.innerText = "Отправка запроса...";
    btn.disabled = true;
    setTimeout(() => {
        alert("Спасибо! Ваша заявка принята. Менеджер свяжется с вами в течение 2 часов.");
        event.target.reset();
        btn.innerText = originalText;
        btn.disabled = false;
    }, 1500);
}