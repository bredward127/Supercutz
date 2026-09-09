"use client";

import { useMemo, useState } from "react";
import AssetsPanel from "@/components/AssetsPanel";
import ModelSelector from "@/components/ModelSelector";
import ScriptPanel from "@/components/ScriptPanel";
import { buildAssetRoleList, type AssetsSummary } from "@/lib/assets";
import { FAL_VIDEO_MODELS } from "@/lib/models";

const EMPTY_ASSETS_SUMMARY: AssetsSummary = {
  hasSourceVideo: false,
  hasStyleVideo: false,
  hasAudio: false,
  imageRoles: [],
};

// Holds the state shared across Model, Assets, and Script: the selected
// model id and the uploaded assets are both needed by Script to call the
// script and build-prompt routes.
export default function CreateVideoWorkspace() {
  const [selectedModelId, setSelectedModelId] = useState(FAL_VIDEO_MODELS[0]?.id ?? "");
  const [assetsSummary, setAssetsSummary] = useState<AssetsSummary>(EMPTY_ASSETS_SUMMARY);

  const availableAssetLabels = useMemo(
    () => Array.from(new Set(assetsSummary.imageRoles)),
    [assetsSummary.imageRoles]
  );
  const assetRoles = useMemo(() => buildAssetRoleList(assetsSummary), [assetsSummary]);

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
        <AssetsPanel onAssetsChange={setAssetsSummary} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Script
        </h2>
        <ScriptPanel
          availableAssetLabels={availableAssetLabels}
          selectedModelId={selectedModelId}
          assetRoles={assetRoles}
        />
      </section>
    </>
  );
}
