"use client";

import { FAL_VIDEO_MODELS, getModelById } from "@/lib/models";

interface ModelSelectorProps {
  value: string;
  onChange: (id: string) => void;
}

export default function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const selected = getModelById(value);

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Model
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          {FAL_VIDEO_MODELS.map((model) => (
            <option key={model.id} value={model.id}>
              {model.label}
              {model.status !== "enabled" ? ` (${model.status})` : ""}
            </option>
          ))}
        </select>
      </label>

      {selected && (
        <>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800 sm:grid-cols-4">
            <div>
              <dt className="text-zinc-500 dark:text-zinc-400">Category</dt>
              <dd className="font-medium">{selected.category}</dd>
            </div>
            <div>
              <dt className="text-zinc-500 dark:text-zinc-400">Duration</dt>
              <dd className="font-medium">
                {selected.minDuration}–{selected.maxDuration}s
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500 dark:text-zinc-400">Resolutions</dt>
              <dd className="font-medium">
                {selected.resolutions.length > 0 ? selected.resolutions.join(", ") : "not applicable"}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500 dark:text-zinc-400">Aspect ratios</dt>
              <dd className="font-medium">
                {selected.aspectRatios.length > 0 ? selected.aspectRatios.join(", ") : "not applicable"}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500 dark:text-zinc-400">Images</dt>
              <dd className="font-medium">
                {selected.supportsImages ? `up to ${selected.maxImages}` : "not supported"}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500 dark:text-zinc-400">Videos</dt>
              <dd className="font-medium">
                {selected.supportsVideos ? `up to ${selected.maxVideos}` : "not supported"}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500 dark:text-zinc-400">Audio</dt>
              <dd className="font-medium">
                {selected.supportsAudio ? `up to ${selected.maxAudio}` : "not supported"}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500 dark:text-zinc-400">Status</dt>
              <dd className="font-medium capitalize">{selected.status}</dd>
            </div>
          </dl>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{selected.pricingNote}</p>
        </>
      )}
    </div>
  );
}
