/* ============================================
   Zackconnect - Vehicle Dealership JavaScript
   ============================================ */

const sampleVehicles = [];

// Global variables
window.zackconnectSampleVehicles = sampleVehicles;
let vehicles = [];
let filteredVehicles = [];
let refreshInventory = () => {};
let favourites = JSON.parse(localStorage.getItem('zackconnect_favourites')) || [];
let useBackendAPI = true; // Set to false to use localStorage fallback

// DOM Elements
const header = document.getElementById('header');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const listingsGrid = document.getElementById('listingsGrid');
const bajajGrid = document.getElementById('bajajGrid');
const carsGrid = document.getElementById('carsGrid');
const tricyclesGrid = document.getElementById('tricyclesGrid');
const emptyState = document.getElementById('emptyState');
const listingCount = document.getElementById('listingCount');
const vehicleDetailsContent = document.getElementById('vehicleDetailsContent');

// Toast elements (optional - can be added to pages if needed)
let toast = document.getElementById('toast');
let toastMessage = document.getElementById('toastMessage');
let toastClose = document.getElementById('toastClose');

// Load vehicles from backend or localStorage
async function loadVehicles() {
    if (useBackendAPI && window.ZackconnectAPI) {
        try {
            vehicles = await window.ZackconnectAPI.VehiclesAPI.getAll();
            filteredVehicles = [...vehicles];
            console.log('Vehicles loaded from backend:', vehicles.length);
        } catch (error) {
            console.error('Failed to load vehicles from backend, using localStorage fallback:', error);
            vehicles = [...window.ZackconnectData.readState(sampleVehicles).vehicles];
            filteredVehicles = [...vehicles];
        }
    } else {
        vehicles = [...window.ZackconnectData.readState(sampleVehicles).vehicles];
        filteredVehicles = [...vehicles];
    }
}

// Initialize from local data first so slow or sleeping APIs never block the page.
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initStickyHeader();
    vehicles = [...window.ZackconnectData.readState(sampleVehicles).vehicles];
    filteredVehicles = [...vehicles];
    
    // Show/hide logout button based on authentication
    const logoutButtons = [
        document.getElementById('logoutBtn'),
        ...document.querySelectorAll('.mobile-logout-btn')
    ].filter(Boolean);
    if (window.ZackconnectAuth?.isAuthenticated()) {
        logoutButtons.forEach(logoutBtn => {
            logoutBtn.style.display = 'inline-block';
            logoutBtn.addEventListener('click', () => window.ZackconnectAuth.logout());
        });
    }

    // Page-specific initialization
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (currentPage === 'index.html') {
        renderHomeVehicleTiles();
        renderCategories();
        renderAnnouncements();
    } else if (currentPage === 'cars.html') {
        initCarsPage();
    } else if (currentPage === 'tricycles.html') {
        initTricyclesPage();
    } else if (currentPage === 'vehicle-details.html') {
        initVehicleDetailsPage();
    } else if (currentPage === 'import.html') {
        initImportPage();
    } else if (currentPage === 'contact.html') {
        initContactPage();
    }
    
    if (toast) initToast();

    const inventoryPages = new Set(['index.html', 'cars.html', 'tricycles.html', 'vehicle-details.html']);
    const contentLoads = [loadPublicSiteContent()];
    if (inventoryPages.has(currentPage)) contentLoads.push(loadVehicles());
    Promise.all(contentLoads).then(() => {
        refreshInventory();
        if (currentPage === 'index.html') {
            renderHomeVehicleTiles();
            renderCategories();
            renderAnnouncements();
        } else if (currentPage === 'vehicle-details.html') {
            initVehicleDetailsPage();
        }
        window.ZackconnectApplySiteContent?.();
    });
});

async function loadPublicSiteContent() {
    if (!window.ZackconnectAPI?.SiteContentAPI) return;
    try {
        window.ZackconnectPublicContent = await window.ZackconnectAPI.SiteContentAPI.getPublic();
    } catch (error) {
        console.error('Could not load shared website content:', error);
        window.ZackconnectPublicContent = null;
    }
}

window.addEventListener('storage', event => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (event.key === window.ZackconnectData.storageKey && currentPage !== 'admin.html') {
        window.location.reload();
    }
});

// Mobile Menu
function initMobileMenu() {
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
        }
    });
}

// Sticky Header
function initStickyHeader() {
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        } else {
            header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        }

        lastScroll = currentScroll;
    });
}

