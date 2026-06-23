/** Faixas etárias alinhadas aos avatares do projeto (`AvatarUsers`). */
export const AGE_RANGE_VALUES = [
    "BABY",
    "CHILDREN_I",
    "CHILDREN_II",
    "TEEN",
    "YOUNG",
    "ADULT",
    "SENIOR",
] as const;

export type AgeRangeValue = (typeof AGE_RANGE_VALUES)[number];

export const AGE_RANGE_LABELS_PT: Record<AgeRangeValue, string> = {
    BABY: "Bebê",
    CHILDREN_I: "Infantil I",
    CHILDREN_II: "Infantil II",
    TEEN: "Adolescente",
    YOUNG: "Jovem",
    ADULT: "Adulto",
    SENIOR: "Idoso",
};

export const AGE_RANGE_INTERVALS: Record<AgeRangeValue, string> = {
    BABY: "0-3",
    CHILDREN_I: "4-8",
    CHILDREN_II: "9-12",
    TEEN: "13-16",
    YOUNG: "17-24",
    ADULT: "25-60",
    SENIOR: "61+",
};
