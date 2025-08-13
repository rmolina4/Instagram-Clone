import { InteractionState, PostFormData, Stage } from "./CreatePostModal";
import { Dispatch, SetStateAction } from "react";
import { motion } from "framer-motion";
import Filters from "./Filters";
import Meta from "./Meta";
import Video from "./Video";

export default function PostSettingsBar({
  interactionState,
  setInteractionState,
  postFormData,
  setPostFormData,
  canvasRef,
  videoRef,
}: {
  interactionState: InteractionState;
  setInteractionState: Dispatch<SetStateAction<InteractionState>>;
  postFormData: PostFormData;
  setPostFormData: Dispatch<SetStateAction<PostFormData>>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}) {
  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: "340px" }}
      transition={{ duration: 0.8, ease: [0.2, 0.95, 0.1, 0.99] }}
      className="overflow-hidden flex-shrink-0"
    >
      <div className="w-[340px] h-full flex flex-col text-sm overflow-y-auto gap-3">
        {interactionState.stage == Stage.Edit &&
          (postFormData.media[interactionState.position].media_type ===
          "image" ? (
            <Filters
              interactionState={interactionState}
              setInteractionState={setInteractionState}
              postFormData={postFormData}
              setPostFormData={setPostFormData}
            />
          ) : (
            <Video
              interactionState={interactionState}
              postFormData={postFormData}
              setPostFormData={setPostFormData}
              canvasRef={canvasRef}
              videoRef={videoRef}
            />
          ))}
        {interactionState.stage == Stage.Share && (
          <Meta
            interactionState={interactionState}
            setInteractionState={setInteractionState}
            postFormData={postFormData}
            setPostFormData={setPostFormData}
          />
        )}
      </div>
    </motion.div>
  );
}
