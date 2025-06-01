import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from "@nestjs/common";
import { ProductService } from "./product.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Product } from "./entities/product.entity";
import { PRODUCT_CATEGORIES, PRODUCT_CATEGORY_LABELS, ProductCategory } from "./enums/product-category.enum";

@Controller("products")
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createProductDto: CreateProductDto): Promise<Product> {
        return this.productService.create(createProductDto);
    }

    @Get()
    findAll(@Query("category") category?: string, @Query("inStock") inStock?: string): Promise<Product[]> {
        if (category) {
            return this.productService.findByCategory(category);
        }
        
        if (inStock === "true") {
            return this.productService.findInStock();
        }

        return this.productService.findAll();
    }

    @Get("categories")
    getCategories() {
        return {
            categories: PRODUCT_CATEGORIES.map(category => ({
                value: category,
                label: PRODUCT_CATEGORY_LABELS[category as ProductCategory]
            }))
        };
    }

    @Get(":id")
    findOne(@Param("id") id: string): Promise<Product> {
        return this.productService.findOne(id);
    }

    @Patch(":id")
    update(@Param("id") id: string, @Body() updateProductDto: UpdateProductDto): Promise<Product> {
        return this.productService.update(id, updateProductDto);
    }

    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param("id") id: string): Promise<void> {
        await this.productService.remove(id);
    }
}
