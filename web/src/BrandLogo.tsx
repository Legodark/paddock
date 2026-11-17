import { useState } from 'react';
import { BRAND_LOGOS } from './brand-logos';
import Icon from './Icon';

function LogoImage({ source }: { source?: string }) {
  const [failed, setFailed] = useState(false);
  return <span className={`brand-logo${!source || failed ? ' brand-logo--fallback' : ''}`} aria-hidden="true">
    {source && !failed
      ? <img src={source} alt="" width="32" height="32" decoding="async" onError={() => setFailed(true)} />
      : <Icon name="car" />}
  </span>;
}

// Decorative: the select or vehicle name already provides the brand in text.
// Only audited local URLs can be used, including when a catalogue is extended.
export default function BrandLogo({ brandId, brandName }: { brandId: string; brandName?: string }) {
  const entry = Object.hasOwn(BRAND_LOGOS, brandId) ? BRAND_LOGOS[brandId] : undefined;
  const source = entry && (brandName === undefined || brandName === entry.brand) ? entry.src : undefined;
  return <LogoImage key={source ?? 'fallback'} source={source} />;
}
