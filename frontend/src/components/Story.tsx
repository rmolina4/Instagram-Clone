import Image from "next/image";

export const Story = () => {
  return (
    <div className="flex w-full mt-4 mb-7 py-2">
      <button className="flex flex-col items-center text-xs text-gray-500 hover:cursor-pointer">
        <Image
          src="https://i.pinimg.com/474x/25/1c/e1/251ce139d8c07cbcc9daeca832851719.jpg"
          alt="story"
          width={60}
          height={60}
          unoptimized
          className="p-[2px] border-1 border-gray-300 rounded-full"
        />
        <span>John Doe</span>
      </button>
    </div>
  );
};
