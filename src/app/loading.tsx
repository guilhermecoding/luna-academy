import { DualArc } from "@/components/dual-arc";
import Image from "next/image";

export default function Loading() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-6">
                <Image
                    src="/gibby-normal-icon.svg"
                    alt="Logo"
                    width={32}
                    height={32}
                    className="pointer-events-none w-28 h-28 grayscale-90 brightness-150 opacity-70"
                    loading="eager"
                />
                <DualArc className="size-10 text-primary/40" />
            </div>
        </div>
    );
}
