"use client";

import { useEffect, useState } from "react";
import { getJson, postJson } from "@/lib/api-client";
import type { ImageAsset } from "@/lib/assets";
import { uploadAssetsForGeneration } from "@/lib/generation-client";
import { isSupportedGenerateVideoModelId, type GenerateVideoResponse } from "@/lib/generate-video-api";
import type { GenerationStatusResponse } from "@/lib/generation-status-api";
import { getModelById } from "@/lib/models";
import { resolveTargetDurationSeconds, type DurationSelection } from "@/lib/script";

const selectClassName =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

const buttonClassName =
  "rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800";

const primaryButtonClassName =
  "rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500";

type GenerationPhase =
  | "idle"
  | "uploading"
  | "queued"
  | "generating"
  | "processing-result"
  | "ready"
  | "failed";

const PHASE_LABELS: Record<GenerationPhase, string> = {
  idle: "",
  uploading: "Uploading",
  queued: "Queued",
  generating: "Generating",
  "processing-result": "Processing Result",
  ready: "Ready",
  failed: "Failed",
};

interface GenerationPanelProps {
  modelId: string;
  prompt: string;
  aspectRatio: string;
  duration: DurationSelection;
  customDuration: string;
  sourceVideo: File | null;
  styleVideo: File | null;
  images: ImageAsset[];
  audio: File | null;
  onStartNewVideo: () => void;
}

