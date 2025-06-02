import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from "@nestjs/common";
import { CartService } from "./cart.service";
import { AddToCartDto } from "./dto/add-to-cart.dto";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto";
import { Cart } from "./entities/cart.entity";

@Controller("carts")
export class CartController {
    constructor(private readonly cartService: CartService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    createCart(): Promise<Cart> {
        return this.cartService.createCart();
    }

    @Get(":cartId")
    findCart(@Param("cartId") cartId: string): Promise<Cart> {
        return this.cartService.findCart(cartId);
    }

    @Post(":cartId/items")
    addToCart(
        @Param("cartId") cartId: string,
        @Body() addToCartDto: AddToCartDto
    ): Promise<Cart> {
        return this.cartService.addToCart(cartId, addToCartDto);
    }

    @Put(":cartId/items/:productId")
    updateCartItem(
        @Param("cartId") cartId: string,
        @Param("productId") productId: string,
        @Body() updateCartItemDto: UpdateCartItemDto
    ): Promise<Cart> {
        return this.cartService.updateCartItem(cartId, productId, updateCartItemDto);
    }

    @Delete(":cartId/items/:productId")
    @HttpCode(HttpStatus.NO_CONTENT)
    async removeFromCart(
        @Param("cartId") cartId: string,
        @Param("productId") productId: string
    ): Promise<void> {
        await this.cartService.removeFromCart(cartId, productId);
    }

    @Delete(":cartId/items")
    @HttpCode(HttpStatus.NO_CONTENT)
    async clearCart(@Param("cartId") cartId: string): Promise<void> {
        await this.cartService.clearCart(cartId);
    }

    @Get(":cartId/total")
    async getCartTotal(@Param("cartId") cartId: string): Promise<{ total: number }> {
        const total = await this.cartService.getCartTotal(cartId);
        return { total };
    }
}
