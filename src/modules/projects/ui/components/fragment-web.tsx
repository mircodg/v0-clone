import { Fragment } from "@/generated/prisma";
import { useState } from "react";
import { ExternalLinkIcon, RefreshCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/hint";

interface FragmentWebProps {
  data: Fragment;
}

function FragmentWeb({ data }: FragmentWebProps) {
  const [fragmentKey, setFragmentKey] = useState(0);
  const [copied, setCopied] = useState(false);

  const onRefresh = () => {
    setFragmentKey((prev) => prev + 1);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(data.sandboxUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="p-2 border-b bg-sidebar flex items-center gap-x-2">
        <Hint text="Refresh" side="bottom">
          <Button variant="outline" size="sm" onClick={onRefresh}>
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
              window.open(data.sandboxUrl, "_blank");
            }}
            disabled={!data.sandboxUrl}
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
      ></iframe>
    </div>
  );
}

export default FragmentWeb;
