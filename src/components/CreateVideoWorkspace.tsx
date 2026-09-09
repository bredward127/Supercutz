"use client";

import { useMemo, useState } from "react";
import AssetsPanel from "@/components/AssetsPanel";
import GenerationPanel from "@/components/GenerationPanel";
import ModelSelector from "@/components/ModelSelector";
import ScriptPanel from "@/components/ScriptPanel";
import { buildAssetRoleList, type ImageAsset } from "@/lib/assets";
import { FAL_VIDEO_MODELS } from "@/lib/models";
import { type AspectRatio, type DurationSelection } from "@/lib/script";

const DEFAULT_MODEL_ID = FAL_VIDEO_MODELS[0]?.id ?? "";
const DEFAULT_DURATION: DurationSelection = 15;
const DEFAULT_ASPECT_RATIO: AspectRatio = "9:16";

// Holds every piece of state shared across Model, Assets, Script, and
// Generate: the selected model, the uploaded assets (as real File objects —
// Generate needs them to upload, Script only needs their roles), duration/
// aspect ratio, and the editable generation prompt. `formKey` remounts the
// child panels (via the `key` prop) on "Start New Video" so each panel's own
// local state (campaign fields, script text, native file input display,
// generation status) resets along with the state owned here.
export default function CreateVideoWorkspace() {
  const [formKey, setFormKey] = useState(0);

  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODEL_ID);

  const [sourceVideo, setSourceVideo] = useState<File | null>(null);
  const [styleVideo, setStyleVideo] = useState<File | null>(null);
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [audio, setAudio] = useState<File | null>(null);

  const [duration, setDuration] = useState<DurationSelection>(DEFAULT_DURATION);
  const [customDuration, setCustomDuration] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(DEFAULT_ASPECT_RATIO);

  const [generatedPrompt, setGeneratedPrompt] = useState("");

  const availableAssetLabels = useMemo(
    () => Array.from(new Set(images.map((image) => image.role))),
    [images]
  );
  const assetRoles = useMemo(
    () =>
      buildAssetRoleList({
        hasSourceVideo: sourceVideo !== null,
        hasStyleVideo: styleVideo !== null,
        hasAudio: audio !== null,
        imageRoles: images.map((image) => image.role),
      }),
    [sourceVideo, styleVideo, audio, images]
  );

  const handleStartNewVideo = () => {
    setSelectedModelId(DEFAULT_MODEL_ID);
    setSourceVideo(null);
    setStyleVideo(null);
    setImages([]);
    setAudio(null);
    setDuration(DEFAULT_DURATION);
    setCustomDuration("");
    setAspectRatio(DEFAULT_ASPECT_RATIO);
    setGeneratedPrompt("");
    setFormKey((key) => key + 1);
  };

  return (
    <>
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Model
        </h2>
        <ModelSelector value={selectedModelId} onChange={setSelectedModelId} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Assets
        </h2>
        <AssetsPanel
          key={formKey}
          sourceVideo={sourceVideo}
          onSourceVideoChange={setSourceVideo}
          styleVideo={styleVideo}
          onStyleVideoChange={setStyleVideo}
          images={images}
          onImagesChange={setImages}
          audio={audio}
          onAudioChange={setAudio}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Script
        </h2>
        <ScriptPanel
          key={formKey}
          availableAssetLabels={availableAssetLabels}
          selectedModelId={selectedModelId}
          assetRoles={assetRoles}
          duration={duration}
          onDurationChange={setDuration}
          customDuration={customDuration}
          onCustomDurationChange={setCustomDuration}
          aspectRatio={aspectRatio}
          onAspectRatioChange={setAspectRatio}
          generatedPrompt={generatedPrompt}
          onGeneratedPromptChange={setGeneratedPrompt}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Generate
        </h2>
        <GenerationPanel
          key={formKey}
          modelId={selectedModelId}
          prompt={generatedPrompt}
          aspectRatio={aspectRatio}
          duration={duration}
          customDuration={customDuration}
          sourceVideo={sourceVideo}
          styleVideo={styleVideo}
          images={images}
          audio={audio}
          onStartNewVideo={handleStartNewVideo}
        />
      </section>
    </>
  );
}
