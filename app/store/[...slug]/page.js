import { redirect } from 'next/navigation';

export default async function LegacyStorePath({ params }) {
  const resolved = await params;
  const parts = resolved?.slug;
  const path = Array.isArray(parts) ? parts.filter(Boolean).join('/') : parts;
  redirect(path ? `/shop/${path}` : '/shop');
}
