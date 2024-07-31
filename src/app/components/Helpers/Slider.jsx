export default function Slider({
  children,
  value = 50,
  min = 0,
  max = 100,
  step = 1,
  onChange = () => {},
  title = undefined,
  ...props
}) {
  return (
    <button
      className='px-7 py-4 border-2 rounded-3xl border-cyan-400/70 bg-cyan-300/10 hover:bg-cyan-300/40 duration-300 w-full max-w-[400px] text-center uppercase'
      {...props}
    >
      {title ? <div className='mb-2'>{title}</div> : null}
      <input
        className='w-full accent-cyan-400/70'
        type='range'
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
      />
    </button>
  );
}
