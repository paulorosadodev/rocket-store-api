import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { PrismaService } from "../prisma/prisma.service";
import { Product } from "./entities/product.entity";
import { findCategoryByValueOrLabel, getInvalidCategoryErrorMessage } from "./enums/product-category.enum";

@Injectable()
export class ProductService {
    constructor(private readonly prisma: PrismaService) {}

    async create(createProductDto: CreateProductDto): Promise<Product> {

        const validCategory = findCategoryByValueOrLabel(createProductDto.category);
        if (!validCategory) {
            throw new BadRequestException(getInvalidCategoryErrorMessage());
        }

        const result = await this.prisma.product.create({
            data: {
                ...createProductDto,
                category: validCategory,
                inStock: createProductDto.quantity > 0,
            },
        });
        return result as Product;
    }

    async findAll(): Promise<Product[]> {
        const result = await this.prisma.product.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
        return result as Product[];
    }

    async findOne(id: string): Promise<Product> {
        const product = await this.prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        return product as Product;
    }

    async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
        await this.findOne(id);

        if (updateProductDto.category) {
            const validCategory = findCategoryByValueOrLabel(updateProductDto.category);
            if (!validCategory) {
                throw new BadRequestException(getInvalidCategoryErrorMessage());
            }
            updateProductDto.category = validCategory;
        }

        const updateData: UpdateProductDto & { inStock?: boolean } = { 
            ...updateProductDto 
        };
        
        if (updateProductDto.quantity !== undefined) {
            updateData.inStock = updateProductDto.quantity > 0;
        }

        const result = await this.prisma.product.update({
            where: { id },
            data: updateData,
        });
        return result as Product;
    }

    async remove(id: string): Promise<Product> {
        await this.findOne(id);

        const result = await this.prisma.product.delete({
            where: { id },
        });
        return result as Product;
    }

    async findByCategory(category: string): Promise<Product[]> {
        const categoryEnum = findCategoryByValueOrLabel(category);
        
        if (!categoryEnum) {
            throw new NotFoundException(getInvalidCategoryErrorMessage());
        }

        const result = await this.prisma.product.findMany({
            where: {
                category: categoryEnum,
            },
            orderBy: {
                name: "asc",
            },
        });
        return result as Product[];
    }

    async findInStock(): Promise<Product[]> {
        const result = await this.prisma.product.findMany({
            where: {
                inStock: true,
                quantity: {
                    gt: 0,
                },
            },
            orderBy: {
                name: "asc",
            },
        });
        return result as Product[];
    }
}
