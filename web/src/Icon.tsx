import type { ReactNode } from 'react';

export type IconName = 'arrow' | 'car' | 'check' | 'info' | 'github' | 'clock' | 'database' | 'chevron' | 'reset' | 'sliders' | 'dog' | 'close';
const paths: Record<IconName, ReactNode> = {
  dog: <>
    <path d="M5 8c1-1.7 2.7-2.7 4.8-2.9L8.5 3c2.5.2 4.4 1.1 5.5 2.4l2.5-1.2.2 1.9A7 7 0 0 1 19 8c1.9 2.6 3.4 6.7 2.6 9-.8 2.4-3.4 1.4-4-1.5M5 8c-1.9 2.6-3.4 6.7-2.6 9 .8 2.4 3.4 1.4 4-1.5" />
    <path d="M6.4 15.5c.4 2.7 2.1 4.3 3.5 4.9l.6-1 1.5 1.8 1.5-1.8.6 1c1.4-.6 3.1-2.2 3.5-4.9M8 9.5c1.4-.1 2.6-.9 3.6-2l.2 2.1c1.6-.1 2.9-.7 3.8-1.5M8.5 12h.1m6.8 0h.1m-3.5 3c-.5 1.1-1.4 1.5-2.5 1.4m2.5-1.4c.5 1.1 1.4 1.5 2.5 1.4" />
    <ellipse cx="12" cy="14.3" rx="1.6" ry="1" fill="currentColor" stroke="none" />
  </>,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  arrow: <><path d="M4 12h15M13 5l7 7-7 7" /></>,
  car: <><path d="m4 10 2-5h12l2 5M3 10h18v8H3zM6 18v2M18 18v2M6 14h2M16 14h2" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7v.1" /></>,
  github: <><path d="M9 19c-5 1-5-2-7-2m14 5v-4a4 4 0 0 0-1-3c3-.4 6-1.5 6-6a5 5 0 0 0-1-3 4.5 4.5 0 0 0-.1-3s-1 0-3 1a11 11 0 0 0-6 0c-2-1-3-1-3-1A4.5 4.5 0 0 0 8 6a5 5 0 0 0-1 3c0 4.5 3 5.6 6 6a4 4 0 0 0-1 3v4" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  database: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0" /></>,
  chevron: <path d="m8 5 7 7-7 7" />,
  reset: <><path d="M3 11a9 9 0 1 1 2 7M3 4v7h7" /></>,
  sliders: <><path d="M4 6h16M4 12h16M4 18h16" /><path d="M8 3v6M16 9v6M10 15v6" /></>,
};
export default function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}
