(() => {
    const storageKey = 'zackconnect_admin_data';
    const defaultCategoryImage = 'images/carimport.jpg';
    const previousDefaultImages = new Set([
        'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
        'images/car2.png'
    ]);
    const defaultCategories = [
        { id: 'cars', label: 'Cars', image: defaultCategoryImage, page: 'cars.html', filters: [{ field: 'category', value: 'car' }], query: {} },
        { id: 'toyota', label: 'Toyota', image: defaultCategoryImage, page: 'cars.html', filters: [{ field: 'make', value: 'toyota' }], query: { make: 'toyota' } },
        { id: 'honda', label: 'Honda', image: defaultCategoryImage, page: 'cars.html', filters: [{ field: 'make', value: 'honda' }], query: { make: 'honda' } },
        { id: 'hyundai', label: 'Hyundai', image: defaultCategoryImage, page: 'cars.html', filters: [{ field: 'make', value: 'hyundai' }], query: { make: 'hyundai' } },
        { id: 'tricycles', label: 'Bajaj Tricycles', image: defaultCategoryImage, page: 'tricycles.html', filters: [{ field: 'category', value: 'bajaj' }], query: {} },
        { id: 'passenger-tricycles', label: 'Passenger Tricycles', image: defaultCategoryImage, page: 'tricycles.html', filters: [{ field: 'bajajType', value: 'passenger' }], query: { type: 'passenger' } },
        { id: 'cargo-tricycles', label: 'Cargo Tricycles', image: defaultCategoryImage, page: 'tricycles.html', filters: [{ field: 'bajajType', value: 'cargo' }], query: { type: 'cargo' } },
        { id: 'imports', label: 'Vehicle Imports', image: defaultCategoryImage, page: 'import.html', filters: [], query: {}, countLabel: 'Get a quote' },
        { id: 'corolla', label: 'Toyota Corolla', image: defaultCategoryImage, page: 'cars.html', filters: [{ field: 'make', value: 'toyota' }, { field: 'model', value: 'corolla' }], query: { model: 'corolla' } },
        { id: 'camry', label: 'Toyota Camry', image: defaultCategoryImage, page: 'cars.html', filters: [{ field: 'make', value: 'toyota' }, { field: 'model', value: 'camry' }], query: { model: 'camry' } },
        { id: 'civic', label: 'Honda Civic', image: defaultCategoryImage, page: 'cars.html', filters: [{ field: 'make', value: 'honda' }, { field: 'model', value: 'civic' }], query: { model: 'civic' } },
        { id: 'tucson', label: 'Hyundai Tucson', image: defaultCategoryImage, page: 'cars.html', filters: [{ field: 'make', value: 'hyundai' }, { field: 'model', value: 'tucson' }], query: { model: 'tucson' } },
        { id: 'hilux', label: 'Toyota Hilux', image: defaultCategoryImage, page: 'cars.html', filters: [{ field: 'make', value: 'toyota' }, { field: 'model', value: 'hilux' }], query: { model: 'hilux' } },
        { id: 'new-tricycles', label: 'New Tricycles', image: defaultCategoryImage, page: 'tricycles.html', filters: [{ field: 'category', value: 'bajaj' }, { field: 'condition', value: 'new' }], query: { condition: 'new' } },
        { id: 'used-tricycles', label: 'Used Tricycles', image: defaultCategoryImage, page: 'tricycles.html', filters: [{ field: 'category', value: 'bajaj' }, { field: 'condition', value: 'used' }], query: { condition: 'used' } },
        { id: 'contact', label: 'Sell a Vehicle', image: defaultCategoryImage, page: 'contact.html', filters: [], query: {}, countLabel: 'Contact us' }
    ];
    const defaultHomeTiles = [
        {
            id: 'cars',
            label: 'Import a Car',
            image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=1200&h=800&fit=crop',
            images: [
                'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=1200&h=800&fit=crop',
                'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&h=800&fit=crop'
            ],
            page: 'cars.html'
        },
        {
            id: 'tricycles',
            label: 'Bajaj Tricycles',
            image: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/2019_Bajaj_RE_Compact_auto_rickshaw.jpg',
            images: [
                'https://upload.wikimedia.org/wikipedia/commons/a/ae/2019_Bajaj_RE_Compact_auto_rickshaw.jpg',
                'https://upload.wikimedia.org/wikipedia/commons/0/0d/2013_Bajaj_RE_auto_rickshaw.jpg'
            ],
            page: 'tricycles.html',
            credit: 'Photos by Oleg Yunakov, licensed under CC BY-SA 4.0.',
            creditUrl: 'https://commons.wikimedia.org/wiki/File:2019_Bajaj_RE_Compact_auto_rickshaw.jpg'
        }
    ];

    function updateBrandName(value) {
        return value.replace(/\bZackconnect\b(?!\s+Autos)/g, 'Zackconnect Autos');
    }

    function createId() {
        return typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }

    function readState(defaultVehicles) {
        const savedState = localStorage.getItem(storageKey);
        if (savedState === null) {
            return {
                vehicles: [...defaultVehicles],
                categories: [...defaultCategories],
                homeTiles: [...defaultHomeTiles],
                requests: [],
                announcements: [],
                activity: [],
                carImportCatalogVersion: 1,
                siteContent: { text: {}, images: {}, hiddenSections: [] }
            };
        }

        let state;
        try {
            state = JSON.parse(savedState);
        } catch (error) {
            throw new Error('Saved Zackconnect admin data is unreadable. Clear this site’s local storage to reset the prototype.', { cause: error });
        }

        if (!state || !Array.isArray(state.vehicles) || !Array.isArray(state.requests) ||
            !Array.isArray(state.announcements) || !Array.isArray(state.activity)) {
            throw new Error('Saved Zackconnect admin data has an invalid format. Clear this site’s local storage to reset the prototype.');
        }
        if (!Array.isArray(state.categories)) state.categories = [...defaultCategories];
        if (!Array.isArray(state.homeTiles)) state.homeTiles = [...defaultHomeTiles];
        if (!state.siteContent || typeof state.siteContent !== 'object' || Array.isArray(state.siteContent)) {
            state.siteContent = { text: {}, images: {}, hiddenSections: [] };
        }
        if (!state.siteContent.text || typeof state.siteContent.text !== 'object' || Array.isArray(state.siteContent.text)) {
            state.siteContent.text = {};
        }
        Object.keys(state.siteContent.text).forEach(key => {
            const value = state.siteContent.text[key];
            if (typeof value === 'string') state.siteContent.text[key] = updateBrandName(value);
        });
        state.siteContent.text['contact.phone'] = '+233 24 373 9221';
        state.siteContent.text['contact.whatsapp'] = '+233 24 373 9221';
        state.siteContent.text['contact.location'] = 'Koforidua, Accra - Ghana';
        if (!state.siteContent.images || typeof state.siteContent.images !== 'object' || Array.isArray(state.siteContent.images)) {
            state.siteContent.images = {};
        }
        if (!Array.isArray(state.siteContent.hiddenSections)) state.siteContent.hiddenSections = [];
        state.homeTiles = state.homeTiles.map(tile => {
            const defaultTile = defaultHomeTiles.find(item => item.id === tile.id);
            const isUnmodifiedDefault = defaultTile && tile.image === defaultTile.image;
            const images = Array.isArray(tile.images) && tile.images.length
                ? tile.images.filter(image => typeof image === 'string' && image)
                : isUnmodifiedDefault ? defaultTile.images
                : tile.image ? [tile.image] : [];
            return {
                ...tile,
                label: tile.id === 'cars' && tile.label === 'Cars' ? defaultTile.label : tile.label,
                images,
                image: images[0] || tile.image || ''
            };
        });
        if (state.carImportCatalogVersion !== 1) {
            let nextVehicleId = Math.max(0, ...state.vehicles.map(vehicle => Number(vehicle.id) || 0));
            defaultVehicles.filter(vehicle => vehicle.category === 'car').forEach(defaultVehicle => {
                const existingVehicle = state.vehicles.find(vehicle => vehicle.title === defaultVehicle.title);
                if (existingVehicle) {
                    existingVehicle.listingType = 'import';
                    return;
                }
                const idInUse = state.vehicles.some(vehicle => String(vehicle.id) === String(defaultVehicle.id));
                const id = idInUse ? ++nextVehicleId : defaultVehicle.id;
                state.vehicles.push({ ...defaultVehicle, id, listingType: 'import' });
            });
            state.carImportCatalogVersion = 1;
        }
        state.vehicles = state.vehicles.map(vehicle => ({
            ...vehicle,
            sellerName: vehicle.sellerName === 'Zackconnect' ? 'Zackconnect Autos' : vehicle.sellerName,
            description: typeof vehicle.description === 'string' ? updateBrandName(vehicle.description) : vehicle.description,
            location: ['accra', 'koforidua'].includes(vehicle.location) ? vehicle.location : 'koforidua'
        }));
        state.categories = state.categories.map(category => {
            if (category.image && !previousDefaultImages.has(category.image)) return category;
            const defaultCategory = defaultCategories.find(item => item.id === category.id);
            if (defaultCategory) return { ...category, image: defaultCategoryImage };
            return { ...category, image: category.image || defaultCategoryImage };
        });

        return state;
    }

    function updateState(defaultVehicles, update, action, details) {
        const state = readState(defaultVehicles);
        update(state);
        state.activity.unshift({
            id: createId(),
            action,
            details,
            createdAt: new Date().toISOString()
        });
        state.activity = state.activity.slice(0, 100);

        try {
            localStorage.setItem(storageKey, JSON.stringify(state));
        } catch (error) {
            throw new Error('Could not save Zackconnect data in this browser. Check browser storage settings and available space.', { cause: error });
        }
        return state;
    }

    window.ZackconnectData = Object.freeze({
        storageKey,
        defaultCategories,
        defaultHomeTiles,
        readState,
        addVehicle(defaultVehicles, vehicle) {
            return updateState(defaultVehicles, state => state.vehicles.unshift(vehicle), 'Added vehicle', vehicle.title);
        },
        updateVehicle(defaultVehicles, id, vehicle) {
            return updateState(defaultVehicles, state => {
                const index = state.vehicles.findIndex(item => String(item.id) === String(id));
                if (index === -1) throw new Error('That vehicle could not be found.');
                state.vehicles[index] = { ...state.vehicles[index], ...vehicle, id: state.vehicles[index].id };
            }, 'Updated vehicle', vehicle.title);
        },
        removeVehicle(defaultVehicles, id) {
            return updateState(defaultVehicles, state => {
                const remaining = state.vehicles.filter(vehicle => String(vehicle.id) !== String(id));
                if (remaining.length === state.vehicles.length) throw new Error('That vehicle could not be found.');
                state.vehicles = remaining;
            }, 'Deleted vehicle', `Vehicle ID ${id}`);
        },
        addCategory(defaultVehicles, category) {
            return updateState(defaultVehicles, state => state.categories.unshift({
                ...category,
                id: createId()
            }), 'Added category', category.label);
        },
        updateCategory(defaultVehicles, id, category) {
            return updateState(defaultVehicles, state => {
                const index = state.categories.findIndex(item => item.id === id);
                if (index === -1) throw new Error('That category could not be found.');
                state.categories[index] = { ...state.categories[index], ...category, id };
            }, 'Updated category', category.label);
        },
        removeCategory(defaultVehicles, id) {
            return updateState(defaultVehicles, state => {
                const remaining = state.categories.filter(category => category.id !== id);
                if (remaining.length === state.categories.length) throw new Error('That category could not be found.');
                state.categories = remaining;
            }, 'Deleted category', `Category ID ${id}`);
        },
        addHomeTile(defaultVehicles, tile) {
            return updateState(defaultVehicles, state => state.homeTiles.unshift({
                ...tile,
                id: createId()
            }), 'Added homepage tile', tile.label);
        },
        updateHomeTile(defaultVehicles, id, tile) {
            return updateState(defaultVehicles, state => {
                const index = state.homeTiles.findIndex(item => item.id === id);
                if (index === -1) throw new Error('That homepage tile could not be found.');
                state.homeTiles[index] = { ...state.homeTiles[index], ...tile, id };
            }, 'Updated homepage tile', tile.label);
        },
        removeHomeTile(defaultVehicles, id) {
            return updateState(defaultVehicles, state => {
                const remaining = state.homeTiles.filter(tile => tile.id !== id);
                if (remaining.length === state.homeTiles.length) throw new Error('That homepage tile could not be found.');
                state.homeTiles = remaining;
            }, 'Deleted homepage tile', `Tile ID ${id}`);
        },
        updateSiteContent(defaultVehicles, siteContent, page) {
            return updateState(defaultVehicles, state => {
                state.siteContent = {
                    text: { ...state.siteContent.text, ...siteContent.text },
                    images: { ...state.siteContent.images, ...siteContent.images },
                    hiddenSections: [
                        ...new Set([
                            ...state.siteContent.hiddenSections.filter(key => !siteContent.sectionKeys.includes(key)),
                            ...siteContent.hiddenSections
                        ])
                    ]
                };
            }, 'Updated site content', `Updated ${page} page content`);
        },
        resetSiteContent(defaultVehicles, page, textKeys, imageKeys, sectionKeys) {
            return updateState(defaultVehicles, state => {
                textKeys.forEach(key => delete state.siteContent.text[key]);
                imageKeys.forEach(key => delete state.siteContent.images[key]);
                state.siteContent.hiddenSections = state.siteContent.hiddenSections.filter(
                    key => !sectionKeys.includes(key)
                );
            }, 'Reset site content', `Restored ${page} page content defaults`);
        },
        addRequest(defaultVehicles, type, fields) {
            const request = { id: createId(), type, fields, createdAt: new Date().toISOString() };
            return updateState(defaultVehicles, state => state.requests.unshift(request), `New ${type}`, fields.name || fields.email || 'Website submission');
        },
        removeRequest(defaultVehicles, id) {
            return updateState(defaultVehicles, state => {
                const remaining = state.requests.filter(request => request.id !== id);
                if (remaining.length === state.requests.length) throw new Error('That submission could not be found.');
                state.requests = remaining;
            }, 'Deleted submission', `Submission ID ${id}`);
        },
        addAnnouncement(defaultVehicles, announcement) {
            return updateState(defaultVehicles, state => state.announcements.unshift({
                ...announcement,
                id: createId(),
                createdAt: new Date().toISOString()
            }), 'Published announcement', announcement.title);
        },
        updateAnnouncement(defaultVehicles, id, announcement) {
            return updateState(defaultVehicles, state => {
                const existing = state.announcements.find(item => item.id === id);
                if (!existing) throw new Error('That announcement could not be found.');
                Object.assign(existing, announcement);
            }, 'Updated announcement', announcement.title);
        },
        removeAnnouncement(defaultVehicles, id) {
            return updateState(defaultVehicles, state => {
                const remaining = state.announcements.filter(announcement => announcement.id !== id);
                if (remaining.length === state.announcements.length) throw new Error('That announcement could not be found.');
                state.announcements = remaining;
            }, 'Deleted announcement', `Announcement ID ${id}`);
        }
    });
})();
