import { Controller, Get, Post, Param, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { OrderService } from "./order.service";
import { Order } from "./entities/order.entity";

@ApiTags("orders")
@Controller("orders")
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Post("checkout/:cartId")
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ 
        summary: "Checkout cart and create order",
        description: "Convert a cart into an order by processing the checkout. This will create a new order with all cart items and calculate the total price."
    })
    @ApiParam({ 
        name: "cartId", 
        description: "The unique identifier of the cart to checkout",
        example: "123e4567-e89b-12d3-a456-426614174000"
    })
    @ApiResponse({ 
        status: 201, 
        description: "Order successfully created from cart",
        type: Order
    })
    @ApiResponse({ 
        status: 404, 
        description: "Cart not found",
        schema: {
            type: "object",
            properties: {
                statusCode: { type: "number", example: 404 },
                message: { type: "string", example: "Cart not found" },
                error: { type: "string", example: "Not Found" }
            }
        }
    })
    @ApiResponse({ 
        status: 400, 
        description: "Cart is empty or invalid",
        schema: {
            type: "object",
            properties: {
                statusCode: { type: "number", example: 400 },
                message: { type: "string", example: "Cannot checkout empty cart" },
                error: { type: "string", example: "Bad Request" }
            }
        }
    })
    checkout(@Param("cartId") cartId: string): Promise<Order> {
        return this.orderService.checkout(cartId);
    }

    @Get()
    @ApiOperation({ 
        summary: "Get all orders",
        description: "Retrieve a list of all orders in the system with their items and details."
    })
    @ApiResponse({ 
        status: 200, 
        description: "List of all orders retrieved successfully",
        type: [Order],
        isArray: true
    })
    findAll(): Promise<Order[]> {
        return this.orderService.findAllOrders();
    }

    @Get(":orderId")
    @ApiOperation({ 
        summary: "Get order by ID",
        description: "Retrieve a specific order by its unique identifier, including all order items and details."
    })
    @ApiParam({ 
        name: "orderId", 
        description: "The unique identifier of the order to retrieve",
        example: "123e4567-e89b-12d3-a456-426614174000"
    })
    @ApiResponse({ 
        status: 200, 
        description: "Order retrieved successfully",
        type: Order
    })
    @ApiResponse({ 
        status: 404, 
        description: "Order not found",
        schema: {
            type: "object",
            properties: {
                statusCode: { type: "number", example: 404 },
                message: { type: "string", example: "Order not found" },
                error: { type: "string", example: "Not Found" }
            }
        }
    })
    findOne(@Param("orderId") orderId: string): Promise<Order> {
        return this.orderService.findOrder(orderId);
    }
}
