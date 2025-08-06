import { InteractionState, PostFormData } from "./CreatePostModal";
import { Dispatch, SetStateAction } from "react";
import { Adjustment } from "@/utils/types";
import { LUT_FILTERS, LUT_NAME } from "@/utils/types";
import Image from "next/image";

export default function Filters({
  interactionState,
  setInteractionState,
  postFormData,
  setPostFormData,
}: {
  interactionState: InteractionState;
  setInteractionState: Dispatch<SetStateAction<InteractionState>>;
  postFormData: PostFormData;
  setPostFormData: Dispatch<SetStateAction<PostFormData>>;
}) {
  const handleReset = (key: keyof Adjustment) => {
    setPostFormData((prev) => ({
      ...prev,
      media: prev.media.map((media, index) => {
        if (index === interactionState.position) {
          return {
            ...media,
            adjustments: {
              ...media.adjustments,
              [key]: 0,
            },
          };
        }
        return media;
      }),
    }));
  };

  const handleSetLut = (name: LUT_NAME) => {
    setPostFormData((prev) => ({
      ...prev,
      media: prev.media.map((media, index) =>
        index === interactionState.position ? { ...media, lut: name } : media
      ),
    }));
  };

  return (
    <>
      <div className="flex justify-between">
        <button
          className={`w-full text-[16px] font-medium border-b border-black py-2 ${
            interactionState.adjustmentsVisible ? "opacity-30" : ""
          }`}
          onClick={() => {
            setInteractionState((prev) => ({
              ...prev,
              adjustmentsVisible: false,
            }));
          }}
        >
          Filters
        </button>
        <button
          className={`w-full text-[16px] font-medium border-b border-black py-2 ${
            !interactionState.adjustmentsVisible ? "opacity-30" : ""
          }`}
          onClick={() => {
            setInteractionState((prev) => ({
              ...prev,
              adjustmentsVisible: true,
            }));
          }}
        >
          Adjustments
        </button>
      </div>
      {interactionState.adjustmentsVisible ? (
        <div className="flex flex-col gap-5">
          {(
            Object.keys(
              postFormData.media[interactionState.position].adjustments
            ) as (keyof Adjustment)[]
          ).map((key) => (
            <div key={key} className="flex flex-col px-4 group gap-5">
              <div className="flex justify-between font-medium text-[16px] items-center">
                {key}
                {postFormData.media[interactionState.position].adjustments[
                  key
                ] != 0 && (
                  <div
                    className="text-blue-500 font-bold hover:cursor-pointer group-hover:block hidden text-sm"
                    onClick={() => {
                      handleReset(key);
                    }}
                  >
                    Reset
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <input
                  className="w-[270px] custom-slider"
                  key={key}
                  type="range"
                  min={
                    key == "Vignette" || key == "Temperature" || key == "Fade"
                      ? 0
                      : -100
                  }
                  max={100}
                  value={
                    postFormData.media[interactionState.position].adjustments[
                      key
                    ]
                  }
                  onChange={(e) =>
                    setPostFormData((prev) => ({
                      ...prev,
                      media: prev.media.map((media, index) =>
                        index === interactionState.position
                          ? {
                              ...media,
                              adjustments: {
                                ...media.adjustments,
                                [key]: Number(e.target.value),
                              },
                            }
                          : media
                      ),
                    }))
                  }
                  style={{
                    backgroundImage:
                      key != "Vignette" && key != "Temperature" && key != "Fade"
                        ? `linear-gradient(to right,  rgba(255, 255, 255, 0) ${
                            postFormData.media[interactionState.position]
                              .adjustments[key] >= 0
                              ? 50
                              : postFormData.media[interactionState.position]
                                  .adjustments[key] /
                                  2 +
                                50
                          }%, #000000 ${
                            postFormData.media[interactionState.position]
                              .adjustments[key] >= 0
                              ? 50
                              : postFormData.media[interactionState.position]
                                  .adjustments[key] /
                                  2 +
                                50
                          }%, #000000 ${
                            postFormData.media[interactionState.position]
                              .adjustments[key] >= 0
                              ? postFormData.media[interactionState.position]
                                  .adjustments[key] /
                                  2 +
                                50
                              : 50
                          }%, rgba(255, 255, 255, 0) ${
                            postFormData.media[interactionState.position]
                              .adjustments[key] >= 0
                              ? postFormData.media[interactionState.position]
                                  .adjustments[key] /
                                  2 +
                                50
                              : 50
                          }%)`
                        : `linear-gradient(to right, #000000 0%, #000000 ${postFormData.media[interactionState.position].adjustments[key]}%, rgba(255, 255, 255, 0) ${postFormData.media[interactionState.position].adjustments[key]}%)`,
                  }}
                />
                <div
                  className={`w-6 text-[12px] text-right ${
                    postFormData.media[interactionState.position].adjustments[
                      key
                    ] != 0
                      ? "text-black"
                      : "text-gray-500"
                  }`}
                >
                  {
                    postFormData.media[interactionState.position].adjustments[
                      key
                    ]
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div
            className={`grid grid-cols-3 gap-5 overflow-y-auto px-4 pb-2 ${postFormData.media[interactionState.position].lut != "None" ? "border-b border-gray-300 dark:border-gray-700" : ""}`}
          >
            {(Object.keys(LUT_FILTERS) as LUT_NAME[]).map((name, index) => (
              <div
                className="flex flex-col gap-1 items-center hover:cursor-pointer"
                key={index}
                onClick={() => {
                  handleSetLut(name);
                }}
              >
                <Image
                  src="/Aden-2x.jpg"
                  alt="Hot Air Balloon"
                  width={90}
                  height={90}
                  unoptimized
                  className={`border-2 rounded-md ${postFormData.media[interactionState.position].lut === name ? "border-blue-500" : "border-transparent"}`}
                  style={{
                    filter: Object.entries(LUT_FILTERS[name]).reduce(
                      (acc, [key, value]) => {
                        return acc + `${key}(${value})`;
                      },
                      "" as string
                    ),
                  }}
                />
                <span className="text-sm">{name}</span>
              </div>
            ))}
          </div>
          {postFormData.media[interactionState.position].lut != "None" && (
            <div className="flex justify-between items-center px-4">
              <input
                className="w-[270px] custom-slider"
                type="range"
                min={0}
                max={100}
                value={
                  postFormData.media[interactionState.position].lut_strength
                }
                onChange={(e) => {
                  setPostFormData((prev) => ({
                    ...prev,
                    media: prev.media.map((media, index) =>
                      index === interactionState.position
                        ? {
                            ...media,
                            lut_strength: Number(e.target.value),
                          }
                        : media
                    ),
                  }));
                }}
                style={{
                  backgroundImage: `linear-gradient(to right, #000000 0%, #000000 ${postFormData.media[interactionState.position].lut_strength}%, rgba(255,255,255,0) ${postFormData.media[interactionState.position].lut_strength}%)`,
                }}
              />
              <span className="text-sm">
                {postFormData.media[interactionState.position].lut_strength}
              </span>
            </div>
          )}
        </div>
      )}
    </>
  );
}
