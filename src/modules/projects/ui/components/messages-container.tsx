import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Fragment } from "@/generated/prisma";
import MessageCard from "@/modules/projects/ui/components/message-card";
import MessageForm from "@/modules/projects/ui/components/message-form";
import MessageLoading from "@/modules/projects/ui/components/message-loading";
interface MessagesContainerProps {
  projectId: string;
  activeFragment: Fragment | null;
  setActiveFragment: (fragment: Fragment | null) => void;
}

export const MessagesContainer = ({
  projectId,
  activeFragment,
  setActiveFragment,
}: MessagesContainerProps) => {
  // auto scroll to bottom on refresh ref
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
      (message) => message.role === "ASSISTANT" && !!message.fragments
    );

    if (lastAssistantMessage) {
      setActiveFragment(lastAssistantMessage.fragments);
    }
  }, [messages, setActiveFragment]);

  // auto scroll to bottom on refresh
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const lastMessage = messages[messages.length - 1];
  const isLastMessageFromUser = lastMessage.role === "USER";

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
              isActiveFragment={activeFragment?.id === message.fragments?.id}
              onFragmentClick={() => setActiveFragment(message.fragments)}
              type={message.type}
            />
          ))}
          {isLastMessageFromUser && <MessageLoading />}
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
