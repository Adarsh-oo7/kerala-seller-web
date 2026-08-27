import ForPageTemplate from '../../../components/seo/ForPageTemplate';
import { FOR_PAGES } from '../for-pages-data';

export default function SmallBusinessesPage() {
  return <ForPageTemplate data={FOR_PAGES['small-businesses']} breadcrumbLabel="Small Businesses" />;
}
