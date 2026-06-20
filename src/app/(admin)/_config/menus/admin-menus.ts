import { ItemMenuSidebarAdmin } from "@/@types/item-menu-sidebar.type";

export const adminMenus: ItemMenuSidebarAdmin[] = [
    {
        group: "ACADÊMICO",
        items: [
            {
                title: "Grade de Horários",
                url: "/admin/[program]/horarios",
                icon: "clock",
                isActive: false,
                hiddenOnPaths: ["^/admin/programas"],
            },
            {
                title: "Matrizes Curriculares",
                url: "/admin/[program]/matrizes",
                icon: "blocks",
                isActive: false,
                hiddenOnPaths: ["^/admin/programas"],
            },
            {
                title: "Períodos",
                url: "/admin/[program]/periodos",
                icon: "calendar",
                isActive: false,
                hiddenOnPaths: ["^/admin/programas"],
            },
            {
                title: "Programas",
                url: "/admin/programas",
                icon: "backpack",
                isActive: false,
            },
            {
                title: "Turmas",
                url: "/admin/[program]/periodos/[period]/turmas",
                icon: "book",
                isActive: false,
            },
        ],
    },
    {
        group: "GERENCIAMENTO",
        items: [
            {
                title: "Alunos",
                url: "/admin/alunos",
                icon: "school",
                isActive: false,
            },
            {
                title: "Equipe",
                url: "/admin/equipe",
                icon: "users",
                isActive: false,
            },
            {
                title: "Instituições",
                url: "/admin/instituicoes",
                icon: "building-estate",
                isActive: false,
            },
        ],
    },
];
