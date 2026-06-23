"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  type ComponentPropsWithoutRef,
} from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
  value: number
  startValue?: number
  direction?: "up" | "down"
  delay?: number
  decimalPlaces?: number
}

const MIN_ANIMATION_DELAY_MS = 150;

function formatNumber(value: number, decimalPlaces: number) {
  return Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(Number(value.toFixed(decimalPlaces)));
}

export function NumberTicker({
  value,
  startValue = 0,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();
  const wasInViewRef = useRef(false);
  const lastPathnameRef = useRef(pathname);

  const initial = direction === "down" ? value : startValue;
  const target = direction === "down" ? startValue : value;

  const motionValue = useMotionValue(initial);
  const springValue = useSpring(motionValue, {
    damping: 50,
    stiffness: 75,
  });

  const isInView = useInView(ref, { once: true, margin: "0px", amount: 0.2 });

  useLayoutEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = formatNumber(latest, decimalPlaces);
      }
    });
  }, [springValue, decimalPlaces]);

  useEffect(() => {
    const pathChanged = lastPathnameRef.current !== pathname;
    const enteredView = isInView && (!wasInViewRef.current || pathChanged);

    wasInViewRef.current = isInView;
    lastPathnameRef.current = pathname;

    if (!enteredView) {
      return;
    }

    motionValue.set(initial);
    if (ref.current) {
      ref.current.textContent = formatNumber(initial, decimalPlaces);
    }

    let raf2 = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        timer = setTimeout(() => {
          motionValue.set(target);
        }, Math.max(delay * 1000, MIN_ANIMATION_DELAY_MS));
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      if (timer) clearTimeout(timer);
    };
  }, [isInView, pathname, initial, target, motionValue, delay, decimalPlaces]);

  return (
    <span
      ref={ref}
      className={cn(
        "inline-block tracking-wider text-black tabular-nums dark:text-white",
        className,
      )}
      {...props}
    >
      {formatNumber(initial, decimalPlaces)}
    </span>
  );
}
