"use client";

import { SideBarContentMenus } from "@/components/sidebar-content";
import { NavUser } from "@/components/nav-user";
import { ItemMenuSidebarAdmin } from "@/@types/item-menu-sidebar.type";

import { usePathname, useParams } from "next/navigation";
import { useCanWrite } from "@/components/write-access-provider";
import Link from "next/link";
import { IconExclamationCircle } from "@tabler/icons-react";

function injectParams(url: string, params: Record<string, string | string[] | undefined>): string | null {
    let finalUrl = url;
    for (const [key, value] of Object.entries(params)) {
        if (value) {
            finalUrl = finalUrl.replace(`[${key}]`, String(value));
        }
    }
    // Se a URL final ainda tiver colchetes (ex: /admin/[program]/cursos),
    // significa que precisamos de mais parâmetros para acessá-la.
    // Retornamos null para ocultar esse link.
    if (finalUrl.includes("[")) return null;
    return finalUrl;
}

export function AdminSidebarContent({ menus }: { menus: ItemMenuSidebarAdmin[] }) {
    const pathname = usePathname();
    const params = useParams();
    const canWrite = useCanWrite();

    const filteredMenus = menus.map(group => {
        // Filtragem dos itens de nível superior
        const groupItems = group.items.reduce((acc: ItemMenuSidebarAdmin["items"], item) => {
            if (item.hiddenOnPaths?.some(p => new RegExp(p).test(pathname))) return acc;
            if (item.visibleOnPaths && !item.visibleOnPaths.some(p => new RegExp(p).test(pathname))) return acc;

            const injectedItemUrl = injectParams(item.url, params);
            if (!injectedItemUrl) return acc; // Oculta se faltar algum slug na URL

            // Tratamento de subitens
            let validSubItems: typeof item.items;
            if (item.items) {
                validSubItems = item.items.reduce((subAcc: NonNullable<typeof item.items>, subItem) => {
                    if (!canWrite && subItem.requiresWrite) return subAcc;
                    if (subItem.hiddenOnPaths?.some(p => new RegExp(p).test(pathname))) return subAcc;
                    if (subItem.visibleOnPaths && !subItem.visibleOnPaths.some(p => new RegExp(p).test(pathname))) return subAcc;

                    const injectedSubUrl = injectParams(subItem.url, params);
                    if (!injectedSubUrl) return subAcc;

                    subAcc.push({ ...subItem, url: injectedSubUrl });
                    return subAcc;
                }, []);
            }

            acc.push({ ...item, url: injectedItemUrl, items: validSubItems });
            return acc;
        }, []);

        return { ...group, items: groupItems };
    }).filter(group => {
        if (group.hiddenOnPaths?.some(p => new RegExp(p).test(pathname))) return false;
        if (group.visibleOnPaths && !group.visibleOnPaths.some(p => new RegExp(p).test(pathname))) return false;
        return group.items.length > 0;
    });

    return <SideBarContentMenus menus={filteredMenus} />;
}

export function AdminSidebarFooter() {
    return (
        <>
            <Link href="/admin/sobre" className="px-3 py-2 text-muted-foreground rounded-2xl flex items-center gap-2 hover:bg-accent">
                <IconExclamationCircle className="size-4" />
                <span className="text-sm">Sobre</span>
            </Link>
            <NavUser baseUrl="/admin" />
        </>
    );
}
