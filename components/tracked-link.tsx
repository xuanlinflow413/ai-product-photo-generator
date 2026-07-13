"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { trackConversion, type ConversionEvent } from "@/lib/conversion-analytics";

type Props = ComponentProps<typeof Link> & { conversion: ConversionEvent };

export function TrackedLink({ conversion, onClick, ...props }: Props) {
  return <Link {...props} onClick={(event) => { trackConversion(conversion); onClick?.(event); }} />;
}
