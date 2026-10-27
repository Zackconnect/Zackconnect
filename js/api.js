/* ============================================
   Zackconnect - API Integration Layer
   ============================================ */

const API_BASE_URL = 'https://zackconnectautobackend.onrender.com/api';
const publicVehiclesCacheKey = 'zackconnect_public_vehicles';
const publicContentCacheKey = 'zackconnect_public_site_content';
const publicCacheTtl = 60000;

function readPublicCache(key, allowExpired = false) {
    try {
        const cached = sessionStorage.getItem(key);
        if (!cached) return null;
        const entry = JSON.parse(cached);
        return allowExpired || entry.expiresAt > Date.now() ? entry.value : null;
    } catch (error) {
        console.warn('Could not read cached public data:', error);
        return null;
    }
}

function writePublicCache(key, value) {
    try {
        sessionStorage.setItem(key, JSON.stringify({
            value,
            expiresAt: Date.now() + publicCacheTtl
        }));
    } catch (error) {
        console.warn('Could not cache public data:', error);
    }
}

function clearPublicCache(key) {
    try {
        sessionStorage.removeItem(key);
    } catch (error) {
        console.warn('Could not clear cached public data:', error);
    }
}

// API Helper Functions
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        if (!response.ok) {
            const body = await response.json().catch(() => null);
            throw new Error(body?.message || `API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
}

function adminHeaders() {
    const token = localStorage.getItem('authToken');
    return { Authorization: `Bearer ${token}` };
}

// Vehicles API
const VehiclesAPI = {
    async getAll() {
        const [cars, tricycles] = await Promise.all([
            apiRequest('/cars'),
            apiRequest('/tricycles')
        ]);

        // Transform to match frontend data structure
        const vehicles = [
            ...cars.map(car => this.transformCar(car)),
            ...tricycles.map(tricycle => this.transformTricycle(tricycle))
        ];

        writePublicCache(publicVehiclesCacheKey, vehicles);
        return vehicles;
    },

    getCachedAll() {
        const vehicles = readPublicCache(publicVehiclesCacheKey, true);
        return Array.isArray(vehicles) ? vehicles : null;
    },

    async getById(id) {
        // Try cars first, then tricycles
        try {
            const car = await apiRequest(`/cars/${id}`);
            return this.transformCar(car);
        } catch {
            try {
                const tricycle = await apiRequest(`/tricycles/${id}`);
                return this.transformTricycle(tricycle);
            } catch {
                throw new Error('Vehicle not found');
            }
        }
    },

    async getAdminAll() {
        const token = localStorage.getItem('authToken');
        const headers = { Authorization: `Bearer ${token}` };
        const [cars, tricycles] = await Promise.all([
            apiRequest('/cars/admin', { headers }),
            apiRequest('/tricycles/admin', { headers })
        ]);
        return [
            ...cars.map(car => this.transformCar(car)),
            ...tricycles.map(tricycle => this.transformTricycle(tricycle))
        ];
    },

    async saveAdmin(vehicle, id) {
        const token = localStorage.getItem('authToken');
        const isCar = vehicle.category === 'car';
        const endpoint = isCar ? '/cars' : '/tricycles';
        const body = {
            model: vehicle.model,
            year: vehicle.year,
            price: vehicle.price,
            mileage: vehicle.mileage,
            fuel_type: vehicle.fuelType,
            color: vehicle.color || null,
            description: vehicle.description,
            images: vehicle.images,
            vehicle_condition: vehicle.condition,
            location: vehicle.location,
            featured: vehicle.featured,
            status: vehicle.availability === 'sold' ? 'sold' : 'available'
        };

        if (isCar) {
            Object.assign(body, {
                make: vehicle.make,
                transmission: vehicle.transmission,
                listing_type: vehicle.listingType,
                source_country: vehicle.listingType === 'import' ? vehicle.sourceCountry : null
            });
        } else {
            Object.assign(body, {
                brand: vehicle.make,
                tricycle_type: vehicle.bajajType
            });
        }

        const method = id ? 'PUT' : 'POST';
        const path = id ? `${endpoint}/${encodeURIComponent(id)}` : endpoint;
        const result = await apiRequest(path, {
            method,
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(body)
        });
        clearPublicCache(publicVehiclesCacheKey);
        return result;
    },

    async deleteAdmin(vehicle) {
        const token = localStorage.getItem('authToken');
        const endpoint = vehicle.category === 'car' ? '/cars' : '/tricycles';
        const result = await apiRequest(`${endpoint}/${encodeURIComponent(vehicle.id)}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        clearPublicCache(publicVehiclesCacheKey);
        return result;
    },

    transformCar(car) {
        return {
            id: car.id,
            title: `${car.make} ${car.model} ${car.year}`,
            category: 'car',
            make: car.make,
            model: car.model,
            year: car.year,
            condition: car.vehicle_condition || 'used',
            price: parseFloat(car.price),
            location: car.location || 'koforidua',
            mileage: car.mileage,
            transmission: car.transmission,
            fuelType: car.fuel_type,
            color: car.color,
            sellerType: 'dealership',
            sellerName: 'Zackconnect Autos',
            phone: '+233 24 373 9221',
            email: 'info@zackconnect.com',
            whatsapp: '+233 24 373 9221',
            description: car.description,
            images: Array.isArray(car.images) && car.images.length
                ? car.images
                : car.image_url ? [car.image_url] : [],
            datePosted: car.created_at,
            featured: Boolean(car.featured),
            availability: car.status === 'available' ? 'available' : 'sold',
            listingType: car.listing_type || 'arrived',
            sourceCountry: car.source_country || ''
        };
    },

    transformTricycle(tricycle) {
        return {
            id: tricycle.id,
            title: `${tricycle.brand} ${tricycle.model} ${tricycle.year}`,
            category: 'bajaj',
            make: tricycle.brand,
            model: tricycle.model,
            year: tricycle.year,
            condition: tricycle.vehicle_condition || 'new',
            price: parseFloat(tricycle.price),
            location: tricycle.location || 'koforidua',
            mileage: tricycle.mileage,
            bajajType: tricycle.tricycle_type || 'passenger',
            sellerType: 'dealership',
            sellerName: 'Zackconnect Autos',
            phone: '+233 24 373 9221',
            email: 'info@zackconnect.com',
            whatsapp: '+233 24 373 9221',
            availability: tricycle.status === 'available' ? 'available' : 'sold',
            description: tricycle.description,
            images: Array.isArray(tricycle.images) && tricycle.images.length
                ? tricycle.images
                : tricycle.image_url ? [tricycle.image_url] : [],
            datePosted: tricycle.created_at,
            featured: Boolean(tricycle.featured),
            availability: tricycle.status === 'available' ? 'available' : 'sold'
        };
    }
};

