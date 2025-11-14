'use client';

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold">Something went wrong!</h1>
            <p className="mb-8 text-muted-foreground">
              An unexpected error occurred. Please try again.
            </p>
            {error?.message && (
              <pre className="mb-8 whitespace-pre-wrap rounded-md bg-muted p-4 text-left text-sm font-mono text-muted-foreground">
                {error.message}
              </pre>
            )}
            <Button onClick={() => reset()}>Try again</Button>
          </div>
        </div>
      </body>
    </html>
  );
}
