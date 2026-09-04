export default function Button({ variant = 'ghost', className = '', ...props }) {
  return (
    <button type='button' className={`btn ${variant === 'primary' ? 'btn-primary' : 'btn-ghost'} ${className}`} {...props} />
  );
}
