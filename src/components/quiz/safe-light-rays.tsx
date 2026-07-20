"use client";

import { Component, type ReactNode } from "react";

import { LightRays } from "@/components/ui/light-rays";

interface State {
  failed: boolean;
}

/** Drops decorative rays if motion/effects throw, without crashing the quiz. */
class LightRaysGuard extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.error("LightRays failed; continuing without effects.", error);
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

export function SafeLightRays(
  props: React.ComponentProps<typeof LightRays>
) {
  return (
    <LightRaysGuard>
      <LightRays {...props} />
    </LightRaysGuard>
  );
}
