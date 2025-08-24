import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextAreaAutosize from "react-textarea-autosize";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { useState } from "react";

interface MessageFormProps {
  projectId: string;
}

const formSchema = z.object({
  value: z.string().min(1, "Value is required").max(10000, "Value is too long"),
});

const MessageForm = ({ projectId }: MessageFormProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createMessage = useMutation(
    trpc.messages.create.mutationOptions({
      onSuccess: () => {
        form.reset();
        // refetch messages
        queryClient.invalidateQueries(
          trpc.messages.getMany.queryOptions({
            projectId,
          })
        );
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: "",
    },
  });

  // states
  const isPending = createMessage.isPending;
  const isButtonDisabled = isPending || !form.formState.isValid;
  const [isFocused, setIsFocused] = useState(false);
  //const [showUsage, setShowUsage] = useState(false);
  const showUsage = false;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await createMessage.mutateAsync({
      value: values.value,
      projectId: projectId,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          "relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all",
          isFocused && "shadow-xs",
          showUsage && "rounded-t-none"
        )}
      >
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <TextAreaAutosize
              {...field}
              onFocus={() => setIsFocused(true)}
              disabled={isPending}
              onBlur={() => setIsFocused(false)}
              minRows={2}
              maxRows={8}
              className="pt-4 resize-none border-none w-full outline-none bg-transparent"
              placeholder="What would you like to build?"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey && e.metaKey) {
                  e.preventDefault();
                  form.handleSubmit(onSubmit)(e);
                }
              }}
            />
          )}
        />
        <div className="flex gap-x-2 items-end justify-between pt-2">
          <div className="text-[10px] text-muted-foreground font-mono">
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span>&#8984;</span>Enter
            </kbd>
            &nbsp;to submit
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={isButtonDisabled}
            className={cn(
              "size-8 rounded-full",
              isButtonDisabled && "bg-muted-foreground border"
            )}
          >
            {isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <ArrowUpIcon className="size-4" />
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MessageForm;
