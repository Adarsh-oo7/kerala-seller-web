import { BRAND } from '../../lib/brand';

const PAGE_URL = `${BRAND.url}/about/project-development`;

export const metadata = {
  title: 'Kerala Sellers Project Development & Technical Case Study | Digital Product Solutions',
  description:
    'An inside look at how Kerala Sellers was engineered: architectural overview, Next.js frontend, Python/Django API, mobile POS Bluetooth thermal printing, and developer attribution to Adarsh B S and Digital Product Solutions.',
  alternates: {
    canonical: PAGE_URL,
    languages: { 'en-IN': PAGE_URL, 'x-default': PAGE_URL },
  },
  openGraph: {
    title: 'Kerala Sellers Project Development & Technical Case Study',
    description:
      'Explore the engineering, architecture, and technology stack behind Kerala Sellers — an affordable, multi-tenant ecommerce and billing platform for Kerala merchants.',
    url: PAGE_URL,
    siteName: BRAND.name,
    locale: 'en_IN',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kerala Sellers Project Development & Technical Case Study',
    description:
      'Architecture, technology stack, and engineering background of Kerala Sellers by Digital Product Solutions and Adarsh B S.',
  },
  robots: { index: true, follow: true },
};

function ProjectDevelopmentJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': PAGE_URL,
    },
    headline: 'Kerala Sellers: Architecture, Engineering & Development Case Study',
    description: metadata.description,
    url: PAGE_URL,
    inLanguage: 'en-IN',
    author: {
      '@type': 'Person',
      name: BRAND.developer.name,
      jobTitle: 'Founder & Lead Developer',
      url: BRAND.developer.portfolio,
      sameAs: BRAND.developer.portfolio,
    },
    publisher: {
      '@type': 'Organization',
      name: BRAND.parent.name,
      url: BRAND.parent.url,
      sameAs: BRAND.parent.url,
      logo: {
        '@type': 'ImageObject',
        url: `${BRAND.url}/assets/images/logo/KERALA%20SELLERS%20transp.png`,
      },
    },
    about: {
      '@type': 'SoftwareApplication',
      name: BRAND.name,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web, Android',
      offers: {
        '@type': 'Offer',
        price: '99',
        priceCurrency: 'INR',
      },
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BRAND.url },
        { '@type': 'ListItem', position: 2, name: 'About', item: `${BRAND.url}/about` },
        { '@type': 'ListItem', position: 3, name: 'Project Development', item: PAGE_URL },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function ProjectDevelopmentLayout({ children }) {
  return (
    <>
      <ProjectDevelopmentJsonLd />
      {children}
    </>
  );
}