function renderHomeVehicleTiles() {
    const grid = document.getElementById('homeVehicleTiles');
    if (!grid) return;

    const allowedPages = new Set(['cars.html', 'tricycles.html']);
    const state = window.ZackconnectPublicContent || window.ZackconnectData.readState(sampleVehicles);
    const tiles = state.homeTiles || window.ZackconnectData.defaultHomeTiles;
    grid.replaceChildren();
    grid.className = 'home-vehicle-pages-grid';

    tiles.forEach(tile => {
        if (!allowedPages.has(tile.page)) {
            throw new Error(`The homepage tile "${tile.label}" has an unsupported destination.`);
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'home-vehicle-tile-wrap';
        const link = document.createElement('a');
        link.className = 'home-vehicle-page-card';
        link.href = tile.page;

        const slides = document.createElement('span');
        slides.className = 'home-vehicle-page-slides';
        const images = Array.isArray(tile.images) && tile.images.length ? tile.images : [tile.image];
        images.filter(Boolean).forEach((imageUrl, index) => {
            const image = document.createElement('img');
            image.src = imageUrl;
            image.alt = '';
            image.loading = 'lazy';
            image.decoding = 'async';
            image.classList.toggle('is-active', index === 0);
            slides.append(image);
        });

        const label = document.createElement('span');
        label.className = 'home-vehicle-page-type';
        label.textContent = tile.label;
        link.append(slides, label);
        wrapper.append(link);
        initHomeTileImageRotation(slides);

        if (tile.credit) {
            const credit = document.createElement('p');
            credit.className = 'home-vehicle-image-credit';
            if (tile.creditUrl) {
                const creditLink = document.createElement('a');
                creditLink.href = tile.creditUrl;
                creditLink.target = '_blank';
                creditLink.rel = 'noopener noreferrer';
                creditLink.textContent = tile.credit;
                credit.append(creditLink);
            } else {
                credit.textContent = tile.credit;
            }
            wrapper.append(credit);
        }
        grid.append(wrapper);
    });
}

function initHomeTileImageRotation(slides) {
    const images = Array.from(slides.querySelectorAll('img'));
    if (images.length < 2) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches) return;

    let activeIndex = 0;
    window.setInterval(() => {
        if (document.hidden || slides.parentElement.matches(':hover') ||
            slides.parentElement.contains(document.activeElement)) return;
        images[activeIndex].classList.remove('is-active');
        activeIndex = (activeIndex + 1) % images.length;
        images[activeIndex].classList.add('is-active');
    }, 4000);
}

function renderCategories() {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;

    const allowedPages = new Set(['cars.html', 'tricycles.html', 'import.html', 'contact.html']);
    const content = window.ZackconnectPublicContent || window.ZackconnectData.readState(sampleVehicles);
    const categories = content.categories || window.ZackconnectData.defaultCategories;
    grid.replaceChildren();
    categories.forEach(category => {
        if (!allowedPages.has(category.page)) {
            throw new Error(`The homepage category "${category.label}" has an unsupported destination.`);
        }
        const filters = Array.isArray(category.filters) ? category.filters : [];
        const matches = filters.length ? vehicles.filter(vehicle => filters.every(filter =>
            String(vehicle[filter.field] || '').toLowerCase() === String(filter.value).toLowerCase()
        )) : [];

        const link = document.createElement('a');
        link.className = 'market-category';
        const query = new URLSearchParams(category.query || {});
        const queryString = query.toString();
        link.href = `${category.page}${queryString ? `?${queryString}` : ''}`;

        const categoryIcon = ['cars', 'tricycles'].includes(category.id)
            ? document.createElement('span')
            : document.createElement('img');
        categoryIcon.className = 'market-category-icon';
        if (categoryIcon.tagName === 'SPAN') {
            categoryIcon.classList.add('market-category-upload-icon');
            categoryIcon.setAttribute('aria-hidden', 'true');
            const imageIcon = document.createElement('i');
            imageIcon.className = 'fa-solid fa-image';
            const downloadIcon = document.createElement('i');
            downloadIcon.className = 'fa-solid fa-circle-arrow-down';
            categoryIcon.append(imageIcon, downloadIcon);
        } else {
            categoryIcon.src = category.image;
            categoryIcon.alt = category.label;
            categoryIcon.loading = 'lazy';
            categoryIcon.decoding = 'async';
        }
        const name = document.createElement('span');
        name.className = 'market-category-name';
        name.textContent = category.label;
        const count = document.createElement('span');
        count.className = 'market-category-count';
        if (filters.length) {
            count.textContent = `${matches.length} ${matches.length === 1 ? 'vehicle' : 'vehicles'}`;
        } else {
            count.textContent = category.countLabel || 'Browse';
        }
        link.append(categoryIcon, name, count);
        grid.append(link);
    });
}

function renderAnnouncements() {
    const section = document.getElementById('announcements');
    const list = document.getElementById('announcementsList');
    if (!section || !list) return;

    const state = window.ZackconnectPublicContent || window.ZackconnectData.readState(sampleVehicles);
    const announcements = state.announcements || [];
    list.replaceChildren();
    section.hidden = announcements.length === 0;
    announcements.forEach(announcement => {
        const card = document.createElement('article');
        card.className = 'announcement-card';
        const title = document.createElement('h2');
        title.textContent = announcement.title;
        const message = document.createElement('p');
        message.textContent = announcement.message;
        card.append(title, message);
        list.append(card);
    });
}

// Render Cars Page
function initCarsPage() {
    const params = new URLSearchParams(window.location.search);
    const groupMake = params.get('groupMake');
    const groupModel = params.get('groupModel');
    const groupYear = params.get('groupYear');
    const browseGroups = document.getElementById('carBrowseGroups');
    const browseResults = document.getElementById('carBrowseResults');
    if (browseGroups && browseResults) {
        browseGroups.hidden = false;
        browseResults.hidden = false;
        renderCarModelYearGroups(params);
    }

    const searchInput = document.getElementById('searchCars');
    const filterMake = document.getElementById('filterMake');
    const filterModel = document.getElementById('filterModel');
    const filterCountry = document.getElementById('filterCountry');
    const filterLocation = document.getElementById('filterLocation');

    if (searchInput) searchInput.value = params.get('search') || '';
    const selectedMake = groupMake || params.get('make');
    const selectedModel = groupModel || params.get('model');
    const selectedYear = groupYear || params.get('year');
    if (selectedMake) params.set('make', selectedMake);
    if (selectedModel) params.set('model', selectedModel);
    if (selectedYear) params.set('year', selectedYear);
    renderCarModelYearGroups(params);
    if (filterMake && selectedMake) setCarFilterValue(filterMake, selectedMake);
    if (filterModel && selectedModel) setCarFilterValue(filterModel, selectedModel);
    if (filterCountry && params.has('country')) filterCountry.value = params.get('country');
    if (filterLocation && params.has('location')) filterLocation.value = params.get('location');

    const carVehicles = vehicles.filter(v => v.category === 'car' && v.availability === 'available');
    const hasCars = carVehicles.length > 0;
    const filterSidebar = document.querySelector('.car-filter-sidebar');
    const carResultsHeading = document.querySelector('.car-results-heading');
    const searchSection = document.querySelector('.car-marketplace-main .search-section');
    [filterSidebar, carResultsHeading, searchSection, browseGroups].forEach(element => {
        if (element) element.hidden = !hasCars;
    });
    const filterYear = document.getElementById('filterYear');
    if (filterYear && selectedYear) {
        setCarFilterValue(filterYear, selectedYear, selectedYear);
    }
    const categoryCount = document.getElementById('carCategoryCount');
    if (categoryCount) categoryCount.textContent = carVehicles.length.toLocaleString();
    const applyCarsFilters = initCarsFilters();
    initCarsSearch(applyCarsFilters);
    initCarsSorting(applyCarsFilters);
    applyCarsFilters();
    refreshInventory = applyCarsFilters;
}

