import { Test, TestingModule } from "@nestjs/testing";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { PrismaService } from "../prisma/prisma.service";

describe("ProductController", () => {
    let controller: ProductController;

    beforeEach(async () => {
        const mockPrismaService = {
            product: {
                create: jest.fn(),
                findMany: jest.fn(),
                findUnique: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProductController],
            providers: [
                ProductService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        controller = module.get<ProductController>(ProductController);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
