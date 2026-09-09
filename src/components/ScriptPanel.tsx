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

const textareaClassName =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

const buttonClassName =
  "rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800";

export default function ScriptPanel() {
  const [duration, setDuration] = useState<DurationSelection>(15);
  const [customDuration, setCustomDuration] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [script, setScript] = useState("");
  const [productionScript, setProductionScript] = useState("");

  const handleGenerateScript = () => {};
  const handleResizeScriptToDuration = () => {};
  const handleAiReformatTranscript = () => {};

  return (
    <div className="flex flex-col gap-6">
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
        <button type="button" onClick={handleGenerateScript} className={buttonClassName}>
          Generate Script
        </button>
        <button type="button" onClick={handleResizeScriptToDuration} className={buttonClassName}>
          Resize Script to Duration
        </button>
        <button type="button" onClick={handleAiReformatTranscript} className={buttonClassName}>
          AI Reformat Transcript
        </button>
      </div>

      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Production Script
        <textarea
          value={productionScript}
          onChange={(event) => setProductionScript(event.target.value)}
          rows={8}
          placeholder="The normalized production script will appear here."
          className={textareaClassName}
        />
      </label>
    </div>
  );
}
