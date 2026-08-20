export const PLATFORM_NAME = 'Kerala Sellers';
export const PLATFORM_URL = 'https://www.keralasellers.in';

export const PLATFORM_DISCLAIMER =
  `${PLATFORM_NAME} (${PLATFORM_URL}) provides software tools so independent sellers can run their own shops. Kerala Sellers is not the seller, manufacturer, or delivery partner for a shop. If a buyer has a problem with an order, the complaint is against that seller. Kerala Sellers may ask the seller for clarification, suspend the shop, or remove the seller. Kerala Sellers is not responsible for the seller's products, prices, stock, packing, shipping, GST, refunds, or buyer–seller disputes.`;

export const POLICY_FIELDS = [
  {
    key: 'terms_and_conditions',
    title: 'Terms and conditions',
    path: 'terms-and-conditions',
    hint: 'Who is the seller, how orders work, and that Kerala Sellers is only the software.',
  },
  {
    key: 'privacy_policy',
    title: 'Privacy policy',
    path: 'privacy-policy',
    hint: 'What this shop collects, and that Kerala Sellers runs the platform.',
  },
  {
    key: 'cancellation_refund_policy',
    title: 'Cancellation and refund',
    path: 'cancellation-refund',
    hint: 'Refunds are the seller’s job. Kerala Sellers can only review a complaint.',
  },
  {
    key: 'shipping_delivery_policy',
    title: 'Shipping and delivery',
    path: 'shipping-delivery',
    hint: 'This seller packs and sends orders. Charges follow Delivery settings.',
  },
];

function shopName(store) {
  return String(store?.name || 'this shop').trim() || 'this shop';
}

export function defaultTerms(name = 'this shop') {
  return `Terms and conditions — ${name}

These terms apply to purchases from ${name} on ${PLATFORM_NAME}.

1. Independent seller
${name} owns and operates this shop. ${PLATFORM_NAME} only provides the website and app as a SaaS tool. We are not a party to the sale.

2. Products and prices
The seller is responsible for product details, quality, stock, photos, and prices shown in this shop.

3. Orders and payment
An order is an agreement between the buyer and this seller. Payment is collected for this seller.

4. If something goes wrong
Contact this seller first using the shop WhatsApp or your order details. You may also report the shop to ${PLATFORM_NAME}. We may ask the seller to explain, or we may suspend or remove the shop. ${PLATFORM_NAME} does not take over the order, replace the product, or pay compensation on behalf of the seller.

5. Changes
The seller may update these terms. The version shown when you place the order applies to that order.

${PLATFORM_DISCLAIMER}
`;
}

export function defaultPrivacy(name = 'this shop') {
  return `Privacy policy — ${name}

1. Who we are
${name} uses ${PLATFORM_NAME} software to run this shop.

2. Data this shop uses
This shop may collect your name, phone, address, and order details so the seller can deliver products and support you.

3. Platform data
${PLATFORM_NAME} stores account and order data needed to run the software. See the ${PLATFORM_NAME} privacy policy on ${PLATFORM_URL} for platform-level data.

4. Sharing
Order details are shared with this seller so they can fulfil the order. ${PLATFORM_NAME} does not sell your data.

5. Questions
Privacy questions about an order should go to this seller. Platform questions can be sent to ${PLATFORM_NAME}. ${PLATFORM_NAME} is not responsible for how an independent seller uses information after they receive an order.

${PLATFORM_DISCLAIMER}
`;
}

export function defaultRefund(name = 'this shop') {
  return `Cancellation and refund — ${name}

1. Seller is responsible
Refunds, replacements, and cancellations for this shop are decided and processed by ${name}, not by ${PLATFORM_NAME}.

2. How to request
Contact this seller with your order number. The seller should confirm whether a cancel, replace, or refund applies.

3. Platform role
If the seller does not respond, or there is fraud or a serious complaint, report it to ${PLATFORM_NAME}. We may ask the seller for clarification or remove the shop. We do not automatically refund from ${PLATFORM_NAME} funds.

4. Payment
Refund timing depends on the seller and the payment method (for example Razorpay or cash on delivery).

${PLATFORM_DISCLAIMER}
`;
}

export function defaultShipping(name = 'this shop') {
  return `Shipping and delivery — ${name}

1. Seller arranges delivery
${name} is responsible for packing and sending orders. ${PLATFORM_NAME} does not deliver products.

2. Charges
Delivery charge, free-delivery rules, and extra COD charges follow this shop's Delivery settings. Several products in one order use the combined packed weight.

3. Time
Any delivery time shown in the shop is an estimate from this seller.

4. Problems
Delayed, damaged, or missing parcels should be raised with this seller. You may report the shop to ${PLATFORM_NAME}. We may ask for clarification or remove the shop. We are not the courier and are not liable for delivery failure.

${PLATFORM_DISCLAIMER}
`;
}

