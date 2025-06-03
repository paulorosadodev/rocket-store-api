import { ApiProperty } from "@nestjs/swagger";
import { Product as PrismaProduct } from "../../../generated/prisma";
import { ProductCategory } from "../enums/product-category.enum";

export class Product implements Omit<PrismaProduct, "category"> {
    @ApiProperty({
        description: "ID único do produto",
        example: "clp1a2b3c4d5e6f7g8h9i0j1"
    })
        id: string;

    @ApiProperty({
        description: "Nome do produto",
        example: "Smartphone Samsung Galaxy S24"
    })
        name: string;

    @ApiProperty({
        description: "Descrição do produto",
        example: "Smartphone com tela de 6.1 polegadas, câmera tripla de 50MP e 128GB de armazenamento",
        nullable: true
    })
        description: string | null;

    @ApiProperty({
        description: "Preço do produto em reais",
        example: 1299.99
    })
        price: number;

    @ApiProperty({
        description: "Categoria do produto",
        enum: ProductCategory,
        example: ProductCategory.ELETRONICOS
    })
        category: ProductCategory;

    @ApiProperty({
        description: "Indica se o produto está em estoque",
        example: true
    })
        inStock: boolean;

    @ApiProperty({
        description: "Quantidade disponível em estoque",
        example: 50
    })
        quantity: number;

    @ApiProperty({
        description: "Data de criação do produto",
        example: "2024-01-01T10:00:00Z"
    })
        createdAt: Date;

    @ApiProperty({
        description: "Data da última atualização do produto",
        example: "2024-01-01T15:30:00Z"
    })
        updatedAt: Date;
}