// Contact API
const ContactAPI = {
    async submit(formData) {
        return await apiRequest('/contact', {
            method: 'POST',
            body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                phone: formData.phone || '',
                enquiryType: formData.enquiryType,
                subject: formData.subject,
                message: formData.message,
                preferredMethod: formData.preferredMethod
            })
        });
    },

    async submitImport(fields) {
        return apiRequest('/contact', {
            method: 'POST',
            body: JSON.stringify({
                name: fields.name,
                email: fields.email,
                phone: fields.phone || '',
                enquiryType: 'import',
                subject: 'Vehicle import request',
                message: 'Website import request',
                preferredMethod: fields.preferredMethod || '',
                fields
            })
        });
    },

    async getAdminAll() {
        const rows = await apiRequest('/contact', { headers: adminHeaders() });
        return rows.map(row => {
            const isImport = row.enquiry_type === 'import';
            let fields;
            if (isImport) {
                try {
                    fields = JSON.parse(row.message);
                } catch (error) {
                    console.error(`Could not decode import request ${row.id}:`, error);
                    fields = { name: row.name, email: row.email, phone: row.phone, message: row.message };
                }
            } else {
                fields = {
                    name: row.name,
                    email: row.email,
                    phone: row.phone,
                    enquiryType: row.enquiry_type,
                    subject: row.subject,
                    message: row.message,
                    preferredMethod: row.preferred_method
                };
            }
            return {
                id: String(row.id),
                type: isImport ? 'import' : 'enquiry',
                fields,
                createdAt: row.created_at,
                source: 'database'
            };
        });
    },

    async deleteAdmin(id) {
        return apiRequest(`/contact/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: adminHeaders()
        });
    }
};

let publicContentCache = null;
let publicContentRequest = null;

const SiteContentAPI = {
    getCachedPublic() {
        return readPublicCache(publicContentCacheKey, true);
    },

    async getPublic() {
        if (publicContentCache && publicContentCache.expiresAt > Date.now()) {
            return publicContentCache.value;
        }
        const cached = readPublicCache(publicContentCacheKey);
        if (cached) {
            publicContentCache = { value: cached, expiresAt: Date.now() + publicCacheTtl };
            return cached;
        }
        if (!publicContentRequest) {
            publicContentRequest = apiRequest('/site-content')
                .then(value => {
                    publicContentCache = { value, expiresAt: Date.now() + publicCacheTtl };
                    writePublicCache(publicContentCacheKey, value);
                    return value;
                })
                .finally(() => {
                    publicContentRequest = null;
                });
        }
        return publicContentRequest;
    },

    async getAdmin() {
        return apiRequest('/site-content/admin', { headers: adminHeaders() });
    },

    async saveAdmin(content) {
        const result = await apiRequest('/site-content/admin', {
            method: 'PUT',
            headers: adminHeaders(),
            body: JSON.stringify({ content })
        });
        publicContentCache = null;
        clearPublicCache(publicContentCacheKey);
        return result;
    },

    async uploadImage(image) {
        const result = await apiRequest('/site-content/admin/image', {
            method: 'POST',
            headers: adminHeaders(),
            body: JSON.stringify({ image })
        });
        return result.image;
    }
};

// Auth API
const AuthAPI = {
    async login(email, password) {
        return await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },

    async signup(userData) {
        return await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    async requestPasswordReset(email) {
        return await apiRequest('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    },

    async resetPassword(token, password) {
        return await apiRequest('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ token, password })
        });
    }
};

// Export to window
window.ZackconnectAPI = {
    VehiclesAPI,
    ContactAPI,
    SiteContentAPI,
    AuthAPI
};
