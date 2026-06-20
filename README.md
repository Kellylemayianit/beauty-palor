denis-nganga-spa/
│
├── index.html            # 1. Homepage (Hero, Brand Story, Editorial Highlights, Global CTA)
├── services.html         # 2. Service Catalog (Category navigation, Sironosim-style row menu)
├── gallery.html          # 3. Portfolio Showcase (Before/After showcases, aesthetic looks)
├── booking.html          # 4. Reservation Hub (Dynamic form engine with auto-state injection)
│
├── data/                 # ─── DATA ENGINE
│   ├── services.json     # Services taxonomy (IDs, names, prices, descriptions, tags)
│   └── images.json       # Visual directory paths, aspect ratios, alt tags, categories
│
└── src/                  # ─── COMPONENT CORE ("Vanilla React")
    ├── components.js     # Master Injections: Global Navigation, Dynamic Footer, Mobile Overlay
    ├── services-view.js  # Row-based list layout hydrator & active filtering parser
    ├── gallery-view.js   # Portfolio image engine & fluid grid controller
    ├── booking-form.js   # Constraints handling, date restrictions & URL query watcher
    └── whatsapp.js       # Outbound validation parsing & safe deep-link compiler



    🗺️ The Complete Interface Mapping
1. Homepage (index.html)
Target: Establish instant editorial brand authority and convert traffic fast.

Structural Content Layout:

#global-header: Injected master navigation.

.hero-billboard: Large serif typography display showcasing the "Precision Grooming by Design" theme, alongside a single primary "Book Session" anchor action.

.brand-curation: Statement block highlighting Denis Ng'ang'a's Master Artist model supervising elite technicians.

.featured-preview: Mini horizontal showcase tracking only items flagged with "isFeatured": true in services.json.

.cta-banner: High-contrast break leading cleanly into the reservation module.

#global-footer: Standardized brand disclaimer and copyright.

2. Service Catalog (services.html)
Target: A clean, easy-to-read menu optimized for finding services and checking pricing.

Structural Content Layout:

#global-header: Fixed dynamic component.

.menu-intro: Minimalist header statement detailing the luxury salon standards.

.category-tabs: Dynamic button bar (e.g., All, Hair, Spa Services, Nails) that filters rows instantly via data-attributes without requiring a page reload.

.services-list-container: The Sironosim-style dynamic layout container rendering items line-by-line with inline pricing, detailed descriptions, and targeted deep links.

#global-footer: Injection wrapper.

3. Portfolio Gallery (gallery.html)
Target: Social proof and visual validation of architectural styling standards.

Structural Content Layout:

#global-header

.gallery-intro: Short description of editorial portfolio lookbooks.

.gallery-fluid-masonry: Fed strictly by images.json. It displays high-resolution portraits, close-up braid/dreadlock details, and spa treatments.

#global-footer

4. Reservation Hub (booking.html)
Target: Zero-friction transaction engine optimized to capture leads safely.

Structural Content Layout:

#global-header

.booking-grid: A clean layout splitting instructions on the left from the form on the right.

form#booking-form:

Client Personal Coordinates (Name, Phone).

Service Selector drop-down (<select id="booking-service"> filled with dynamic options from services.json).

Calendar Selector (<input type="date"> restricted to forward-looking dates).

Time Matrix block (<input type="time">).

Custom Styling Instructions textarea.

#global-footer




[ User views services.html ]
               │
               ▼
   (Clicks "Book Session" link)  ───► Appends URI state: ?service=full-head-dreads
               │
               ▼
     [ Loads booking.html ]
               │
               ▼
  (booking-form.js parses parameter) ───► Auto-selects corresponding dropdown index
               │
               ▼
  (User triggers form submit)
               │
               ▼
   (whatsapp.js formats payload) ───► Compiles safe URI deep link string
               │
               ▼
   [ Dispatches to WhatsApp ]    ───► Launches thread to +254 786 247 132

   
