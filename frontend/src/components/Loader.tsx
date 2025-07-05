export default function Loader({ className }: { className?: string }) {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className="border border-gray-300 border-t-blue-600 border-4 w-[20px] h-[20px] rounded-full animate-spin" />
    </div>
  );
}
