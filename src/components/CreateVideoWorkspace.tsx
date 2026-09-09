"use client";

import { useState } from "react";
import AssetsPanel from "@/components/AssetsPanel";
import ScriptPanel from "@/components/ScriptPanel";

// Holds the state shared between Assets and Script: image role labels
// uploaded in Assets are passed to Script so Claude knows what's available
// to show on screen.
export default function CreateVideoWorkspace() {
  const [assetLabels, setAssetLabels] = useState<string[]>([]);

  return (
    <>
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Assets
        </h2>
        <AssetsPanel onImageLabelsChange={setAssetLabels} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Script
        </h2>
        <ScriptPanel availableAssetLabels={assetLabels} />
      </section>
    </>
  );
}