function setCarFilterValue(select, value, label = value) {
    const normalizedValue = String(value).toLowerCase();
    let option = Array.from(select.options).find(item => item.value.toLowerCase() === normalizedValue);
    if (!option) {
        option = new Option(label, normalizedValue);
        select.add(option);
    }
    select.value = option.value;
}

function renderCarModelYearGroups(params) {
    const grid = document.getElementById('carModelYearGrid');
    if (!grid) return;

    const groups = new Map();
    vehicles.filter(vehicle => {
        if (vehicle.category !== 'car' || vehicle.availability !== 'available') return false;
        if (params.has('make') && vehicle.make.toLowerCase() !== params.get('make').toLowerCase()) return false;
        if (params.has('model') && vehicle.model.toLowerCase() !== params.get('model').toLowerCase()) return false;
        return true;
    }).forEach(vehicle => {
        const key = `${vehicle.make.toLowerCase()}|${vehicle.model.toLowerCase()}|${vehicle.year}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(vehicle);
    });

    grid.replaceChildren();
    [...groups.entries()]
        .sort(([, firstGroup], [, secondGroup]) =>
            String(secondGroup[0].year).localeCompare(String(firstGroup[0].year)) ||
            firstGroup[0].make.localeCompare(secondGroup[0].make) ||
            firstGroup[0].model.localeCompare(secondGroup[0].model)
        )
        .forEach(([, groupVehicles]) => {
            const vehicle = groupVehicles[0];
            const params = new URLSearchParams({
                groupMake: vehicle.make,
                groupModel: vehicle.model,
                groupYear: String(vehicle.year)
            });
            const link = document.createElement('a');
            link.className = 'car-model-year-tile';
            link.href = `cars.html?${params.toString()}`;

            const image = document.createElement('img');
            image.src = vehicle.images?.[0] || vehicle.image || '';
            image.alt = '';
            image.loading = 'lazy';
            image.decoding = 'async';

            const label = document.createElement('span');
            label.className = 'car-model-year-label';
            label.textContent = vehicle.model;

            const make = document.createElement('span');
            make.className = 'car-model-year-make';
            make.textContent = `${vehicle.make} · ${vehicle.year}`;

            const count = document.createElement('span');
            count.className = 'car-model-year-count';
            count.textContent = `${groupVehicles.length} ${groupVehicles.length === 1 ? 'car' : 'cars'}`;

            link.append(image, label, make, count);
            grid.append(link);
        });
}

function renderCarsListings(vehiclesToRender) {
    if (!carsGrid) return;
    carsGrid.innerHTML = '';
    const noInventoryState = document.getElementById('carsNoInventory');
    const hasCars = vehicles.some(vehicle =>
        vehicle.category === 'car' && vehicle.availability === 'available'
    );
    
    if (vehiclesToRender.length === 0) {
        if (emptyState) emptyState.style.display = hasCars ? 'block' : 'none';
        if (noInventoryState) noInventoryState.hidden = hasCars;
        if (listingCount) listingCount.textContent = hasCars ? 'Showing 0 cars' : 'Cars available to import on request';
        return;
    }

    if (noInventoryState) noInventoryState.hidden = true;
    if (emptyState) emptyState.style.display = 'none';
    if (listingCount) listingCount.textContent = `Showing ${vehiclesToRender.length} car${vehiclesToRender.length !== 1 ? 's' : ''}`;

    vehiclesToRender.forEach(vehicle => {
        const card = createVehicleCard(vehicle);
        carsGrid.appendChild(card);
    });
}

// Render Tricycles Page
function initTricyclesPage() {
    const params = new URLSearchParams(window.location.search);
    const filterBajajType = document.getElementById('filterBajajType');
    const filterCondition = document.getElementById('filterCondition');
    const filterLocation = document.getElementById('filterLocation');

    if (filterBajajType && params.has('type')) filterBajajType.value = params.get('type');
    if (filterCondition && params.has('condition')) filterCondition.value = params.get('condition');
    if (filterLocation && params.has('location')) filterLocation.value = params.get('location');

    const initialTabType = params.get('type') || params.get('condition') || 'all';
    const applyFilters = initTricyclesFilters(initialTabType);
    refreshInventory = applyFilters;
    initTricyclesTabs(applyFilters, initialTabType);
    const sortListings = document.getElementById('sortListings');
    if (sortListings) sortListings.addEventListener('change', applyFilters);
}

function renderTricyclesListings(vehiclesToRender) {
    if (!tricyclesGrid) return;
    tricyclesGrid.innerHTML = '';
    
    if (vehiclesToRender.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        if (listingCount) listingCount.textContent = 'Showing 0 tricycles';
        const hasAvailableTricycles = vehicles.some(vehicle =>
            vehicle.category === 'bajaj' && vehicle.availability === 'available'
        );
        const emptyTitle = document.getElementById('tricyclesEmptyTitle');
        const emptyMessage = document.getElementById('tricyclesEmptyMessage');
        const resetButton = document.getElementById('resetSearch');
        const contactLink = document.getElementById('tricyclesEmptyContact');
        if (emptyTitle) emptyTitle.textContent = hasAvailableTricycles
            ? 'No tricycles match this selection'
            : 'No tricycles are currently available';
        if (emptyMessage) emptyMessage.textContent = hasAvailableTricycles
            ? 'Try another tricycle type or condition.'
            : 'Contact Zackconnect Autos to ask about upcoming availability.';
        if (resetButton) resetButton.hidden = !hasAvailableTricycles;
        if (contactLink) contactLink.hidden = hasAvailableTricycles;
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    const resetButton = document.getElementById('resetSearch');
    const contactLink = document.getElementById('tricyclesEmptyContact');
    if (resetButton) resetButton.hidden = false;
    if (contactLink) contactLink.hidden = true;
    if (listingCount) listingCount.textContent = `Showing ${vehiclesToRender.length} tricycle${vehiclesToRender.length !== 1 ? 's' : ''}`;

    vehiclesToRender.forEach(vehicle => {
        const card = createVehicleCard(vehicle);
        tricyclesGrid.appendChild(card);
    });
}

// Render Vehicle Details Page
function initVehicleDetailsPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const vehicleId = urlParams.get('id');
    const vehicleCategory = urlParams.get('type');

    if (vehicleId) {
        const vehicle = vehicles.find(v =>
            String(v.id) === vehicleId &&
            (!vehicleCategory || v.category === vehicleCategory)
        );
        if (vehicle) {
            renderVehicleDetailsPage(vehicle);
        } else {
            vehicleDetailsContent.innerHTML = '<p>Vehicle not found.</p>';
        }
    } else {
        vehicleDetailsContent.innerHTML = '<p>No vehicle specified.</p>';
    }
}

function renderVehicleDetailsPage(vehicle) {
    if (!vehicleDetailsContent) return;
    const vehicleTitle = escapeHtml(vehicle.title);
    const importParams = new URLSearchParams({
        makeModel: `${vehicle.make} ${vehicle.model}`,
        year: String(vehicle.year),
        condition: vehicle.condition,
        vehicleType: vehicle.category === 'car' ? 'car' : 'other',
        sourceVehicle: vehicle.title,
        sourceVehicleId: String(vehicle.id),
        estimatePrice: String(vehicle.price)
    });
    if (vehicle.sourceCountry) importParams.set('country', vehicle.sourceCountry);
    
    const isImportListing = vehicle.category === 'car' && vehicle.listingType === 'import';
    const sourceCountryLabel = vehicle.sourceCountry ? formatSourceCountry(vehicle.sourceCountry) : '';
    const availabilityBadge = vehicle.availability === 'available'
        ? `<span class="availability-badge available">${isImportListing ? 'Available to import' : 'Available'}</span>`
        : '<span class="availability-badge sold">Sold</span>';

    const mileageSpec = vehicle.mileage ? `
        <div class="spec-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>${Number(vehicle.mileage).toLocaleString()} km</span>
        </div>
    ` : '';

    const transmissionSpec = vehicle.transmission ? `
        <div class="spec-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
            </svg>
            <span>${escapeHtml(vehicle.transmission)}</span>
        </div>
    ` : '';

    const fuelSpec = vehicle.fuelType ? `
        <div class="spec-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
            <span>${escapeHtml(vehicle.fuelType)}</span>
        </div>
    ` : '';

    vehicleDetailsContent.innerHTML = `
        <div class="vehicle-details-header">
            <h1>${vehicleTitle}</h1>
            ${isImportListing ? '<p class="vehicle-price-note">Indicative import estimate</p>' : ''}
            <div class="price">GH₵${vehicle.price.toLocaleString()}</div>
            ${availabilityBadge}
        </div>

        <div class="vehicle-gallery">
            <div class="gallery-main">
                <img src="${escapeHtml(vehicle.images[0])}" alt="${vehicleTitle}">
            </div>
            <div class="gallery-thumbnails">
                ${vehicle.images.map((img, index) => `
                    <div class="gallery-thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
                        <img src="${escapeHtml(img)}" alt="${vehicleTitle}">
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="vehicle-specs">
            <h2>Specifications</h2>
            <div class="specs-grid">
                <div class="spec-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span>Year: ${vehicle.year}</span>
                </div>
                ${vehicle.category === 'bajaj' ? `<div class="spec-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="5" cy="17" r="3"/>
                        <circle cx="19" cy="17" r="3"/>
                        <path d="M5 17h5l3-7h4l2 7M10 17l-2-6h5"/>
                    </svg>
                    <span>Type: ${vehicle.bajajType === 'cargo' ? 'Cargo tricycle' : 'Passenger tricycle'}</span>
                </div>` : ''}
                ${isImportListing && sourceCountryLabel ? `<div class="spec-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>
                    </svg>
                    <span>Country of origin: ${escapeHtml(sourceCountryLabel)}</span>
                </div>` : ''}
                ${!isImportListing ? `<div class="spec-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span>Location: ${escapeHtml(formatLocation(vehicle.location))}</span>
                </div>` : ''}
                <div class="spec-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    <span>Condition: ${vehicle.condition === 'new' ? 'New' : 'Used'}</span>
                </div>
                ${mileageSpec}
                ${transmissionSpec}
                ${fuelSpec}
                ${vehicle.color ? `
                    <div class="spec-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                        </svg>
                        <span>Color: ${escapeHtml(vehicle.color)}</span>
                    </div>
                ` : ''}
            </div>
        </div>

        <div class="vehicle-description">
            <h2>Description</h2>
            <p>${escapeHtml(vehicle.description)}</p>
        </div>

        <div class="dealership-info">
            <h2>Contact Zackconnect Autos</h2>
            <p>${isImportListing
                ? `This car is available to import from ${sourceCountryLabel ? escapeHtml(sourceCountryLabel) : 'its listed source country'} to Ghana. Contact us to confirm sourcing availability and get an up-to-date landed-price quote.`
                : 'Contact us to confirm availability and arrange a viewing.'}</p>
            <div class="contact-actions">
                ${isImportListing
                    ? `<a href="import.html?${importParams.toString()}" class="btn btn-primary">Request import quote</a>`
                    : ''}
                <a href="tel:+233243739221" class="btn btn-primary">Call Zackconnect Autos</a>
                <a href="https://wa.me/233243739221" class="btn btn-whatsapp">Chat on WhatsApp</a>
                <a href="contact.html" class="btn btn-secondary">Send Enquiry</a>
            </div>
            ${isImportListing ? '<p class="demo-note">Price shown is an estimate only; confirm the vehicle, shipping, duties, and final landed cost with Zackconnect Autos before purchase.</p>' : ''}
        </div>

        <div class="similar-vehicles">
            <h2>Similar Vehicles</h2>
            <div class="listings-grid">
                ${vehicles.filter(v => v.category === vehicle.category && v.id !== vehicle.id).slice(0, 3).map(v => {
                    const card = createVehicleCard(v);
                    return card.outerHTML;
                }).join('')}
            </div>
        </div>
    `;

    // Add event listeners for gallery thumbnails
    vehicleDetailsContent.querySelectorAll('.gallery-thumbnail').forEach(thumb => {
        thumb.addEventListener('click', function() {
            const index = this.dataset.index;
            const mainImage = vehicleDetailsContent.querySelector('.gallery-main img');
            mainImage.src = vehicle.images[index];
            
            vehicleDetailsContent.querySelectorAll('.gallery-thumbnail').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
    vehicleDetailsContent.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', () => {
            window.location.href = `vehicle-details.html?id=${encodeURIComponent(button.dataset.id)}&type=${encodeURIComponent(vehicle.category)}`;
        });
    });
}

// Initialize Import Page
function initImportPage() {
    initImportForm();
}

function initImportForm() {
    const importForm = document.getElementById('importForm');
    if (importForm) {
        const params = new URLSearchParams(window.location.search);
        const makeModelInput = document.getElementById('importMakeModel');
        const yearInput = document.getElementById('importYear');
        const conditionInput = document.getElementById('importCondition');
        const vehicleTypeInput = document.getElementById('importVehicleType');
        const sourceVehicleInput = document.getElementById('importSourceVehicle');
        const sourceVehicleIdInput = document.getElementById('importSourceVehicleId');
        const sourceCountryInput = document.getElementById('importCountry');
        const selectedVehicleNote = document.getElementById('selectedImportVehicle');
        if (params.has('makeModel')) makeModelInput.value = params.get('makeModel');
        if (params.has('year')) yearInput.value = params.get('year');
        if (params.has('condition')) conditionInput.value = params.get('condition');
        if (params.has('vehicleType')) vehicleTypeInput.value = params.get('vehicleType');
        if (params.has('sourceVehicle')) sourceVehicleInput.value = params.get('sourceVehicle');
        if (params.has('sourceVehicleId')) sourceVehicleIdInput.value = params.get('sourceVehicleId');
        if (params.has('country')) sourceCountryInput.value = params.get('country');
        if (params.has('sourceVehicle')) {
            const estimate = Number(params.get('estimatePrice'));
            const estimateText = Number.isFinite(estimate) && estimate > 0
                ? ` · Indicative listing price: GH₵${estimate.toLocaleString()}`
                : '';
            const sourceCountryText = formatSourceCountry(params.get('country'));
            selectedVehicleNote.textContent =
                `Requesting a quote for: ${params.get('sourceVehicle')}${sourceCountryText ? ` · Source: ${sourceCountryText}` : ''}${estimateText}. The final price will be confirmed by Zackconnect Autos.`;
            selectedVehicleNote.hidden = false;
        }

        importForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (validateForm(importForm)) {
                try {
                    await window.ZackconnectAPI.ContactAPI.submitImport(Object.fromEntries(new FormData(importForm)));
                    showToast('Import request submitted successfully. Zackconnect Autos will contact you soon.', 'success');
                    importForm.reset();
                    selectedVehicleNote.hidden = true;
                    selectedVehicleNote.textContent = '';
                } catch (error) {
                    console.error(error);
                    showToast('Could not save your import request. Please try again.', 'error');
                }
            }
        });
    }
}

// Initialize Contact Page
function initContactPage() {
    initContactForm();
}

async function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (validateForm(contactForm)) {
                const formData = Object.fromEntries(new FormData(contactForm));
                
                if (useBackendAPI && window.ZackconnectAPI) {
                    try {
                        await window.ZackconnectAPI.ContactAPI.submit(formData);
                        showToast('Message sent successfully! Zackconnect Autos will contact you soon.', 'success');
                        contactForm.reset();
                    } catch (error) {
                        console.error('Failed to send message to backend:', error);
                        showToast('Failed to send message. Please try again or contact us directly.', 'error');
                    }
                }
            }
        });
    }
}

