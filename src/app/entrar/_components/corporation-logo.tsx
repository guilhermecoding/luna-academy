"use client";

import { useState } from "react";
import Image from "next/image";

type CorporationLogoProps = {
    logoCorporation?: string;
};

export default function CorporationLogo({ logoCorporation }: CorporationLogoProps) {
    const [showCorporationLogo, setShowCorporationLogo] = useState(Boolean(logoCorporation));

    if (!showCorporationLogo || !logoCorporation) {
        return null;
    }

    return (
        <Image
            src={logoCorporation}
            alt="Logo"
            width={100}
            height={100}
            className="size-15 object-contain mt-3 pointer-events-none"
            onError={() => setShowCorporationLogo(false)}
        />
    );
}
