'use client';

import { Star, MapPin } from 'lucide-react';

/**
 * Seller Social Proof / Testimonials grid component.
 */
export default function TestimonialsGrid({
  title = 'Trusted by Sellers Across Kerala',
  subtitle = 'See how home bakers, Instagram boutiques, and local shop owners run their business with KeralaSellers.',
  testimonials = [
    {
      name: 'Priya R.',
      business: 'Handmade Jewellery & Crafts',
      location: 'Kochi, Kerala',
      text: 'I used to spend hours answering DM inquiries on Instagram. Now I put my KeralaSellers store link in my bio, customers pick items and checkout directly. It cut my order handling time by 80%!',
      rating: 5,
    },
    {
      name: 'Anil Kumar',
      business: 'Retail & Gourmet Bakery',
      location: 'Calicut, Kerala',
      text: 'Having counter POS billing and my online WhatsApp catalogue share the same stock inventory means no double entries and zero overselling. Very easy for non-technical shop owners.',
      rating: 5,
    },
    {
      name: 'Fathima S.',
      business: 'Boutique & Sarees',
      location: 'Trivandrum, Kerala',
      text: 'Zero commission makes a huge difference compared to Meesho or Amazon. I keep 100% of my revenue and money goes straight to my bank via Razorpay UPI.',
      rating: 5,
    },
  ],
}) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="seo-section">
      <div className="seo-section__header">
        <p className="seo-section__eyebrow">SELLER STORIES &amp; REVIEWS</p>
        <h2 className="seo-section__h2">{title}</h2>
        {subtitle && <p className="seo-section__lead">{subtitle}</p>}
      </div>

      <div className="seo-testimonials-grid">
        {testimonials.map((t, idx) => (
          <div key={idx} className="seo-testimonial-card">
            <div className="seo-testimonial-card__stars">
              {[...Array(t.rating || 5)].map((_, i) => (
                <Star key={i} size={16} color="#f59e0b" fill="#f59e0b" />
              ))}
            </div>
            <p className="seo-testimonial-card__text">&ldquo;{t.text}&rdquo;</p>
            <div className="seo-testimonial-card__author">
              <div className="seo-testimonial-card__avatar">{t.name.charAt(0)}</div>
              <div>
                <h4 className="seo-testimonial-card__name">{t.name}</h4>
                <p className="seo-testimonial-card__business">{t.business}</p>
                <span className="seo-testimonial-card__location">
                  <MapPin size={12} /> {t.location}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
