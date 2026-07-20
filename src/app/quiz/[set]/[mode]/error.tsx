"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  preferCompatibleMode,
  withCompatibleSearchParam,
} from "@/lib/quiz-compatible";

export default function QuizRouteError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const pathname = usePathname() || "/";

  useEffect(() => {
    console.error(error);
  }, [error]);

  const compatibleHref = withCompatibleSearchParam(pathname);

  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-[var(--canvas-soft)]">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-16">
        <Card className="shadow-elevation-3 w-full border-border">
          <CardHeader>
            <CardTitle className="text-xl font-semibold tracking-[-0.4px]">
              This page couldn’t load
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
            <p>Reload to try again, or continue in compatible mode.</p>
            <p className="font-mono text-xs break-all text-muted-foreground/80">
              {error.message}
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 sm:flex-row">
            <Button className="flex-1" onClick={() => unstable_retry()}>
              Reload
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              render={<Link href={compatibleHref} />}
              onClick={() => preferCompatibleMode()}
            >
              Compatible mode
            </Button>
          </CardFooter>
        </Card>
        <Button variant="ghost" render={<Link href="/" />}>
          Go back home
        </Button>
      </main>
    </div>
  );
}
