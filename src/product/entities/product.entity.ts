import { Product as PrismaProduct } from "../../../generated/prisma";
import { ProductCategory } from "../enums/product-category.enum";

export class Product implements Omit<PrismaProduct, "category"> {
    id: string;
    name: string;
    description: string | null;
    price: number;
    category: ProductCategory;
    inStock: boolean;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}
