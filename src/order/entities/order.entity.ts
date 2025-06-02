export class Order {
    id: string;
    total: number;
    createdAt: Date;
    updatedAt: Date;
    items: OrderItem[];
}

export class OrderItem {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: number; 
    createdAt: Date;
    updatedAt: Date;
    order?: Order;
    product?: {
        id: string;
        name: string;
    };
}
