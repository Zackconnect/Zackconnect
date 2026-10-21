(() => {
    const dataStore = window.ZackconnectData;
    const defaultVehicles = Array.isArray(window.zackconnectSampleVehicles)
        ? window.zackconnectSampleVehicles
        : [];
    const vehiclesApi = window.ZackconnectAPI.VehiclesAPI;
    let serverVehicles = [];
    const adminMessage = document.getElementById('adminMessage');
    const vehicleForm = document.getElementById('vehicleForm');
    const vehicleFormTitle = document.getElementById('vehicleFormTitle');
    const vehicleSubmitButton = document.getElementById('vehicleSubmitButton');
    const vehicleMakeField = document.getElementById('vehicleMakeField');
    const vehicleListingTypeField = document.getElementById('vehicleListingTypeField');
    const vehicleLocationField = document.getElementById('vehicleLocationField');
    const vehiclePriceLabel = document.getElementById('vehiclePriceLabel');
    const vehicleImageInput = document.getElementById('vehicleImageInput');
    const vehicleImagePreview = document.getElementById('vehicleImagePreview');
    const vehicleImagePlaceholder = document.getElementById('vehicleImagePlaceholder');
    const vehicleImageCount = document.getElementById('vehicleImageCount');
    let vehicleImagePreviewUrls = [];
    let selectedVehicleImages = [];

    function getState() {
        return { ...dataStore.readState(defaultVehicles), vehicles: serverVehicles };
    }

    function showError(error) {
        console.error(error);
        adminMessage.textContent = error.message;
        adminMessage.className = 'admin-message error';
    }

    function setMessage(message) {
        adminMessage.textContent = message;
        adminMessage.className = 'admin-message';
    }

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, character => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[character]);
    }

    function formatDate(value) {
        return new Date(value).toLocaleString();
    }

    function createActionButton(label, className, handler) {
        const button = document.createElement('button');
        button.className = className;
        button.type = 'button';
        button.textContent = label;
        button.addEventListener('click', handler);
        return button;
    }

    function renderActivities(activities, target) {
        target.replaceChildren();
        if (!activities.length) {
            target.textContent = 'No activity recorded in this browser yet.';
            return;
        }

        activities.slice(0, 8).forEach(activity => {
            const item = document.createElement('div');
            item.className = 'admin-activity-item';
            const description = document.createElement('div');
            const title = document.createElement('strong');
            title.textContent = activity.action;
            const details = document.createElement('span');
            details.textContent = activity.details;
            description.append(title, details);
            const time = document.createElement('time');
            time.dateTime = activity.createdAt;
            time.textContent = formatDate(activity.createdAt);
            item.append(description, time);
            target.append(item);
        });
    }

    function renderVehicles(state) {
        const rows = document.getElementById('vehicleRows');
        rows.replaceChildren();
        document.getElementById('vehicleCountLabel').textContent = `${state.vehicles.length} listing${state.vehicles.length === 1 ? '' : 's'}`;

        state.vehicles.forEach(vehicle => {
            const row = document.createElement('tr');
            const name = document.createElement('td');
            name.textContent = vehicle.title;
            const category = document.createElement('td');
            category.textContent = vehicle.category === 'bajaj' ? 'Tricycle' : 'Car';
            const price = document.createElement('td');
            price.textContent = `GH₵${Number(vehicle.price).toLocaleString()}`;
            const location = document.createElement('td');
            location.textContent = vehicle.listingType === 'import' ? 'Available to import' : vehicle.location;
            const action = document.createElement('td');
            action.append(createActionButton('Edit', 'admin-edit-button', () => openVehicleEditor(vehicle)));
            action.append(createActionButton('Delete', 'admin-delete-button', async () => {
                if (!window.confirm(`Delete "${vehicle.title}" from this browser's inventory?`)) return;
                try {
                    await vehiclesApi.deleteAdmin(vehicle);
                    await loadAdminVehicles();
                    setMessage('Vehicle deleted from the shared inventory.');
                } catch (error) {
                    showError(error);
                }
            }));
            row.append(name, category, price, location, action);
            rows.append(row);
        });
    }

    function renderRequests(requests, type, target) {
        const records = requests.filter(request => request.type === type);
        target.replaceChildren();
        if (!records.length) {
            target.textContent = `No ${type === 'import' ? 'import requests' : 'enquiries'} have been saved in this browser.`;
            return;
        }

        records.forEach(request => {
            const card = document.createElement('article');
            card.className = 'admin-record';
            const heading = document.createElement('div');
            heading.className = 'admin-record-heading';
            const name = document.createElement('h3');
            name.textContent = request.fields.name || request.fields.email || 'Website submission';
            const date = document.createElement('time');
            date.dateTime = request.createdAt;
            date.textContent = formatDate(request.createdAt);
            heading.append(name, date);

            const details = document.createElement('dl');
            Object.entries(request.fields).forEach(([key, value]) => {
                if (!value) return;
                const term = document.createElement('dt');
                term.textContent = key.replace(/([A-Z])/g, ' $1').replace(/^./, letter => letter.toUpperCase());
                const description = document.createElement('dd');
                description.textContent = value;
                details.append(term, description);
            });
            card.append(heading, details, createActionButton('Delete submission', 'admin-delete-button', () => {
                if (!window.confirm('Delete this submission from this browser?')) return;
                try {
                    render(dataStore.removeRequest(defaultVehicles, request.id));
                    setMessage('Submission removed from this browser.');
                } catch (error) {
                    showError(error);
                }
            }));
            target.append(card);
        });
    }

    function renderAnnouncements(announcements) {
        const target = document.getElementById('announcementList');
        target.replaceChildren();
        if (!announcements.length) {
            target.textContent = 'No announcements have been published.';
            return;
        }

        announcements.forEach(announcement => {
            const card = document.createElement('article');
            card.className = 'admin-record';
            const heading = document.createElement('div');
            heading.className = 'admin-record-heading';
            const title = document.createElement('h3');
            title.textContent = announcement.title;
            const date = document.createElement('time');
            date.dateTime = announcement.createdAt;
            date.textContent = formatDate(announcement.createdAt);
            heading.append(title, date);
            const message = document.createElement('p');
            message.textContent = announcement.message;
            card.append(heading, message, createActionButton('Edit', 'admin-edit-button', () => {
                const form = document.getElementById('announcementForm');
                form.dataset.editingId = announcement.id;
                form.elements.title.value = announcement.title;
                form.elements.message.value = announcement.message;
                document.getElementById('announcementFormTitle').textContent = 'Edit announcement';
                document.getElementById('announcementSubmitButton').textContent = 'Save changes';
                document.getElementById('cancelAnnouncementEdit').hidden = false;
                form.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }), createActionButton('Delete announcement', 'admin-delete-button', () => {
                if (!window.confirm('Delete this announcement from this browser?')) return;
                try {
                    render(dataStore.removeAnnouncement(defaultVehicles, announcement.id));
                    setMessage('Announcement deleted from this browser.');
                } catch (error) {
                    showError(error);
                }
            }));
            target.append(card);
        });
    }

    function renderCategories(categories) {
        const target = document.getElementById('categoryList');
        target.replaceChildren();
        if (!categories.length) {
            target.textContent = 'No homepage categories are configured.';
            return;
        }

        categories.forEach(category => {
            const card = document.createElement('article');
            card.className = 'admin-record admin-category-record';
            const image = document.createElement('img');
            image.className = 'admin-category-icon';
            image.src = category.image;
            image.alt = `${category.label} category`;
            const info = document.createElement('div');
            info.className = 'admin-category-info';
            const title = document.createElement('h3');
            title.textContent = category.label;
            const destination = document.createElement('p');
            destination.textContent = `Links to ${category.page}`;
            info.append(title, destination);
            const actions = document.createElement('div');
            actions.className = 'admin-category-actions';
            actions.append(
                createActionButton('Edit', 'admin-edit-button', () => openCategoryEditor(category)),
                createActionButton('Delete', 'admin-delete-button', () => {
                    if (!window.confirm(`Remove "${category.label}" from the homepage?`)) return;
                    try {
                        render(dataStore.removeCategory(defaultVehicles, category.id));
                        setMessage('Homepage category removed.');
                    } catch (error) {
                        showError(error);
                    }
                })
            );
            card.append(image, info, actions);
            target.append(card);
        });
    }

    function renderHomeTiles(tiles) {
        const target = document.getElementById('homeTileList');
        target.replaceChildren();
        if (!tiles.length) {
            target.textContent = 'No homepage tiles are configured.';
            return;
        }

        tiles.forEach(tile => {
            const card = document.createElement('article');
            card.className = 'admin-record admin-category-record';
            const image = document.createElement('img');
            image.className = 'admin-category-icon admin-home-tile-thumb';
            image.src = tile.image;
            image.alt = `${tile.label} tile preview`;
            const info = document.createElement('div');
            info.className = 'admin-category-info';
            const title = document.createElement('h3');
            title.textContent = tile.label;
            const destination = document.createElement('p');
            const imageCount = Array.isArray(tile.images) ? tile.images.length : tile.image ? 1 : 0;
            destination.textContent = `Links to ${tile.page} · ${imageCount} photo${imageCount === 1 ? '' : 's'}`;
            info.append(title, destination);
            const actions = document.createElement('div');
            actions.className = 'admin-category-actions';
            actions.append(
                createActionButton('Edit', 'admin-edit-button', () => openHomeTileEditor(tile)),
                createActionButton('Delete', 'admin-delete-button', () => {
                    if (!window.confirm(`Remove "${tile.label}" from the homepage?`)) return;
                    try {
                        render(dataStore.removeHomeTile(defaultVehicles, tile.id));
                        setMessage('Homepage tile removed.');
                    } catch (error) {
                        showError(error);
                    }
                })
            );
            card.append(image, info, actions);
            target.append(card);
        });
    }

    function render(state = getState()) {
        state = { ...state, vehicles: serverVehicles };
        document.getElementById('vehicleTotal').textContent = state.vehicles.length;
        document.getElementById('importTotal').textContent = state.requests.filter(request => request.type === 'import').length;
        document.getElementById('enquiryTotal').textContent = state.requests.filter(request => request.type === 'enquiry').length;
        document.getElementById('homeTileTotal').textContent = state.homeTiles.length;
        document.getElementById('categoryTotal').textContent = state.categories.length;
        document.getElementById('announcementTotal').textContent = state.announcements.length;
        renderVehicles(state);
        renderRequests(state.requests, 'import', document.getElementById('requestList'));
        renderRequests(state.requests, 'enquiry', document.getElementById('enquiryList'));
        renderHomeTiles(state.homeTiles);
        renderCategories(state.categories);
        renderAnnouncements(state.announcements);
        renderActivities(state.activity, document.getElementById('overviewActivity'));
        renderActivities(state.activity, document.getElementById('activityList'));
    }

    async function loadAdminVehicles() {
        serverVehicles = await vehiclesApi.getAdminAll();
        render();
    }

    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(item => item.classList.toggle('active', item === tab));
            document.querySelectorAll('.admin-panel').forEach(panel => {
                panel.hidden = panel.id !== `panel-${tab.dataset.panel}`;
            });
            document.querySelector('.admin-activity-full').hidden = tab.dataset.panel !== 'overview';
        });
    });

    function resetVehicleForm() {
        vehicleForm.reset();
        clearVehicleImagePreview();
        selectedVehicleImages = [];
        vehicleImageInput.required = true;
        vehicleForm.elements.listingType.value = 'arrived';
        syncVehicleListingFields();
        delete vehicleForm.dataset.editingId;
        vehicleFormTitle.textContent = 'New vehicle listing';
        vehicleSubmitButton.textContent = 'Save listing';
    }

    function setVehicleImagePreview(source) {
        const sources = Array.isArray(source) ? source : source ? [source] : [];
        vehicleImagePreview.replaceChildren();
        sources.forEach((imageSource, index) => {
            const image = document.createElement('img');
            image.src = imageSource;
            image.alt = `Vehicle photo ${index + 1}`;
            vehicleImagePreview.append(image);
        });
        vehicleImagePreview.hidden = sources.length === 0;
        vehicleImagePlaceholder.hidden = sources.length > 0;
        vehicleImageCount.textContent = sources.length ? `${sources.length} photo${sources.length === 1 ? '' : 's'} selected` : '';
        vehicleImageCount.hidden = sources.length === 0;
    }

    function openVehicleEditor(vehicle) {
        resetVehicleForm();
        vehicleForm.dataset.editingId = vehicle.id;
        vehicleFormTitle.textContent = `Edit vehicle: ${vehicle.title}`;
        vehicleSubmitButton.textContent = 'Save changes';
        vehicleForm.elements.category.value = vehicle.category === 'bajaj'
            ? `bajaj-${vehicle.bajajType || 'passenger'}`
            : 'car';
        vehicleForm.elements.listingType.value = vehicle.listingType || 'arrived';
        syncVehicleListingFields();
        vehicleForm.elements.make.value = (vehicle.make || '').replace(/\b\w/g, character => character.toUpperCase());
        vehicleForm.elements.model.value = vehicle.model || '';
        vehicleForm.elements.year.value = vehicle.year || '';
        vehicleForm.elements.condition.value = vehicle.condition || 'used';
        vehicleForm.elements.price.value = vehicle.price ?? '';
        vehicleForm.elements.location.value = vehicle.location || 'accra';
        vehicleForm.elements.mileage.value = vehicle.mileage ?? '';
        vehicleForm.elements.transmission.value = vehicle.transmission || '';
        vehicleForm.elements.fuelType.value = vehicle.fuelType || '';
        vehicleForm.elements.featured.checked = Boolean(vehicle.featured);
        vehicleForm.elements.description.value = vehicle.description || '';
        vehicleImageInput.required = false;
        setVehicleImagePreview(vehicle.images?.length ? vehicle.images : vehicle.image);
        vehicleForm.hidden = false;
        vehicleForm.elements.make.focus();
        vehicleForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function syncVehicleListingFields() {
        const isCar = vehicleForm.elements.category.value === 'car';
        const isImportListing = isCar && vehicleForm.elements.listingType.value === 'import';
        vehicleMakeField.hidden = !isCar;
        vehicleForm.elements.make.disabled = !isCar;
        vehicleForm.elements.make.required = isCar;
        if (isCar && vehicleForm.elements.make.value.toLowerCase() === 'bajaj') {
            vehicleForm.elements.make.value = '';
        } else if (!isCar) {
            vehicleForm.elements.make.value = 'Bajaj';
        }
        vehicleListingTypeField.hidden = !isCar;
        vehicleLocationField.hidden = isImportListing;
        vehicleForm.elements.location.required = !isImportListing;
        vehiclePriceLabel.textContent = isImportListing ? 'Indicative price (GH₵)' : 'Price (GH₵)';
    }

    vehicleForm.elements.category.addEventListener('change', syncVehicleListingFields);
    vehicleForm.elements.listingType.addEventListener('change', syncVehicleListingFields);

    document.getElementById('toggleVehicleForm').addEventListener('click', () => {
        const shouldOpen = vehicleForm.hidden;
        resetVehicleForm();
        vehicleForm.hidden = !shouldOpen;
        if (shouldOpen) vehicleForm.elements.make.focus();
    });
    document.getElementById('cancelVehicleForm').addEventListener('click', () => {
        resetVehicleForm();
        vehicleForm.hidden = true;
    });

    function clearVehicleImagePreview() {
        vehicleImagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
        vehicleImagePreviewUrls = [];
        setVehicleImagePreview([]);
    }

    vehicleImageInput.addEventListener('change', () => {
        const newFiles = Array.from(vehicleImageInput.files);
        const additions = newFiles.filter(file => !selectedVehicleImages.some(existing =>
            existing.name === file.name && existing.size === file.size && existing.lastModified === file.lastModified
        ));
        if (selectedVehicleImages.length + additions.length > 10) {
            setMessage('Choose no more than 10 photos for one vehicle listing.');
            vehicleImageInput.value = '';
            return;
        }
        selectedVehicleImages.push(...additions);
        clearVehicleImagePreview();
        vehicleImagePreviewUrls = selectedVehicleImages.map(file => URL.createObjectURL(file));
        setVehicleImagePreview(vehicleImagePreviewUrls);
        if (selectedVehicleImages.length) vehicleImageInput.required = false;
        vehicleImageInput.value = '';
    });

    vehicleForm.addEventListener('submit', async event => {
        event.preventDefault();
        const values = Object.fromEntries(new FormData(vehicleForm));
        const submitButton = vehicleForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        try {
            const state = getState();
            const categoryValue = values.category;
            const category = categoryValue === 'car' ? 'car' : 'bajaj';
            const make = category === 'bajaj' ? 'bajaj' : values.make.trim().toLowerCase();
            const model = values.model.trim();
            const year = Number(values.year);
            const editingId = vehicleForm.dataset.editingId;
            const existingVehicle = editingId
                ? state.vehicles.find(item => String(item.id) === editingId)
                : undefined;
            if (editingId && !existingVehicle) throw new Error('That vehicle could not be found.');
            const uploadedImages = selectedVehicleImages;
            if (uploadedImages.length > 10) throw new Error('Choose no more than 10 photos for one vehicle listing.');
            const images = uploadedImages.length
                ? await Promise.all(uploadedImages.map(file => optimizeUploadedImage(file, 'vehicle photo')))
                : existingVehicle?.images?.length
                    ? existingVehicle.images
                    : existingVehicle?.image ? [existingVehicle.image] : [];
            if (!images.length) throw new Error('Choose at least one photo for this vehicle.');
            const vehicle = {
                id: existingVehicle?.id ?? Math.max(0, ...state.vehicles.map(item => Number(item.id) || 0)) + 1,
                title: `${category === 'bajaj' ? 'Bajaj' : values.make.trim()} ${model} ${year}`,
                category,
                make,
                model,
                year,
                condition: values.condition,
                price: Number(values.price),
                location: values.location,
                mileage: values.mileage ? Number(values.mileage) : 0,
                bajajType: category === 'bajaj' ? categoryValue.slice('bajaj-'.length) : '',
                transmission: values.transmission,
                fuelType: values.fuelType,
                sellerType: 'dealership',
                sellerName: 'Zackconnect',
                phone: '',
                email: '',
                whatsapp: '',
                availability: 'available',
                listingType: category === 'car' ? values.listingType : 'arrived',
                description: values.description.trim(),
                images,
                datePosted: existingVehicle?.datePosted || new Date().toISOString().slice(0, 10),
                featured: Boolean(values.featured)
            };
            await vehiclesApi.saveAdmin(vehicle, editingId);
            await loadAdminVehicles();
            resetVehicleForm();
            clearVehicleImagePreview();
            vehicleForm.hidden = true;
            setMessage(editingId ? 'Vehicle updated in the shared inventory.' : 'Vehicle added to the shared inventory.');
        } catch (error) {
            showError(error);
        } finally {
            vehicleSubmitButton.disabled = false;
        }
        loadAdminVehicles().catch(showError);
    });

    document.getElementById('announcementForm').addEventListener('submit', event => {
        event.preventDefault();
        const form = event.currentTarget;
        const values = Object.fromEntries(new FormData(form));
        try {
            const announcement = {
                title: values.title.trim(),
                message: values.message.trim()
            };
            render(form.dataset.editingId
                ? dataStore.updateAnnouncement(defaultVehicles, form.dataset.editingId, announcement)
                : dataStore.addAnnouncement(defaultVehicles, announcement));
            form.reset();
            delete form.dataset.editingId;
            document.getElementById('announcementFormTitle').textContent = 'Publish an announcement';
            document.getElementById('announcementSubmitButton').textContent = 'Publish announcement';
            document.getElementById('cancelAnnouncementEdit').hidden = true;
            setMessage('Announcement saved on this browser’s homepage.');
        } catch (error) {
            showError(error);
        }
    });
    document.getElementById('cancelAnnouncementEdit').addEventListener('click', () => {
        const form = document.getElementById('announcementForm');
        form.reset();
        delete form.dataset.editingId;
        document.getElementById('announcementFormTitle').textContent = 'Publish an announcement';
        document.getElementById('announcementSubmitButton').textContent = 'Publish announcement';
        document.getElementById('cancelAnnouncementEdit').hidden = true;
    });

    const categoryForm = document.getElementById('categoryForm');
    const categoryFormTitle = document.getElementById('categoryFormTitle');
    const categorySubmitButton = document.getElementById('categorySubmitButton');
    const categoryImageInput = document.getElementById('categoryImageInput');
    const categoryImagePreview = document.getElementById('categoryImagePreview');
    const categoryImagePlaceholder = document.getElementById('categoryImagePlaceholder');
    let categoryImagePreviewUrl = '';

    function setCategoryImagePreview(source) {
        categoryImagePreview.src = source;
        categoryImagePreview.hidden = false;
        categoryImagePlaceholder.hidden = true;
    }

    function clearCategoryImagePreview() {
        if (categoryImagePreviewUrl) URL.revokeObjectURL(categoryImagePreviewUrl);
        categoryImagePreviewUrl = '';
        categoryImagePreview.removeAttribute('src');
        categoryImagePreview.hidden = true;
        categoryImagePlaceholder.hidden = false;
    }

    function optimizeUploadedImage(file, imageType) {
        return new Promise((resolve, reject) => {
            if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
                reject(new Error(`Choose a JPG, PNG or WebP ${imageType}.`));
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                reject(new Error(`Choose a ${imageType} smaller than 5 MB.`));
                return;
            }

            const sourceUrl = URL.createObjectURL(file);
            const image = new Image();
            image.onload = () => {
                URL.revokeObjectURL(sourceUrl);
                try {
                    if (image.naturalWidth * image.naturalHeight > 25000000) {
                        throw new Error(`This ${imageType} is too large to process. Choose a smaller image.`);
                    }
                    const scale = Math.min(1, 1024 / Math.max(image.naturalWidth, image.naturalHeight));
                    const canvas = document.createElement('canvas');
                    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
                    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
                    const context = canvas.getContext('2d');
                    if (!context) throw new Error('Could not prepare this image in the browser.');
                    context.fillStyle = '#ffffff';
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    context.drawImage(image, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/jpeg', 0.9));
                } catch (error) {
                    reject(error);
                }
            };
            image.onerror = () => {
                URL.revokeObjectURL(sourceUrl);
                reject(new Error(`Could not read this ${imageType}. Choose a valid JPG, PNG or WebP image.`));
            };
            image.src = sourceUrl;
        });
    }

    categoryImageInput.addEventListener('change', () => {
        const file = categoryImageInput.files[0];
        if (!file) return;
        if (categoryImagePreviewUrl) URL.revokeObjectURL(categoryImagePreviewUrl);
        categoryImagePreviewUrl = URL.createObjectURL(file);
        setCategoryImagePreview(categoryImagePreviewUrl);
    });

    function openCategoryEditor(category) {
        categoryForm.reset();
        clearCategoryImagePreview();
        categoryForm.dataset.editingId = category.id;
        categoryFormTitle.textContent = `Edit homepage category: ${category.label}`;
        categorySubmitButton.textContent = 'Save changes';
        categoryForm.elements.label.value = category.label;
        categoryImageInput.required = false;
        setCategoryImagePreview(category.image);
        categoryForm.elements.page.value = category.page;

        const filters = Array.isArray(category.filters) ? category.filters : [];
        const editableFilters = filters.filter(filter =>
            ['category', 'make', 'model', 'condition', 'bajajType'].includes(filter.field)
        );
        [0, 1].forEach(index => {
            const filter = editableFilters[index];
            categoryForm.elements[index === 0 ? 'filterField' : 'filterField2'].value = filter?.field || '';
            categoryForm.elements[index === 0 ? 'filterValue' : 'filterValue2'].value = filter?.value || '';
        });
        categoryForm.hidden = false;
        categoryForm.elements.label.focus();
        categoryForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function closeCategoryForm() {
        categoryForm.reset();
        clearCategoryImagePreview();
        categoryImageInput.required = true;
        delete categoryForm.dataset.editingId;
        categoryFormTitle.textContent = 'New homepage category';
        categorySubmitButton.textContent = 'Add category';
        categoryForm.hidden = true;
    }

    document.getElementById('toggleCategoryForm').addEventListener('click', () => {
        closeCategoryForm();
        categoryForm.hidden = !categoryForm.hidden;
        if (!categoryForm.hidden) categoryForm.elements.label.focus();
    });
    document.getElementById('cancelCategoryForm').addEventListener('click', () => {
        closeCategoryForm();
    });
    categoryForm.addEventListener('submit', async event => {
        event.preventDefault();
        const values = Object.fromEntries(new FormData(categoryForm));
        try {
            const permittedPages = new Set(['cars.html', 'tricycles.html', 'import.html', 'contact.html']);
            if (!permittedPages.has(values.page)) throw new Error('Choose a valid page for this category.');
            const filters = [];
            const query = {};
            const enteredFilters = [
                { field: values.filterField, value: values.filterValue },
                { field: values.filterField2, value: values.filterValue2 }
            ];
            enteredFilters.forEach(filter => {
                if (!filter.field && !filter.value.trim()) return;
                if (!filter.field || !filter.value.trim()) {
                    throw new Error('Choose a field and enter its value for each inventory filter.');
                }
                const value = filter.value.trim().toLowerCase();
                filters.push({ field: filter.field, value });
                if (filter.field !== 'category') {
                    const queryField = filter.field === 'bajajType' ? 'type' : filter.field;
                    query[queryField] = value;
                }
            });
            if (filters.length > 2) {
                throw new Error('A homepage category can have up to two inventory filters.');
            }

            const category = {
                label: values.label.trim(),
                image: values.picture.size
                    ? await optimizeUploadedImage(values.picture, 'category picture')
                    : getState().categories.find(item => item.id === categoryForm.dataset.editingId)?.image,
                page: values.page,
                filters,
                query
            };
            if (!category.image) throw new Error('Choose a picture for this category.');
            const editingId = categoryForm.dataset.editingId;
            render(editingId
                ? dataStore.updateCategory(defaultVehicles, editingId, category)
                : dataStore.addCategory(defaultVehicles, category));
            closeCategoryForm();
            setMessage(editingId ? 'Homepage category updated.' : 'Homepage category added.');
        } catch (error) {
            showError(error);
        }
    });

    const homeTileForm = document.getElementById('homeTileForm');
    const homeTileFormTitle = document.getElementById('homeTileFormTitle');
    const homeTileSubmitButton = document.getElementById('homeTileSubmitButton');
    const homeTileImageInput = document.getElementById('homeTileImageInput');
    const homeTileImagePreview = document.getElementById('homeTileImagePreview');
    const homeTileImagePlaceholder = document.getElementById('homeTileImagePlaceholder');
    const homeTileImageCount = document.getElementById('homeTileImageCount');
    let homeTileImagePreviewUrls = [];
    let selectedHomeTileImages = [];

    function setHomeTileImagePreview(sources) {
        homeTileImagePreview.replaceChildren();
        sources.forEach((source, index) => {
            const image = document.createElement('img');
            image.src = source;
            image.alt = `Homepage tile photo ${index + 1}`;
            homeTileImagePreview.append(image);
        });
        homeTileImagePreview.hidden = sources.length === 0;
        homeTileImagePlaceholder.hidden = sources.length > 0;
        homeTileImageCount.textContent = `${sources.length} photo${sources.length === 1 ? '' : 's'} selected`;
        homeTileImageCount.hidden = sources.length === 0;
    }

    function clearHomeTileImagePreview() {
        homeTileImagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
        homeTileImagePreviewUrls = [];
        homeTileImagePreview.replaceChildren();
        homeTileImagePreview.hidden = true;
        homeTileImagePlaceholder.hidden = false;
        homeTileImageCount.textContent = '';
        homeTileImageCount.hidden = true;
    }

    function resetHomeTileForm() {
        homeTileForm.reset();
        clearHomeTileImagePreview();
        selectedHomeTileImages = [];
        homeTileImageInput.required = true;
        delete homeTileForm.dataset.editingId;
        homeTileFormTitle.textContent = 'New homepage tile';
        homeTileSubmitButton.textContent = 'Add tile';
        homeTileForm.hidden = true;
    }

    function openHomeTileEditor(tile) {
        resetHomeTileForm();
        homeTileForm.dataset.editingId = tile.id;
        homeTileFormTitle.textContent = `Edit homepage tile: ${tile.label}`;
        homeTileSubmitButton.textContent = 'Save changes';
        homeTileForm.elements.label.value = tile.label;
        homeTileForm.elements.page.value = tile.page;
        homeTileForm.elements.credit.value = tile.credit || '';
        homeTileForm.elements.creditUrl.value = tile.creditUrl || '';
        homeTileImageInput.required = false;
        const images = Array.isArray(tile.images) && tile.images.length ? tile.images : [tile.image];
        setHomeTileImagePreview(images.filter(Boolean));
        homeTileForm.hidden = false;
        homeTileForm.elements.label.focus();
        homeTileForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    homeTileImageInput.addEventListener('change', () => {
        const newFiles = Array.from(homeTileImageInput.files);
        const additions = newFiles.filter(file => !selectedHomeTileImages.some(existing =>
            existing.name === file.name && existing.size === file.size && existing.lastModified === file.lastModified
        ));
        if (selectedHomeTileImages.length + additions.length > 10) {
            setMessage('Choose no more than 10 photos for one homepage tile.');
            homeTileImageInput.value = '';
            return;
        }
        selectedHomeTileImages.push(...additions);
        homeTileImagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
        homeTileImagePreviewUrls = selectedHomeTileImages.map(file => URL.createObjectURL(file));
        setHomeTileImagePreview(homeTileImagePreviewUrls);
        if (selectedHomeTileImages.length) homeTileImageInput.required = false;
        homeTileImageInput.value = '';
    });

    document.getElementById('toggleHomeTileForm').addEventListener('click', () => {
        const shouldOpen = homeTileForm.hidden;
        resetHomeTileForm();
        homeTileForm.hidden = !shouldOpen;
        if (shouldOpen) homeTileForm.elements.label.focus();
    });
    document.getElementById('cancelHomeTileForm').addEventListener('click', resetHomeTileForm);
    homeTileForm.addEventListener('submit', async event => {
        event.preventDefault();
        homeTileSubmitButton.disabled = true;
        const values = Object.fromEntries(new FormData(homeTileForm));
        try {
            if (!['cars.html', 'tricycles.html'].includes(values.page)) {
                throw new Error('Choose either the Cars or Tricycles page as the destination.');
            }
            const credit = values.credit.trim();
            const creditUrl = values.creditUrl.trim();
            if (creditUrl) {
                const parsedCreditUrl = new URL(creditUrl);
                if (!['http:', 'https:'].includes(parsedCreditUrl.protocol)) {
                    throw new Error('The attribution link must use http or https.');
                }
                if (!credit) throw new Error('Enter the photo attribution when adding an attribution link.');
            }

            const editingId = homeTileForm.dataset.editingId;
            const existingTile = editingId
                ? getState().homeTiles.find(tile => tile.id === editingId)
                : undefined;
            if (editingId && !existingTile) throw new Error('That homepage tile could not be found.');
            const uploadedImages = selectedHomeTileImages;
            if (uploadedImages.length === 1) {
                throw new Error('Choose at least 2 photos for one homepage tile.');
            }
            if (uploadedImages.length > 10) throw new Error('Choose no more than 10 photos for one homepage tile.');
            const images = uploadedImages.length
                ? await Promise.all(uploadedImages.map(file => optimizeUploadedImage(file, 'homepage tile photo')))
                : Array.isArray(existingTile?.images) && existingTile.images.length
                    ? existingTile.images
                    : existingTile?.image ? [existingTile.image] : [];
            if (!images.length) throw new Error('Choose at least one photo for this homepage tile.');
            if (!existingTile && images.length < 2) {
                throw new Error('Choose at least 2 photos for one homepage tile.');
            }

            const tile = {
                label: values.label.trim(),
                image: images[0],
                images,
                page: values.page,
                credit,
                creditUrl
            };
            render(editingId
                ? dataStore.updateHomeTile(defaultVehicles, editingId, tile)
                : dataStore.addHomeTile(defaultVehicles, tile));
            resetHomeTileForm();
            setMessage(editingId ? 'Homepage tile updated.' : 'Homepage tile added.');
        } catch (error) {
            showError(error);
        } finally {
            homeTileSubmitButton.disabled = false;
        }
    });

    const siteContent = window.ZackconnectSiteContent;
    const siteContentForm = document.getElementById('siteContentForm');
    const siteContentPage = document.getElementById('siteContentPage');
    const siteContentFields = document.getElementById('siteContentFields');
    const siteContentSections = document.getElementById('siteContentSections');
    const siteContentImages = document.getElementById('siteContentImages');

    siteContent.pages.forEach(page => {
        const option = document.createElement('option');
        option.value = page.id;
        option.textContent = page.label;
        siteContentPage.append(option);
    });

    function renderSiteContentForm() {
        const page = siteContentPage.value;
        const state = getState();
        const pageFields = siteContent.fields.filter(field => field.page === page);
        const pageSections = siteContent.sections.filter(section => section.page === page);
        const pageImages = siteContent.images.filter(image => image.page === page);
        siteContentFields.replaceChildren();
        siteContentSections.replaceChildren();
        siteContentImages.replaceChildren();

        pageFields.forEach(field => {
            const label = document.createElement('label');
            label.textContent = field.label;
            const input = document.createElement(field.type === 'textarea' ? 'textarea' : 'input');
            if (field.type !== 'textarea') input.type = 'text';
            input.maxLength = field.type === 'textarea' ? 1200 : 160;
            input.value = state.siteContent.text[field.key] ?? field.default;
            input.dataset.contentKey = field.key;
            if (field.type === 'textarea') input.rows = 3;
            label.append(input);
            siteContentFields.append(label);
        });

        pageSections.forEach(section => {
            const label = document.createElement('label');
            label.className = 'admin-checkbox';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = !state.siteContent.hiddenSections.includes(section.key);
            checkbox.dataset.sectionKey = section.key;
            const text = document.createTextNode(section.label);
            label.append(checkbox, text);
            siteContentSections.append(label);
        });

        pageImages.forEach(image => {
            const label = document.createElement('label');
            label.className = 'admin-form-wide';
            label.textContent = image.label;
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/jpeg,image/png,image/webp';
            input.dataset.siteImageFile = image.key;
            const note = document.createElement('span');
            note.className = 'admin-field-note';
            note.textContent = 'Optional. Choose a JPG, PNG or WebP image up to 5 MB. It will be optimized and saved in this browser.';
            label.append(input, note);
            siteContentImages.append(label);

            const savedImage = state.siteContent.images[image.key];
            if (savedImage) {
                const resetLabel = document.createElement('label');
                resetLabel.className = 'admin-checkbox admin-form-wide';
                const reset = document.createElement('input');
                reset.type = 'checkbox';
                reset.dataset.siteImageReset = image.key;
                resetLabel.append(reset, document.createTextNode('Restore the original banner image'));
                siteContentImages.append(resetLabel);
            }
        });
    }

    siteContentPage.addEventListener('change', renderSiteContentForm);
    siteContentForm.addEventListener('submit', async event => {
        event.preventDefault();
        const submitButton = document.getElementById('siteContentSubmit');
        submitButton.disabled = true;
        try {
            const page = siteContentPage.value;
            const pageSections = siteContent.sections.filter(section => section.page === page);
            const text = Object.fromEntries(Array.from(
                siteContentFields.querySelectorAll('[data-content-key]'),
                input => [input.dataset.contentKey, input.value.trim()]
            ));
            const hiddenSections = Array.from(
                siteContentSections.querySelectorAll('[data-section-key]:not(:checked)'),
                input => input.dataset.sectionKey
            );
            const images = {};
            for (const input of siteContentImages.querySelectorAll('[data-site-image-file]')) {
                const file = input.files[0];
                if (file) images[input.dataset.siteImageFile] = await optimizeUploadedImage(file, 'banner image');
            }
            siteContentImages.querySelectorAll('[data-site-image-reset]:checked').forEach(input => {
                images[input.dataset.siteImageReset] = '';
            });
            render(dataStore.updateSiteContent(defaultVehicles, {
                text,
                images,
                hiddenSections,
                sectionKeys: pageSections.map(section => section.key)
            }, page));
            renderSiteContentForm();
            setMessage(`${siteContent.pages.find(item => item.id === page).label} content saved.`);
        } catch (error) {
            showError(error);
        } finally {
            submitButton.disabled = false;
        }
    });
    document.getElementById('siteContentReset').addEventListener('click', () => {
        const page = siteContentPage.value;
        if (!window.confirm(`Restore the original copy, banner image, and visible sections for ${siteContent.pages.find(item => item.id === page).label}?`)) return;
        try {
            const pageFields = siteContent.fields.filter(field => field.page === page);
            const pageImages = siteContent.images.filter(image => image.page === page);
            const pageSections = siteContent.sections.filter(section => section.page === page);
            render(dataStore.resetSiteContent(
                defaultVehicles,
                page,
                pageFields.map(field => field.key),
                pageImages.map(image => image.key),
                pageSections.map(section => section.key)
            ));
            renderSiteContentForm();
            setMessage(`${siteContent.pages.find(item => item.id === page).label} restored to its original content.`);
        } catch (error) {
            showError(error);
        }
    });
    renderSiteContentForm();

    window.addEventListener('storage', event => {
        if (event.key !== dataStore.storageKey) return;
        try {
            render();
            setMessage('Dashboard updated with changes from another Zackconnect tab in this browser.');
        } catch (error) {
            showError(error);
        }
    });

    try {
        render();
    } catch (error) {
        showError(error);
    }
    loadAdminVehicles().catch(showError);
    document.getElementById('adminLogout').addEventListener('click', () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
        window.location.href = 'login.html';
    });
})();
