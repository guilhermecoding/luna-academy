"use client";

import { cn } from "@/lib/utils";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const GIBBY_SIZE_PX = 76;

interface GibbyAnimateProps {
    className?: string;
}

export default function GibbyAnimate({ className }: GibbyAnimateProps) {
    return (
        <div
            className={cn("inline-flex shrink-0", className)}
            style={{ width: GIBBY_SIZE_PX, height: GIBBY_SIZE_PX }}
        >
            <DotLottieReact
                src="/gibby-animate.lottie"
                loop
                autoplay
                width={GIBBY_SIZE_PX}
                height={GIBBY_SIZE_PX}
                className="block size-full"
            />
        </div>
    );
}
