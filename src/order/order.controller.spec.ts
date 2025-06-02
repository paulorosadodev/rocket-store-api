import { Test, TestingModule } from "@nestjs/testing";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { Order } from "./entities/order.entity";

describe("OrderController", () => {
    let controller: OrderController;

    const mockOrderService = {
        checkout: jest.fn(),
        findOrder: jest.fn(),
        findAllOrders: jest.fn(),
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
            controllers: [OrderController],
            providers: [
                {
                    provide: OrderService,
                    useValue: mockOrderService,
                },
            ],
        }).compile();

        controller = module.get<OrderController>(OrderController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("checkout", () => {
        it("should checkout a cart and return the order", async () => {
            mockOrderService.checkout.mockResolvedValue(mockOrder);

            const result = await controller.checkout("cart-123");

            expect(mockOrderService.checkout).toHaveBeenCalledWith("cart-123");
            expect(result).toEqual(mockOrder);
        });
    });

    describe("findAll", () => {
        it("should return all orders", async () => {
            const orders = [mockOrder];
            mockOrderService.findAllOrders.mockResolvedValue(orders);

            const result = await controller.findAll();

            expect(mockOrderService.findAllOrders).toHaveBeenCalled();
            expect(result).toEqual(orders);
        });

        it("should return empty array when no orders exist", async () => {
            mockOrderService.findAllOrders.mockResolvedValue([]);

            const result = await controller.findAll();

            expect(mockOrderService.findAllOrders).toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });

    describe("findOne", () => {
        it("should return an order by id", async () => {
            mockOrderService.findOrder.mockResolvedValue(mockOrder);

            const result = await controller.findOne("order-123");

            expect(mockOrderService.findOrder).toHaveBeenCalledWith("order-123");
            expect(result).toEqual(mockOrder);
        });
    });
});
