"use client";

import { IMAGE_ROLE_OPTIONS, type ImageAsset, type ImageRole } from "@/lib/assets";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

function FileInfo({ file }: { file: File }) {
  return (
    <p className="text-xs text-zinc-500 dark:text-zinc-400">
      {file.name} · {file.type || "unknown type"} · {formatFileSize(file.size)}
    </p>
  );
}

const fileInputClassName =
  "mt-1 block w-full text-sm text-zinc-600 file:mr-4 file:rounded-full file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-700 dark:text-zinc-400 dark:file:bg-zinc-100 dark:file:text-zinc-900";

interface AssetsPanelProps {
  sourceVideo: File | null;
  onSourceVideoChange: (file: File | null) => void;
  styleVideo: File | null;
  onStyleVideoChange: (file: File | null) => void;
  images: ImageAsset[];
  onImagesChange: (images: ImageAsset[]) => void;
  audio: File | null;
  onAudioChange: (file: File | null) => void;
}

export default function AssetsPanel({
  sourceVideo,
  onSourceVideoChange,
  styleVideo,
  onStyleVideoChange,
  images,
  onImagesChange,
  audio,
  onAudioChange,
}: AssetsPanelProps) {
  const handleImagesSelected = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const newImages: ImageAsset[] = Array.from(fileList).map((file) => ({
      id: crypto.randomUUID(),
      file,
      role: "other",
    }));
    onImagesChange([...images, ...newImages]);
  };

  const updateImageRole = (id: string, role: ImageRole) => {
    onImagesChange(images.map((image) => (image.id === id ? { ...image, role } : image)));
  };

  const clearAll = () => {
    onSourceVideoChange(null);
    onStyleVideoChange(null);
    onImagesChange([]);
    onAudioChange(null);
  };

  const hasAnyAsset = Boolean(sourceVideo) || Boolean(styleVideo) || images.length > 0 || Boolean(audio);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Source video
          <input
            type="file"
            accept="video/*"
            onChange={(event) => onSourceVideoChange(event.target.files?.[0] ?? null)}
            className={fileInputClassName}
          />
        </label>
        {sourceVideo && <FileInfo file={sourceVideo} />}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Style / reference video{" "}
          <span className="font-normal text-zinc-400">(optional)</span>
          <input
            type="file"
            accept="video/*"
            onChange={(event) => onStyleVideoChange(event.target.files?.[0] ?? null)}
            className={fileInputClassName}
          />
        </label>
        {styleVideo && <FileInfo file={styleVideo} />}
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Images{" "}
          <span className="font-normal text-zinc-400">
            (logo, product, screenshots, environment references)
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => handleImagesSelected(event.target.files)}
            className={fileInputClassName}
          />
        </label>
        {images.length > 0 && (
          <ul className="flex flex-col gap-2">
            {images.map((image) => (
              <li
                key={image.id}
                className="flex flex-col gap-2 rounded-md border border-zinc-200 p-3 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between"
              >
                <FileInfo file={image.file} />
                <select
                  value={image.role}
                  onChange={(event) =>
                    updateImageRole(image.id, event.target.value as ImageRole)
                  }
                  className="w-fit rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  {IMAGE_ROLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Audio{" "}
          <span className="font-normal text-zinc-400">
            (optional voice-over or music reference)
          </span>
          <input
            type="file"
            accept="audio/*"
            onChange={(event) => onAudioChange(event.target.files?.[0] ?? null)}
            className={fileInputClassName}
          />
        </label>
        {audio && <FileInfo file={audio} />}
      </div>

      <button
        type="button"
        onClick={clearAll}
        disabled={!hasAnyAsset}
        className="w-fit rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300"
      >
        Clear All
      </button>
    </div>
  );
}
