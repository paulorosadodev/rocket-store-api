/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { ProductCategory } from "../src/product/enums/product-category.enum";

describe("Product (e2e)", () => {
    let app: INestApplication;
    let prismaService: PrismaService;

    const testProduct = {
        name: "Test Product E2E",
        description: "Test product for e2e testing",
        price: 99.99,
        category: ProductCategory.ELETRONICOS,
        quantity: 5,
    };

    const testProduct2 = {
        name: "Test Product 2 E2E",
        description: "Second test product for e2e testing",
        price: 149.99,
        category: ProductCategory.ROUPAS,
        quantity: 0, // Out of stock
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));

        await app.init();

        prismaService = app.get<PrismaService>(PrismaService);
    });

    beforeEach(async () => {
        // Clean up the database before each test
        await prismaService.product.deleteMany();
    });

    afterAll(async () => {
        // Clean up the database after all tests
        await prismaService.product.deleteMany();
        await prismaService.$disconnect();
        await app.close();
    });

    describe("/products (POST)", () => {
        it("should create a new product", async () => {
            const response = await request(app.getHttpServer())
                .post("/products")
                .send(testProduct)
                .expect(201);

            expect(response.body).toMatchObject({
                name: testProduct.name,
                description: testProduct.description,
                price: testProduct.price,
                category: testProduct.category,
                quantity: testProduct.quantity,
                inStock: true,
            });
            expect(response.body.id).toBeDefined();
            expect(response.body.createdAt).toBeDefined();
            expect(response.body.updatedAt).toBeDefined();
        });

        it("should create a product with quantity 0 and inStock false", async () => {
            const response = await request(app.getHttpServer())
                .post("/products")
                .send(testProduct2)
                .expect(201);

            expect(response.body).toMatchObject({
                name: testProduct2.name,
                description: testProduct2.description,
                price: testProduct2.price,
                category: testProduct2.category,
                quantity: 0,
                inStock: false,
            });
        });

        it("should return 400 for invalid product data", async () => {
            const invalidProduct = {
                name: "", // Invalid: empty name
                price: -10, // Invalid: negative price
                category: "INVALID_CATEGORY",
                quantity: -5, // Invalid: negative quantity
            };

            await request(app.getHttpServer())
                .post("/products")
                .send(invalidProduct)
                .expect(400);
        });

        it("should return 400 for missing required fields", async () => {
            const incompleteProduct = {
                name: "Test Product",
                // Missing price, category, quantity
            };

            await request(app.getHttpServer())
                .post("/products")
                .send(incompleteProduct)
                .expect(400);
        });
    });

    describe("/products (GET)", () => {
        beforeEach(async () => {
            // Create test products
            await prismaService.product.createMany({
                data: [
                    {
                        ...testProduct,
                        inStock: testProduct.quantity > 0,
                    },
                    {
                        ...testProduct2,
                        inStock: testProduct2.quantity > 0,
                    },
                ],
            });
        });

        it("should return all products", async () => {
            const response = await request(app.getHttpServer())
                .get("/products")
                .expect(200);

            expect(response.body).toHaveLength(2);
            expect(response.body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ name: testProduct.name }),
                    expect.objectContaining({ name: testProduct2.name }),
                ])
            );
        });

        it("should filter products by category", async () => {
            const response = await request(app.getHttpServer())
                .get(`/products?category=${ProductCategory.ELETRONICOS}`)
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(response.body[0]).toMatchObject({
                name: testProduct.name,
                category: ProductCategory.ELETRONICOS,
            });
        });

        it("should filter products by inStock", async () => {
            const response = await request(app.getHttpServer())
                .get("/products?inStock=true")
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(response.body[0]).toMatchObject({
                name: testProduct.name,
                inStock: true,
            });
        });

        it("should filter products by category and inStock", async () => {
            const response = await request(app.getHttpServer())
                .get(`/products?category=${ProductCategory.ELETRONICOS}&inStock=true`)
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(response.body[0]).toMatchObject({
                name: testProduct.name,
                category: ProductCategory.ELETRONICOS,
                inStock: true,
            });
        });

        it("should return 404 for invalid category", async () => {
            const response = await request(app.getHttpServer())
                .get("/products?category=NON_EXISTENT")
                .expect(404);

            expect(response.body.message).toContain("Categoria inválida. As categorias válidas são: ELETRONICOS (Eletrônicos), ROUPAS (Roupas e Acessórios), LIVROS (Livros), CASA_JARDIM (Casa e Jardim), ESPORTES (Esportes e Lazer), BELEZA (Beleza e Cuidados), BRINQUEDOS (Brinquedos), AUTOMOTIVO (Automotivo), ALIMENTOS_BEBIDAS (Alimentos e Bebidas), SAUDE (Saúde)");
        });
    });

    describe("/products/categories (GET)", () => {
        it("should return all product categories", async () => {
            const response = await request(app.getHttpServer())
                .get("/products/categories")
                .expect(200);

            expect(response.body).toHaveProperty("categories");
            expect(Array.isArray(response.body.categories)).toBe(true);
            expect(response.body.categories.length).toBeGreaterThan(0);
            
            // Check that each category has the correct structure
            response.body.categories.forEach((category: any) => {
                expect(category).toHaveProperty("value");
                expect(category).toHaveProperty("label");
            });

            // Check that ELETRONICOS category is present
            const eletronicosCat = response.body.categories.find(
                (cat: any) => cat.value === ProductCategory.ELETRONICOS
            );
            expect(eletronicosCat).toBeDefined();
            expect(eletronicosCat.label).toBe("Eletrônicos");
        });
    });

    describe("/products/:id (GET)", () => {
        let productId: string;

        beforeEach(async () => {
            const createdProduct = await prismaService.product.create({
                data: {
                    ...testProduct,
                    inStock: testProduct.quantity > 0,
                },
            });
            productId = createdProduct.id;
        });

        it("should return a product by id", async () => {
            const response = await request(app.getHttpServer())
                .get(`/products/${productId}`)
                .expect(200);

            expect(response.body).toMatchObject({
                id: productId,
                name: testProduct.name,
                description: testProduct.description,
                price: testProduct.price,
                category: testProduct.category,
                quantity: testProduct.quantity,
                inStock: true,
            });
        });

        it("should return 404 for non-existent product", async () => {
            const nonExistentId = "clp0000000000000000000000";
            
            const response = await request(app.getHttpServer())
                .get(`/products/${nonExistentId}`)
                .expect(404);

            expect(response.body.message).toContain("not found");
        });
    });

    describe("/products/:id (PATCH)", () => {
        let productId: string;

        beforeEach(async () => {
            const createdProduct = await prismaService.product.create({
                data: {
                    ...testProduct,
                    inStock: testProduct.quantity > 0,
                },
            });
            productId = createdProduct.id;
        });

        it("should update a product", async () => {
            const updateData = {
                name: "Updated Product Name",
                price: 199.99,
            };

            const response = await request(app.getHttpServer())
                .patch(`/products/${productId}`)
                .send(updateData)
                .expect(200);

            expect(response.body).toMatchObject({
                id: productId,
                name: updateData.name,
                price: updateData.price,
                description: testProduct.description, // Unchanged
                category: testProduct.category, // Unchanged
            });
        });

        it("should update inStock when quantity is changed to 0", async () => {
            const updateData = { quantity: 0 };

            const response = await request(app.getHttpServer())
                .patch(`/products/${productId}`)
                .send(updateData)
                .expect(200);

            expect(response.body).toMatchObject({
                id: productId,
                quantity: 0,
                inStock: false,
            });
        });

        it("should update inStock when quantity is changed from 0 to positive", async () => {
            // First set quantity to 0
            await prismaService.product.update({
                where: { id: productId },
                data: { quantity: 0, inStock: false },
            });

            const updateData = { quantity: 10 };

            const response = await request(app.getHttpServer())
                .patch(`/products/${productId}`)
                .send(updateData)
                .expect(200);

            expect(response.body).toMatchObject({
                id: productId,
                quantity: 10,
                inStock: true,
            });
        });

        it("should return 404 for non-existent product", async () => {
            const nonExistentId = "clp0000000000000000000000";
            const updateData = { name: "Updated Name" };

            const response = await request(app.getHttpServer())
                .patch(`/products/${nonExistentId}`)
                .send(updateData)
                .expect(404);

            expect(response.body.message).toContain("not found");
        });

        it("should return 400 for invalid update data", async () => {
            const invalidUpdateData = {
                price: -50, // Invalid: negative price
                quantity: -10, // Invalid: negative quantity
            };

            await request(app.getHttpServer())
                .patch(`/products/${productId}`)
                .send(invalidUpdateData)
                .expect(400);
        });
    });

    describe("/products/:id (DELETE)", () => {
        let productId: string;

        beforeEach(async () => {
            const createdProduct = await prismaService.product.create({
                data: {
                    ...testProduct,
                    inStock: testProduct.quantity > 0,
                },
            });
            productId = createdProduct.id;
        });

        it("should delete a product", async () => {
            await request(app.getHttpServer())
                .delete(`/products/${productId}`)
                .expect(204);

            // Verify the product was deleted
            const deletedProduct = await prismaService.product.findUnique({
                where: { id: productId },
            });
            expect(deletedProduct).toBeNull();
        });

        it("should return 404 for non-existent product", async () => {
            const nonExistentId = "clp0000000000000000000000";

            const response = await request(app.getHttpServer())
                .delete(`/products/${nonExistentId}`)
                .expect(404);

            expect(response.body.message).toContain("not found");
        });
    });

    describe("Integration scenarios", () => {
        it("should handle a complete product lifecycle", async () => {
            // 1. Create a product
            const createResponse = await request(app.getHttpServer())
                .post("/products")
                .send(testProduct)
                .expect(201);

            const productId = createResponse.body.id;

            // 2. Get the product by ID
            await request(app.getHttpServer())
                .get(`/products/${productId}`)
                .expect(200);

            // 3. Update the product
            const updateData = { name: "Updated Product", price: 299.99 };
            await request(app.getHttpServer())
                .patch(`/products/${productId}`)
                .send(updateData)
                .expect(200);

            // 4. Verify the product appears in the list
            const listResponse = await request(app.getHttpServer())
                .get("/products")
                .expect(200);

            expect(listResponse.body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: productId,
                        name: updateData.name,
                        price: updateData.price,
                    }),
                ])
            );

            // 5. Delete the product
            await request(app.getHttpServer())
                .delete(`/products/${productId}`)
                .expect(204);

            // 6. Verify the product is gone
            await request(app.getHttpServer())
                .get(`/products/${productId}`)
                .expect(404);
        });

        it("should handle concurrent operations", async () => {
            // Create multiple products concurrently
            const createPromises = Array.from({ length: 5 }, (_, i) => 
                request(app.getHttpServer())
                    .post("/products")
                    .send({
                        ...testProduct,
                        name: `Concurrent Product ${i}`,
                    })
                    .expect(201)
            );

            const responses = await Promise.all(createPromises);
            const productIds = responses.map(response => response.body.id);

            // Verify all products were created
            const listResponse = await request(app.getHttpServer())
                .get("/products")
                .expect(200);

            expect(listResponse.body).toHaveLength(5);

            // Delete all products concurrently
            const deletePromises = productIds.map(id =>
                request(app.getHttpServer())
                    .delete(`/products/${id}`)
                    .expect(204)
            );

            await Promise.all(deletePromises);

            // Verify all products were deleted
            const finalListResponse = await request(app.getHttpServer())
                .get("/products")
                .expect(200);

            expect(finalListResponse.body).toHaveLength(0);
        });
    });
});
