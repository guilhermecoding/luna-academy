import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Img,
    Html,
    Preview,
    Section,
    Text,
    Tailwind,
} from "react-email";

interface WelcomeMemberEmailProps {
    userName: string;
    userEmail: string;
    userPassword?: string;
    roleName: string; // ex: "Administrador" ou "Professor"
    systemUrl: string;
}

export const WelcomeMemberEmail = ({
    userName = "Usuário",
    userEmail,
    userPassword,
    roleName,
    systemUrl,
}: WelcomeMemberEmailProps) => {
    const previewText = `Bem-vindo ao Luna Academy! Seus dados de acesso de ${roleName} estão disponíveis.`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans px-2">
                    <Container className="border border-solid border-[#eaeaea] rounded my-10 mx-auto p-5 max-w-116.25">
                        <Section className="mt-8 text-center">
                            <Img
                                src={`${systemUrl}/logo_completa.png`}
                                width="180"
                                height="auto"
                                alt="Luna Academy"
                                className="mx-auto"
                            />
                        </Section>
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-7.5 mx-0">
                            Bem-vindo(a) ao time, <strong className="capitalize">{userName.split(" ")[0]}</strong>!
                        </Heading>
                        <Text className="text-black text-[14px] leading-6">
                            Olá! Aqui quem fala é o <strong>Gibby</strong>, o mascote do Luna Academy! 🌙
                        </Text>
                        <Text className="text-black text-[14px] leading-6">
                            Estou passando aqui para avisar que um dos nossos administradores acabou de cadastrar você no sistema como <strong>{roleName}</strong>.
                        </Text>
                        <Text className="text-black text-[14px] leading-6">
                            Aqui estão os seus dados de acesso:
                        </Text>

                        <Section className="bg-[#f6f9fc] rounded p-4 my-6">
                            <Text className="text-black text-[14px] m-0">
                                <strong>E-mail:</strong> {userEmail}
                            </Text>
                            <Text className="text-black text-[14px] mt-2 mb-0">
                                <strong>Senha:</strong> {userPassword}
                            </Text>
                        </Section>

                        <Text className="text-black text-[14px] leading-6">
                            Por questões de segurança, recomendamos que você altere essa senha assim que possível.
                        </Text>

                        <Section className="text-center mt-8 mb-8">
                            <Button
                                className="bg-[#6366f1] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                                href={systemUrl}
                            >
                                Acessar o Sistema
                            </Button>
                        </Section>

                        <Hr className="border border-solid border-[#eaeaea] my-6.5 mx-0 w-full" />
                        <Text className="text-[#666666] text-[12px] leading-6">
                            Se você não sabe do que se trata ou acredita que isso é um erro, basta ignorar este e-mail.
                            <br />
                            Abraços, <br />
                            <strong>Gibby 👾</strong>
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default WelcomeMemberEmail;
