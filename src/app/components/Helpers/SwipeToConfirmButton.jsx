import { useCallback, useEffect, useRef, useState } from 'react';

export default function SwipeToConfirmButton({ children, onConfirm = () => {}, onReset = () => {}, onError = () => {} }) {
  const container = useRef(null),
    slider = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [sliderLeft, setSliderLeft] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const onDrag = useCallback(
      (e) => {
        if (isDragging) {
          setSliderLeft(Math.min(Math.max(0, e.clientX - startX), containerWidth));
        }
      },
      [isDragging, containerWidth, startX]
    ),
    stopDrag = useCallback(() => {
      if (isDragging) {
        setIsDragging(false);
        if (sliderLeft > containerWidth - 75) {
          onConfirm();
        } else {
          onError();
        }
        setSliderLeft(0);
      }
    }, [isDragging, containerWidth, sliderLeft, onConfirm, onError]),
    startDrag = useCallback(
      (e) => {
        onReset();
        setIsDragging(true);
        setStartX(e.clientX);
      },
      [onReset]
    );

  // Get container width
  useEffect(() => setContainerWidth(container.current.offsetWidth), []);

  return (
    <div className='w-full max-w-[400px] mx-[50px] select-none'>
      <div
        ref={container}
        className='w-full py-4 border-2 border-cyan-400/70 bg-cyan-300/10 rounded-3xl relative overflow-hidden'
      >
        <div
          ref={slider}
          className='w-[75px] h-full bg-cyan-400/70 rounded-2xl absolute top-0 flex items-center justify-center text-white text-xl'
          style={{ left: Math.min(sliderLeft, containerWidth - 75) + 'px', cursor: isDragging ? 'grabbing' : 'grab' }}
          onPointerDown={startDrag}
          onPointerMove={onDrag}
          onPointerUp={stopDrag}
          onPointerLeave={stopDrag}
        >
          &#x2192;
        </div>
        <div className='text-center uppercase'>{children}</div>
      </div>
    </div>
  );
}
