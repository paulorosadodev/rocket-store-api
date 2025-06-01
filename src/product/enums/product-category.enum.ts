export enum ProductCategory {
    ELETRONICOS = "ELETRONICOS",
    ROUPAS = "ROUPAS", 
    LIVROS = "LIVROS",
    CASA_JARDIM = "CASA_JARDIM",
    ESPORTES = "ESPORTES",
    BELEZA = "BELEZA",
    BRINQUEDOS = "BRINQUEDOS",
    AUTOMOTIVO = "AUTOMOTIVO",
    ALIMENTOS_BEBIDAS = "ALIMENTOS_BEBIDAS",
    SAUDE = "SAUDE",
}

export const PRODUCT_CATEGORIES = Object.values(ProductCategory);

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
    [ProductCategory.ELETRONICOS]: "Eletrônicos",
    [ProductCategory.ROUPAS]: "Roupas e Acessórios",
    [ProductCategory.LIVROS]: "Livros",
    [ProductCategory.CASA_JARDIM]: "Casa e Jardim",
    [ProductCategory.ESPORTES]: "Esportes e Lazer",
    [ProductCategory.BELEZA]: "Beleza e Cuidados",
    [ProductCategory.BRINQUEDOS]: "Brinquedos",
    [ProductCategory.AUTOMOTIVO]: "Automotivo",
    [ProductCategory.ALIMENTOS_BEBIDAS]: "Alimentos e Bebidas",
    [ProductCategory.SAUDE]: "Saúde",
};

export const LABEL_TO_CATEGORY: Record<string, ProductCategory> = Object.entries(PRODUCT_CATEGORY_LABELS)
    .reduce((acc, [key, value]) => {
        acc[value] = key as ProductCategory;
        return acc;
    }, {} as Record<string, ProductCategory>);

export function findCategoryByValueOrLabel(input: string): ProductCategory | null {
    if (Object.values(ProductCategory).includes(input as ProductCategory)) {
        return input as ProductCategory;
    }
    
    return LABEL_TO_CATEGORY[input] || null;
}

export function getInvalidCategoryErrorMessage(): string {
    const categoryList = Object.entries(PRODUCT_CATEGORY_LABELS)
        .map(([key, label]) => `${key} (${label})`)
        .join(", ");
    
    return `Categoria inválida. As categorias válidas são: ${categoryList}`;
}
