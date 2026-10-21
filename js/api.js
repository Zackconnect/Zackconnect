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
    AuthAPI
};
