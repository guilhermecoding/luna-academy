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
                items: [
                    { title: "Novo Horário", url: "/admin/[program]/horarios/novo", requiresWrite: true },
                ],
            },
            {
                title: "Matrizes Curriculares",
                url: "/admin/[program]/matrizes",
                icon: "blocks",
                isActive: false,
                hiddenOnPaths: ["^/admin/programas"],
                items: [
                    { title: "Nova Matriz", url: "/admin/[program]/matrizes/novo", requiresWrite: true },
                ],
            },
            {
                title: "Períodos",
                url: "/admin/[program]/periodos",
                icon: "calendar",
                isActive: false,
                hiddenOnPaths: ["^/admin/programas"],
                items: [
                    { title: "Novo Período", url: "/admin/[program]/periodos/novo", requiresWrite: true },
                ],
            },
            {
                title: "Programas",
                url: "/admin/programas",
                icon: "backpack",
                isActive: false,
                items: [
                    { title: "Criar Programa", url: "/admin/programas/novo", requiresWrite: true },
                ],
            },
            {
                title: "Turmas",
                url: "/admin/[program]/periodos/[period]/turmas",
                icon: "book",
                isActive: false,
                items: [
                    { title: "Nova Turma", url: "/admin/[program]/periodos/[period]/turmas/novo", requiresWrite: true },
                ],
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
                items: [
                    { title: "Adicionar Aluno", url: "/admin/alunos/novo", requiresWrite: true },
                    { title: "Listar Alunos deste Período", url: "/admin/[program]/periodos/[period]/alunos" },
                    { title: "Todos os alunos", url: "/admin/alunos" },
                ],
            },
            {
                title: "Equipe",
                url: "/admin/equipe",
                icon: "users",
                isActive: false,
                items: [
                    { title: "Administradores", url: "/admin/equipe/administradores" },
                    { title: "Professores", url: "/admin/equipe/professores" },
                ],
            },
            {
                title: "Instituições",
                url: "/admin/instituicoes",
                icon: "building-estate",
                isActive: false,
                items: [
                    { title: "Adicionar Instituição", url: "/admin/instituicoes/novo", requiresWrite: true },
                ],
            },
        ],
    },
];
