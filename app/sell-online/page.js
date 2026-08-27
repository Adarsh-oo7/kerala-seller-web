import { redirect } from 'next/navigation';

// /sell-online → permanent redirect to /sell-online-kerala
// Preserves any external links using /sell-online, passes SEO equity to the existing page.
export default function SellOnlineRedirectPage() {
  redirect('/sell-online-kerala');
}
