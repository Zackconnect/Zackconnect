# Zackconnect - Vehicle Dealership & Import Platform

A modern, professional vehicle import and Bajaj tricycle website for Ghana, built with HTML5, CSS3, and vanilla JavaScript. Zackconnect sources cars from China, the USA, and Canada; the homepage and Cars page show car import options with detailed specifications and indicative prices, while arrived vehicles can be listed separately.

## Features

- **Car Import Catalog**: The homepage and Cars page show available import options with vehicle specifications, indicative prices, and quote-request links; availability and final landed prices must be confirmed
- **Bajaj Tricycles**: Browse local tricycle listings and filter by type, condition, and price
- **Homepage Vehicle Tiles**: Fixed car and tricycle tiles show at least two photos rotating independently inside each tile; manage tile labels, photos, destinations, and attribution in the admin dashboard
- **Car Browsing**: Use a marketplace-style cars page with a filter sidebar, horizontally scrolling model-and-year shortcuts, and side-by-side car listing cards
- **Import Services**: Request vehicle imports from China, Canada, and the USA with transparent pricing
- **Vehicle Details**: Detailed vehicle information pages with specifications and contact options
- **Company Information**: Learn about Zackconnect's mission, vision, and services
- **Contact Forms**: Enquiry forms for vehicles and import requests with WhatsApp integration
- **Account Recovery**: Sign-in includes a forgot-password flow with emailed, one-time reset links
- **Signup and Login Frontend**: Homepage links lead to signup and login screens, ready for backend authentication
- **Admin Dashboard Prototype**: Manage vehicle listings and homepage tiles/categories/announcements; edit page copy, banner images, and section visibility; review local enquiries and import requests
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional design with red, black, and white color palette

## Project Structure

```
Zackconnect/
├── index.html              # Homepage with category links and vehicle page cards
├── cars.html               # Cars inventory page with filters
├── tricycles.html          # Bajaj tricycles inventory page
├── vehicle-details.html    # Individual vehicle details page
├── signup.html             # Account registration frontend
├── login.html              # Account login frontend
├── forgot-password.html    # Request a password reset email
├── reset-password.html     # Set a new password from a reset link
├── admin.html              # Browser-only admin dashboard prototype
├── import.html             # Import service request page
├── about.html              # Company information page
├── contact.html            # Contact and enquiry page
├── css/
│   └── style.css           # All styling
├── js/
│   ├── data-store.js       # Browser-local prototype data store
│   ├── admin.js            # Admin dashboard actions and rendering
│   ├── auth.js             # Signup/login screens and pre-auth navigation
│   ├── site-content.js     # Browser-local page copy, banner/logo images, and section visibility
│   └── script.js           # Vehicle listings and page functionality
├── images/                 # Vehicle photos and transparent Zackconnect logo
└── README.md              # This file
```

## How to Run Locally

### Option 1: Using VS Code Live Server (Recommended)

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"
4. The website will open in your default browser

### Option 2: Using Python

If you have Python installed:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then open `http://localhost:8000` in your browser.

### Option 3: Using Node.js

If you have Node.js installed:

```bash
# Install http-server globally
npm install -g http-server

# Run the server
http-server
```

### Option 4: Direct File Access

Simply double-click `index.html` to open it in your browser. Note that some features may not work perfectly due to browser security restrictions.

## Technology Stack

- **HTML5**: Semantic markup and structure
- **CSS3**: Styling, layouts, animations, and responsive design
- **Vanilla JavaScript**: Interactivity and functionality (no frameworks)

## Key Functionality

### Search & Filters
- Browse car import options and specifications; arrived cars can be listed separately
- Request a car import from China, the USA, or Canada
- Filter import cars by source country (China, USA, or Canada); filter arrived cars by Ghana office (Accra or Koforidua), as well as make, model, year, condition, transmission, fuel type, and body type
- Filter tricycles by type (passenger, cargo, commercial), condition, price range, and location
- Sort by newest first, price low to high, or price high to low