export default function GenerationPanel({
  modelId,
  prompt,
  aspectRatio,
  duration,
  customDuration,
  sourceVideo,
  styleVideo,
  images,
  audio,
  onStartNewVideo,
}: GenerationPanelProps) {
  const model = getModelById(modelId);
  const resolvedDuration = resolveTargetDurationSeconds(duration, customDuration);

  const [resolution, setResolution] = useState(model?.resolutions[0] ?? "");
  // Adjust state during render (React's recommended alternative to an
  // effect here) when the model changes, so resolution always starts valid
  // for the newly selected model.
  const [resolutionForModelId, setResolutionForModelId] = useState(modelId);
  if (modelId !== resolutionForModelId) {
    setResolutionForModelId(modelId);
    setResolution(model?.resolutions[0] ?? "");
  }

  const [phase, setPhase] = useState<GenerationPhase>("idle");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!requestId) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const result = await getJson<GenerationStatusResponse>(
          `/api/generation-status?requestId=${encodeURIComponent(requestId)}&modelId=${encodeURIComponent(modelId)}`
        );
        if (cancelled) return;

        if (result.state === "queued") {
          setPhase("queued");
          setQueuePosition(result.queuePosition ?? null);
          return;
        }
        if (result.state === "in-progress") {
          setPhase("generating");
          return;
        }
        if (result.state === "completed" && result.videoUrl) {
          clearInterval(intervalId);
          setPhase("processing-result");
          setVideoUrl(result.videoUrl);
          return;
        }
        clearInterval(intervalId);
        setPhase("failed");
        setErrorMessage(result.error ?? "Generation failed.");
      } catch (err) {
        if (cancelled) return;
        clearInterval(intervalId);
        setPhase("failed");
        setErrorMessage(err instanceof Error ? err.message : "Something went wrong while checking status.");
      }
    };

    poll();
    const intervalId = setInterval(poll, 3000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [requestId, modelId]);

  const isModelSupported = model !== undefined && isSupportedGenerateVideoModelId(model.id);
  const hasRequiredSourceVideo = !model || !model.supportsVideos || sourceVideo !== null;
  const isDurationInRange =
    model !== undefined &&
    resolvedDuration !== null &&
    resolvedDuration >= model.minDuration &&
    resolvedDuration <= model.maxDuration;
  const isPromptFilled = prompt.trim().length > 0;
  const canGenerate =
    model !== undefined && isModelSupported && hasRequiredSourceVideo && isDurationInRange && isPromptFilled;
  const isBusy = phase !== "idle" && phase !== "ready" && phase !== "failed";

  const handleGenerateVideo = async () => {
    if (!model || resolvedDuration === null) return;
    setErrorMessage(null);
    setShowDetails(false);
    setPhase("uploading");

    try {
      const assetUrls = await uploadAssetsForGeneration({ sourceVideo, styleVideo, images, audio });

      const submission = await postJson<GenerateVideoResponse>("/api/generate-video", {
        modelId,
        prompt,
        assetUrls,
        resolution,
        durationSeconds: resolvedDuration,
        aspectRatio,
      });
      setQueuePosition(submission.queuePosition ?? null);
      setPhase("queued");
      setRequestId(submission.requestId);
    } catch (err) {
      setPhase("failed");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const handleDownload = () => {
    if (!videoUrl) return;
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = "supercutz-video.mp4";
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="flex flex-col gap-4">
      {model && (
        <label className="flex w-fit flex-col gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Resolution
          <select
            value={resolution}
            onChange={(event) => setResolution(event.target.value)}
            disabled={isBusy}
            className={selectClassName}
          >
            {model.resolutions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      )}

      {phase === "idle" && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleGenerateVideo}
            disabled={!canGenerate}
            className={`${primaryButtonClassName} w-fit`}
          >
            Generate Video
          </button>
          {!canGenerate && (
            <ul className="list-inside list-disc text-xs text-zinc-500 dark:text-zinc-400">
              {!model && <li>Select a model.</li>}
              {model && !isModelSupported && (
                <li>{model.label} doesn&apos;t have video generation wired up yet — pick a Seedance model.</li>
              )}
              {model && isModelSupported && !hasRequiredSourceVideo && (
                <li>Upload a source video — required for {model.label}.</li>
              )}
              {model && !isDurationInRange && (
                <li>
                  Set a duration between {model.minDuration} and {model.maxDuration} seconds for{" "}
                  {model.label}.
                </li>
              )}
              {!isPromptFilled && <li>Build or write a generation prompt first.</li>}
            </ul>
          )}
        </div>
      )}

      {isBusy && (
        <div className="flex items-center gap-3 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800">
          <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
          <span className="font-medium">{PHASE_LABELS[phase]}…</span>
          {phase === "queued" && queuePosition !== null && (
            <span className="text-zinc-500 dark:text-zinc-400">(position {queuePosition})</span>
          )}
        </div>
      )}

      {phase === "ready" && videoUrl && (
        <div className="flex flex-col gap-3">
          {/* Hidden until the browser has actually buffered the video, so
              "Processing Result" reflects real client-side work rather than
              being a purely cosmetic delay. */}
          <video src={videoUrl} controls className="w-full rounded-lg" />
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={handleDownload} className={buttonClassName}>
              Download MP4
            </button>
            <button type="button" onClick={onStartNewVideo} className={buttonClassName}>
              Start New Video
            </button>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            This app does not save your videos. Download this file if you want to keep it.
          </p>
        </div>
      )}

      {phase === "processing-result" && videoUrl && (
        <>
          <div className="flex items-center gap-3 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
            <span className="font-medium">Processing Result…</span>
          </div>
          <video
            src={videoUrl}
            className="hidden"
            onLoadedData={() => setPhase("ready")}
            onError={() => {
              setPhase("failed");
              setErrorMessage("The finished video URL could not be loaded.");
            }}
          />
        </>
      )}

      {phase === "failed" && (
        <div className="flex flex-col gap-3 rounded-lg border border-red-200 p-4 text-sm dark:border-red-900">
          <p className="font-medium text-red-600 dark:text-red-400">Failed</p>
          <button
            type="button"
            onClick={() => setShowDetails((value) => !value)}
            className="w-fit text-xs font-medium text-zinc-500 underline dark:text-zinc-400"
          >
            {showDetails ? "Hide Details" : "Show Details"}
          </button>
          {showDetails && (
            <pre className="whitespace-pre-wrap rounded-md bg-zinc-100 p-3 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              {errorMessage}
            </pre>
          )}
          <button type="button" onClick={onStartNewVideo} className={`${buttonClassName} w-fit`}>
            Start New Video
          </button>
        </div>
      )}
    </div>
  );
}
