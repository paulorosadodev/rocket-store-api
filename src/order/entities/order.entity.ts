import { ApiProperty } from "@nestjs/swagger";

export class Order {
    @ApiProperty({
        description: "ID único do pedido",
        example: "clp1a2b3c4d5e6f7g8h9i0j1"
    })
        id: string;

    @ApiProperty({
        description: "Valor total do pedido",
        example: 2599.98
    })
        total: number;

    @ApiProperty({
        description: "Data de criação do pedido",
        example: "2024-01-01T10:00:00Z"
    })
        createdAt: Date;

    @ApiProperty({
        description: "Data da última atualização do pedido",
        example: "2024-01-01T15:30:00Z"
    })
        updatedAt: Date;

    @ApiProperty({
        description: "Itens do pedido",
        type: () => [OrderItem]
    })
        items: OrderItem[];
}

export class OrderItem {
    @ApiProperty({
        description: "ID único do item do pedido",
        example: "clp1a2b3c4d5e6f7g8h9i0j4"
    })
        id: string;

    @ApiProperty({
        description: "ID do pedido ao qual o item pertence",
        example: "clp1a2b3c4d5e6f7g8h9i0j1"
    })
        orderId: string;

    @ApiProperty({
        description: "ID do produto",
        example: "clp1a2b3c4d5e6f7g8h9i0j3"
    })
        productId: string;

    @ApiProperty({
        description: "Quantidade do produto no pedido",
        example: 2
    })
        quantity: number;

    @ApiProperty({
        description: "Preço unitário do produto no momento do pedido",
        example: 1299.99
    })
        price: number;

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
        description: "Pedido ao qual o item pertence",
        type: () => Order,
        required: false
    })
        order?: Order;

    @ApiProperty({
        description: "Informações básicas do produto",
        required: false
    })
        product?: {
        id: string;
        name: string;
    };
}
