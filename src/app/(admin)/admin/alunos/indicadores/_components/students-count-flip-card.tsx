import WrapperFlipCardIndicator from "@/components/wrapper-flip-card-indicator";

export default function StudentsCountFlipCard() {
    return (
        <WrapperFlipCardIndicator title="Total de alunos"
            className="w-72"
        >
            <div className="py-4">
                <span className="text-foreground text-3xl font-bold ">217</span>
            </div>
        </WrapperFlipCardIndicator>
    );
}
