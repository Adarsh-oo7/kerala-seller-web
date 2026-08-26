import { BRAND } from './lib/brand';

export default function sitemap() {
  const lastModified = new Date();
  return [
    { url: `${BRAND.url}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${BRAND.url}/sell-online-kerala`, lastModified, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${BRAND.url}/products`, lastModified, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BRAND.url}/shop`, lastModified, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BRAND.url}/about`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BRAND.url}/contact`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BRAND.url}/register/seller`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
  ];
}
