import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import MessageCard from "@/modules/projects/ui/components/message-card";
import MessageForm from "@/modules/projects/ui/components/message-form";

interface MessagesContainerProps {
  projectId: string;
}

export const MessagesContainer = ({ projectId }: MessagesContainerProps) => {
  // auto scroll to bottom on refresh
  const bottomRef = useRef<HTMLDivElement>(null);

  // get prefetched messages
  const trpc = useTRPC();
  const { data: messages } = useSuspenseQuery(
    trpc.messages.getMany.queryOptions({
      projectId: projectId,
    })
  );

  // set active fragment
  useEffect(() => {
    const lastAssistantMessage = messages.findLast(
      (message) => message.role === "ASSISTANT"
    );

    if (lastAssistantMessage) {
      // TODO: set active fragment
    }
  }, [messages]);

  // auto scroll to bottom on refresh
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="pt-2 pr-1">
          {messages.map((message) => (
            <MessageCard
              key={message.id}
              content={message.content}
              role={message.role}
              fragment={message.fragments}
              createdAt={message.createdAt}
              isActiveFragment={false}
              onFragmentClick={() => {}}
              type={message.type}
            />
          ))}
          {/* div to auto scroll into */}
          <div ref={bottomRef} />
        </div>
      </div>
      <div className="relative p-3 pt-1">
        {/* text clip trasparency */}
        <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background/70 pointer-events-none" />
        {/* message form */}
        <MessageForm projectId={projectId} />
      </div>
    </div>
  );
};
