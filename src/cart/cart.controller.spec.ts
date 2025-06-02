import { Test, TestingModule } from "@nestjs/testing";
import { CartController } from "./cart.controller";
import { CartService } from "./cart.service";
import { AddToCartDto } from "./dto/add-to-cart.dto";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto";
import { Cart } from "./entities/cart.entity";

describe("CartController", () => {
    let controller: CartController;

    const mockCartService = {
        createCart: jest.fn(),
        findCart: jest.fn(),
        addToCart: jest.fn(),
        updateCartItem: jest.fn(),
        removeFromCart: jest.fn(),
        clearCart: jest.fn(),
        getCartTotal: jest.fn(),
    };

    const mockCart: Cart = {
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

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CartController],
            providers: [
                {
                    provide: CartService,
                    useValue: mockCartService,
                },
            ],
        }).compile();

        controller = module.get<CartController>(CartController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("createCart", () => {
        it("should create a new cart", async () => {
            const emptyCart = { ...mockCart, items: [] };
            mockCartService.createCart.mockResolvedValue(emptyCart);

            const result = await controller.createCart();

            expect(mockCartService.createCart).toHaveBeenCalled();
            expect(result).toEqual(emptyCart);
        });
    });

    describe("findCart", () => {
        it("should return a cart by id", async () => {
            mockCartService.findCart.mockResolvedValue(mockCart);

            const result = await controller.findCart("cart-123");

            expect(mockCartService.findCart).toHaveBeenCalledWith("cart-123");
            expect(result).toEqual(mockCart);
        });
    });

    describe("addToCart", () => {
        it("should add product to cart", async () => {
            const addToCartDto: AddToCartDto = {
                productId: "product-123",
                quantity: 2,
            };
            mockCartService.addToCart.mockResolvedValue(mockCart);

            const result = await controller.addToCart("cart-123", addToCartDto);

            expect(mockCartService.addToCart).toHaveBeenCalledWith("cart-123", addToCartDto);
            expect(result).toEqual(mockCart);
        });
    });

    describe("updateCartItem", () => {
        it("should update cart item quantity", async () => {
            const updateCartItemDto: UpdateCartItemDto = {
                quantity: 3,
            };
            mockCartService.updateCartItem.mockResolvedValue(mockCart);

            const result = await controller.updateCartItem("cart-123", "product-123", updateCartItemDto);

            expect(mockCartService.updateCartItem).toHaveBeenCalledWith("cart-123", "product-123", updateCartItemDto);
            expect(result).toEqual(mockCart);
        });
    });

    describe("removeFromCart", () => {
        it("should remove product from cart", async () => {
            mockCartService.removeFromCart.mockResolvedValue(undefined);

            await controller.removeFromCart("cart-123", "product-123");

            expect(mockCartService.removeFromCart).toHaveBeenCalledWith("cart-123", "product-123");
        });
    });

    describe("clearCart", () => {
        it("should clear all items from cart", async () => {
            mockCartService.clearCart.mockResolvedValue(undefined);

            await controller.clearCart("cart-123");

            expect(mockCartService.clearCart).toHaveBeenCalledWith("cart-123");
        });
    });

    describe("getCartTotal", () => {
        it("should return cart total", async () => {
            const expectedTotal = 2599.98;
            mockCartService.getCartTotal.mockResolvedValue(expectedTotal);

            const result = await controller.getCartTotal("cart-123");

            expect(mockCartService.getCartTotal).toHaveBeenCalledWith("cart-123");
            expect(result).toEqual({ total: expectedTotal });
        });
    });
});