// Render Bajaj Listings (legacy - kept for compatibility)
function renderBajajListings() {
    const bajajVehicles = vehicles.filter(v => v.category === 'bajaj');
    if (bajajGrid) {
        bajajGrid.innerHTML = '';
        bajajVehicles.forEach(vehicle => {
            const card = createVehicleCard(vehicle);
            bajajGrid.appendChild(card);
        });
    }
}

// Render Favourites (removed - marketplace feature)
// function renderFavourites() { ... }

// Create Vehicle Card
function createVehicleCard(vehicle) {
    const card = document.createElement('div');
    card.className = 'vehicle-card';
    card.dataset.id = vehicle.id;

    const badgeClass = vehicle.condition === 'new' ? 'badge-new' : 'badge-used';
    const isImportListing = vehicle.category === 'car' && vehicle.listingType === 'import';
    const sourceCountryLabel = vehicle.sourceCountry ? formatSourceCountry(vehicle.sourceCountry) : '';
    const availabilityBadge = vehicle.category === 'car'
        ? ''
        : vehicle.availability === 'available'
            ? '<span class="availability-badge-card">Available</span>'
            : '<span class="availability-badge-card sold">Sold</span>';
    const mileageInfo = vehicle.mileage ? `<span class="vehicle-info-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
        </svg>
        ${Number(vehicle.mileage).toLocaleString()} km
    </span>` : '';
    const vehicleImages = Array.isArray(vehicle.images) && vehicle.images.length
        ? vehicle.images
        : vehicle.image ? [vehicle.image] : [];
    const imageUrl = escapeHtml(vehicleImages[0] || '');
    const title = escapeHtml(vehicle.title);
    const browseLink = document.createElement('a');
    if (vehicle.category !== 'car') {
        browseLink.href = 'tricycles.html';
        browseLink.className = 'btn btn-primary';
        browseLink.textContent = 'Browse Tricycles';
    }

    card.innerHTML = `
        <div class="vehicle-image">
            <img class="vehicle-card-image" src="${imageUrl}" alt="${title}">
            <span class="vehicle-badge ${badgeClass}">${escapeHtml(vehicle.condition)}</span>
            ${availabilityBadge}
            ${vehicleImages.length > 1 ? `
                <button class="vehicle-image-nav vehicle-image-previous" type="button" aria-label="Previous photo">‹</button>
                <button class="vehicle-image-nav vehicle-image-next" type="button" aria-label="Next photo">›</button>
                <span class="vehicle-image-count" aria-live="polite">1 / ${vehicleImages.length}</span>
            ` : ''}
        </div>
        <div class="vehicle-details">
            <h3 class="vehicle-title">${title}</h3>
            ${isImportListing ? '<span class="vehicle-price-note">Indicative import estimate</span>' : ''}
            <div class="vehicle-price">GH₵${vehicle.price.toLocaleString()}</div>
            <div class="vehicle-info">
                <span class="vehicle-info-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    ${vehicle.year}
                </span>
                ${mileageInfo}
                ${!isImportListing ? `<span class="vehicle-info-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                    ${escapeHtml(formatLocation(vehicle.location))}
                </span>` : ''}
            </div>
            <div class="vehicle-meta">
                <span class="vehicle-location">${isImportListing ? `From ${escapeHtml(sourceCountryLabel || 'country not specified')}` : escapeHtml(formatLocation(vehicle.location))}</span>
                <span class="vehicle-seller">Zackconnect Autos</span>
            </div>
            <div class="vehicle-actions">
                <button class="btn btn-outline view-details" data-id="${vehicle.id}" data-category="${vehicle.category}">View Details</button>
            </div>
        </div>
    `;
    if (vehicle.category !== 'car') card.querySelector('.vehicle-actions').append(browseLink);

    if (vehicleImages.length > 1) {
       const cardImage = card.querySelector('.vehicle-card-image');
       const imageCount = card.querySelector('.vehicle-image-count');
       let activeImage = 0;
       const showImage = offset => {
           activeImage = (activeImage + offset + vehicleImages.length) % vehicleImages.length;
           cardImage.src = vehicleImages[activeImage];
           imageCount.textContent = `${activeImage + 1} / ${vehicleImages.length}`;
       };
       card.querySelector('.vehicle-image-previous').addEventListener('click', () => showImage(-1));
       card.querySelector('.vehicle-image-next').addEventListener('click', () => showImage(1));
    }

    // Add event listener for view details
    const viewDetailsBtn = card.querySelector('.view-details');
    viewDetailsBtn.addEventListener('click', () => {
        window.location.href = `vehicle-details.html?id=${encodeURIComponent(vehicle.id)}&type=${encodeURIComponent(vehicle.category)}`;
    });

    return card;
}

