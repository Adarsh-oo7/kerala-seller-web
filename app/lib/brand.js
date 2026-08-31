/** Official Kerala Sellers brand, parent company, founders, and public profiles. */

export const BRAND = {
  name: 'Kerala Sellers',
  url: 'https://www.keralasellers.in',
  email: 'keralasellers.in@gmail.com',
  phoneDisplay: '+91 94003 55185',
  phoneTel: '+919400355185',
  parent: {
    name: 'Digital Product Solutions',
    url: 'https://www.digitalproductsolutions.in/',
  },
  founders: [
    {
      name: 'Adarsh B S',
      role: 'Founder & CEO',
      focus: 'Strategy and growth',
      quote:
        'I am building KeralaSellers.in to make it easy for small businesses in our state to grow online without middlemen or commission cuts.',
    },
    {
      name: 'Aromal V G',
      role: 'Co-Founder',
      focus: 'Tech and product',
      quote:
        'Every Kerala reseller deserves the tools to succeed digitally. We are here to make that a reality for our local business community.',
    },
  ],
  profiles: {
    linkedin: 'https://www.linkedin.com/showcase/kerala-sellers/',
    google: 'https://share.google/rk3cZs3gbwWCoyE59',
    instagram: 'https://www.instagram.com/kerala_sellers/',
    instagramAlt: 'https://www.instagram.com/kerala__sellers/',
    facebook: 'https://www.facebook.com/profile.php?id=61586008980027',
    youtube: 'https://www.youtube.com/@KeralaSellers',
    prebook: 'https://prebook.keralasellers.in/',
  },
  sellerStart: '/register/seller',
  sellerLoginPlans: '/login/seller',
};

export const BRAND_SAME_AS = [
  BRAND.profiles.linkedin,
  BRAND.profiles.google,
  BRAND.profiles.instagram,
  BRAND.profiles.instagramAlt,
  BRAND.profiles.facebook,
  BRAND.profiles.youtube,
  BRAND.profiles.prebook,
  BRAND.parent.url,
];

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BRAND.url}/#organization`,
    name: BRAND.name,
    alternateName: ['Kerala Sellers', 'KeralaSellers.in', 'KS'],
    url: BRAND.url,
    logo: {
      '@type': 'ImageObject',
      url: `${BRAND.url}/assets/images/logo/KERALA SELLERS transp.png`,
      width: 400,
      height: 120,
    },
    email: BRAND.email,
    telephone: BRAND.phoneTel,
    foundingDate: '2024',
    numberOfEmployees: { '@type': 'QuantitativeValue', value: 12 },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kochi',
      addressRegion: 'Kerala',
      addressCountry: 'IN',
    },
    areaServed: [
      { '@type': 'State', name: 'Kerala' },
      { '@type': 'Country', name: 'India' },
    ],
    knowsAbout: [
      'E-commerce for small businesses',
      'Instagram seller tools',
      'WhatsApp commerce',
      'Zero commission marketplace',
      'Kerala local products',
      'Online store builder',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: BRAND.phoneTel,
        contactType: 'customer support',
        areaServed: 'IN',
        availableLanguage: ['English', 'Malayalam'],
      },
      {
        '@type': 'ContactPoint',
        email: BRAND.email,
        contactType: 'customer support',
      },
    ],
    sameAs: BRAND_SAME_AS,
    parentOrganization: {
      '@type': 'Organization',
      name: BRAND.parent.name,
      url: BRAND.parent.url,
    },
    founder: BRAND.founders.map((person) => ({
      '@type': 'Person',
      name: person.name,
      jobTitle: person.role,
    })),
  };
}

