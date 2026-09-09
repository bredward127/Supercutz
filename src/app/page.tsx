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
    </div>
  );
}
