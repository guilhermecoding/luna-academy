"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { IconLogin2, IconUserShield, IconSchool, IconLoader2, IconEye, IconEyeOff, IconInfoCircle } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import TooltipText from "@/components/tooltip-text";
import GoogleLoginButton from "./google-login-button";
import {
    logGoogleAuthError,
    mapGoogleOAuthQueryError,
} from "@/lib/google-auth";
import {
    fetchSessionUser,
    validateLoginSession,
    resolveLoginTab,
    clearPersistedLoginTab,
    loginRedirectPath,
    type LoginTab,
} from "@/lib/login-session";

const loginSchema = z.object({
    email: z.string().email("Este e-mail não é válido"),
    password: z.string().min(8, "A senha deve ter ao menos 8 caracteres"),
});
type LoginInput = z.infer<typeof loginSchema>;

const emptyLoginValues: LoginInput = {
    email: "",
    password: "",
};

type LoginFormProps = {
    googleAuthEnabled: boolean;
};

export default function LoginForm({ googleAuthEnabled }: LoginFormProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<LoginTab>("teacher");
    const [showPassword, setShowPassword] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        mode: "onSubmit",
        reValidateMode: "onChange",
        defaultValues: emptyLoginValues,
    });

    const submitLogin = handleSubmit(onSubmit);

    function handleFormKeyDown(event: React.KeyboardEvent<HTMLFormElement>) {
        if (event.key !== "Enter" || event.nativeEvent.isComposing || loading) {
            return;
        }

        const target = event.target;
        if (!(target instanceof HTMLInputElement)) {
            return;
        }

        event.preventDefault();
        void submitLogin();
    }

    useEffect(() => {
        reset(emptyLoginValues);
        setActiveTab("teacher");
        setShowPassword(false);
    }, [pathname, reset]);

    async function completeLogin(activeTabValue: LoginTab) {
        const user = await fetchSessionUser();
        const validation = validateLoginSession(user, activeTabValue);

        if (!validation.ok) {
            await authClient.signOut();

            if (validation.reason === "no_user") {
                toast.error("Não foi possível validar o perfil", {
                    description: "Tente novamente em instantes.",
                });
                return;
            }

            toast.error("Usuário não encontrado", {
                description: "Ops! Não sabemos quem é você... Talvez suas credenciais estejam inválidas. Tente novamente.",
            });
            return;
        }

        const firstName = validation.user.name?.trim().split(" ")[0] || "usuário";
        toast.message(`Bem vindo(a) de volta, ${firstName}!`);

        const redirectPath = loginRedirectPath(validation.user, activeTabValue);
        if (redirectPath) {
            router.push(redirectPath);
            router.refresh();
        }
    }

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const resolvedTab = resolveLoginTab(params.get("tab"));
        setActiveTab(resolvedTab);

        const oauthProvider = params.get("oauth");
        const oauthError = params.get("error");

        if (params.get("error") === "account_disabled") {
            toast.error("Usuário não encontrado", {
                description: "Ops! Não sabemos quem é você... Talvez suas credenciais estejam inválidas. Tente novamente.",
            });
            clearPersistedLoginTab();
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
        }

        if (oauthError) {
            const { userMessage, shouldLog } = mapGoogleOAuthQueryError(oauthError);
            if (shouldLog) {
                logGoogleAuthError("oauth callback", oauthError);
            }
            toast.error(userMessage);
            clearPersistedLoginTab();
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
        }

        if (oauthProvider === "google") {
            void completeLogin(resolvedTab).finally(() => {
                clearPersistedLoginTab();
                window.history.replaceState({}, document.title, window.location.pathname);
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function onSubmit(values: LoginInput) {
        setLoading(true);
        try {
            const { error } = await authClient.signIn.email({
                email: values.email,
                password: values.password,
            });

            if (error) {
                toast.error("Usuário não encontrado", {
                    description: "Ops! Não sabemos quem é você... Talvez suas credenciais estejam inválidas. Tente novamente.",
                });
                return;
            }

            await completeLogin(activeTab);
        } catch {
            toast.error("Erro inesperado", {
                description: "Ocorreu um problema do nosso lado. Tente novamente em instantes.",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full sm:w-3/5 max-w-sm px-3 sm:px-0 space-y-6">
            <div className="flex p-1 bg-muted-foreground/10 rounded-xl border border-border/50">
                <button
                    type="button"
                    onClick={() => setActiveTab("teacher")}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all",
                        activeTab === "teacher"
                            ? "bg-background text-primary shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                    )}
                >
                    <IconSchool className="w-4 h-4" />
                    Professor
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("admin")}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all",
                        activeTab === "admin"
                            ? "bg-background text-primary shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                    )}
                >
                    <IconUserShield className="w-4 h-4" />
                    Administrador
                </button>
            </div>

            <form
                onSubmit={submitLogin}
                onKeyDown={handleFormKeyDown}
                className="w-full space-y-5"
            >
                <div className="w-full space-y-2">
                    <Label htmlFor="email" className="text-xs gap-1 font-bold uppercase tracking-wider text-muted-foreground ml-1">
                        E-mail
                        <TooltipText text="Este é o e-mail cadastrado por um administrador da escola.">
                            <IconInfoCircle className="w-3.5 h-3.5" />
                        </TooltipText>
                    </Label>
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                id="email"
                                type="email"
                                enterKeyHint="go"
                                autoComplete="email"
                                placeholder={activeTab === "admin" ? "admin@luna.com" : "professor@luna.com"}
                                className={cn(
                                    "h-12 rounded-xl border-2 px-4 outline-none transition-all focus:ring-0 bg-background",
                                    errors.email ? "border-destructive focus:border-destructive" : "border-foreground/20 focus:border-primary",
                                )}
                            />
                        )}
                    />
                    {errors.email && (
                        <p className="text-xs font-medium text-destructive ml-1">{errors.email.message}</p>
                    )}
                </div>

                <div className="w-full space-y-2">
                    <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                        Senha
                    </Label>
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <div className="relative">
                                <Input
                                    {...field}
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    enterKeyHint="go"
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className={cn(
                                        "h-12 rounded-xl border-2 px-4 pr-12 outline-none transition-all focus:ring-0 bg-background password-input-native-toggle-hidden",
                                        errors.password ? "border-destructive focus:border-destructive" : "border-foreground/20 focus:border-primary",
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                >
                                    {showPassword ? (
                                        <IconEyeOff className="size-5" />
                                    ) : (
                                        <IconEye className="size-5" />
                                    )}
                                </button>
                            </div>
                        )}
                    />
                    {errors.password && (
                        <p className="text-xs font-medium text-destructive ml-1">{errors.password.message}</p>
                    )}
                </div>

                <div className="pt-2">
                    <Button
                        type="submit"
                        className="w-full h-14 font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
                        disabled={loading}
                        aria-busy={loading}
                    >
                        {loading ? (
                            <>
                                <IconLoader2 className="animate-spin size-6" />
                                Um momento...
                            </>
                        ) : (
                            <>
                                <IconLogin2 className="size-6" />
                                Entrar
                            </>
                        )}
                    </Button>
                </div>
            </form>

            {googleAuthEnabled && (
                <>
                    <div className="flex w-full flex-row justify-center items-center gap-4 overflow-hidden">
                        <Separator className="w-full" />
                        <span className="text-muted-foreground text-sm font-medium">OU</span>
                        <Separator className="w-full" />
                    </div>
                    <GoogleLoginButton activeTab={activeTab} enabled={googleAuthEnabled} />
                </>
            )}
        </div>
    );
}
