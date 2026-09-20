import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

/**
 * Markdown básico y seguro: react-markdown no interpreta HTML crudo y filtra URLs
 * peligrosas (javascript:). Además se deshabilitan imágenes incrustadas.
 */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("space-y-3 text-[15px] leading-relaxed text-ink", className)}>
      <ReactMarkdown
        disallowedElements={["img", "h1"]}
        unwrapDisallowed
        components={{
          h2: (p) => <h2 className="pt-2 text-lg font-bold text-ink" {...p} />,
          h3: (p) => <h3 className="pt-1 text-base font-bold text-ink" {...p} />,
          p: (p) => <p className="whitespace-pre-line" {...p} />,
          ul: (p) => <ul className="list-disc space-y-1 pl-6" {...p} />,
          ol: (p) => <ol className="list-decimal space-y-1 pl-6" {...p} />,
          blockquote: (p) => <blockquote className="border-l-4 border-line pl-4 text-muted" {...p} />,
          code: (p) => <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-[13px]" {...p} />,
          pre: (p) => <pre className="overflow-x-auto rounded-xl bg-surface p-3 text-[13px]" {...p} />,
          a: ({ href, ...p }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer nofollow ugc"
              className="font-medium text-brand underline-offset-2 hover:underline"
              {...p}
            />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
