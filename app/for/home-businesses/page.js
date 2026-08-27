import ForPageTemplate from '../../../components/seo/ForPageTemplate';
import { FOR_PAGES } from '../for-pages-data';

export default function HomeBusinessesPage() {
  return <ForPageTemplate data={FOR_PAGES['home-businesses']} breadcrumbLabel="Home Businesses" />;
}
