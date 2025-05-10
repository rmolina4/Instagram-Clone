export default function Divider() {
  return (
    <div className="flex items-center justify-center mx-10 mt-[10px] mb-[18px]">
      <div className="w-[50%] h-[1px] bg-gray-300"></div>
      <p className="mx-2 text-xs font-semibold text-gray-500 mx-[18px]">OR</p>
      <div className="w-[50%] h-[1px] bg-gray-300"></div>
    </div>
  );
}