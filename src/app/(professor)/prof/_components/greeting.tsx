"use client";

function timeGreeting(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Bom dia";
    if (hour >= 12 && hour < 18) return "Boa tarde";
    return "Boa noite";
}

export function Greeting({
    userName,
    className = "text-3xl font-black text-foreground mb-2",
}: {
    userName: string;
    className?: string;
}) {
    const greeting = timeGreeting();
    const firstName = userName.split(" ")[0];

    return (
        <p className={className}>
            {greeting}, {firstName}!
        </p>
    );
}
