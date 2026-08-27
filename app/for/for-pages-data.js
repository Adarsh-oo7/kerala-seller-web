/**
 * Shared data for all /for/[segment] seller persona pages.
 * Each entry defines: metadata, hero, problems, features, faqs, and internal links.
 */

export const FOR_PAGES = {
  'social-media-sellers': {
    slug: 'social-media-sellers',
    meta: {
      title: 'Platform for Social Media Sellers | Kerala Sellers',
      description:
        'Sell on Instagram, WhatsApp & Facebook without juggling DMs. One dashboard for all your social media orders. 0% commission. Social media order engane manage cheyyam — Kerala Sellers.',
    },
    hero: {
      badge: '📱 For Social Media Sellers',
      h1: ['All-in-One Platform for ', 'Social Media Sellers'],
      sub: 'Stop managing orders in scattered DMs across Instagram, WhatsApp, and Facebook. Get a single store link, one order dashboard, and 0% commission — so you can focus on selling, not chasing messages.',
      pills: ['✓ One store link', '✓ All orders in one place', '✓ 0% commission', '✓ Ready in 10 minutes'],
    },
    stats: [
      { n: '1000+', l: 'Social Sellers' },
      { n: '0%', l: 'Commission' },
      { n: '10 min', l: 'Setup' },
      { n: '3+', l: 'Platforms Covered' },
    ],
    problems: [
      { emoji: '😩', problem: 'Replying to the same "price?" question 100 times a day across three platforms', solution: 'Customers visit your store link, see all prices and photos, and order themselves — no DMs.' },
      { emoji: '😵', problem: 'Orders scattered across Instagram DMs, WhatsApp chats, and Facebook messages', solution: 'One clean order dashboard collects every order — no matter which platform your customer found you on.' },
      { emoji: '💸', problem: 'Sending payment links manually and then following up to confirm payments', solution: 'Customers pay via UPI, card, or net banking at checkout. Payment is confirmed instantly.' },
      { emoji: '📦', problem: 'Losing track of which items are in stock across your posts and stories', solution: 'Real-time stock management. When a product sells out, it shows as unavailable automatically.' },
      { emoji: '🤯', problem: 'No professional presence — just a personal account that customers cannot easily browse', solution: 'Your own branded store link (keralasellers.in/shop/yourname) to put in every bio and story.' },
    ],
    features: [
      { emoji: '🔗', title: 'One Store Link for All Platforms', desc: 'Share one link in your Instagram bio, WhatsApp status, Facebook page, and anywhere else. All orders come to one dashboard.' },
      { emoji: '📋', title: 'Unified Order Dashboard', desc: 'See every order — from Instagram, WhatsApp, or any source — in a single clean view with customer details and payment status.' },
      { emoji: '💰', title: '0% Commission, Flat Monthly Fee', desc: 'No percentage cut. Pay a small fixed monthly fee and keep 100% of every sale you make.' },
      { emoji: '📊', title: 'Inventory Synced Across Everything', desc: 'Update stock once. It reflects everywhere — no more manually telling each platform your item is sold out.' },
      { emoji: '🔔', title: 'Instant Order Notifications', desc: 'Get notified the moment a customer places an order — so you never miss a sale.' },
    ],
    faqs: [
      { q: 'Social media order engane manage cheyyam easily?', a: 'Kerala Sellers gives you a single store link to share across Instagram, WhatsApp, and Facebook. All orders come to one dashboard — no more chasing DMs on different apps.' },
      { q: 'Can my customers still reach me on WhatsApp or Instagram?', a: 'Yes. The store link just gives them a better way to place orders. They can still message you for custom enquiries. The difference is that regular orders happen without back-and-forth.' },
      { q: 'Do I need to stop selling the way I currently sell?', a: 'No. Just add your store link to your bio and status. Keep posting. Your existing audience clicks the link and orders — nothing else changes for them.' },
      { q: 'What if I sell on all three — Instagram, WhatsApp, and Facebook?', a: 'Perfect. One Kerala Sellers store works across all three. Share the same link everywhere. All orders appear in one dashboard, regardless of which platform the buyer came from.' },
      { q: 'Is there a free plan?', a: 'You can create an account for free and explore. Paid plans start at affordable monthly rates to activate your live store and accept orders.' },
    ],
    links: [
      { href: '/for/instagram-sellers', label: 'Instagram Sellers' },
      { href: '/for/whatsapp-sellers', label: 'WhatsApp Sellers' },
      { href: '/features/order-management', label: 'Order Management' },
      { href: '/solutions', label: 'All Solutions' },
      { href: '/register/seller', label: 'Start Free' },
    ],
  },

  'instagram-sellers': {
    slug: 'instagram-sellers',
    meta: {
      title: 'Online Store for Instagram Sellers | Kerala Sellers',
      description:
        'Turn your Instagram DMs into a proper online store. Share a link in bio, let customers browse and order — no more price reply chaos. Instagram DM order track cheyyan — Kerala Sellers.',
    },
    hero: {
      badge: '📸 For Instagram Sellers',
      h1: ['Online Store for ', 'Instagram Sellers'],
      sub: 'You already have the followers. Now give them a store. Share your Kerala Sellers link in your Instagram bio, let customers browse your products, add to cart, and pay — without a single DM exchange.',
      pills: ['✓ Link in bio store', '✓ No DM order chaos', '✓ 0% commission', '✓ Works on mobile'],
    },
    stats: [
      { n: '1000+', l: 'Instagram Sellers' },
      { n: '0%', l: 'Commission' },
      { n: '10 min', l: 'Setup' },
      { n: '1 link', l: 'Runs Everything' },
    ],
    problems: [
      { emoji: '😩', problem: 'Typing "price is ₹450, DM to order" under every single post', solution: 'Your store link shows every product with photo, price, and stock. Customers order with one tap.' },
      { emoji: '😵', problem: 'Instagram DM inbox overflowing — "is it available?", "can I order?", "what\'s the rate?"', solution: 'Customers visit your store link and self-serve. DMs drop dramatically. Actual questions only.' },
      { emoji: '💸', problem: 'Sending UPI QR codes and then waiting for payment screenshots', solution: 'Checkout with Razorpay — UPI, cards, net banking. Payment confirmed instantly at checkout.' },
      { emoji: '📦', problem: 'Forgetting to update your stories when something sells out, then disappointing customers', solution: 'Inventory auto-tracks. Items show out-of-stock automatically on your store when quantity hits zero.' },
      { emoji: '🌐', problem: 'No proper business presence — just a personal page that looks like a hobby', solution: 'keralasellers.in/shop/yourshopname — a professional branded store you can be proud to share.' },
    ],
    features: [
      { emoji: '📌', title: 'Perfect Link in Bio', desc: 'One link goes in your Instagram bio. Followers tap it, browse your full catalogue, and order — no DMs needed.' },
      { emoji: '🛒', title: 'Cart-Based Ordering', desc: 'Customers add multiple items to cart and checkout in one go. Clean, familiar, like shopping from any proper store.' },
      { emoji: '📱', title: 'Instagram Story Compatible', desc: 'Share your store link in stories, reels captions, and DMs too. Works perfectly on mobile.' },
      { emoji: '📊', title: 'See What Your Audience Buys', desc: 'Analytics showing top products, order patterns, and revenue trends — so you post and stock what actually sells.' },
      { emoji: '❤️', title: 'Wishlists for Repeat Orders', desc: 'Customers save favourite products and come back to order again. Build loyal buyers without any ads.' },
    ],
    faqs: [
      { q: 'Instagram DM order track cheyyan easy aano?', a: 'With Kerala Sellers, you don\'t need to track DMs at all. Your customers click the link in your bio, place orders on your store, and all orders appear in your dashboard automatically.' },
      { q: 'Will my Instagram followers find it easy to order from my store link?', a: 'Yes. The store is mobile-first and works exactly like a familiar shopping experience — browse, add to cart, pay. No app download or signup needed from the buyer.' },
      { q: 'Can I use this if I sell clothes, jewellery, food, or handmade items?', a: 'Absolutely. Kerala Sellers works for any product category — fashion, jewellery, home-baked goods, handicrafts, ayurvedic products, electronics, and more.' },
      { q: 'Do I need a separate Instagram Business account?', a: 'No. You can use Kerala Sellers independently — just put your store link anywhere on Instagram. An Instagram Business account is helpful but not required.' },
      { q: 'Will Kerala Sellers replace my Instagram account?', a: 'No. You keep your Instagram exactly as it is. Kerala Sellers adds the ordering layer — followers who are ready to buy go from your post to your store. It is additive, not a replacement.' },
    ],
    links: [
      { href: '/for/whatsapp-sellers', label: 'WhatsApp Sellers' },
      { href: '/for/social-media-sellers', label: 'Social Media Sellers' },
      { href: '/features/online-store-builder', label: 'Store Builder' },
      { href: '/features/order-management', label: 'Order Management' },
      { href: '/register/seller', label: 'Start Free' },
    ],
  },

  'whatsapp-sellers': {
    slug: 'whatsapp-sellers',
    meta: {
      title: 'WhatsApp Order Management for Kerala Sellers | Kerala Sellers',
      description:
        'Stop managing orders manually on WhatsApp. Get a store link for WhatsApp status, accept orders automatically, and track them in one dashboard. WhatsApp il order engane manage cheyyam.',
    },
    hero: {
      badge: '💬 For WhatsApp Sellers',
      h1: ['Sell and Manage ', 'WhatsApp Orders Easily'],
      sub: 'Put your store link in your WhatsApp Status. Customers click, browse, pick products, and pay — all without you typing a single price reply. Your WhatsApp stays for real conversations. Orders happen on their own.',
      pills: ['✓ WhatsApp Status link', '✓ Auto order tracking', '✓ UPI checkout', '✓ 0% commission'],
    },
    stats: [
      { n: '500+', l: 'WhatsApp Sellers' },
      { n: '0%', l: 'Commission' },
      { n: '10 min', l: 'Setup' },
      { n: '24/7', l: 'Orders Accepted' },
    ],
    problems: [
      { emoji: '😩', problem: '"WhatsApp il varunna order engane manage cheyyam?" — keeping up with order chats is a full-time job', solution: 'Customers click your store link, order themselves, and pay. Orders appear in your dashboard automatically.' },
      { emoji: '😵', problem: 'Getting confused between orders from different contacts — who ordered what, which is paid, which is delivered', solution: 'Every order has a unique ID with customer name, items, amount, and payment status. Zero confusion.' },
      { emoji: '💸', problem: 'Chasing UPI payment screenshots and typing "did you send?" in every chat', solution: 'Customers pay at checkout via Razorpay. You see payment confirmed — no chase needed.' },
      { emoji: '📦', problem: 'Running out of stock mid-order because your catalogue is just a photo album in WhatsApp groups', solution: 'Live stock management. Your store always shows current availability. No overselling.' },
      { emoji: '🤯', problem: 'Losing orders when your WhatsApp gets temporarily banned for business messaging', solution: 'Your store link works independently. Orders keep coming even if your WhatsApp has issues.' },
    ],
    features: [
      { emoji: '📲', title: 'WhatsApp Status Store Link', desc: 'Post your store link (keralasellers.in/shop/yourname) in your WhatsApp Status. Every view is a potential customer.' },
      { emoji: '🛒', title: 'Automatic Order Collection', desc: 'No more manual order tracking. Every order is collected automatically in your dashboard with full customer details.' },
      { emoji: '💳', title: 'UPI Checkout at Order Time', desc: 'Customers pay via UPI, card, or net banking when they place the order. No follow-up for payment needed.' },
      { emoji: '📊', title: 'Order Status Management', desc: 'Mark orders as confirmed, packed, shipped, or delivered. Customers can track their order status.' },
      { emoji: '🔔', title: 'Order Notifications', desc: 'Instant notification when a new order is placed. Never miss a sale, even when you\'re busy.' },
    ],
    faqs: [
      { q: 'WhatsApp il order engane manage cheyyam without confusion?', a: 'Kerala Sellers replaces the manual process. Your store link goes in your WhatsApp Status. Customers click, browse, place an order and pay. All orders appear in your dashboard with names, items, amounts, and payment status — no confusion.' },
      { q: 'Will customers need to download an app to order from my store?', a: 'No app needed. The store opens in any mobile browser. Customers click the link and order just like from any website.' },
      { q: 'Can I still use my WhatsApp Business for customer chats?', a: 'Yes. Use WhatsApp for personal conversations and custom queries. Use your Kerala Sellers store link for regular orders. They work together perfectly.' },
      { q: 'What if I have multiple products and different availability days?', a: 'You can set stock quantities and availability per product. Mark items as unavailable on specific days or when stock runs out.' },
      { q: 'Is the store link safe to share in WhatsApp groups?', a: 'Completely safe. It is a standard web link (keralasellers.in/shop/yourname) — no tracking or spam. Safe to share in groups, broadcast lists, and statuses.' },
    ],
    links: [
      { href: '/for/instagram-sellers', label: 'Instagram Sellers' },
      { href: '/for/home-businesses', label: 'Home Businesses' },
      { href: '/features/order-management', label: 'Order Management' },
      { href: '/solutions', label: 'All Solutions' },
      { href: '/register/seller', label: 'Start Free' },
    ],
  },

  'small-businesses': {
    slug: 'small-businesses',
    meta: {
      title: 'Online Store & Tools for Small Businesses | Kerala Sellers',
      description:
        'Billing, inventory, online store, and order management for small businesses in Kerala. One platform. 0% commission. Cheriya businessinu online tool — Kerala Sellers.',
    },
    hero: {
      badge: '🏪 For Small Businesses',
      h1: ['Online Store and Business Management ', 'for Small Businesses'],
      sub: 'Billing, inventory, online orders, and customer management — all in one place. Built for small businesses in Kerala who want a professional presence without expensive software or website costs.',
      pills: ['✓ Billing + inventory', '✓ Online store', '✓ 0% commission', '✓ Mobile-friendly'],
    },
    stats: [
      { n: '1000+', l: 'Businesses' },
      { n: '0%', l: 'Commission' },
      { n: '14+', l: 'Districts' },
      { n: '₹', l: 'Affordable Plans' },
    ],
    problems: [
      { emoji: '😩', problem: 'Using WhatsApp, Excel, and handwritten notebooks to manage orders and stock', solution: 'One digital dashboard replaces all three. Orders, stock, billing — all organised and searchable.' },
      { emoji: '💸', problem: 'Paying 15–30% commission to marketplace platforms just to sell online', solution: '0% commission. Flat monthly subscription. Every rupee of profit stays with you.' },
      { emoji: '😰', problem: 'No time or money to build a proper website for the business', solution: 'Your store is live in 10 minutes. No developers, no hosting, no one-time website cost.' },
      { emoji: '📦', problem: 'Overselling when stock runs out because you update different places manually', solution: 'Inventory syncs automatically. Customers see real stock. Overselling becomes impossible.' },
      { emoji: '🧾', problem: 'Generating receipts manually or using a separate billing tool', solution: 'Built-in billing add-on to generate receipts for offline and online sales from one system.' },
    ],
    features: [
      { emoji: '🏪', title: 'Your Own Online Store', desc: 'A branded store link for your business — keralasellers.in/shop/yourshopname. Professional, shareable, works on all phones.' },
      { emoji: '📊', title: 'Order Dashboard', desc: 'See all orders in one clean view. Filter by status, date, or customer. No more scattered order tracking.' },
      { emoji: '📦', title: 'Inventory Management', desc: 'Set quantities per product. Get alerts when stock is low. Auto-updates when products sell.' },
      { emoji: '🧾', title: 'Billing Add-on', desc: 'Generate receipts for offline and online sales. Bridge your physical shop with your online store.' },
      { emoji: '💳', title: 'All Payment Methods', desc: 'UPI, cards, net banking, wallets — all via Razorpay. Money goes directly to your account.' },
    ],
    faqs: [
      { q: 'Cheriya businessinu online tool — do I really need it?', a: 'If you are taking orders on WhatsApp or phone, losing track of stock, or manually managing payments, yes. Kerala Sellers organises all of that in one place and takes 10 minutes to set up.' },
      { q: 'Is this suitable for a shop that also sells offline?', a: 'Yes. The billing add-on lets you generate receipts for offline sales too. You manage physical shop and online store from the same dashboard.' },
      { q: 'How is this different from using Swiggy/Zomato/Amazon?', a: 'Those platforms take 15–40% commission and own the customer relationship. On Kerala Sellers, it is your store, your customer data, and 0% commission.' },
      { q: 'Can I manage multiple product categories?', a: 'Yes. Create categories and subcategories for your products. Customers can filter and browse your catalogue just like a proper e-commerce store.' },
      { q: 'What if my business is not registered?', a: 'No GST number or business registration is required to sign up. Individual sellers and unregistered businesses are welcome.' },
    ],
    links: [
      { href: '/for/home-businesses', label: 'Home Businesses' },
      { href: '/features/online-store-builder', label: 'Store Builder' },
      { href: '/features/inventory-management', label: 'Inventory Management' },
      { href: '/solutions', label: 'All Solutions' },
      { href: '/register/seller', label: 'Start Free' },
    ],
  },

  'home-businesses': {
    slug: 'home-businesses',
    meta: {
      title: 'Online Selling Platform for Home Businesses | Kerala Sellers',
      description:
        'Sell from home with your own store link. Perfect for home bakers, resellers, handicraft makers, and anyone running a business from home in Kerala. Veetil ninnu business online aakkan — Kerala Sellers.',
    },
    hero: {
      badge: '🏠 For Home Businesses',
      h1: ['Online Selling Platform ', 'for Home Businesses'],
      sub: 'Running a home bakery, selling handmade products, or reselling from home? Kerala Sellers gives you a professional online store without renting a space, building a website, or paying platform commission.',
      pills: ['✓ Sell from home', '✓ Your own store link', '✓ 0% commission', '✓ Local delivery zones'],
    },
    stats: [
      { n: '500+', l: 'Home Sellers' },
      { n: '0%', l: 'Commission' },
      { n: '10 min', l: 'Setup' },
      { n: 'Kerala', l: 'Focused Delivery' },
    ],
    problems: [
      { emoji: '😩', problem: 'Customers think home businesses are "not professional" — no proper brand presence', solution: 'Your own branded store link gives your home business a professional online identity.' },
      { emoji: '😵', problem: 'Taking pre-orders and custom orders through WhatsApp and losing track of what was promised to whom', solution: 'Every order is tracked with the customer name, item, date, and payment status. Nothing gets lost.' },
      { emoji: '💸', problem: 'Veetil ninnu business online aakkan costaan — website builders charge thousands', solution: 'Your store is live in 10 minutes with zero upfront cost. Monthly plan is far cheaper than any website.' },
      { emoji: '📦', problem: 'Selling more than you can produce — over-promising when WhatsApp orders pile up', solution: 'Set exact quantities per product. When your baked goods or handmade items hit zero, orders stop automatically.' },
      { emoji: '🌐', problem: 'Customers outside your local area cannot find or order from you easily', solution: 'Share your store link anywhere online. Customers across Kerala — and beyond — can order and pay online.' },
    ],
    features: [
      { emoji: '🎂', title: 'Perfect for Home Bakeries', desc: 'Set daily available quantities, add-ons, and custom order notes. Customers pre-order and pay — no follow-up chasing.' },
      { emoji: '🧵', title: 'Handmade & Craft Products', desc: 'Showcase your handmade jewellery, textiles, or art with beautiful product photos and descriptions.' },
      { emoji: '📍', title: 'Local Delivery Zones', desc: 'Set your delivery areas — panchayat, district, or all-Kerala. Customers see delivery options based on their location.' },
      { emoji: '📱', title: 'Manage Everything from Your Phone', desc: 'Accept orders, update stock, and mark deliveries — all from your smartphone while you work.' },
      { emoji: '🤝', title: 'Kerala Home Seller Community', desc: 'Join 500+ home businesses across Kerala already using Kerala Sellers to grow their income.' },
    ],
    faqs: [
      { q: 'Veetil ninnu business online aakkan enthu cheyyanam?', a: 'Register on Kerala Sellers with your phone number, add your shop name and logo, upload your products with photos and prices, and share your store link on Instagram and WhatsApp. That is all. Setup takes 10 minutes.' },
      { q: 'I am a home baker — can I take pre-orders and limit quantities?', a: 'Yes. You can set available quantities per product, disable ordering when you are fully booked, and accept custom order notes from customers.' },
      { q: 'Do I need a FSSAI license or any registration to sell food online?', a: 'Kerala Sellers does not require any business registration to sign up. However, for selling food commercially, FSSAI registration is advisable under Indian food safety law. Please check local compliance requirements.' },
      { q: 'Can I set different prices for different customer groups?', a: 'Currently each product has one price. You can create multiple product listings for different variants or package sizes at different price points.' },
      { q: 'What happens if a customer orders and I cannot fulfil it?', a: 'You can cancel orders from your dashboard and initiate a refund through Razorpay. It is best to set accurate stock quantities to avoid this — but the option is there.' },
    ],
    links: [
      { href: '/for/small-businesses', label: 'Small Businesses' },
      { href: '/for/whatsapp-sellers', label: 'WhatsApp Sellers' },
      { href: '/features/online-store-builder', label: 'Store Builder' },
      { href: '/sell-online-kerala', label: 'Sell Online in Kerala' },
      { href: '/register/seller', label: 'Start Free' },
    ],
  },
};
