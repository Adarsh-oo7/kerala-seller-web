import Header from '../common/Header';
import Footer from '../common/Footer';
import Link from 'next/link';

/**
 * Shared layout shell for all SEO marketing pages.
 * Renders Header + Footer + breadcrumb + consistent wrapper.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {Array<{label: string, href?: string}>} props.breadcrumbs - e.g. [{label:'Home',href:'/'},{label:'Solutions'}]
 * @param {string} [props.className] - extra class on the page wrapper
 */
export default function SeoPageLayout({ children, breadcrumbs = [], className = '' }) {
  return (
    <div className={`seo-page ${className}`}>
      <Header />

      {breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="seo-breadcrumb">
          <ol className="seo-breadcrumb__list">
            {breadcrumbs.map((crumb, i) => (
              <li key={i} className="seo-breadcrumb__item">
                {crumb.href ? (
                  <Link href={crumb.href} className="seo-breadcrumb__link">{crumb.label}</Link>
                ) : (
                  <span aria-current="page">{crumb.label}</span>
                )}
                {i < breadcrumbs.length - 1 && (
                  <span className="seo-breadcrumb__sep" aria-hidden="true"> / </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <main>{children}</main>

      <Footer />
    </div>
  );
}
