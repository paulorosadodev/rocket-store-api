import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from "@nestjs/swagger";
import { ProductService } from "./product.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Product } from "./entities/product.entity";
import { PRODUCT_CATEGORIES, PRODUCT_CATEGORY_LABELS, ProductCategory } from "./enums/product-category.enum";

@ApiTags("products")
@Controller("products")
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @ApiOperation({ 
        summary: "Criar um novo produto",
        description: "Cria um novo produto no sistema com todas as informações necessárias"
    })
    @ApiResponse({ 
        status: 201, 
        description: "Produto criado com sucesso",
        type: Product
    })
    @ApiResponse({ 
        status: 400, 
        description: "Dados inválidos fornecidos"
    })
    @ApiBody({ 
        type: CreateProductDto,
        description: "Dados do produto a ser criado"
    })
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createProductDto: CreateProductDto): Promise<Product> {
        return this.productService.create(createProductDto);
    }

    @ApiOperation({ 
        summary: "Listar produtos",
        description: "Retorna uma lista de produtos com filtros opcionais por categoria e disponibilidade em estoque"
    })
    @ApiResponse({ 
        status: 200, 
        description: "Lista de produtos retornada com sucesso",
        type: [Product]
    })
    @ApiQuery({ 
        name: "category", 
        required: false, 
        description: "Filtrar produtos por categoria",
        enum: ProductCategory
    })
    @ApiQuery({ 
        name: "inStock", 
        required: false, 
        description: "Filtrar apenas produtos em estoque",
        type: "boolean"
    })
    @Get()
    findAll(@Query("category") category?: string, @Query("inStock") inStock?: string): Promise<Product[]> {
        if (category && inStock === "true") {
            return this.productService.findByCategoryAndInStock(category);
        }
        
        if (category) {
            return this.productService.findByCategory(category);
        }
        
        if (inStock === "true") {
            return this.productService.findInStock();
        }

        return this.productService.findAll();
    }

    @ApiOperation({ 
        summary: "Listar categorias disponíveis",
        description: "Retorna todas as categorias de produtos disponíveis no sistema"
    })
    @ApiResponse({ 
        status: 200, 
        description: "Lista de categorias retornada com sucesso",
        schema: {
            type: "object",
            properties: {
                categories: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            value: { type: "string" },
                            label: { type: "string" }
                        }
                    }
                }
            }
        }
    })
    @Get("categories")
    getCategories() {
        return {
            categories: PRODUCT_CATEGORIES.map(category => ({
                value: category,
                label: PRODUCT_CATEGORY_LABELS[category as ProductCategory]
            }))
        };
    }

    @ApiOperation({ 
        summary: "Buscar produto por ID",
        description: "Retorna um produto específico baseado no seu ID"
    })
    @ApiResponse({ 
        status: 200, 
        description: "Produto encontrado com sucesso",
        type: Product
    })
    @ApiResponse({ 
        status: 404, 
        description: "Produto não encontrado"
    })
    @ApiParam({ 
        name: "id", 
        description: "ID único do produto",
        type: "string"
    })
    @Get(":id")
    findOne(@Param("id") id: string): Promise<Product> {
        return this.productService.findOne(id);
    }

    @ApiOperation({ 
        summary: "Atualizar produto",
        description: "Atualiza as informações de um produto existente"
    })
    @ApiResponse({ 
        status: 200, 
        description: "Produto atualizado com sucesso",
        type: Product
    })
    @ApiResponse({ 
        status: 404, 
        description: "Produto não encontrado"
    })
    @ApiResponse({ 
        status: 400, 
        description: "Dados inválidos fornecidos"
    })
    @ApiParam({ 
        name: "id", 
        description: "ID único do produto",
        type: "string"
    })
    @ApiBody({ 
        type: UpdateProductDto,
        description: "Dados do produto a serem atualizados"
    })
    @Patch(":id")
    update(@Param("id") id: string, @Body() updateProductDto: UpdateProductDto): Promise<Product> {
        return this.productService.update(id, updateProductDto);
    }

    @ApiOperation({ 
        summary: "Excluir produto",
        description: "Remove um produto do sistema"
    })
    @ApiResponse({ 
        status: 204, 
        description: "Produto excluído com sucesso"
    })
    @ApiResponse({ 
        status: 404, 
        description: "Produto não encontrado"
    })
    @ApiParam({ 
        name: "id", 
        description: "ID único do produto",
        type: "string"
    })
    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param("id") id: string): Promise<void> {
        await this.productService.remove(id);
    }
}
