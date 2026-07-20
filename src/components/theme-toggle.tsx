"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  if (!mounted) {
    return (
      <span
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "pointer-events-none"
        )}
        aria-hidden
      />
    );
  }

  return (
    <AnimatedThemeToggler
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      onThemeChange={setTheme}
      className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
    />
  );
}
