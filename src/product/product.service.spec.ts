import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ProductService } from "./product.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductCategory } from "./enums/product-category.enum";
import { Product } from "./entities/product.entity";

describe("ProductService", () => {
    let service: ProductService;

    const mockPrismaService = {
        product: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    };

    const mockProduct: Product = {
        id: "clp1234567890",
        name: "Smartphone Samsung",
        description: "Smartphone com 128GB de armazenamento",
        price: 1200.99,
        category: ProductCategory.ELETRONICOS,
        inStock: true,
        quantity: 10,
        createdAt: new Date("2024-01-01T10:00:00Z"),
        updatedAt: new Date("2024-01-01T10:00:00Z"),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<ProductService>(ProductService);

        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("create", () => {
        const createProductDto: CreateProductDto = {
            name: "Smartphone Samsung",
            description: "Smartphone com 128GB de armazenamento",
            price: 1200.99,
            category: ProductCategory.ELETRONICOS,
            quantity: 10,
        };

        it("should create a product successfully", async () => {
            const expectedProduct = {
                ...createProductDto,
                id: mockProduct.id,
                inStock: true,
                createdAt: mockProduct.createdAt,
                updatedAt: mockProduct.updatedAt,
            };

            mockPrismaService.product.create.mockResolvedValue(expectedProduct);

            const result = await service.create(createProductDto);

            expect(mockPrismaService.product.create).toHaveBeenCalledWith({
                data: {
                    ...createProductDto,
                    category: ProductCategory.ELETRONICOS,
                    inStock: true,
                },
            });
            expect(result).toEqual(expectedProduct);
        });

        it("should set inStock to false when quantity is 0", async () => {
            const dtoWithZeroQuantity = { ...createProductDto, quantity: 0 };
            const expectedProduct = {
                ...dtoWithZeroQuantity,
                id: mockProduct.id,
                inStock: false,
                createdAt: mockProduct.createdAt,
                updatedAt: mockProduct.updatedAt,
            };

            mockPrismaService.product.create.mockResolvedValue(expectedProduct);

            const result = await service.create(dtoWithZeroQuantity);

            expect(mockPrismaService.product.create).toHaveBeenCalledWith({
                data: {
                    ...dtoWithZeroQuantity,
                    category: ProductCategory.ELETRONICOS,
                    inStock: false,
                },
            });
            expect(result.inStock).toBe(false);
        });

        it("should accept category by label", async () => {
            const dtoWithLabel = { ...createProductDto, category: "Eletrônicos" as ProductCategory };
            const expectedProduct = {
                ...createProductDto,
                id: mockProduct.id,
                inStock: true,
                createdAt: mockProduct.createdAt,
                updatedAt: mockProduct.updatedAt,
            };

            mockPrismaService.product.create.mockResolvedValue(expectedProduct);

            const result = await service.create(dtoWithLabel);

            expect(mockPrismaService.product.create).toHaveBeenCalledWith({
                data: {
                    ...createProductDto,
                    category: ProductCategory.ELETRONICOS,
                    inStock: true,
                },
            });
            expect(result).toEqual(expectedProduct);
        });

        it("should throw BadRequestException for invalid category", async () => {
            const invalidDto = { ...createProductDto, category: "CATEGORIA_INVALIDA" as ProductCategory };

            await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
            expect(mockPrismaService.product.create).not.toHaveBeenCalled();
        });
    });

    describe("findAll", () => {
        it("should return all products ordered by creation date", async () => {
            const products = [mockProduct];
            mockPrismaService.product.findMany.mockResolvedValue(products);

            const result = await service.findAll();

            expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
                orderBy: {
                    createdAt: "desc",
                },
            });
            expect(result).toEqual(products);
        });

        it("should return empty array when no products exist", async () => {
            mockPrismaService.product.findMany.mockResolvedValue([]);

            const result = await service.findAll();

            expect(result).toEqual([]);
        });
    });

    describe("findOne", () => {
        it("should return a product by id", async () => {
            mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

            const result = await service.findOne(mockProduct.id);

            expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
                where: { id: mockProduct.id },
            });
            expect(result).toEqual(mockProduct);
        });

        it("should throw NotFoundException when product not found", async () => {
            const nonExistentId = "non-existent-id";
            mockPrismaService.product.findUnique.mockResolvedValue(null);

            await expect(service.findOne(nonExistentId)).rejects.toThrow(
                new NotFoundException(`Product with ID ${nonExistentId} not found`)
            );
        });
    });

    describe("update", () => {
        const updateProductDto: UpdateProductDto = {
            name: "Smartphone Samsung Updated",
            price: 1300.99,
        };

        it("should update a product successfully", async () => {
            const updatedProduct = { ...mockProduct, ...updateProductDto };

            mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
            mockPrismaService.product.update.mockResolvedValue(updatedProduct);

            const result = await service.update(mockProduct.id, updateProductDto);

            expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
                where: { id: mockProduct.id },
            });
            expect(mockPrismaService.product.update).toHaveBeenCalledWith({
                where: { id: mockProduct.id },
                data: updateProductDto,
            });
            expect(result).toEqual(updatedProduct);
        });

        it("should update inStock when quantity is updated", async () => {
            const updateDto = { quantity: 0 };
            const updatedProduct = { ...mockProduct, quantity: 0, inStock: false };

            mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
            mockPrismaService.product.update.mockResolvedValue(updatedProduct);

            const result = await service.update(mockProduct.id, updateDto);

            expect(mockPrismaService.product.update).toHaveBeenCalledWith({
                where: { id: mockProduct.id },
                data: { ...updateDto, inStock: false },
            });
            expect(result).toEqual(updatedProduct);
        });

        it("should validate category when updating", async () => {
            const updateDto = { category: "CATEGORIA_INVALIDA" as ProductCategory };

            mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

            await expect(service.update(mockProduct.id, updateDto)).rejects.toThrow(BadRequestException);
            expect(mockPrismaService.product.update).not.toHaveBeenCalled();
        });

        it("should throw NotFoundException when product not found", async () => {
            const nonExistentId = "non-existent-id";
            mockPrismaService.product.findUnique.mockResolvedValue(null);

            await expect(service.update(nonExistentId, updateProductDto)).rejects.toThrow(
                new NotFoundException(`Product with ID ${nonExistentId} not found`)
            );
            expect(mockPrismaService.product.update).not.toHaveBeenCalled();
        });
    });

    describe("remove", () => {
        it("should delete a product successfully", async () => {
            mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
            mockPrismaService.product.delete.mockResolvedValue(mockProduct);

            const result = await service.remove(mockProduct.id);

            expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
                where: { id: mockProduct.id },
            });
            expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
                where: { id: mockProduct.id },
            });
            expect(result).toEqual(mockProduct);
        });

        it("should throw NotFoundException when product not found", async () => {
            const nonExistentId = "non-existent-id";
            mockPrismaService.product.findUnique.mockResolvedValue(null);

            await expect(service.remove(nonExistentId)).rejects.toThrow(
                new NotFoundException(`Product with ID ${nonExistentId} not found`)
            );
            expect(mockPrismaService.product.delete).not.toHaveBeenCalled();
        });
    });

    describe("findByCategory", () => {
        it("should return products by category", async () => {
            const products = [mockProduct];
            mockPrismaService.product.findMany.mockResolvedValue(products);

            const result = await service.findByCategory(ProductCategory.ELETRONICOS);

            expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
                where: {
                    category: ProductCategory.ELETRONICOS,
                },
                orderBy: {
                    name: "asc",
                },
            });
            expect(result).toEqual(products);
        });

        it("should accept category by label", async () => {
            const products = [mockProduct];
            mockPrismaService.product.findMany.mockResolvedValue(products);

            const result = await service.findByCategory("Eletrônicos");

            expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
                where: {
                    category: ProductCategory.ELETRONICOS,
                },
                orderBy: {
                    name: "asc",
                },
            });
            expect(result).toEqual(products);
        });

        it("should throw NotFoundException for invalid category", async () => {
            await expect(service.findByCategory("CATEGORIA_INVALIDA")).rejects.toThrow(NotFoundException);
            expect(mockPrismaService.product.findMany).not.toHaveBeenCalled();
        });
    });

    describe("findInStock", () => {
        it("should return only products in stock", async () => {
            const inStockProducts = [mockProduct];
            mockPrismaService.product.findMany.mockResolvedValue(inStockProducts);

            const result = await service.findInStock();

            expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
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
            expect(result).toEqual(inStockProducts);
        });
    });

    describe("findByCategoryAndInStock", () => {
        it("should return products by category that are in stock", async () => {
            const products = [mockProduct];
            mockPrismaService.product.findMany.mockResolvedValue(products);

            const result = await service.findByCategoryAndInStock(ProductCategory.ELETRONICOS);

            expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
                where: {
                    category: ProductCategory.ELETRONICOS,
                    inStock: true,
                    quantity: {
                        gt: 0,
                    },
                },
                orderBy: {
                    name: "asc",
                },
            });
            expect(result).toEqual(products);
        });

        it("should throw NotFoundException for invalid category", async () => {
            await expect(service.findByCategoryAndInStock("CATEGORIA_INVALIDA")).rejects.toThrow(NotFoundException);
            expect(mockPrismaService.product.findMany).not.toHaveBeenCalled();
        });
    });
});
