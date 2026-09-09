import CreateVideoWorkspace from "@/components/CreateVideoWorkspace";

export default function CreateVideoPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-12">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Create Video</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Generate an AI ad video from your footage, references, and a script.
        </p>
      </header>

      <CreateVideoWorkspace />

      <section className="flex flex-col gap-3 rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Generate
        </h2>
        <p>
          Submit to fal.ai, track progress, preview, and download the result —
          coming in a later stage.
        </p>
        <button
          type="button"
          disabled
          className="w-fit rounded-full bg-zinc-300 px-5 py-2 text-sm font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500"
        >
          Generate video
        </button>
      </section>
    </div>
  );
}
