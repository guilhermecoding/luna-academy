"use client";

import { useState } from "react";

/** Chave única por montagem — força remount dos gráficos e replay da animação ao reentrar na página. */
export function useChartAnimationKey() {
    const [key] = useState(() => Date.now());
    return key;
}
