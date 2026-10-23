'use client';

import { useEffect, useState } from 'react';

type Banner = { id: string; title: string; subtitle: string | null; imagePath: string };

export function BannerSlider({ banners }: { banners: Banner[] }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(() => setActive((value) => (value + 1) % banners.length), 5500);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banners.length) return null;
  const banner = banners[active] || banners[0];
  return (
    <div className="banner-wrap">
      <div className="banner-slide">
        <img src={banner.imagePath} alt={banner.title} width={1660} height={947} fetchPriority="high" />
        <div className="banner-caption">
          <strong>{banner.title}</strong>
          {banner.subtitle ? <p>{banner.subtitle}</p> : null}
        </div>
      </div>
      {banners.length > 1 ? (
        <div className="banner-dots" aria-label="Pilih banner">
          {banners.map((item, index) => (
            <button key={item.id} type="button" className={index === active ? 'active' : ''} onClick={() => setActive(index)} aria-label={`Banner ${index + 1}`} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
