/* ============================================
   Zackconnect - API Integration Layer
   ============================================ */

const API_BASE_URL = 'https://zackconnectautobackend.onrender.com/api';

// API Helper Functions
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
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
            ...cars.map(car => ({
                id: car.id,
                title: `${car.make} ${car.model} ${car.year}`,
                category: 'car',
                make: car.make,
                model: car.model,
                year: car.year,
                condition: 'used',
                price: parseFloat(car.price),
                location: 'koforidua',
                mileage: car.mileage,
                transmission: car.transmission,
                fuelType: car.fuel_type,
                color: car.color,
                sellerType: 'dealership',
                sellerName: 'Zackconnect Autos',
                phone: '+233 24 373 9221',
                email: 'info@zackconnect.com',
                whatsapp: '+233 24 373 9221',
                availability: car.status === 'available' ? 'available' : 'sold',
                description: car.description,
                images: car.image_url ? [car.image_url] : [],
                datePosted: car.created_at,
                featured: false
            })),
            ...tricycles.map(tricycle => ({
                id: tricycle.id,
                title: `${tricycle.brand} ${tricycle.model} ${tricycle.year}`,
                category: 'bajaj',
                make: tricycle.brand,
                model: tricycle.model,
                year: tricycle.year,
                condition: 'new',
                price: parseFloat(tricycle.price),
                location: 'koforidua',
                mileage: tricycle.mileage,
                bajajType: 'passenger',
                sellerType: 'dealership',
                sellerName: 'Zackconnect Autos',
                phone: '+233 24 373 9221',
                email: 'info@zackconnect.com',
                whatsapp: '+233 24 373 9221',
                availability: tricycle.status === 'available' ? 'available' : 'sold',
                description: tricycle.description,
                images: tricycle.image_url ? [tricycle.image_url] : [],
                datePosted: tricycle.created_at,
                featured: false
            }))
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

    transformCar(car) {
        return {
            id: car.id,
            title: `${car.make} ${car.model} ${car.year}`,
            category: 'car',
            make: car.make,
            model: car.model,
            year: car.year,
            condition: 'used',
            price: parseFloat(car.price),
            location: 'koforidua',
            mileage: car.mileage,
            transmission: car.transmission,
            fuelType: car.fuel_type,
            color: car.color,
            sellerType: 'dealership',
            sellerName: 'Zackconnect Autos',
            phone: '+233 24 373 9221',
            email: 'info@zackconnect.com',
            whatsapp: '+233 24 373 9221',
            availability: car.status === 'available' ? 'available' : 'sold',
            description: car.description,
            images: car.image_url ? [car.image_url] : [],
            datePosted: car.created_at,
            featured: false
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
            condition: 'new',
            price: parseFloat(tricycle.price),
            location: 'koforidua',
            mileage: tricycle.mileage,
            bajajType: 'passenger',
            sellerType: 'dealership',
            sellerName: 'Zackconnect Autos',
            phone: '+233 24 373 9221',
            email: 'info@zackconnect.com',
            whatsapp: '+233 24 373 9221',
            availability: tricycle.status === 'available' ? 'available' : 'sold',
            description: tricycle.description,
            images: tricycle.image_url ? [tricycle.image_url] : [],
            datePosted: tricycle.created_at,
            featured: false
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
        return await apiRequest('/auth/signup', {
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
