export default function Slider({ label, value, onChange }) {
  return (
    <label className='flex w-full items-center gap-4'>
      <span className='label w-28 shrink-0'>{label}</span>
      <input
        type='range'
        min={0}
        max={1}
        step={0.05}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className='h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-amber-400'
      />
      <span className='w-10 shrink-0 text-right font-mono text-xs text-white/60'>{Math.round(value * 100)}</span>
    </label>
  );
}
