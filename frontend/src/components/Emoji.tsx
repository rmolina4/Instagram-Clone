const emojiList = [
  "😀",
  "😃",
  "😄",
  "😁",
  "😆",
  "😅",
  "😂",
  "🤣",
  "😍",
  "🤩",
  "🥰",
  "😘",
  "😗",
  "😙",
  "🤗",
  "🤔",
  "🤨",
  "🙄",
];

export const Emoji = ({
  setBody,
  className,
  style,
}: {
  setBody: (emoji: string) => void;
  className?: string;
  style?: React.CSSProperties;
}) => {
  return (
    <div
      className={`absolute flex flex-col gap-1 rounded-lg bg-white dark:bg-neutral-800 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.2)] p-2 w-max ${className}`}
      style={style}
    >
      <span className="text-sm font-bold text-gray-500 ml-1">Most Popular</span>
      <div className="text-xl md:text-2xl lg:text-3xl grid grid-cols-6 gap-2">
        {emojiList.map((emoji) => (
          <span
            className="cursor-pointer"
            key={emoji}
            onClick={() => setBody(emoji)}
          >
            {emoji}
          </span>
        ))}
      </div>
    </div>
  );
};
