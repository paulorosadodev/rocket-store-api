import { ApiProperty } from "@nestjs/swagger";

export class Cart {
    @ApiProperty({
        description: "ID único do carrinho",
        example: "clp1a2b3c4d5e6f7g8h9i0j1"
    })
        id: string;

    @ApiProperty({
        description: "Data de criação do carrinho",
        example: "2024-01-01T10:00:00Z"
    })
        createdAt: Date;

    @ApiProperty({
        description: "Data da última atualização do carrinho",
        example: "2024-01-01T15:30:00Z"
    })
        updatedAt: Date;

    @ApiProperty({
        description: "Itens no carrinho",
        type: () => [CartItem]
    })
        items: CartItem[];
}

export class CartItem {
    @ApiProperty({
        description: "ID único do item do carrinho",
        example: "clp1a2b3c4d5e6f7g8h9i0j2"
    })
        id: string;

    @ApiProperty({
        description: "ID do carrinho ao qual o item pertence",
        example: "clp1a2b3c4d5e6f7g8h9i0j1"
    })
        cartId: string;

    @ApiProperty({
        description: "ID do produto",
        example: "clp1a2b3c4d5e6f7g8h9i0j3"
    })
        productId: string;

    @ApiProperty({
        description: "Quantidade do produto no carrinho",
        example: 2
    })
        quantity: number;

    @ApiProperty({
        description: "Data de criação do item",
        example: "2024-01-01T10:00:00Z"
    })
        createdAt: Date;

    @ApiProperty({
        description: "Data da última atualização do item",
        example: "2024-01-01T15:30:00Z"
    })
        updatedAt: Date;

    @ApiProperty({
        description: "Carrinho ao qual o item pertence",
        type: () => Cart,
        required: false
    })
        cart?: Cart;

    @ApiProperty({
        description: "Informações do produto",
        required: false
    })
        product?: {
        id: string;
        name: string;
        price: number;
        inStock: boolean;
        quantity: number;
    };
}