// Format Location
function formatLocation(location) {
    const locations = {
        'accra': 'Accra',
        'koforidua': 'Koforidua'
    };
    return locations[location] || location;
}

function formatSourceCountry(country) {
    const countries = {
        china: 'China',
        usa: 'USA',
        canada: 'Canada'
    };
    return countries[String(country || '').toLowerCase()] || '';
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
}

// Toggle Favourite (removed - marketplace feature)
// function toggleFavourite(vehicleId) { ... }

// Show Vehicle Details Modal (removed - using separate page now)
// function showVehicleDetails(vehicle) { ... }

// Initialize Modal (removed - using separate page now)
// function initModal() { ... }

// Initialize Cars Filters
function initCarsFilters() {
    const filterMake = document.getElementById('filterMake');
    const filterModel = document.getElementById('filterModel');
    const filterPriceRange = document.getElementById('filterPriceRange');
    const filterYear = document.getElementById('filterYear');
    const filterCondition = document.getElementById('filterCondition');
    const filterTransmission = document.getElementById('filterTransmission');
    const filterFuelType = document.getElementById('filterFuelType');
    const filterBodyType = document.getElementById('filterBodyType');
    const filterCountry = document.getElementById('filterCountry');
    const filterLocation = document.getElementById('filterLocation');
    const clearFilters = document.getElementById('clearFilters');
    const resetSearch = document.getElementById('resetSearch');

    const filters = [filterMake, filterModel, filterPriceRange, filterYear, filterCondition, filterTransmission, filterFuelType, filterBodyType, filterCountry, filterLocation];

    filters.forEach(filter => {
        if (filter) {
            filter.addEventListener('change', applyCarsFilters);
        }
    });

    if (clearFilters) {
        clearFilters.addEventListener('click', () => {
            filters.forEach(f => { if (f) f.value = ''; });
            applyCarsFilters();
        });
    }

    if (resetSearch) {
        resetSearch.addEventListener('click', () => {
            filters.forEach(f => { if (f) f.value = ''; });
            const searchInput = document.getElementById('searchCars');
            if (searchInput) searchInput.value = '';
            applyCarsFilters();
        });
    }

    function applyCarsFilters() {
        let carVehicles = vehicles.filter(v => v.category === 'car' && v.availability === 'available');

        const params = new URLSearchParams(window.location.search);
        if (params.has('groupMake')) {
            carVehicles = carVehicles.filter(v =>
                v.make.toLowerCase() === params.get('groupMake').toLowerCase() &&
                v.model.toLowerCase() === params.get('groupModel').toLowerCase() &&
                String(v.year) === params.get('groupYear')
            );
        }
        
        if (filterMake && filterMake.value) carVehicles = carVehicles.filter(v => v.make === filterMake.value);
        if (filterModel && filterModel.value) carVehicles = carVehicles.filter(v => v.model.toLowerCase() === filterModel.value.toLowerCase());
        if (filterCondition && filterCondition.value) carVehicles = carVehicles.filter(v => v.condition === filterCondition.value);
        if (filterTransmission && filterTransmission.value) carVehicles = carVehicles.filter(v => v.transmission === filterTransmission.value);
        if (filterFuelType && filterFuelType.value) carVehicles = carVehicles.filter(v => v.fuelType === filterFuelType.value);
        if (filterCountry && filterCountry.value) {
            carVehicles = carVehicles.filter(v =>
                v.listingType === 'import' && v.sourceCountry === filterCountry.value
            );
        }
        if (filterLocation && filterLocation.value) {
            carVehicles = carVehicles.filter(v =>
                v.listingType !== 'import' && v.location === filterLocation.value
            );
        }

        const searchInput = document.getElementById('searchCars');
        const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        if (keyword) {
            carVehicles = carVehicles.filter(v =>
                v.title.toLowerCase().includes(keyword) ||
                v.make.toLowerCase().includes(keyword) ||
                v.model.toLowerCase().includes(keyword) ||
                formatSourceCountry(v.sourceCountry).toLowerCase().includes(keyword)
            );
        }
        
        if (filterPriceRange && filterPriceRange.value) {
            if (filterPriceRange.value.endsWith('+')) {
                const minimum = Number.parseInt(filterPriceRange.value, 10);
                carVehicles = carVehicles.filter(v => v.price >= minimum);
            } else {
                const [minimum, maximum] = filterPriceRange.value.split('-').map(Number);
                carVehicles = carVehicles.filter(v => v.price >= minimum && v.price <= maximum);
            }
        }
        
        if (filterYear && filterYear.value) {
            if (filterYear.value === 'older') {
                carVehicles = carVehicles.filter(v => v.year <= 2019);
            } else {
                carVehicles = carVehicles.filter(v => v.year === parseInt(filterYear.value));
            }
        }

        const sortListings = document.getElementById('sortListings');
        if (sortListings?.value === 'price-low') carVehicles.sort((a, b) => a.price - b.price);
        else if (sortListings?.value === 'price-high') carVehicles.sort((a, b) => b.price - a.price);
        else carVehicles.sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted));

        renderCarsListings(carVehicles);
    }

    return applyCarsFilters;
}

