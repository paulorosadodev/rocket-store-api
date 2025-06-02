import { Controller, Get, Post, Param, HttpCode, HttpStatus } from "@nestjs/common";
import { OrderService } from "./order.service";
import { Order } from "./entities/order.entity";

@Controller("orders")
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Post("checkout/:cartId")
    @HttpCode(HttpStatus.CREATED)
    checkout(@Param("cartId") cartId: string): Promise<Order> {
        return this.orderService.checkout(cartId);
    }

    @Get()
    findAll(): Promise<Order[]> {
        return this.orderService.findAllOrders();
    }

    @Get(":orderId")
    findOne(@Param("orderId") orderId: string): Promise<Order> {
        return this.orderService.findOrder(orderId);
    }
}
