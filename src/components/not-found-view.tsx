import img from "@/assets/images/pagina-perdida.svg";
import Image from "next/image";
import Page from "@/components/page";
import Section from "@/components/section";
import { ButtonLink } from "./ui/button-link";

export default function NotFoundView() {
    return (
        <Page>
            <Section>
                <div className="mx-auto flex w-full max-w-md flex-col items-center py-16 text-center">
                    <Image
                        src={img}
                        alt="Página não encontrada"
                        width={400}
                        height={400}
                        className="mx-auto h-auto w-full max-w-sm"
                        loading="eager"
                    />
                    <h1 className="text-2xl font-bold">Ops! Não há nada aqui...</h1>
                    <p className="text-muted-foreground">
                        A página que você está procurando não existe.
                    </p>
                    <ButtonLink
                        href="/"
                        className="w-full sm:w-auto mt-6"
                    >
                        Voltar para a página inicial
                    </ButtonLink>
                </div>
            </Section>
        </Page>
    );
}
