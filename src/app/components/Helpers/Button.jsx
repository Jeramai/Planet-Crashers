export default function Button({ children, ...props }) {
  return (
    <button
      className='px-7 py-4 border-2 rounded-3xl border-cyan-400/70 bg-cyan-300/10 hover:bg-cyan-300/40 duration-300 w-full max-w-[400px] text-center uppercase'
      {...props}
    >
      {children}
    </button>
  );
}
