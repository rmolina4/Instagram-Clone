import { Post as PostProps } from "@/utils/types";
import { timeAgo } from "@/utils/time";

const estimateTextWidth = (text: string, fontSize: number): number => {
  return Math.floor(text.length * 0.52 * fontSize);
};

export default function PostSkeleton(props: PostProps) {
  return (
    <div className="w-[468px] flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <div className="w-[30px] h-[30px] rounded-full bg-gray-200" />
        <div className="flex gap-1">
          <div
            className="bg-gray-200 rounded"
            style={{
              width: `${estimateTextWidth(props.username + " ", 14)}px`,
            }}
          />
          <div
            className="h-4 bg-gray-200 rounded"
            style={{
              width: `${estimateTextWidth(timeAgo(props.created_at), 14)}px`,
            }}
          />
          {!props.followed_by_me && (
            <div
              className="h-4 bg-gray-200 rounded"
              style={{
                width: `${estimateTextWidth("Follow", 14)}px`,
              }}
            />
          )}
        </div>
        <div className="ml-auto w-4 h-4 bg-gray-200 rounded" />
      </div>
      <div className="w-full h-[585px] relative bg-gray-200" />
      <div className="flex flex-col gap-2">
        <div className="w-full flex gap-3 items-center">
          <div className="w-6 h-[25px] bg-gray-200 rounded" />
          <div className="w-6 h-[25px] bg-gray-200 rounded" />
          <div className="ml-auto w-6 h-[25px] bg-gray-200 rounded" />
        </div>
        <div
          className="h-4 bg-gray-200 rounded"
          style={{
            width: `${estimateTextWidth(`${props.like_count} likes`, 14)}px`,
          }}
        />
        <div className="flex gap-1">
          <div
            className="h-4 bg-gray-200 rounded"
            style={{ width: `${estimateTextWidth(props.username, 14)}px` }}
          />
          {props.body && (
            <div
              className="h-4 bg-gray-200 rounded"
              style={{ width: `${estimateTextWidth(props.body, 14)}px` }}
            />
          )}
        </div>
        {props.comments.length > 0 && (
          <div
            className="h-4 bg-gray-200 rounded"
            style={{
              width: `${estimateTextWidth(`View all ${props.comments.length} comments`, 14)}px`,
            }}
          />
        )}
        <div
          className="h-4 bg-gray-200 rounded"
          style={{ width: `${estimateTextWidth("Add a comment...", 14)}px` }}
        />
      </div>
    </div>
  );
}
