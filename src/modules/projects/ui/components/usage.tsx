import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CrownIcon } from "lucide-react";
import { formatDuration, intervalToDuration } from "date-fns";
import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";

interface UsageProps {
  points: number;
  msBeforeNext: number;
}

export const Usage = ({ points, msBeforeNext }: UsageProps) => {
  const { has } = useAuth();
  const hasProAccess = has?.({
    plan: "pro",
  });
  const resetTime = useMemo(() => {
    try {
      return formatDuration(
        intervalToDuration({
          start: new Date(),
          end: new Date(Date.now() + msBeforeNext),
        }),
        {
          format: ["months", "days", "hours"],
        }
      );
    } catch (error) {
      console.error("Error formatting duration", error);
      return "unknown";
    }
  }, [msBeforeNext]);

  return (
    <div className="rounded-t-xl bg-background border border-b-0 p-2.5">
      <div className="flex items-center gap-x-2">
        <div>
          <p className="text-sm">
            {points} {hasProAccess ? "" : "free"} credits remaining
          </p>
          <p className="text-sm text-muted-foreground">Reset in {resetTime}</p>
        </div>
        {!hasProAccess && (
          <Button variant={"tertiary"} size={"sm"} asChild className="ml-auto">
            <Link href={"/pricing"}>
              <CrownIcon />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};
