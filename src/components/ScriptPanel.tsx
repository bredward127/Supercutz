"use client";

import { useState } from "react";
import {
  ASPECT_RATIO_OPTIONS,
  DURATION_PRESETS,
  type AspectRatio,
  type DurationPreset,
  type DurationSelection,
} from "@/lib/script";

const selectClassName =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

const textInputClassName = selectClassName;

const textareaClassName =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

const buttonClassName =
  "rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800";

type PendingAction = "generate" | "reformat" | "resize" | null;

function resolveTargetDurationSeconds(
  duration: DurationSelection,
  customDuration: string
): number | null {
  if (duration === "custom") {
    const parsed = Number(customDuration);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }
  return duration;
}

async function callScriptApi(path: string, body: unknown): Promise<string> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data && typeof data === "object" && typeof (data as { error?: unknown }).error === "string"
        ? (data as { error: string }).error
        : `Request failed with status ${response.status}.`;
    throw new Error(message);
  }

  if (!data || typeof (data as { script?: unknown }).script !== "string") {
    throw new Error("Unexpected response shape from server.");
  }

  return (data as { script: string }).script;
}

interface ScriptPanelProps {
  availableAssetLabels: string[];
}

export default function ScriptPanel({ availableAssetLabels }: ScriptPanelProps) {
  const [campaignType, setCampaignType] = useState("");
  const [offer, setOffer] = useState("");
  const [cta, setCta] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("");

  const [duration, setDuration] = useState<DurationSelection>(15);
  const [customDuration, setCustomDuration] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");

  const [script, setScript] = useState("");
  const [productionScript, setProductionScript] = useState("");

  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateScript = async () => {
    const targetDurationSeconds = resolveTargetDurationSeconds(duration, customDuration);
    if (targetDurationSeconds === null) {
      setError("Enter a valid custom duration in seconds.");
      return;
    }
    setError(null);
    setPendingAction("generate");
    try {
      const result = await callScriptApi("/api/generate-script", {
        campaignType,
        offer,
        cta,
        audience,
        tone,
        targetDurationSeconds,
        availableAssetLabels,
      });
      setProductionScript(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPendingAction(null);
    }
  };

  const handleAiReformatTranscript = async () => {
    if (script.trim().length === 0) {
      setError("Paste a script or transcript first.");
      return;
    }
    const targetDurationSeconds = resolveTargetDurationSeconds(duration, customDuration);
    if (targetDurationSeconds === null) {
      setError("Enter a valid custom duration in seconds.");
      return;
    }
    setError(null);
    setPendingAction("reformat");
    try {
      const result = await callScriptApi("/api/reformat-transcript", {
        campaignType,
        offer,
        cta,
        audience,
        tone,
        targetDurationSeconds,
        availableAssetLabels,
        rawTranscript: script,
      });
      setProductionScript(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPendingAction(null);
    }
  };

  const handleResizeScriptToDuration = async () => {
    if (productionScript.trim().length === 0) {
      setError("There's no production script yet to resize.");
      return;
    }
    const targetDurationSeconds = resolveTargetDurationSeconds(duration, customDuration);
    if (targetDurationSeconds === null) {
      setError("Enter a valid custom duration in seconds.");
      return;
    }
    setError(null);
    setPendingAction("resize");
    try {
      const result = await callScriptApi("/api/resize-script", {
        script: productionScript,
        targetDurationSeconds,
      });
      setProductionScript(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPendingAction(null);
    }
  };

  const isBusy = pendingAction !== null;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Campaign type
          <input
            type="text"
            value={campaignType}
            onChange={(event) => setCampaignType(event.target.value)}
            placeholder="e.g. App install"
            className={textInputClassName}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Offer
          <input
            type="text"
            value={offer}
            onChange={(event) => setOffer(event.target.value)}
            placeholder="e.g. 20% off first order"
            className={textInputClassName}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Call to action
          <input
            type="text"
            value={cta}
            onChange={(event) => setCta(event.target.value)}
            placeholder="e.g. Download now"
            className={textInputClassName}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Audience
          <input
            type="text"
            value={audience}
            onChange={(event) => setAudience(event.target.value)}
            placeholder="e.g. Busy parents in their 30s"
            className={textInputClassName}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Tone
          <input
            type="text"
            value={tone}
            onChange={(event) => setTone(event.target.value)}
            placeholder="e.g. Energetic and direct"
            className={textInputClassName}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Duration
          <select
            value={String(duration)}
            onChange={(event) => {
              const value = event.target.value;
              setDuration(value === "custom" ? "custom" : (Number(value) as DurationPreset));
            }}
            className={selectClassName}
          >
            {DURATION_PRESETS.map((seconds) => (
              <option key={seconds} value={seconds}>
                {seconds}s
              </option>
            ))}
            <option value="custom">Custom</option>
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Aspect ratio
          <select
            value={aspectRatio}
            onChange={(event) => setAspectRatio(event.target.value as AspectRatio)}
            className={selectClassName}
          >
            {ASPECT_RATIO_OPTIONS.map((ratio) => (
              <option key={ratio} value={ratio}>
                {ratio}
              </option>
            ))}
          </select>
        </label>

        {duration === "custom" && (
          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Custom duration (seconds)
            <input
              type="number"
              min={1}
              value={customDuration}
              onChange={(event) => setCustomDuration(event.target.value)}
              placeholder="e.g. 20"
              className={selectClassName}
            />
          </label>
        )}
      </div>

      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Script / transcript
        <textarea
          value={script}
          onChange={(event) => setScript(event.target.value)}
          rows={8}
          placeholder="Paste your script or transcript here..."
          className={textareaClassName}
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleGenerateScript}
          disabled={isBusy}
          className={buttonClassName}
        >
          {pendingAction === "generate" ? "Generating…" : "Generate Script"}
        </button>
        <button
          type="button"
          onClick={handleResizeScriptToDuration}
          disabled={isBusy}
          className={buttonClassName}
        >
          {pendingAction === "resize" ? "Resizing…" : "Resize Script to Duration"}
        </button>
        <button
          type="button"
          onClick={handleAiReformatTranscript}
          disabled={isBusy}
          className={buttonClassName}
        >
          {pendingAction === "reformat" ? "Reformatting…" : "AI Reformat Transcript"}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Production Script
        <textarea
          value={productionScript}
          onChange={(event) => setProductionScript(event.target.value)}
          rows={12}
          placeholder="The normalized production script will appear here."
          className={textareaClassName}
        />
      </label>
    </div>
  );
}
