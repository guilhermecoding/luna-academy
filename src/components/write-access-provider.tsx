"use client";

import { createContext, useContext } from "react";

const WriteAccessContext = createContext(false);

export function WriteAccessProvider({
    canWrite,
    children,
}: {
    canWrite: boolean;
    children: React.ReactNode;
}) {
    return (
        <WriteAccessContext.Provider value={canWrite}>
            {children}
        </WriteAccessContext.Provider>
    );
}

export function useCanWrite(): boolean {
    return useContext(WriteAccessContext);
}
