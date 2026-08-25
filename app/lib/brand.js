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
  sellerLoginPlans:
    '/login/seller?redirect=' + encodeURIComponent('/dashboard/seller/subscription'),
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
    name: BRAND.name,
    url: BRAND.url,
    email: BRAND.email,
    telephone: BRAND.phoneTel,
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