// Initialize Cars Search
function initCarsSearch(applyFilters) {
    const searchInput = document.getElementById('searchCars');
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
}

// Initialize Cars Sorting
function initCarsSorting(applyFilters) {
    const sortListings = document.getElementById('sortListings');
    if (sortListings) {
        sortListings.addEventListener('change', applyFilters);
    }
}

// Initialize Tricycles Filters
function initTricyclesFilters(initialTabType = 'all') {
    const filterBajajType = document.getElementById('filterBajajType');
    const filterCondition = document.getElementById('filterCondition');
    const filterPriceRange = document.getElementById('filterPriceRange');
    const filterLocation = document.getElementById('filterLocation');
    const clearFilters = document.getElementById('clearFilters');
    const resetSearch = document.getElementById('resetSearch');
    const sortListings = document.getElementById('sortListings');
    let activeTabType = initialTabType;

    const filters = [filterBajajType, filterCondition, filterPriceRange, filterLocation];

    filters.forEach(filter => {
        if (filter) {
            filter.addEventListener('change', applyTricyclesFilters);
        }
    });

    if (clearFilters) {
        clearFilters.addEventListener('click', () => {
            filters.forEach(f => { if (f) f.value = ''; });
            activeTabType = 'all';
            document.querySelectorAll('.category-tab').forEach(tab => {
                tab.classList.toggle('active', tab.dataset.type === 'all');
            });
            applyTricyclesFilters();
        });
    }

    if (resetSearch) {
        resetSearch.addEventListener('click', () => {
            filters.forEach(f => { if (f) f.value = ''; });
            activeTabType = 'all';
            document.querySelectorAll('.category-tab').forEach(tab => {
                tab.classList.toggle('active', tab.dataset.type === 'all');
            });
            applyTricyclesFilters();
        });
    }

    function applyTricyclesFilters(tabType) {
        if (typeof tabType === 'string') activeTabType = tabType;
        let bajajVehicles = vehicles.filter(v =>
            v.category === 'bajaj' && v.availability === 'available'
        );
        
        if (activeTabType === 'new' || activeTabType === 'used') {
            bajajVehicles = bajajVehicles.filter(v => v.condition === activeTabType);
        } else if (activeTabType !== 'all') {
            bajajVehicles = bajajVehicles.filter(v => v.bajajType === activeTabType);
        }
        if (filterBajajType && filterBajajType.value) bajajVehicles = bajajVehicles.filter(v => v.bajajType === filterBajajType.value);
        if (filterCondition && filterCondition.value) bajajVehicles = bajajVehicles.filter(v => v.condition === filterCondition.value);
        if (filterLocation && filterLocation.value) bajajVehicles = bajajVehicles.filter(v => v.location === filterLocation.value);
        
        if (filterPriceRange && filterPriceRange.value) {
            const [min, max] = filterPriceRange.value.split('-').map(v => v === '+' ? Infinity : Number.parseInt(v, 10));
            bajajVehicles = bajajVehicles.filter(v => v.price >= min && v.price <= max);
        }

        if (sortListings?.value === 'price-low') bajajVehicles.sort((a, b) => a.price - b.price);
        else if (sortListings?.value === 'price-high') bajajVehicles.sort((a, b) => b.price - a.price);
        else bajajVehicles.sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted));
        
        renderTricyclesListings(bajajVehicles);
    }

    applyTricyclesFilters();
    return applyTricyclesFilters;
}

