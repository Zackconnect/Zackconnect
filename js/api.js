/* ============================================
   Zackconnect - API Integration Layer
   ============================================ */

const API_BASE_URL = 'https://zackconnectautobackend.onrender.com/api';

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
        // Fetch both cars and tricycles
        const [cars, tricycles] = await Promise.all([
            apiRequest('/cars'),
            apiRequest('/tricycles')
        ]);

        // Transform to match frontend data structure
        const vehicles = [
            ...cars.map(car => this.transformCar(car)),
            ...tricycles.map(tricycle => this.transformTricycle(tricycle))
        ];

        return vehicles;
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
                listing_type: vehicle.listingType
            });
        } else {
            Object.assign(body, {
                brand: vehicle.make,
                tricycle_type: vehicle.bajajType
            });
        }

        const method = id ? 'PUT' : 'POST';
        const path = id ? `${endpoint}/${encodeURIComponent(id)}` : endpoint;
        return apiRequest(path, {
            method,
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(body)
        });
    },

    async deleteAdmin(vehicle) {
        const token = localStorage.getItem('authToken');
        const endpoint = vehicle.category === 'car' ? '/cars' : '/tricycles';
        return apiRequest(`${endpoint}/${encodeURIComponent(vehicle.id)}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
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
            listingType: car.listing_type || 'arrived'
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

const SiteContentAPI = {
    async getPublic() {
        return apiRequest('/site-content');
    },

    async getAdmin() {
        return apiRequest('/site-content/admin', { headers: adminHeaders() });
    },

    async saveAdmin(content) {
        return apiRequest('/site-content/admin', {
            method: 'PUT',
            headers: adminHeaders(),
            body: JSON.stringify({ content })
        });
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
    }
};

// Export to window
window.ZackconnectAPI = {
    VehiclesAPI,
    ContactAPI,
    SiteContentAPI,
    AuthAPI
};
