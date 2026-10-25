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
        'Sell on Instagram, WhatsApp and Facebook without juggling DMs. One store link and one order dashboard for every channel. 0% commission.',
    },
    hero: {
      badge: '📱 For Social Media Sellers',
      h1: ['All-in-One Platform for ', 'Social Media Sellers'],
      sub: 'Stop managing orders in scattered DMs across Instagram, WhatsApp, and Facebook. Get a single store link, one order dashboard, and 0% commission — so you can focus on selling, not chasing messages.',
      pills: ['✓ One store link', '✓ All orders in one place', '✓ 0% commission', '✓ Ready in 10 minutes'],
    },
    stats: [
      { n: 'Trusted', l: 'By Social Sellers' },
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
      { href: '/features', label: 'All Solutions' },
      { href: '/register/seller', label: 'Start Free' },
    ],
  },

  'instagram-sellers': {
    slug: 'instagram-sellers',
    meta: {
      title: 'Online Store for Instagram Sellers | Kerala Sellers',
      description:
        'Turn Instagram DMs into a real online store. One link in bio, customers browse, add to cart and pay by UPI. 0% commission for Kerala sellers.',
    },
    hero: {
      badge: '📸 For Instagram Sellers',
      h1: ['Online Store for ', 'Instagram Sellers'],
      sub: 'You already have the followers. Now give them a store. Share your Kerala Sellers link in your Instagram bio, let customers browse your products, add to cart, and pay — without a single DM exchange.',
      pills: ['✓ Link in bio store', '✓ No DM order chaos', '✓ 0% commission', '✓ Works on mobile'],
    },
    stats: [
      { n: 'Trusted', l: 'By IG Sellers' },
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
      title: 'WhatsApp Order Management for Sellers | Kerala Sellers',
      description:
        'Stop tracking WhatsApp orders by hand. Put a store link in your Status, take paid orders automatically and track them in one dashboard. 0% commission.',
    },
    hero: {
      badge: '💬 For WhatsApp Sellers',
      h1: ['Sell and Manage ', 'WhatsApp Orders Easily'],
      sub: 'Put your store link in your WhatsApp Status. Customers click, browse, pick products, and pay — all without you typing a single price reply. Your WhatsApp stays for real conversations. Orders happen on their own.',
      pills: ['✓ WhatsApp Status link', '✓ Auto order tracking', '✓ UPI checkout', '✓ 0% commission'],
    },
    stats: [
      { n: 'Trusted', l: 'By WA Sellers' },
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
      { href: '/features', label: 'All Solutions' },
      { href: '/register/seller', label: 'Start Free' },
    ],
  },

  'small-businesses': {
    slug: 'small-businesses',
    meta: {
      title: 'Online Store & Billing for Small Business | Kerala Sellers',
      description:
        'Online store, POS billing and inventory for small businesses in Kerala. Go live from ₹99/month with 0% commission. No website or developer needed.',
    },
    hero: {
      badge: '🏪 For Small Businesses',
      h1: ['Online Store and Business Management ', 'for Small Businesses'],
      sub: 'Billing, inventory, online orders, and customer management — all in one place. Built for small businesses in Kerala who want a professional presence without expensive software or website costs.',
      pills: ['✓ Billing + inventory', '✓ Online store', '✓ 0% commission', '✓ Mobile-friendly'],
    },
    stats: [
      { n: 'Trusted', l: 'By Local Shops' },
      { n: '0%', l: 'Commission' },
      { n: '14', l: 'Districts' },
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
      { href: '/features', label: 'All Solutions' },
      { href: '/register/seller', label: 'Start Free' },
    ],
  },

  'home-businesses': {
    slug: 'home-businesses',
    meta: {
      title: 'Home Based Business in Kerala & Direct Selling for Beginners',
      description:
        'Start a home based business or direct selling in Kerala with your own store link. Perfect for beginners: home bakery, tailoring, reselling & crafts. 0% commission, from ₹99/mo.',
    },
    hero: {
      badge: '🏠 For Home Businesses & Direct Selling',
      h1: ['Start a Home Based Business ', 'in Kerala'],
      sub: 'Running a home bakery, direct selling, tailoring, or selling handmade goods? Kerala Sellers gives your home business a professional online store without renting a shop, building a website, or paying platform commission.',
      pills: ['✓ Sell from home', '✓ Direct selling beginners', '✓ UPI payments', '✓ 0% commission'],
    },
    stats: [
      { n: 'Trusted', l: 'By Home Sellers' },
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
      { emoji: '🛍️', title: 'Direct Selling & Reselling in Kerala', desc: 'Upload your supplier catalogue, share your store link in WhatsApp groups and Instagram, and collect payments directly.' },
      { emoji: '🧵', title: 'Handmade & Craft Products', desc: 'Showcase your handmade jewellery, textiles, or art with beautiful product photos and descriptions.' },
      { emoji: '📍', title: 'Local Delivery Zones', desc: 'Set your delivery areas — panchayat, district, or all-Kerala. Customers see delivery options based on their location.' },
      { emoji: '📱', title: 'Manage Everything from Your Phone', desc: 'Accept orders, update stock, and mark deliveries — all from your smartphone while you work.' },
    ],
    guide: {
      eyebrow: 'HOME BUSINESS IDEAS IN KERALA',
      title: 'Home Based Business Ideas That Sell Well in Kerala',
      lead: 'Popular low-investment businesses Kerala sellers already run from home. Each one works with a store link shared on WhatsApp and Instagram.',
      items: [
        { title: 'Home Bakery & Cakes', desc: 'Birthday cakes, brownies, and plum cakes for Christmas. Set daily quantities so you never take more orders than your oven can handle. Get FSSAI registration before selling food.' },
        { title: 'Pickles, Masala & Snacks', desc: 'Homemade achar, chammanthi podi, banana chips, and halwa sell all year to Keralites in Kerala and the Gulf. List each pack size as its own product.' },
        { title: 'Boutique & Tailoring', desc: 'Churidar stitching, kurtis, set mundu, and kids wear. Post new designs on Instagram and let customers order sizes directly from your store.' },
        { title: 'Handmade Jewellery & Crafts', desc: 'Resin art, terracotta, thread bangles, and gift hampers. Good photos and a store link do the selling while you make the next piece.' },
        { title: 'Plants & Terrace Garden', desc: 'Indoor plants, grow bags, seeds, and organic vegetables for local buyers. Use delivery zones to limit orders to your panchayat or district.' },
        { title: 'Reselling From Home', desc: 'Sell sarees, cosmetics, or home products sourced from a supplier. Add their catalogue to your own store and keep the full margin.' },
      ],
    },
    faqs: [
      { q: 'What is the best home based business in Kerala to start with low investment?', a: 'The easiest are the ones that use skills you already have: a home bakery, pickles and snacks, tailoring, handmade crafts, or reselling. Start with a few products, share your Kerala Sellers store link on WhatsApp and Instagram, and add more as orders grow. Plans start at ₹99/month with no commission.' },
      { q: 'Veetil ninnu business online aakkan enthu cheyyanam?', a: 'Register on Kerala Sellers with your phone number, add your shop name and logo, upload your products with photos and prices, and share your store link on Instagram and WhatsApp. That is all. Setup takes 10 minutes.' },
      { q: 'Can direct sellers and resellers in Kerala use Kerala Sellers?', a: 'Yes. Kerala Sellers is built for direct sellers, resellers, and home entrepreneurs across Kerala. You can upload products, share your store link in WhatsApp groups and Instagram, and take online payments with zero marketplace commission.' },
      { q: 'I am a home baker — can I take pre-orders and limit quantities?', a: 'Yes. You can set available quantities per product, disable ordering when you are fully booked, and accept custom order notes from customers.' },
      { q: 'Do I need a FSSAI license or any registration to sell food online?', a: 'Kerala Sellers does not require any business registration to sign up. However, for selling food commercially, FSSAI registration is advisable under Indian food safety law. Please check local compliance requirements.' },
      { q: 'Can I set different prices for different customer groups?', a: 'Currently each product has one price. You can create multiple product listings for different variants or package sizes at different price points.' },
      { q: 'What happens if a customer orders and I cannot fulfil it?', a: 'You can cancel orders from your dashboard and initiate a refund through Razorpay. It is best to set accurate stock quantities to avoid this — but the option is there.' },
    ],
    links: [
      { href: '/for/resellers', label: 'Resellers & Dropshipping' },
      { href: '/for/small-businesses', label: 'Small Businesses' },
      { href: '/for/whatsapp-sellers', label: 'WhatsApp Sellers' },
      { href: '/ml/veetu-business', label: 'വീട്ടിൽ നിന്ന് ബിസിനസ്' },
      { href: '/sell-online-kerala', label: 'Sell Online in Kerala' },
      { href: '/register/seller', label: 'Start Free' },
    ],
  },

  resellers: {
    slug: 'resellers',
    meta: {
      title: 'Online Reseller Store & Dropshipping Kerala | Kerala Sellers',
      description: 'Start reselling online in Kerala with your own store link. Add supplier products, set your margin, take UPI orders and keep 100% of profit. From ₹99/month.',
    },
    hero: {
      badge: '🔁 For Resellers',
      h1: ['Your Own Online Reseller Store ', 'in Kerala'],
      sub: 'Stop forwarding supplier photos one by one. Put every product you resell into your own branded store, set your own price, and let customers order and pay from a single link.',
      pills: ['✓ Your price, your margin', '✓ One link for all products', '✓ UPI checkout', '✓ 0% commission'],
    },
    stats: [
      { n: 'Trusted', l: 'By Kerala Resellers' },
      { n: '0%', l: 'Commission' },
      { n: '10 min', l: 'Setup' },
      { n: '₹99', l: 'Plans From / Month' },
    ],
    problems: [
      { emoji: '😩', problem: 'Forwarding the same supplier photos to every WhatsApp group and answering "price?" again and again', solution: 'Add products once with your selling price. Share one store link that shows every item, price, and size.' },
      { emoji: '💸', problem: 'Reseller apps take a cut of every order and decide your margin for you', solution: 'You set the price. Kerala Sellers charges a flat monthly plan with 0% commission on what you sell.' },
      { emoji: '😵', problem: 'Losing track of who ordered what, who paid, and what you still need to order from the supplier', solution: 'Every order lands in one dashboard with customer, items, and payment status, so placing supplier orders is easy.' },
      { emoji: '📦', problem: 'Selling items the supplier has already run out of', solution: 'Mark stock per product. When an item is out, it shows unavailable on your store automatically.' },
      { emoji: '🌐', problem: 'Customers see you as a forwarder, not a real shop', solution: 'Your own store name, logo, and link make your reselling business look like a proper brand.' },
    ],
    features: [
      { emoji: '🛍️', title: 'Your Own Branded Store', desc: 'A store link like keralasellers.in/shop/yourname with your logo, so customers buy from you, not from the supplier.' },
      { emoji: '💰', title: 'Set Your Own Margin', desc: 'Add the supplier product with your selling price. Change prices any time for offers and festival sales.' },
      { emoji: '🧾', title: 'Orders Ready for Your Supplier', desc: 'See exactly which items, sizes, and quantities were ordered so you can place one clean order with your supplier.' },
      { emoji: '💳', title: 'Online Payments Before You Buy', desc: 'Customers pay by UPI, card, or net banking at checkout, so you do not spend your own money on unpaid orders.' },
      { emoji: '📲', title: 'Share Anywhere', desc: 'Post the link in WhatsApp groups, Status, Instagram bio, and Facebook. Every share sends buyers to the same store.' },
    ],
    guide: {
      eyebrow: 'HOW TO START RESELLING',
      title: 'Start a Reselling Business in Kerala in 4 Steps',
      lead: 'A simple path for beginners who want to resell sarees, cosmetics, home products, or electronics without a shop.',
      items: [
        { title: '1. Pick a Niche You Know', desc: 'Choose products your friends and followers already ask about, such as sarees, kids wear, kitchen items, or skincare.' },
        { title: '2. Find a Reliable Supplier', desc: 'Work with a wholesaler or manufacturer who confirms stock quickly and ships on time. Kerala Sellers does not supply products.' },
        { title: '3. Build Your Store', desc: 'Register free, add the products with your own photos and prices, and connect payments. It takes about 10 minutes.' },
        { title: '4. Share and Grow', desc: 'Share your link in WhatsApp groups and Instagram every day. Repeat customers come back to the same store instead of your DMs.' },
      ],
    },
    faqs: [
      { q: 'Can I start reselling in Kerala with no investment?', a: 'Registration on Kerala Sellers is free, and your store goes live on plans from ₹99/month. Because customers pay online before you order from your supplier, you do not need to hold stock or spend money upfront.' },
      { q: 'Does Kerala Sellers provide products or dropshipping suppliers?', a: 'No. Kerala Sellers gives you the store, payments, and order management. You choose your own supplier and decide what to sell, which keeps your margin and your customers with you.' },
      { q: 'How is this different from reseller apps like Meesho?', a: 'Reseller apps own the customer and control the margin. With Kerala Sellers you have your own branded store, set your own prices, and pay a flat monthly fee with 0% commission.' },
      { q: 'Can I do dropshipping in Kerala with Kerala Sellers?', a: 'Yes, if your supplier can ship directly to your customer. Take the order and payment on your store, then pass the delivery details to your supplier. You stay in control of pricing and customer communication.' },
      { q: 'Do I need GST to resell online?', a: 'No GST number is needed to sign up. Whether you need GST depends on your turnover and what you sell, so check with a tax professional as your business grows.' },
    ],
    links: [
      { href: '/for/home-businesses', label: 'Home Based Business' },
      { href: '/for/whatsapp-sellers', label: 'WhatsApp Sellers' },
      { href: '/for/instagram-sellers', label: 'Instagram Sellers' },
      { href: '/sell-online-kerala', label: 'Sell Online in Kerala' },
      { href: '/register/seller', label: 'Start Free' },
    ],
  },

  'list-your-business-kerala': {
    slug: 'list-your-business-kerala',
    meta: {
      title: 'List Your Business Online in Kerala | Kerala Sellers',
      description: 'Submit your business online in Kerala: free sign-up, your own shop page, a place in the Kerala shops directory, and online orders. Live from ₹99/month.',
    },
    hero: {
      badge: '📍 For Kerala Businesses',
      h1: ['List Your Business Online ', 'in Kerala'],
      sub: 'Get your Kerala business in front of buyers with more than a listing. Kerala Sellers gives you a shop page with your products, prices, contact details, and online ordering, all at one link.',
      pills: ['✓ Free sign-up', '✓ Your own shop page', '✓ Kerala shops directory', '✓ Online orders & UPI'],
    },
    stats: [
      { n: 'Free', l: 'Registration' },
      { n: '0%', l: 'Commission' },
      { n: '10 min', l: 'Setup' },
      { n: '14', l: 'Districts Served' },
    ],
    problems: [
      { emoji: '😩', problem: 'Business directories only show your phone number, so customers still have to call to ask what you sell', solution: 'Your shop page shows every product with photos and prices, so customers know what you sell before they call.' },
      { emoji: '💸', problem: 'Paying for a website you cannot update yourself', solution: 'Update products, prices, and stock from your phone. No developer, hosting, or one-time website bill.' },
      { emoji: '😵', problem: 'Customers find you online but cannot order or pay', solution: 'Buyers add to cart and pay by UPI, card, or net banking. Orders reach your dashboard instantly.' },
      { emoji: '🌐', problem: 'Your business is hard to share — there is no single link to send', solution: 'One link for WhatsApp, Instagram, Google Business Profile, and visiting cards.' },
    ],
    features: [
      { emoji: '🏪', title: 'Your Business Shop Page', desc: 'A page at keralasellers.in/shop/yourname with your logo, banner, description, products, and contact options.' },
      { emoji: '📍', title: 'Listed in the Kerala Shops Directory', desc: 'Live shops appear in the Kerala Sellers shops directory so local buyers can discover you.' },
      { emoji: '🛒', title: 'Online Orders and Payments', desc: 'Accept orders with UPI, cards, net banking, or cash on delivery, with 0% commission.' },
      { emoji: '🧾', title: 'Billing for Walk-in Customers', desc: 'Use the same app for counter billing with a Bluetooth thermal printer, and keep stock in sync.' },
      { emoji: '🔎', title: 'Search-Friendly Shop Page', desc: 'Each live shop page has its own title, description, and structured data so it can show up in Google search.' },
    ],
    guide: {
      eyebrow: 'HOW TO LIST YOUR BUSINESS',
      title: 'Submit Your Business Online in Kerala in 4 Steps',
      lead: 'Everything happens on your phone. Most businesses finish in about 10 minutes.',
      items: [
        { title: '1. Register Free', desc: 'Sign up as a seller with your phone number and business name. No GST or registration certificate is needed to start.' },
        { title: '2. Add Your Details', desc: 'Upload your logo and banner, write a short description, and add your WhatsApp number and address.' },
        { title: '3. Add Products', desc: 'List what you sell with photos and prices. Start with your best sellers and add more later.' },
        { title: '4. Go Live and Share', desc: 'Pick a plan from ₹99/month to publish your shop, then share the link on WhatsApp, Instagram, and your Google Business Profile.' },
      ],
    },
    faqs: [
      { q: 'Can I add my business online in Kerala for free?', a: 'Registration is free, and you can set up your shop page, products, and details at no cost. To publish the shop and accept orders, choose a plan starting at ₹99/month with 0% commission.' },
      { q: 'Is this the same as a Google Business Profile listing?', a: 'No, and you should use both. Google Business Profile shows your location on Maps. Your Kerala Sellers shop page shows your products and takes orders. Add your shop link to your Google profile so searchers can order directly.' },
      { q: 'Which businesses can list on Kerala Sellers?', a: 'Shops and sellers who sell products: retail stores, boutiques, bakeries, home businesses, resellers, and Instagram or WhatsApp sellers across all 14 districts of Kerala.' },
      { q: 'Do I need GST or a trade licence to list my business?', a: 'No documents are needed to sign up. Follow the licences your business type needs, such as FSSAI for food, as you grow.' },
    ],
    links: [
      { href: '/shop', label: 'Kerala Shops Directory' },
      { href: '/for/small-businesses', label: 'Small Businesses' },
      { href: '/for/home-businesses', label: 'Home Based Business' },
      { href: '/features/online-store-builder', label: 'Store Builder' },
      { href: '/register/seller', label: 'Start Free' },
    ],
  },
};
