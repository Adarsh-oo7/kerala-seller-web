import { organizationJsonLd } from '../../app/lib/brand';

export default function OrganizationJsonLd() {
  const data = organizationJsonLd();
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
