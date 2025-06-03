import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AddToCartDto } from "./dto/add-to-cart.dto";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto";
import { Cart } from "./entities/cart.entity";

@Injectable()
export class CartService {
    constructor(private readonly prisma: PrismaService) {}

    async createCart(): Promise<Cart> {
        const cart = await this.prisma.cart.create({
            data: {},
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                price: true,
                                inStock: true,
                                quantity: true,
                            },
                        },
                    },
                },
            },
        });
        return cart as Cart;
    }

    async findCart(cartId: string): Promise<Cart> {
        const cart = await this.prisma.cart.findUnique({
            where: { id: cartId },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                price: true,
                                inStock: true,
                                quantity: true,
                            },
                        },
                    },
                },
            },
        });

        if (!cart) {
            throw new NotFoundException(`Cart with ID ${cartId} not found`);
        }

        return cart as Cart;
    }

    async addToCart(cartId: string, addToCartDto: AddToCartDto): Promise<Cart> {
        await this.findCart(cartId);

        const product = await this.prisma.product.findUnique({
            where: { id: addToCartDto.productId },
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${addToCartDto.productId} not found`);
        }

        if (!product.inStock || product.quantity < addToCartDto.quantity) {
            throw new BadRequestException(`Product is not available in the requested quantity. Available: ${product.quantity}`);
        }

        const existingItem = await this.prisma.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId,
                    productId: addToCartDto.productId,
                },
            },
        });

        if (existingItem) {
            const newQuantity = existingItem.quantity + addToCartDto.quantity;
            
            if (product.quantity < newQuantity) {
                throw new BadRequestException(`Not enough stock. Available: ${product.quantity}, requested: ${newQuantity}`);
            }

            await this.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQuantity },
            });
        } else {
            await this.prisma.cartItem.create({
                data: {
                    cartId,
                    productId: addToCartDto.productId,
                    quantity: addToCartDto.quantity,
                },
            });
        }

        return this.findCart(cartId);
    }

    async updateCartItem(cartId: string, productId: string, updateCartItemDto: UpdateCartItemDto): Promise<Cart> {
        await this.findCart(cartId);

        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        if (!product.inStock || product.quantity < updateCartItemDto.quantity) {
            throw new BadRequestException(`Product is not available in the requested quantity. Available: ${product.quantity}`);
        }

        const cartItem = await this.prisma.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId,
                    productId,
                },
            },
        });

        if (!cartItem) {
            throw new NotFoundException("Item not found in cart");
        }

        await this.prisma.cartItem.update({
            where: { id: cartItem.id },
            data: { quantity: updateCartItemDto.quantity },
        });

        return this.findCart(cartId);
    }

    async removeFromCart(cartId: string, productId: string): Promise<Cart> {
        await this.findCart(cartId);

        const cartItem = await this.prisma.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId,
                    productId,
                },
            },
        });

        if (!cartItem) {
            throw new NotFoundException("Item not found in cart");
        }

        await this.prisma.cartItem.delete({
            where: { id: cartItem.id },
        });

        return this.findCart(cartId);
    }

    async clearCart(cartId: string): Promise<void> {
        await this.findCart(cartId);

        await this.prisma.cartItem.deleteMany({
            where: { cartId },
        });
    }

    async getCartTotal(cartId: string): Promise<number> {
        const cart = await this.findCart(cartId);
        
        return cart.items.reduce((total, item) => {
            return total + (item.product!.price * item.quantity);
        }, 0);
    }
}
