import ForPageTemplate from '../../../components/seo/ForPageTemplate';
import { FOR_PAGES } from '../for-pages-data';

export default function ResellersPage() {
  return <ForPageTemplate data={FOR_PAGES['resellers']} breadcrumbLabel="Resellers" />;
}
