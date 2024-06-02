"use client"

import type * as alphaTabTypes from "@coderline/alphatab";
import Script from "next/script";
export type AlphaTab = typeof alphaTabTypes;
export type * from "@coderline/alphatab";

export interface AlphaTabLoaderProps {
  onLoad?: (e: AlphaTab) => void;
}

export function AlphaTabLoader(props: AlphaTabLoaderProps) {
  async function alphaTabLoaded() {
    if (props.onLoad) {
      props.onLoad(await import("@coderline/alphatab"));
    }
  }

  return (
    <Script
      src="/alphatab/alphaTab.min.js"
      strategy="lazyOnload"
      onLoad={alphaTabLoaded} />
  );
}
