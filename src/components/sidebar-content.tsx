"use client";

import * as React from "react";
import { ItemMenuSidebarAdmin } from "@/@types/item-menu-sidebar.type";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SheetClose } from "@/components/ui/sheet";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "@/components/ui/sidebar";
import { IconChevronRightFilled } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import { iconMap } from "@/components/icon-map-menu";

function getIcon(iconName: string): React.ReactNode {
    return iconMap[iconName] || null;
}

function isPathActive(pathname: string, url: string): boolean {
    if (pathname === url) return true;
    return pathname.startsWith(`${url}/`);
}

function collectMenuUrls(menus: ItemMenuSidebarAdmin[]): string[] {
    const urls: string[] = [];

    for (const menu of menus) {
        for (const item of menu.items) {
            urls.push(item.url);
            if (item.items) {
                for (const subItem of item.items) {
                    urls.push(subItem.url);
                }
            }
        }
    }

    return urls;
}

function getActiveUrl(pathname: string, urls: string[]): string | null {
    const matches = urls.filter((url) => isPathActive(pathname, url));
    if (matches.length === 0) return null;

    return matches.sort((a, b) => b.length - a.length)[0];
}

function SidebarMenuCollapsibleItem({
    item,
    isItemActive,
    activeUrl,
    isMobile,
}: {
    item: ItemMenuSidebarAdmin["items"][number];
    isItemActive: boolean;
    activeUrl: string | null;
    isMobile: boolean;
}) {
    const [open, setOpen] = React.useState(isItemActive);
    const hasChildren = Boolean(item.items?.length);

    React.useEffect(() => {
        if (isItemActive) setOpen(true);
    }, [isItemActive]);

    return (
        <Collapsible open={open} onOpenChange={setOpen} asChild>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={item.title} isActive={isItemActive}>
                    {isMobile ? (
                        <SheetClose asChild>
                            <Link href={item.url}>
                                {getIcon(item.icon)}
                                <span>{item.title}</span>
                            </Link>
                        </SheetClose>
                    ) : (
                        <Link href={item.url}>
                            {getIcon(item.icon)}
                            <span>{item.title}</span>
                        </Link>
                    )}
                </SidebarMenuButton>
                {hasChildren ? (
                    <>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuAction className="data-[state=open]:rotate-90">
                                <IconChevronRightFilled />
                                <span className="sr-only">Toggle</span>
                            </SidebarMenuAction>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenuSub>
                                {item.items?.map((subItem) => {
                                    const isSubItemActive = activeUrl === subItem.url;

                                    return (
                                        <SidebarMenuSubItem key={subItem.title}>
                                            <SidebarMenuSubButton asChild isActive={isSubItemActive}>
                                                {isMobile ? (
                                                    <SheetClose asChild>
                                                        <Link href={subItem.url}>
                                                            <span>{subItem.title}</span>
                                                        </Link>
                                                    </SheetClose>
                                                ) : (
                                                    <Link href={subItem.url}>
                                                        <span>{subItem.title}</span>
                                                    </Link>
                                                )}
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    );
                                })}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </>
                ) : null}
            </SidebarMenuItem>
        </Collapsible>
    );
}

/**
 * Renderiza o conteúdo do sidebar com base nos menus fornecidos.
 * @param menus - Array de objetos representando os grupos de menu e seus itens.
 */
export function SideBarContentMenus({
    menus,
}: {
    menus: ItemMenuSidebarAdmin[]
}) {
    const { isMobile } = useSidebar();
    const pathname = usePathname();
    const activeUrl = getActiveUrl(pathname, collectMenuUrls(menus));

    return (
        <>
            {menus.map((menu) => (
                <SidebarGroup key={menu.group}>
                    <SidebarGroupLabel>{menu.group}</SidebarGroupLabel>
                    <SidebarMenu>
                        {menu.items.map((item) => {
                            const isItemActive =
                                activeUrl === item.url ||
                                item.items?.some((subItem) => activeUrl === subItem.url);

                            return (
                                <SidebarMenuCollapsibleItem
                                    key={item.title}
                                    item={item}
                                    isItemActive={isItemActive ?? false}
                                    activeUrl={activeUrl}
                                    isMobile={isMobile}
                                />
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}