const DEFAULT_BUILDERS = {
  terms_and_conditions: defaultTerms,
  privacy_policy: defaultPrivacy,
  cancellation_refund_policy: defaultRefund,
  shipping_delivery_policy: defaultShipping,
};

export function defaultPolicy(key, name = 'this shop') {
  const builder = DEFAULT_BUILDERS[key];
  return builder ? builder(name).trim() : '';
}

export function policyBody(store, key) {
  const custom = String(store?.[key] || '').trim();
  if (custom) return custom;
  return defaultPolicy(key, shopName(store));
}

export function emptyPolicies() {
  return {
    terms_and_conditions: '',
    privacy_policy: '',
    cancellation_refund_policy: '',
    shipping_delivery_policy: '',
  };
}

export function policiesFromStore(store) {
  const name = shopName(store);
  return {
    terms_and_conditions: String(store?.terms_and_conditions || '').trim() || defaultTerms(name),
    privacy_policy: String(store?.privacy_policy || '').trim() || defaultPrivacy(name),
    cancellation_refund_policy: String(store?.cancellation_refund_policy || '').trim() || defaultRefund(name),
    shipping_delivery_policy: String(store?.shipping_delivery_policy || '').trim() || defaultShipping(name),
  };
}

export function platformPolicy(path) {
  if (path === 'privacy-policy') {
    return {
      title: 'Privacy policy',
      body: `Privacy policy — ${PLATFORM_NAME}

${PLATFORM_NAME} provides SaaS tools for independent sellers. We collect account, shop, and order information needed to run the website, app, payments, and support.

1. Shop data
When you buy from a shop, that seller also receives the details they need to fulfil the order. Each seller is responsible for how they handle that information.

2. We do not sell personal data
We use data to operate the platform, prevent fraud, and improve the service.

3. Account deletion
Sellers can close their Kerala Sellers account in the Android app (More → Delete account) or on ${PLATFORM_URL}/delete-account. Login is disabled and the public shop is hidden. Order and bill records needed for GST, disputes, or the law may be kept.

4. Questions
Platform privacy questions can be sent through ${PLATFORM_URL}. Order privacy questions should go to the seller of that shop.

${PLATFORM_DISCLAIMER}
`,
    };
  }
  if (path === 'cancellation-refund') {
    return {
      title: 'Cancellation and refund',
      body: `Cancellation and refund — ${PLATFORM_NAME}

${PLATFORM_NAME} subscription charges are for software access. Product refunds belong to the seller who took the order.

If a buyer needs to cancel or refund an order, they must contact that seller. If the seller does not respond, report the shop to ${PLATFORM_NAME}. We may ask for clarification or remove the shop. We do not automatically pay the buyer's refund from ${PLATFORM_NAME} funds.

${PLATFORM_DISCLAIMER}
`,
    };
  }
  if (path === 'shipping-delivery') {
    return {
      title: 'Shipping and delivery',
      body: `Shipping and delivery — ${PLATFORM_NAME}

${PLATFORM_NAME} does not pack, ship, or deliver products. Each seller sets their own delivery charges, free-delivery rules, and delivery time estimates in Delivery settings.

Delivery problems should be raised with that seller. ${PLATFORM_NAME} may review a complaint and ask the seller for clarification or remove the shop. We are not the courier.

${PLATFORM_DISCLAIMER}
`,
    };
  }
  return {
    title: 'Terms and conditions',
    body: `Terms and conditions — ${PLATFORM_NAME}

${PLATFORM_NAME} is a SaaS platform. We provide software so independent sellers in Kerala and across India can create a shop, list products, take orders, and manage delivery settings.

1. We are not the seller
Each shop on ${PLATFORM_URL} is owned and operated by that seller. ${PLATFORM_NAME} does not sell those products, hold that stock, or fulfil those orders.

2. Buyer complaints
If something goes wrong with a product, price, payment, delivery, refund, or delay, the buyer should contact that seller. The buyer may also report the shop to ${PLATFORM_NAME}. We may ask the seller for clarification, suspend the shop, or remove the seller. We are not responsible for the seller's goods or services.

3. Seller accounts
Sellers must give accurate business details. We may refuse, suspend, or remove a shop for fraud, policy breach, or unresolved buyer complaints.

4. Software only
Using ${PLATFORM_NAME} does not make us a marketplace merchant of record, a courier, or a guarantor. Subscription fees pay for the software tools.

${PLATFORM_DISCLAIMER}
`,
  };
}
