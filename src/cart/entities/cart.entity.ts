export class Cart {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    items: CartItem[];
}

export class CartItem {
    id: string;
    cartId: string;
    productId: string;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
    cart?: Cart;
    product?: {
        id: string;
        name: string;
        price: number;
        inStock: boolean;
        quantity: number;
    };
}
