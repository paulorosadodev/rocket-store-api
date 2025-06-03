import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from "@nestjs/swagger";
import { CartService } from "./cart.service";
import { AddToCartDto } from "./dto/add-to-cart.dto";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto";
import { Cart } from "./entities/cart.entity";

@ApiTags("cart")
@Controller("carts")
export class CartController {
    constructor(private readonly cartService: CartService) {}

    @ApiOperation({ 
        summary: "Criar carrinho",
        description: "Cria um novo carrinho de compras vazio"
    })
    @ApiResponse({ 
        status: 201, 
        description: "Carrinho criado com sucesso",
        type: Cart
    })
    @Post()
    @HttpCode(HttpStatus.CREATED)
    createCart(): Promise<Cart> {
        return this.cartService.createCart();
    }

    @ApiOperation({ 
        summary: "Buscar carrinho",
        description: "Retorna um carrinho específico com todos os seus itens"
    })
    @ApiResponse({ 
        status: 200, 
        description: "Carrinho encontrado com sucesso",
        type: Cart
    })
    @ApiResponse({ 
        status: 404, 
        description: "Carrinho não encontrado"
    })
    @ApiParam({ 
        name: "cartId", 
        description: "ID único do carrinho",
        type: "string"
    })
    @Get(":cartId")
    findCart(@Param("cartId") cartId: string): Promise<Cart> {
        return this.cartService.findCart(cartId);
    }

    @ApiOperation({ 
        summary: "Adicionar item ao carrinho",
        description: "Adiciona um produto ao carrinho com a quantidade especificada"
    })
    @ApiResponse({ 
        status: 200, 
        description: "Item adicionado ao carrinho com sucesso",
        type: Cart
    })
    @ApiResponse({ 
        status: 404, 
        description: "Carrinho ou produto não encontrado"
    })
    @ApiResponse({ 
        status: 400, 
        description: "Dados inválidos ou produto fora de estoque"
    })
    @ApiParam({ 
        name: "cartId", 
        description: "ID único do carrinho",
        type: "string"
    })
    @ApiBody({ 
        type: AddToCartDto,
        description: "Dados do produto a ser adicionado"
    })
    @Post(":cartId/items")
    addToCart(
        @Param("cartId") cartId: string,
        @Body() addToCartDto: AddToCartDto
    ): Promise<Cart> {
        return this.cartService.addToCart(cartId, addToCartDto);
    }

    @ApiOperation({ 
        summary: "Atualizar quantidade de item no carrinho",
        description: "Atualiza a quantidade de um produto específico no carrinho"
    })
    @ApiResponse({ 
        status: 200, 
        description: "Quantidade atualizada com sucesso",
        type: Cart
    })
    @ApiResponse({ 
        status: 404, 
        description: "Carrinho ou item não encontrado"
    })
    @ApiResponse({ 
        status: 400, 
        description: "Quantidade inválida ou insuficiente em estoque"
    })
    @ApiParam({ 
        name: "cartId", 
        description: "ID único do carrinho",
        type: "string"
    })
    @ApiParam({ 
        name: "productId", 
        description: "ID único do produto",
        type: "string"
    })
    @ApiBody({ 
        type: UpdateCartItemDto,
        description: "Nova quantidade do item"
    })
    @Put(":cartId/items/:productId")
    updateCartItem(
        @Param("cartId") cartId: string,
        @Param("productId") productId: string,
        @Body() updateCartItemDto: UpdateCartItemDto
    ): Promise<Cart> {
        return this.cartService.updateCartItem(cartId, productId, updateCartItemDto);
    }

    @ApiOperation({ 
        summary: "Remover item do carrinho",
        description: "Remove um produto específico do carrinho"
    })
    @ApiResponse({ 
        status: 204, 
        description: "Item removido com sucesso"
    })
    @ApiResponse({ 
        status: 404, 
        description: "Carrinho ou item não encontrado"
    })
    @ApiParam({ 
        name: "cartId", 
        description: "ID único do carrinho",
        type: "string"
    })
    @ApiParam({ 
        name: "productId", 
        description: "ID único do produto",
        type: "string"
    })
    @Delete(":cartId/items/:productId")
    @HttpCode(HttpStatus.NO_CONTENT)
    async removeFromCart(
        @Param("cartId") cartId: string,
        @Param("productId") productId: string
    ): Promise<void> {
        await this.cartService.removeFromCart(cartId, productId);
    }

    @ApiOperation({ 
        summary: "Limpar carrinho",
        description: "Remove todos os itens do carrinho"
    })
    @ApiResponse({ 
        status: 204, 
        description: "Carrinho limpo com sucesso"
    })
    @ApiResponse({ 
        status: 404, 
        description: "Carrinho não encontrado"
    })
    @ApiParam({ 
        name: "cartId", 
        description: "ID único do carrinho",
        type: "string"
    })
    @Delete(":cartId/items")
    @HttpCode(HttpStatus.NO_CONTENT)
    async clearCart(@Param("cartId") cartId: string): Promise<void> {
        await this.cartService.clearCart(cartId);
    }

    @ApiOperation({ 
        summary: "Calcular total do carrinho",
        description: "Retorna o valor total dos itens no carrinho"
    })
    @ApiResponse({ 
        status: 200, 
        description: "Total calculado com sucesso",
        schema: {
            type: "object",
            properties: {
                total: { 
                    type: "number",
                    description: "Valor total do carrinho em reais",
                    example: 2599.98
                }
            }
        }
    })
    @ApiResponse({ 
        status: 404, 
        description: "Carrinho não encontrado"
    })
    @ApiParam({ 
        name: "cartId", 
        description: "ID único do carrinho",
        type: "string"
    })
    @Get(":cartId/total")
    async getCartTotal(@Param("cartId") cartId: string): Promise<{ total: number }> {
        const total = await this.cartService.getCartTotal(cartId);
        return { total };
    }
}
