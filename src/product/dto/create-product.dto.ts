import { 
    IsString, 
    IsNotEmpty, 
    IsOptional, 
    IsNumber, 
    IsPositive, 
    IsInt, 
    Min, 
    MaxLength, 
    MinLength,
    Validate,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Prisma } from "../../../generated/prisma";
import { ProductCategory, findCategoryByValueOrLabel, getInvalidCategoryErrorMessage } from "../enums/product-category.enum";

@ValidatorConstraint({ name: "IsValidCategory", async: false })
export class IsValidCategoryConstraint implements ValidatorConstraintInterface {
    validate(value: string): boolean {
        return findCategoryByValueOrLabel(value) !== null;
    }

    defaultMessage(): string {
        return getInvalidCategoryErrorMessage();
    }
}

export class CreateProductDto implements Omit<Prisma.ProductCreateInput, "id" | "createdAt" | "updatedAt"> {
        @ApiProperty({
            description: "Nome do produto",
            example: "Smartphone Samsung Galaxy S24",
            minLength: 2,
            maxLength: 100
        })
        @IsString({ message: "Nome deve ser uma string" })
        @IsNotEmpty({ message: "Nome é obrigatório" })
        @MinLength(2, { message: "Nome deve ter pelo menos 2 caracteres" })
        @MaxLength(100, { message: "Nome deve ter no máximo 100 caracteres" })
            name!: string;

        @ApiPropertyOptional({
            description: "Descrição detalhada do produto",
            example: "Smartphone com tela de 6.1 polegadas, câmera tripla de 50MP e 128GB de armazenamento",
            maxLength: 500
        })
        @IsOptional()
        @IsString({ message: "Descrição deve ser uma string" })
        @MaxLength(500, { message: "Descrição deve ter no máximo 500 caracteres" })
            description?: string;

        @ApiProperty({
            description: "Preço do produto em reais",
            example: 1299.99,
            minimum: 0.01
        })
        @IsNumber({}, { message: "Preço deve ser um número" })
        @IsPositive({ message: "Preço deve ser um valor positivo" })
        @Transform(({ value }: { value: string | number }) => parseFloat(String(value)))
            price!: number;

        @ApiProperty({
            description: "Categoria do produto",
            example: "ELETRONICOS",
            enum: ProductCategory,
            enumName: "ProductCategory"
        })
        @Transform(({ value }: { value: string }) => {
            const validCategory = findCategoryByValueOrLabel(value);
            return validCategory || value;
        })
        @Validate(IsValidCategoryConstraint)
        @IsNotEmpty({ message: "Categoria é obrigatória" })
            category!: ProductCategory;

        @ApiProperty({
            description: "Quantidade em estoque",
            example: 50,
            minimum: 0
        })
        @IsInt({ message: "Quantidade deve ser um número inteiro" })
        @Min(0, { message: "Quantidade deve ser maior ou igual a 0" })
        @Transform(({ value }: { value: string | number }) => parseInt(String(value), 10))
            quantity!: number;
}
