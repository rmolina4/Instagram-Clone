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
  videoRef,
  canvasRef,
}: {
  interactionState: InteractionState;
  setInteractionState: Dispatch<SetStateAction<InteractionState>>;
  postFormData: PostFormData;
  setPostFormData: Dispatch<SetStateAction<PostFormData>>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
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
          (postFormData.media[interactionState.position].resource instanceof
          HTMLImageElement ? (
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
              videoRef={videoRef}
              canvasRef={canvasRef}
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
