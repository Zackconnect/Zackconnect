(() => {
    const pages = [
        { id: 'index.html', label: 'Homepage' },
        { id: 'cars.html', label: 'Cars' },
        { id: 'tricycles.html', label: 'Tricycles' },
        { id: 'about.html', label: 'About' },
        { id: 'contact.html', label: 'Contact' },
        { id: 'import.html', label: 'Import' }
    ];
    const fields = [
        { page: 'index.html', key: 'home.heroTitle', label: 'Homepage accessible title', type: 'text', default: 'Import cars from China, the USA, and Canada with Zackconnect Autos' },
        { page: 'index.html', key: 'footer.tagline', label: 'Footer tagline (shared across pages)', type: 'text', default: 'Your Trusted Partner for Cars & Tricycles.' },
        { page: 'index.html', key: 'home.searchPlaceholder', label: 'Search placeholder', type: 'text', default: 'What are you looking for?', attribute: 'placeholder' },
        { page: 'index.html', key: 'home.benefitsTitle', label: 'Why choose heading', type: 'text', default: 'Why Choose Zackconnect Autos?' },
        { page: 'index.html', key: 'home.feature1Title', label: 'Benefit 1 title', type: 'text', default: 'Car Imports and Bajaj Tricycles' },
        { page: 'index.html', key: 'home.feature1Text', label: 'Benefit 1 description', type: 'textarea', default: 'Import cars from China, the USA, and Canada, and shop Bajaj tricycles in Ghana' },
        { page: 'index.html', key: 'home.feature2Title', label: 'Benefit 2 title', type: 'text', default: 'Import Assistance' },
        { page: 'index.html', key: 'home.feature2Text', label: 'Benefit 2 description', type: 'textarea', default: 'We help you source cars from China, the USA, and Canada' },
        { page: 'index.html', key: 'home.feature3Title', label: 'Benefit 3 title', type: 'text', default: 'Clear Quotations' },
        { page: 'index.html', key: 'home.feature3Text', label: 'Benefit 3 description', type: 'textarea', default: 'Transparent pricing with no hidden fees or surprises' },
        { page: 'index.html', key: 'home.feature4Title', label: 'Benefit 4 title', type: 'text', default: 'Customer-Focused Service' },
        { page: 'index.html', key: 'home.feature4Text', label: 'Benefit 4 description', type: 'textarea', default: 'Dedicated support to help you find the right vehicle' },
        { page: 'index.html', key: 'home.howTitle', label: 'How it works heading', type: 'text', default: 'How It Works' },
        { page: 'index.html', key: 'home.step1Title', label: 'Step 1 title', type: 'text', default: 'Choose a Car to Import' },
        { page: 'index.html', key: 'home.step1Text', label: 'Step 1 description', type: 'textarea', default: 'Tell us what you want from China, the USA, or Canada, or browse Bajaj tricycles in Ghana' },
        { page: 'index.html', key: 'home.step2Title', label: 'Step 2 title', type: 'text', default: 'Request or Browse' },
        { page: 'index.html', key: 'home.step2Text', label: 'Step 2 description', type: 'textarea', default: 'Browse cars available to import or request a model that is not listed' },
        { page: 'index.html', key: 'home.step3Title', label: 'Step 3 title', type: 'text', default: 'Contact Zackconnect Autos' },
        { page: 'index.html', key: 'home.step3Text', label: 'Step 3 description', type: 'textarea', default: 'Get in touch for availability and a quotation' },
        { page: 'index.html', key: 'home.step4Title', label: 'Step 4 title', type: 'text', default: 'Confirm Arrangements' },
        { page: 'index.html', key: 'home.step4Text', label: 'Step 4 description', type: 'textarea', default: 'Review and agree on purchase or import terms' },
        { page: 'index.html', key: 'home.step5Title', label: 'Step 5 title', type: 'text', default: 'Complete Transaction' },
        { page: 'index.html', key: 'home.step5Text', label: 'Step 5 description', type: 'textarea', default: 'Finalize through our approved process' },
        { page: 'cars.html', key: 'cars.modelsTitle', label: 'Popular models heading', type: 'text', default: 'Browse cars by model and year' },
        { page: 'cars.html', key: 'cars.modelsSubtitle', label: 'Popular models description', type: 'textarea', default: 'Explore cars available to import. Request a quote to confirm availability and landed price.' },
        { page: 'cars.html', key: 'cars.listingsTitle', label: 'Listings heading', type: 'text', default: 'Cars available to import' },
        { page: 'tricycles.html', key: 'tricycles.promoTitle', label: 'Promotion heading', type: 'text', default: 'Start or Grow Your Business with a Bajaj Tricycle' },
        { page: 'tricycles.html', key: 'tricycles.promoText', label: 'Promotion description', type: 'textarea', default: 'Contact Zackconnect Autos to confirm available models, prices, and specifications for your business needs.' },
        { page: 'about.html', key: 'about.introTitle', label: 'Introduction heading', type: 'text', default: 'Who We Are' },
        { page: 'about.html', key: 'about.introText1', label: 'Introduction paragraph 1', type: 'textarea', default: 'Zackconnect Autos is a Ghanaian vehicle import service. We help customers source cars from China, the USA, and Canada, and offer Bajaj tricycles in Ghana. Cars shown as import options are not represented as stock physically in Ghana.' },
        { page: 'about.html', key: 'about.introText2', label: 'Introduction paragraph 2', type: 'textarea', default: 'Our goal is to make vehicle ownership easier by providing a reliable source for quality vehicles and professional import services.' },
        { page: 'about.html', key: 'about.missionTitle', label: 'Mission heading', type: 'text', default: 'Our Mission' },
        { page: 'about.html', key: 'about.missionText', label: 'Mission statement', type: 'textarea', default: 'To provide a trusted, customer-focused vehicle dealership that simplifies car and tricycle buying, and offers transparent import services in Ghana.' },
        { page: 'about.html', key: 'about.visionTitle', label: 'Vision heading', type: 'text', default: 'Our Vision' },
        { page: 'about.html', key: 'about.visionText', label: 'Vision statement', type: 'textarea', default: "To become Ghana's leading vehicle dealership, known for reliability, transparency, quality vehicles, and excellent customer service." },
        { page: 'about.html', key: 'about.offerTitle', label: 'Services heading', type: 'text', default: 'What We Offer' },
        { page: 'contact.html', key: 'contact.infoTitle', label: 'Contact information heading', type: 'text', default: 'Get in Touch' },
        { page: 'contact.html', key: 'contact.infoText', label: 'Contact information description', type: 'textarea', default: 'Have questions about our vehicles or import services? Contact us today.' },
        { page: 'contact.html', key: 'contact.phone', label: 'Phone number', type: 'text', default: '+233 24 373 9221' },
        { page: 'contact.html', key: 'contact.whatsapp', label: 'WhatsApp number', type: 'text', default: '+233 24 373 9221' },
        { page: 'contact.html', key: 'contact.email', label: 'Email address', type: 'text', default: 'info@zackconnect.com' },
        { page: 'contact.html', key: 'contact.location', label: 'Location', type: 'text', default: 'Koforidua, Accra - Ghana' },
        { page: 'contact.html', key: 'contact.businessHoursWeekday', label: 'Weekday business hours', type: 'text', default: 'Mon - Fri: 8:00 AM - 6:00 PM' },
        { page: 'contact.html', key: 'contact.businessHoursWeekend', label: 'Saturday business hours', type: 'text', default: 'Sat: 9:00 AM - 2:00 PM' },
        { page: 'contact.html', key: 'contact.whatsappTitle', label: 'WhatsApp heading', type: 'text', default: 'Quick Enquiry via WhatsApp' },
        { page: 'contact.html', key: 'contact.whatsappText', label: 'WhatsApp description', type: 'textarea', default: 'Get faster responses by reaching out to us directly on WhatsApp' },
        { page: 'import.html', key: 'import.serviceTitle', label: 'Service heading', type: 'text', default: 'How Our Import Service Works' },
        { page: 'import.html', key: 'import.processTitle', label: 'Process heading', type: 'text', default: 'The Import Process' },
        { page: 'import.html', key: 'import.costTitle', label: 'Cost breakdown heading', type: 'text', default: 'Cost Breakdown' },
        { page: 'import.html', key: 'import.countriesTitle', label: 'Countries heading', type: 'text', default: 'We Import From' }
    ];
    const sections = [
        { page: 'index.html', key: 'home.hero', label: 'Home search banner' },
        { page: 'index.html', key: 'home.categories', label: 'Homepage categories' },
        { page: 'index.html', key: 'home.vehicleTiles', label: 'Homepage vehicle tiles' },
        { page: 'index.html', key: 'home.benefits', label: 'Why choose section' },
        { page: 'index.html', key: 'home.how', label: 'How it works section' },
        { page: 'cars.html', key: 'cars.inventory', label: 'Cars inventory and filters' },
        { page: 'tricycles.html', key: 'tricycles.promo', label: 'Tricycle promotion' },
        { page: 'tricycles.html', key: 'tricycles.inventory', label: 'Tricycle inventory' },
        { page: 'about.html', key: 'about.content', label: 'About information' },
        { page: 'contact.html', key: 'contact.content', label: 'Contact details and form' },
        { page: 'contact.html', key: 'contact.whatsapp', label: 'WhatsApp contact banner' },
        { page: 'import.html', key: 'import.content', label: 'Import information and form' }
    ];
    const images = [
        { page: 'index.html', key: 'index.html.headerImage', label: 'Homepage banner background' },
        { page: 'index.html', key: 'global.logo', label: 'Company logo (shared across pages)' }
    ];

    async function applySiteContent() {
        if (!window.ZackconnectData || !window.zackconnectSampleVehicles) return;
        let state = window.ZackconnectPublicContent;
        if (!state && window.ZackconnectAPI?.SiteContentAPI) {
            try {
                state = await window.ZackconnectAPI.SiteContentAPI.getPublic();
                window.ZackconnectPublicContent = state;
            } catch (error) {
                console.error('Could not load shared website content:', error);
            }
        }
        state = state || window.ZackconnectData.readState(window.zackconnectSampleVehicles);
        const page = window.location.pathname.split('/').pop() || 'index.html';
        const content = {
            text: {},
            images: {},
            hiddenSections: [],
            ...(state.siteContent || {})
        };

        document.querySelectorAll('[data-site-content]').forEach(element => {
            const value = content.text[element.dataset.siteContent];
            if (element.dataset.siteAttribute) {
                const attribute = element.dataset.siteAttribute;
                if (!element.hasAttribute('data-site-original-value')) {
                    element.dataset.siteOriginalValue = element.getAttribute(attribute) || '';
                }
                element.setAttribute(attribute, value ?? element.dataset.siteOriginalValue);
            } else {
                if (!element.hasAttribute('data-site-original-value')) {
                    element.dataset.siteOriginalValue = element.textContent;
                }
                element.textContent = value ?? element.dataset.siteOriginalValue;
            }
        });
        document.querySelectorAll('[data-site-image]').forEach(element => {
            const value = content.images[element.dataset.siteImage];
            if (element.tagName === 'IMG') {
                if (!element.hasAttribute('data-site-default-src')) {
                    element.dataset.siteDefaultSrc = element.getAttribute('src') || '';
                }
                element.src = value || element.dataset.siteDefaultSrc;
            } else if (value) {
                element.style.backgroundImage = `linear-gradient(135deg, rgba(22, 32, 39, .72), rgba(22, 32, 39, .38)), url("${value}")`;
            } else {
                element.style.removeProperty('background-image');
            }
        });
        sections.filter(section => section.page === page).forEach(section => {
            const element = document.querySelector(`[data-site-section="${section.key}"]`);
            if (element) element.hidden = content.hiddenSections.includes(section.key);
        });
    }

    window.ZackconnectSiteContent = Object.freeze({ pages, fields, sections, images });
    window.ZackconnectApplySiteContent = applySiteContent;
    document.addEventListener('DOMContentLoaded', applySiteContent);
    window.addEventListener('storage', event => {
        if (event.key === window.ZackconnectData?.storageKey) applySiteContent();
    });
})();
