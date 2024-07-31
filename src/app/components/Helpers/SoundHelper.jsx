import { useEffect, useRef } from 'react';
import { useGameContext } from '../Context';
import { imgPrefix } from '../Overlays';

export default function SoundHelper() {
  const { audioVolume } = useGameContext();
  const audioRef = useRef(null);

  // Change audio volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = audioVolume ?? 0.5;
  }, [audioVolume]);

  return (
    <audio ref={audioRef} className='hidden' loop autoPlay>
      <source src={`${imgPrefix}sounds/soundtrack-3.mp3`} type='audio/mp3' />
      <track kind='captions' label='Soundtrack 1' />
      Your browser does not support the audio element.
    </audio>
  );
}
