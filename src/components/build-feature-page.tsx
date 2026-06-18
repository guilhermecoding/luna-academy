import React from "react";
import Page from "./page";
import Section from "./section";
import Image from "next/image";
import img from "@/assets/images/build-up.svg";

export default function BuildFeaturePage() {
    return (
        <Page>
            <Section>
                <div className="flex flex-col items-center gap-1 mb-3">
                    <Image
                        src={img}
                        alt="Logo"
                        width={32}
                        height={32}
                        className="pointer-events-none w-100"
                    />
                    <p className="text-muted-foreground text-2xl text-center font-bold">Ops! Ainda estamos construindo isso</p>
                </div>
            </Section>
        </Page>
    );
}
