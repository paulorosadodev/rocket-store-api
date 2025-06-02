import { Module } from "@nestjs/common";
import { ProductModule } from "./product/product.module";
import { CartModule } from "./cart/cart.module";
import { OrderModule } from "./order/order.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
    imports: [PrismaModule, ProductModule, CartModule, OrderModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
