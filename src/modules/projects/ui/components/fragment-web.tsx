import { Fragment } from "@/generated/prisma";
import { useState } from "react";
import { ExternalLinkIcon, RefreshCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/hint";
import { toast } from "sonner";

interface FragmentWebProps {
  data: Fragment;
}

function FragmentWeb({ data }: FragmentWebProps) {
  const [fragmentKey, setFragmentKey] = useState(0);
  const [copied, setCopied] = useState(false);

  const onRefresh = () => {
    setFragmentKey((prev) => prev + 1);
  };

  const handleCopy = async () => {
    // TODO: check if this works.
    if (!data.sandboxUrl) return;
    try {
      await navigator.clipboard.writeText(data.sandboxUrl);
      setCopied(true);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy to clipboard");
    } finally {
      const timeout = setTimeout(() => {
        setCopied(false);
      }, 2000);
      // cleanup timeout on unmount
      return () => clearTimeout(timeout);
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="p-2 border-b bg-sidebar flex items-center gap-x-2">
        <Hint text="Refresh" side="bottom">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            aria-label="Refresh preview"
          >
            <RefreshCcwIcon />
          </Button>
        </Hint>
        <Hint text="Copy to clipboard" side="bottom">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!data.sandboxUrl || copied}
            className="flex-1 flex-start text-start font-normal"
            aria-label="Copy to clipboard"
          >
            <span className="truncate">{data.sandboxUrl}</span>
          </Button>
        </Hint>
        <Hint text="Open in new tab" side="bottom" align="start">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (!data.sandboxUrl) return;
              window.open(data.sandboxUrl, "_blank", "noopener,noreferrer");
            }}
            disabled={!data.sandboxUrl}
            aria-label="Open in new tab"
          >
            <ExternalLinkIcon />
          </Button>
        </Hint>
      </div>
      <iframe
        key={fragmentKey}
        src={data.sandboxUrl}
        className="w-full h-full"
        sandbox="allow-scripts allow-same-origin allow-forms"
        loading="lazy"
        title="Fragment preview"
        referrerPolicy="no-referrer"
      ></iframe>
    </div>
  );
}

export default FragmentWeb;
