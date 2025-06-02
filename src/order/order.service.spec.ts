import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { OrderService } from "./order.service";
import { PrismaService } from "../prisma/prisma.service";
import { CartService } from "../cart/cart.service";
import { Order } from "./entities/order.entity";
import { Cart } from "../cart/entities/cart.entity";

describe("OrderService", () => {
    let service: OrderService;

    const mockPrismaService = {
        product: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        order: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
        },
        orderItem: {
            create: jest.fn(),
        },
        cartItem: {
            deleteMany: jest.fn(),
        },
        $transaction: jest.fn(),
    };

    const mockCartService = {
        findCart: jest.fn(),
        getCartTotal: jest.fn(),
    };

    const mockCartWithItems: Cart = {
        id: "cart-123",
        createdAt: new Date("2024-01-01T10:00:00Z"),
        updatedAt: new Date("2024-01-01T10:00:00Z"),
        items: [
            {
                id: "item-123",
                cartId: "cart-123",
                productId: "product-123",
                quantity: 2,
                createdAt: new Date("2024-01-01T10:00:00Z"),
                updatedAt: new Date("2024-01-01T10:00:00Z"),
                product: {
                    id: "product-123",
                    name: "Smartphone",
                    price: 1299.99,
                    inStock: true,
                    quantity: 10,
                },
            },
        ],
    };

    const mockEmptyCart: Cart = {
        id: "cart-456",
        createdAt: new Date("2024-01-01T10:00:00Z"),
        updatedAt: new Date("2024-01-01T10:00:00Z"),
        items: [],
    };

    const mockOrder: Order = {
        id: "order-123",
        total: 2599.98,
        createdAt: new Date("2024-01-01T10:00:00Z"),
        updatedAt: new Date("2024-01-01T10:00:00Z"),
        items: [
            {
                id: "order-item-123",
                orderId: "order-123",
                productId: "product-123",
                quantity: 2,
                price: 1299.99,
                createdAt: new Date("2024-01-01T10:00:00Z"),
                updatedAt: new Date("2024-01-01T10:00:00Z"),
                product: {
                    id: "product-123",
                    name: "Smartphone",
                },
            },
        ],
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrderService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
                {
                    provide: CartService,
                    useValue: mockCartService,
                },
            ],
        }).compile();

        service = module.get<OrderService>(OrderService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("checkout", () => {
        it("should successfully checkout a cart with valid items", async () => {
            const mockProduct = {
                id: "product-123",
                name: "Smartphone",
                price: 1299.99,
                quantity: 10,
                inStock: true,
                description: "Latest smartphone",
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockCartService.findCart.mockResolvedValue(mockCartWithItems);
            mockCartService.getCartTotal.mockResolvedValue(2599.98);
            mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
            mockPrismaService.$transaction.mockResolvedValue(mockOrder);

            const result = await service.checkout("cart-123");

            expect(mockCartService.findCart).toHaveBeenCalledWith("cart-123");
            expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
                where: { id: "product-123" },
            });
            expect(result).toEqual(mockOrder);
        });

        it("should throw BadRequestException when cart is empty", async () => {
            mockCartService.findCart.mockResolvedValue(mockEmptyCart);

            await expect(service.checkout("cart-456")).rejects.toThrow(
                new BadRequestException("Cart is empty")
            );

            expect(mockCartService.findCart).toHaveBeenCalledWith("cart-456");
        });

        it("should throw NotFoundException when product not found during checkout", async () => {
            mockCartService.findCart.mockResolvedValue(mockCartWithItems);
            mockPrismaService.product.findUnique.mockResolvedValue(null);

            await expect(service.checkout("cart-123")).rejects.toThrow(
                new NotFoundException("Product with ID product-123 not found")
            );

            expect(mockCartService.findCart).toHaveBeenCalledWith("cart-123");
            expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
                where: { id: "product-123" },
            });
        });

        it("should throw BadRequestException when product is out of stock during checkout", async () => {
            const mockOutOfStockProduct = {
                id: "product-123",
                name: "Smartphone",
                price: 1299.99,
                quantity: 0,
                inStock: false,
                description: "Latest smartphone",
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockCartService.findCart.mockResolvedValue(mockCartWithItems);
            mockPrismaService.product.findUnique.mockResolvedValue(mockOutOfStockProduct);

            await expect(service.checkout("cart-123")).rejects.toThrow(
                new BadRequestException(
                    "Product \"Smartphone\" is not available in the requested quantity. Available: 0, requested: 2"
                )
            );

            expect(mockCartService.findCart).toHaveBeenCalledWith("cart-123");
            expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
                where: { id: "product-123" },
            });
        });

        it("should throw BadRequestException when insufficient stock during checkout", async () => {
            const mockLowStockProduct = {
                id: "product-123",
                name: "Smartphone",
                price: 1299.99,
                quantity: 1,
                inStock: true,
                description: "Latest smartphone",
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockCartService.findCart.mockResolvedValue(mockCartWithItems);
            mockPrismaService.product.findUnique.mockResolvedValue(mockLowStockProduct);

            await expect(service.checkout("cart-123")).rejects.toThrow(
                new BadRequestException(
                    "Product \"Smartphone\" is not available in the requested quantity. Available: 1, requested: 2"
                )
            );

            expect(mockCartService.findCart).toHaveBeenCalledWith("cart-123");
            expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
                where: { id: "product-123" },
            });
        });

        it("should throw NotFoundException when order not found after creation", async () => {
            const mockProduct = {
                id: "product-123",
                name: "Smartphone",
                price: 1299.99,
                quantity: 10,
                inStock: true,
                description: "Latest smartphone",
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockCartService.findCart.mockResolvedValue(mockCartWithItems);
            mockCartService.getCartTotal.mockResolvedValue(2599.98);
            mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
            
            // Mock the transaction to execute the callback and simulate the order not being found after creation
            mockPrismaService.$transaction.mockImplementation((callback: any) => {
                // Simulate the transaction execution but return null when trying to find the created order
                return callback({
                    order: {
                        create: jest.fn().mockResolvedValue({ id: "order-123" }),
                        findUnique: jest.fn().mockResolvedValue(null), // Order not found after creation
                    },
                    orderItem: {
                        create: jest.fn(),
                    },
                    product: {
                        update: jest.fn()
                            .mockResolvedValueOnce({ ...mockProduct, quantity: 8 }) // First update call (decrement)
                            .mockResolvedValueOnce({ ...mockProduct, quantity: 8, inStock: true }), // Second update call (inStock)
                    },
                    cartItem: {
                        deleteMany: jest.fn(),
                    },
                }) as Promise<any>;
            });

            await expect(service.checkout("cart-123")).rejects.toThrow(
                new NotFoundException("Order not found after creation")
            );

            expect(mockCartService.findCart).toHaveBeenCalledWith("cart-123");
            expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
                where: { id: "product-123" },
            });
        });
    });

    describe("findOrder", () => {
        it("should return an order when found", async () => {
            mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

            const result = await service.findOrder("order-123");

            expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
                where: { id: "order-123" },
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
            expect(result).toEqual(mockOrder);
        });

        it("should throw NotFoundException when order not found", async () => {
            mockPrismaService.order.findUnique.mockResolvedValue(null);

            await expect(service.findOrder("invalid-order")).rejects.toThrow(
                new NotFoundException("Order with ID invalid-order not found")
            );
        });
    });

    describe("findAllOrders", () => {
        it("should return all orders ordered by creation date desc", async () => {
            const orders = [mockOrder];
            mockPrismaService.order.findMany.mockResolvedValue(orders);

            const result = await service.findAllOrders();

            expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
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
            expect(result).toEqual(orders);
        });

        it("should return empty array when no orders exist", async () => {
            mockPrismaService.order.findMany.mockResolvedValue([]);

            const result = await service.findAllOrders();

            expect(result).toEqual([]);
        });
    });
});
