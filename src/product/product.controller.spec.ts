import { Test, TestingModule } from "@nestjs/testing";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Product } from "./entities/product.entity";
import { ProductCategory, PRODUCT_CATEGORIES, PRODUCT_CATEGORY_LABELS } from "./enums/product-category.enum";

describe("ProductController", () => {
    let controller: ProductController;
    let productService: ProductService;

    const mockProduct: Product = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Test Product",
        description: "Test Description",
        price: 99.99,
        category: ProductCategory.ELETRONICOS,
        quantity: 10,
        inStock: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
    };

    const mockProductService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        findByCategory: jest.fn(),
        findInStock: jest.fn(),
        findByCategoryAndInStock: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProductController],
            providers: [
                {
                    provide: ProductService,
                    useValue: mockProductService,
                },
            ],
        }).compile();

        controller = module.get<ProductController>(ProductController);
        productService = module.get<ProductService>(ProductService);

        jest.clearAllMocks();
    });

    describe("constructor", () => {
        it("should be defined", () => {
            expect(controller).toBeDefined();
            expect(productService).toBeDefined();
        });
    });

    describe("create", () => {
        it("should create a product successfully", async () => {
            const createProductDto: CreateProductDto = {
                name: "Test Product",
                description: "Test Description",
                price: 99.99,
                category: ProductCategory.ELETRONICOS,
                quantity: 10,
            };

            mockProductService.create.mockResolvedValue(mockProduct);

            const result = await controller.create(createProductDto);

            expect(mockProductService.create).toHaveBeenCalledWith(createProductDto);
            expect(mockProductService.create).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockProduct);
        });

        it("should handle service errors during creation", async () => {
            const createProductDto: CreateProductDto = {
                name: "Test Product",
                description: "Test Description",
                price: 99.99,
                category: ProductCategory.ELETRONICOS,
                quantity: 10,
            };

            const error = new Error("Creation failed");
            mockProductService.create.mockRejectedValue(error);

            await expect(controller.create(createProductDto)).rejects.toThrow("Creation failed");
            expect(mockProductService.create).toHaveBeenCalledWith(createProductDto);
        });
    });

    describe("findAll", () => {
        const mockProducts = [mockProduct];

        it("should return all products when no query parameters are provided", async () => {
            mockProductService.findAll.mockResolvedValue(mockProducts);

            const result = await controller.findAll();

            expect(mockProductService.findAll).toHaveBeenCalledWith();
            expect(mockProductService.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockProducts);
        });

        it("should return products by category when category query is provided", async () => {
            const category = "eletronicos";
            mockProductService.findByCategory.mockResolvedValue(mockProducts);

            const result = await controller.findAll(category);

            expect(mockProductService.findByCategory).toHaveBeenCalledWith(category);
            expect(mockProductService.findByCategory).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockProducts);
        });

        it("should return in-stock products when inStock query is true", async () => {
            mockProductService.findInStock.mockResolvedValue(mockProducts);

            const result = await controller.findAll(undefined, "true");

            expect(mockProductService.findInStock).toHaveBeenCalledWith();
            expect(mockProductService.findInStock).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockProducts);
        });

        it("should return products by category and in-stock when both queries are provided", async () => {
            const category = "eletronicos";
            mockProductService.findByCategoryAndInStock.mockResolvedValue(mockProducts);

            const result = await controller.findAll(category, "true");

            expect(mockProductService.findByCategoryAndInStock).toHaveBeenCalledWith(category);
            expect(mockProductService.findByCategoryAndInStock).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockProducts);
        });

        it("should ignore inStock when it's not 'true'", async () => {
            const category = "eletronicos";
            mockProductService.findByCategory.mockResolvedValue(mockProducts);

            const result = await controller.findAll(category, "false");

            expect(mockProductService.findByCategory).toHaveBeenCalledWith(category);
            expect(mockProductService.findAll).not.toHaveBeenCalled();
            expect(mockProductService.findInStock).not.toHaveBeenCalled();
            expect(result).toEqual(mockProducts);
        });
    });

    describe("getCategories", () => {
        it("should return all available product categories with labels", () => {
            const result = controller.getCategories();

            const expectedCategories = PRODUCT_CATEGORIES.map(category => ({
                value: category,
                label: PRODUCT_CATEGORY_LABELS[category as ProductCategory]
            }));

            expect(result).toEqual({
                categories: expectedCategories
            });
        });

        it("should return the correct structure for categories", () => {
            const result = controller.getCategories();

            expect(result).toHaveProperty("categories");
            expect(Array.isArray(result.categories)).toBe(true);
            
            if (result.categories.length > 0) {
                expect(result.categories[0]).toHaveProperty("value");
                expect(result.categories[0]).toHaveProperty("label");
            }
        });
    });

    describe("findOne", () => {
        const productId = "550e8400-e29b-41d4-a716-446655440000";

        it("should return a product by id", async () => {
            mockProductService.findOne.mockResolvedValue(mockProduct);

            const result = await controller.findOne(productId);

            expect(mockProductService.findOne).toHaveBeenCalledWith(productId);
            expect(mockProductService.findOne).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockProduct);
        });

        it("should handle service errors when finding a product", async () => {
            const error = new Error("Product not found");
            mockProductService.findOne.mockRejectedValue(error);

            await expect(controller.findOne(productId)).rejects.toThrow("Product not found");
            expect(mockProductService.findOne).toHaveBeenCalledWith(productId);
        });
    });

    describe("update", () => {
        const productId = "550e8400-e29b-41d4-a716-446655440000";
        const updateProductDto: UpdateProductDto = {
            name: "Updated Product",
            price: 149.99,
        };

        it("should update a product successfully", async () => {
            const updatedProduct = { ...mockProduct, ...updateProductDto };
            mockProductService.update.mockResolvedValue(updatedProduct);

            const result = await controller.update(productId, updateProductDto);

            expect(mockProductService.update).toHaveBeenCalledWith(productId, updateProductDto);
            expect(mockProductService.update).toHaveBeenCalledTimes(1);
            expect(result).toEqual(updatedProduct);
        });

        it("should handle service errors during update", async () => {
            const error = new Error("Update failed");
            mockProductService.update.mockRejectedValue(error);

            await expect(controller.update(productId, updateProductDto)).rejects.toThrow("Update failed");
            expect(mockProductService.update).toHaveBeenCalledWith(productId, updateProductDto);
        });
    });

    describe("remove", () => {
        const productId = "550e8400-e29b-41d4-a716-446655440000";

        it("should remove a product successfully", async () => {
            mockProductService.remove.mockResolvedValue(undefined);

            const result = await controller.remove(productId);

            expect(mockProductService.remove).toHaveBeenCalledWith(productId);
            expect(mockProductService.remove).toHaveBeenCalledTimes(1);
            expect(result).toBeUndefined();
        });

        it("should handle service errors during removal", async () => {
            const error = new Error("Removal failed");
            mockProductService.remove.mockRejectedValue(error);

            await expect(controller.remove(productId)).rejects.toThrow("Removal failed");
            expect(mockProductService.remove).toHaveBeenCalledWith(productId);
        });
    });
});