// Initialize Tricycles Tabs
function initTricyclesTabs(applyFilters, initialTabType = 'all') {
    const categoryTabs = document.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.type === initialTabType);
    });

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const type = tab.dataset.type || 'all';
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            applyFilters(type);
        });
    });
}

// Initialize Search (removed - marketplace feature)
// function initSearch() { ... }

// Initialize Sorting (removed - marketplace feature)
// function initSorting() { ... }

// Initialize Forms (removed sell form, auth - marketplace features)
// function initForms() { ... }

// Validate Form
function validateForm(form, checkRequired = true) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = '#dc3545';
        } else {
            field.style.borderColor = '#e0e0e0';
        }
    });

    // Email validation
    const emailFields = form.querySelectorAll('input[type="email"]');
    emailFields.forEach(field => {
        if (field.value && !isValidEmail(field.value)) {
            isValid = false;
            field.style.borderColor = '#dc3545';
            showToast('Please enter a valid email address', 'error');
        }
    });

    // Phone validation
    const phoneFields = form.querySelectorAll('input[type="tel"]');
    phoneFields.forEach(field => {
        if (field.value && !isValidPhone(field.value)) {
            isValid = false;
            field.style.borderColor = '#dc3545';
            showToast('Please enter a valid phone number', 'error');
        }
    });

    if (!isValid && checkRequired) {
        showToast('Please fill in all required fields', 'error');
    }

    return isValid;
}

