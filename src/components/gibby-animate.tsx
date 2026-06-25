"use client";

import { cn } from "@/lib/utils";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const GIBBY_SIZE_PX = 76;

interface GibbyAnimateProps {
    className?: string;
    size?: number;
}

export default function GibbyAnimate({ className, size = GIBBY_SIZE_PX }: GibbyAnimateProps) {
    return (
        <div
            className={cn("inline-flex shrink-0", className)}
            style={{ width: size, height: size }}
        >
            <DotLottieReact
                src="/gibby-animate.lottie"
                loop
                autoplay
                width={size}
                height={size}
                className="block size-full"
            />
        </div>
    );
}
