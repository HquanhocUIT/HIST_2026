import type { ExhibitId } from "./InteractiveScene";
import videoData from "./videoNarrations.json";

export type ExhibitVideoKind = "crafting" | "story";

type ExhibitVideo = {
  title: string;
  source: string;
  narration: string;
};

export const exhibitVideos: Record<
  ExhibitId,
  Record<ExhibitVideoKind, ExhibitVideo>
> = videoData;
