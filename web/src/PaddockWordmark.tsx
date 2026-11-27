import { useRef, useState } from 'react';
import deloreanImage from './assets/delorean.webp?no-inline';

// The time-count animation advances through these eight transitions.
const speeds = ['00', '12', '24', '36', '48', '60', '72', '84', '88'];

export default function PaddockWordmark() {
  const [trip, setTrip] = useState(0);
  const landed = useRef(false);

  function replay() {
    if (!landed.current) return;
    landed.current = false;
    setTrip(current => current + 1);
  }

  return <a className="wordmark" href="#inicio" aria-label="Paddock, inicio" onMouseEnter={replay} onFocus={replay} onClick={replay}>
    <span key={trip} className="brand-lockup" aria-hidden="true">
      <span className="brand-name">PADDOCK<span className="brand-trail"><span className="brand-bolt" /></span></span>
      <span className="brand-car">
        <span className="brand-speedometer">
          <span className="brand-speed-window"><span className="brand-speed-values">
            {speeds.map(speed => <span key={speed}>{speed}</span>)}
          </span></span>
          <span className="brand-speed-unit">MPH</span>
        </span>
        <span className="brand-vehicle" onAnimationEnd={event => {
          if (event.animationName === 'time-jump') landed.current = true;
        }}>
          <img src={deloreanImage} width="180" height="61" alt="" />
          <span className="brand-charge" />
        </span>
      </span>
    </span>
  </a>;
}
