export default function LoadingSpinner({ size = 'md' }) {
  const s = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  return (
    <div className="flex items-center justify-center p-8">
      <div className={`${s} border-2 border-primary-500 border-t-transparent rounded-full animate-spin`} />
    </div>
  );
}
