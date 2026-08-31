'use client';

import { useState } from 'react';
import { Play, CheckCircle2, X, Film } from 'lucide-react';

/**
 * Reusable Demo Video Section Component for KeralaSellers marketing pages.
 * Supports embedded video playback, responsive 16:9 thumbnail preview,
 * page-specific titles, and clean SaaS modal view.
 */
export default function DemoVideoSection({
  title = 'See KeralaSellers in Action',
  subtitle = 'Watch how a seller can manage their entire business from a mobile phone.',
  videoTitle = 'How KeralaSellers Works — 60 Second Overview',
  badge = 'SEE HOW IT WORKS',
  youtubeId = 'ggkqC6ALK_c', // Official @KeralaSellers channel video ID
  videoUrl, // Direct video URL if provided
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  const videoSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: videoTitle,
    description: subtitle,
    thumbnailUrl: [
      `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`,
      `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    ],
    uploadDate: '2026-08-30T00:00:00+05:30',
    embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeId}`,
    contentUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
    publisher: {
      '@type': 'Organization',
      name: 'Kerala Sellers',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.keralasellers.in/assets/images/logo.png',
      },
    },
  };

  return (
    <section className="seo-video-section" aria-labelledby="video-section-title">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
      />
      <div className="seo-video-section__inner">
        <div className="seo-video-section__header">
          <span className="seo-video-section__badge">
            <Film size={14} />
            <span>{badge}</span>
          </span>
          <h2 className="seo-video-section__h2" id="video-section-title">
            {title}
          </h2>
          <p className="seo-video-section__sub">{subtitle}</p>
        </div>

        <div className="seo-video-card">
          {!isPlaying ? (
            <div
              className="seo-video-card__thumbnail"
              onClick={() => setIsPlaying(true)}
              role="button"
              tabIndex={0}
              aria-label={`Play video: ${videoTitle}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setIsPlaying(true);
              }}
            >
              {/* Decorative Mockup Backdrop */}
              <div className="seo-video-card__backdrop">
                <div className="seo-video-card__grid-pattern" />
                <div className="seo-video-card__badge-tag">
                  <span className="seo-video-card__dot" /> 60-Sec Mobile Demo
                </div>
              </div>

              {/* Play Button Overlay */}
              <div className="seo-video-card__play-wrapper">
                <div className="seo-video-card__play-btn">
                  <Play size={28} className="seo-video-card__play-icon" />
                </div>
                <span className="seo-video-card__play-text">Click to Watch Demo</span>
              </div>

              {/* Video Info Overlay */}
              <div className="seo-video-card__info">
                <h3 className="seo-video-card__info-title">{videoTitle}</h3>
                <p className="seo-video-card__info-desc">
                  No coding required • 100% Smartphone Optimised • Free Setup
                </p>
              </div>
            </div>
          ) : (
            <div className="seo-video-card__player-wrapper">
              <button
                type="button"
                className="seo-video-card__close-btn"
                onClick={() => setIsPlaying(false)}
                aria-label="Close video player"
              >
                <X size={20} /> Close Video
              </button>
              {videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  className="seo-video-card__iframe"
                />
              ) : (
                <iframe
                  className="seo-video-card__iframe"
                  src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
                  title={videoTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          )}
        </div>

        {/* Key Takeaways under video */}
        <div className="seo-video-section__features">
          <div className="seo-video-feat">
            <CheckCircle2 size={18} color="#10b981" />
            <span>Zero technical skills needed</span>
          </div>
          <div className="seo-video-feat">
            <CheckCircle2 size={18} color="#10b981" />
            <span>Runs 100% on any mobile phone</span>
          </div>
          <div className="seo-video-feat">
            <CheckCircle2 size={18} color="#10b981" />
            <span>Launch your store in 10 minutes</span>
          </div>
        </div>
      </div>
    </section>
  );
}
