import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CartService } from "./cart.service";
import { PrismaService } from "../prisma/prisma.service";
import { AddToCartDto } from "./dto/add-to-cart.dto";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto";
import { Cart, CartItem } from "./entities/cart.entity";

describe("CartService", () => {
    let service: CartService;

    const mockPrismaService = {
        cart: {
            create: jest.fn(),
            findUnique: jest.fn(),
        },
        cartItem: {
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            deleteMany: jest.fn(),
        },
        product: {
            findUnique: jest.fn(),
        },
    };

    const mockCart: Cart = {
        id: "cart-123",
        createdAt: new Date("2024-01-01T10:00:00Z"),
        updatedAt: new Date("2024-01-01T10:00:00Z"),
        items: [],
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

    const mockProduct = {
        id: "product-123",
        name: "Smartphone",
        price: 1299.99,
        inStock: true,
        quantity: 10,
    };

    const mockCartItem: CartItem = {
        id: "item-123",
        cartId: "cart-123",
        productId: "product-123",
        quantity: 2,
        createdAt: new Date("2024-01-01T10:00:00Z"),
        updatedAt: new Date("2024-01-01T10:00:00Z"),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CartService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<CartService>(CartService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("createCart", () => {
        it("should create a new empty cart", async () => {
            mockPrismaService.cart.create.mockResolvedValue(mockCart);

            const result = await service.createCart();

            expect(mockPrismaService.cart.create).toHaveBeenCalledWith({
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
            expect(result).toEqual(mockCart);
        });
    });

    describe("findCart", () => {
        it("should return a cart when found", async () => {
            mockPrismaService.cart.findUnique.mockResolvedValue(mockCart);

            const result = await service.findCart("cart-123");

            expect(mockPrismaService.cart.findUnique).toHaveBeenCalledWith({
                where: { id: "cart-123" },
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
            expect(result).toEqual(mockCart);
        });

        it("should throw NotFoundException when cart not found", async () => {
            mockPrismaService.cart.findUnique.mockResolvedValue(null);

            await expect(service.findCart("invalid-id")).rejects.toThrow(
                new NotFoundException("Cart with ID invalid-id not found")
            );
        });
    });

    describe("addToCart", () => {
        const addToCartDto: AddToCartDto = {
            productId: "product-123",
            quantity: 2,
        };

        it("should add a new product to cart", async () => {
            mockPrismaService.cart.findUnique
                .mockResolvedValueOnce(mockCart) // First call to verify cart exists
                .mockResolvedValueOnce(mockCartWithItems); // Second call to return updated cart
            mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
            mockPrismaService.cartItem.findUnique.mockResolvedValue(null);
            mockPrismaService.cartItem.create.mockResolvedValue(mockCartItem);

            const result = await service.addToCart("cart-123", addToCartDto);

            expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
                where: { id: "product-123" },
            });
            expect(mockPrismaService.cartItem.create).toHaveBeenCalledWith({
                data: {
                    cartId: "cart-123",
                    productId: "product-123",
                    quantity: 2,
                },
            });
            expect(result).toEqual(mockCartWithItems);
        });

        it("should update existing item quantity when product already in cart", async () => {
            const existingItem = { ...mockCartItem, quantity: 1 };
            mockPrismaService.cart.findUnique
                .mockResolvedValueOnce(mockCart) // First call to verify cart exists
                .mockResolvedValueOnce(mockCartWithItems); // Second call to return updated cart
            mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
            mockPrismaService.cartItem.findUnique.mockResolvedValue(existingItem);
            mockPrismaService.cartItem.update.mockResolvedValue({ ...existingItem, quantity: 3 });
            mockPrismaService.cart.findUnique.mockResolvedValueOnce(mockCartWithItems);

            const result = await service.addToCart("cart-123", addToCartDto);

            expect(mockPrismaService.cartItem.update).toHaveBeenCalledWith({
                where: { id: "item-123" },
                data: { quantity: 3 },
            });
            expect(result).toEqual(mockCartWithItems);
        });

        it("should throw NotFoundException when product not found", async () => {
            mockPrismaService.cart.findUnique.mockResolvedValue(mockCart);
            mockPrismaService.product.findUnique.mockResolvedValue(null);

            await expect(service.addToCart("cart-123", addToCartDto)).rejects.toThrow(
                new NotFoundException("Product with ID product-123 not found")
            );
        });

        it("should throw BadRequestException when product not in stock", async () => {
            const outOfStockProduct = { ...mockProduct, inStock: false };
            mockPrismaService.cart.findUnique.mockResolvedValue(mockCart);
            mockPrismaService.product.findUnique.mockResolvedValue(outOfStockProduct);

            await expect(service.addToCart("cart-123", addToCartDto)).rejects.toThrow(
                new BadRequestException("Product is not available in the requested quantity. Available: 10")
            );
        });

        it("should throw BadRequestException when insufficient stock", async () => {
            const lowStockProduct = { ...mockProduct, quantity: 1 };
            mockPrismaService.cart.findUnique.mockResolvedValue(mockCart);
            mockPrismaService.product.findUnique.mockResolvedValue(lowStockProduct);

            await expect(service.addToCart("cart-123", addToCartDto)).rejects.toThrow(
                new BadRequestException("Product is not available in the requested quantity. Available: 1")
            );
        });

        it("should throw BadRequestException when adding to existing item exceeds stock", async () => {
            const existingItem = { ...mockCartItem, quantity: 9 };
            const limitedStockProduct = { ...mockProduct, quantity: 10 };
            mockPrismaService.cart.findUnique.mockResolvedValue(mockCart);
            mockPrismaService.product.findUnique.mockResolvedValue(limitedStockProduct);
            mockPrismaService.cartItem.findUnique.mockResolvedValue(existingItem);

            await expect(service.addToCart("cart-123", addToCartDto)).rejects.toThrow(
                new BadRequestException("Not enough stock. Available: 10, requested: 11")
            );
        });
    });

    describe("updateCartItem", () => {
        const updateCartItemDto: UpdateCartItemDto = {
            quantity: 3,
        };

        it("should update cart item quantity", async () => {
            mockPrismaService.cart.findUnique
                .mockResolvedValueOnce(mockCart) // First call to verify cart exists
                .mockResolvedValueOnce(mockCartWithItems); // Second call to return updated cart
            mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
            mockPrismaService.cartItem.findUnique.mockResolvedValue(mockCartItem);
            mockPrismaService.cartItem.update.mockResolvedValue({ ...mockCartItem, quantity: 3 });

            const result = await service.updateCartItem("cart-123", "product-123", updateCartItemDto);

            expect(mockPrismaService.cartItem.update).toHaveBeenCalledWith({
                where: { id: "item-123" },
                data: { quantity: 3 },
            });
            expect(result).toEqual(mockCartWithItems);
        });

        it("should throw NotFoundException when product not found", async () => {
            mockPrismaService.cart.findUnique.mockResolvedValue(mockCart);
            mockPrismaService.product.findUnique.mockResolvedValue(null);

            await expect(
                service.updateCartItem("cart-123", "invalid-product", updateCartItemDto)
            ).rejects.toThrow(new NotFoundException("Product with ID invalid-product not found"));
        });

        it("should throw BadRequestException when insufficient stock", async () => {
            const lowStockProduct = { ...mockProduct, quantity: 1 };
            mockPrismaService.cart.findUnique.mockResolvedValue(mockCart);
            mockPrismaService.product.findUnique.mockResolvedValue(lowStockProduct);

            await expect(
                service.updateCartItem("cart-123", "product-123", updateCartItemDto)
            ).rejects.toThrow(
                new BadRequestException("Product is not available in the requested quantity. Available: 1")
            );
        });

        it("should throw NotFoundException when item not in cart", async () => {
            mockPrismaService.cart.findUnique.mockResolvedValue(mockCart);
            mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
            mockPrismaService.cartItem.findUnique.mockResolvedValue(null);

            await expect(
                service.updateCartItem("cart-123", "product-123", updateCartItemDto)
            ).rejects.toThrow(new NotFoundException("Item not found in cart"));
        });
    });

    describe("removeFromCart", () => {
        it("should remove item from cart", async () => {
            mockPrismaService.cart.findUnique
                .mockResolvedValueOnce(mockCart) // First call to verify cart exists
                .mockResolvedValueOnce(mockCartWithItems); // Second call to return updated cart
            mockPrismaService.cartItem.findUnique.mockResolvedValue(mockCartItem);
            mockPrismaService.cartItem.delete.mockResolvedValue(mockCartItem);

            const result = await service.removeFromCart("cart-123", "product-123");

            expect(mockPrismaService.cartItem.delete).toHaveBeenCalledWith({
                where: { id: "item-123" },
            });
            expect(result).toEqual(mockCartWithItems);
        });

        it("should throw NotFoundException when item not in cart", async () => {
            mockPrismaService.cart.findUnique.mockResolvedValue(mockCart);
            mockPrismaService.cartItem.findUnique.mockResolvedValue(null);

            await expect(service.removeFromCart("cart-123", "product-123")).rejects.toThrow(
                new NotFoundException("Item not found in cart")
            );
        });
    });

    describe("clearCart", () => {
        it("should remove all items from cart", async () => {
            mockPrismaService.cart.findUnique.mockResolvedValue(mockCart);
            mockPrismaService.cartItem.deleteMany.mockResolvedValue({ count: 2 });

            await service.clearCart("cart-123");

            expect(mockPrismaService.cartItem.deleteMany).toHaveBeenCalledWith({
                where: { cartId: "cart-123" },
            });
        });
    });

    describe("getCartTotal", () => {
        it("should calculate cart total correctly", async () => {
            mockPrismaService.cart.findUnique.mockResolvedValue(mockCartWithItems);

            const result = await service.getCartTotal("cart-123");

            expect(result).toBe(2599.98); // 2 * 1299.99
        });

        it("should return 0 for empty cart", async () => {
            mockPrismaService.cart.findUnique.mockResolvedValue(mockCart);

            const result = await service.getCartTotal("cart-123");

            expect(result).toBe(0);
        });
    });
});
