/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CartService } from "../cart/cart.service";
import { Order } from "./entities/order.entity";

@Injectable()
export class OrderService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cartService: CartService
    ) {}

    async checkout(cartId: string): Promise<Order> {
        const cart = await this.cartService.findCart(cartId);

        if (!cart.items || cart.items.length === 0) {
            throw new BadRequestException("Cart is empty");
        }

        for (const item of cart.items) {
            const product = await this.prisma.product.findUnique({
                where: { id: item.productId },
            });

            if (!product) {
                throw new NotFoundException(`Product with ID ${item.productId} not found`);
            }

            if (!product.inStock || product.quantity < item.quantity) {
                throw new BadRequestException(
                    `Product "${product.name}" is not available in the requested quantity. Available: ${product.quantity}, requested: ${item.quantity}`
                );
            }
        }

        const total = await this.cartService.getCartTotal(cartId);

        const order = await this.prisma.$transaction(async (prisma) => {
            const newOrder = await prisma.order.create({
                data: {
                    total,
                },
            });

            for (const item of cart.items) {
                await prisma.orderItem.create({
                    data: {
                        orderId: newOrder.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.product!.price, 
                    },
                });

                const updatedProduct = await prisma.product.update({
                    where: { id: item.productId },
                    data: {
                        quantity: {
                            decrement: item.quantity,
                        },
                    },
                });

                await prisma.product.update({
                    where: { id: item.productId },
                    data: {
                        inStock: updatedProduct.quantity > 0,
                    },
                });
            }

            await prisma.cartItem.deleteMany({
                where: { cartId },
            });

            const orderWithItems = await prisma.order.findUnique({
                where: { id: newOrder.id },
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!orderWithItems) {
                throw new NotFoundException("Order not found after creation");
            }

            return orderWithItems;
        });

        return order as Order;
    }

    async findOrder(orderId: string): Promise<Order> {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }

        return order as Order;
    }

    async findAllOrders(): Promise<Order[]> {
        const orders = await this.prisma.order.findMany({
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return orders as Order[];
    }
}