### Vehicle Listings
- Dynamic vehicle cards with images, prices, specifications, and availability status
- Request an import quote directly from car cards, with the selected car details pre-filled
- View details page with full vehicle information and gallery
- Contact dealership via phone, WhatsApp, or enquiry form

### Forms
- Import request form with vehicle specifications and preferences
- Contact form with enquiry type and preferred contact method
- Form validation for all required fields

### Responsive Design
- Mobile-first approach with breakpoints for tablet and desktop
- Hamburger menu for mobile navigation
- Flexible grid layouts that adapt to screen size

## Sample Data

The prototype includes sample Bajaj tricycle listings and example car import options. Car prices and specifications are indicative examples and do not guarantee stock or a final landed price. Admins can manage import options and arrived vehicle listings separately.

## Frontend Admin Prototype and Backend Integration

Open `admin.html` to add, edit, and delete backend-backed vehicle listings, including uploading up to 10 photos per listing; choose several photos at once or add them one at a time. Set each car as an import option with a source country (China, USA, or Canada), or as arrived in Ghana with an office location (Accra or Koforidua). Use **Recover saved vehicles** to transfer earlier car and tricycle listings from this browser into the shared inventory if they are missing. Edit, add, and remove homepage photo tiles (labels, uploaded pictures, destinations, and optional image attribution) and category shortcuts; review and delete import requests and contact enquiries; publish, edit, and remove homepage announcements; and update public-page copy, banner images, and section visibility from the Site content panel. Review recent activity from the dashboard. Vehicle cards keep each listing together and let visitors browse its photos; the details page also displays the complete gallery. Uploaded vehicle, category, tile, and banner pictures are uploaded to the backend image store. Inventory is stored in the shared database, while tile, category, announcement, and page-content changes are saved in the shared site-content database. Category vehicle counts are calculated from the current inventory.

The admin dashboard requires an authenticated admin account. Vehicle listings, contact enquiries, import requests, and site-content settings are saved through the backend and shared across visitors. The browser’s saved vehicle data is only used by **Recover saved vehicles** to transfer older listings into the shared inventory.

The signup page remains a frontend-only form and does not create accounts. For the current demo, submitting the login form immediately continues to the selected page without checking credentials or contacting a backend. The demo login lasts for the current browser tab. This is not authentication; add server-side authentication and authorization before enabling account creation or access to protected pages. Homepage links preserve the selected destination through the signup/login screens.

To make the wider frontend prototype production-ready, you will need:

1. **Backend Server**: Node.js, Python, PHP, or similar
2. **Database**: MySQL, PostgreSQL, MongoDB, or similar for inventory management
3. **Authentication**: Admin panel for managing dealership inventory
4. **Image Storage**: Cloud storage or server-side file handling for vehicle images
5. **Payment Gateway**: For import services and vehicle purchases
6. **Email Service**: For enquiry notifications and communications
7. **Real API Integration**: For actual import service providers and shipping tracking
8. **WhatsApp Business API**: For automated customer communication

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility Features

- Semantic HTML markup
- ARIA labels where appropriate
- Keyboard navigation support
- Visible focus states
- Readable color contrast
- Alt text for images

## Customization

### Colors
Edit CSS variables in `css/style.css`:

```css
:root {
    --primary-color: #E31837;
    --secondary-color: #1a1a1a;
    /* ... other variables */
}
```

### Sample Data
Edit the `sampleVehicles` array in `js/script.js` to change the default inventory. Dashboard changes saved in browser local storage take precedence over those defaults in that browser.

### Images
Replace placeholder images with your own in the `images/` folder and update the image paths in the JavaScript data.

## License

This project is for demonstration purposes. Feel free to use it as a starting point for your own vehicle marketplace.

## Support

For questions or issues, please refer to the code comments or contact the development team.

---

**Zackconnect - Your Trusted Partner for Cars & Tricycles.**
#   z a c k c o n n e c t a u t o s  
 