// Email Validation
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Phone Validation
function isValidPhone(phone) {
    const re = /^[\d\s\+()-]{10,}$/;
    return re.test(phone);
}

// Show Ad Preview (removed - marketplace feature)
// function showAdPreview() { ... }

// Initialize Auth Tabs (removed - marketplace feature)
// function initAuthTabs() { ... }

// Initialize Password Toggle (removed - marketplace feature)
// function initPasswordToggle() { ... }

// Initialize Image Preview (removed - marketplace feature)
// function initImagePreview() { ... }

// Initialize Toast
function initToast() {
    toastClose.addEventListener('click', () => {
        toast.classList.remove('active');
    });

    setTimeout(() => {
        if (toast.classList.contains('active')) {
            toast.classList.remove('active');
        }
    }, 5000);
}

// Show Toast
function showToast(message, type = 'success') {
    if (!toast || !toastMessage) {
        window.alert(message);
        return;
    }

    toastMessage.textContent = message;
    toast.className = `toast ${type} active`;
    
    setTimeout(() => {
        toast.classList.remove('active');
    }, 5000);
}

// Category Cards Click Handlers (removed - using direct links now)
// document.querySelectorAll('.category-card').forEach(card => { ... });

// Smooth scroll for navigation links (removed - using page links now)
// document.querySelectorAll('a[href^="#"]').forEach(anchor => { ... });

// Bajaj Filters (legacy - replaced by initTricyclesFilters)
// const bajajTypeFilter = document.getElementById('bajajTypeFilter');
// const bajajConditionFilter = document.getElementById('bajajConditionFilter');
// if (bajajTypeFilter && bajajConditionFilter) { ... }

// Helper function for applyFilters (removed - replaced by page-specific filters)
// function applyFilters() { ... }
