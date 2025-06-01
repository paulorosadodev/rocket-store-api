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
        @IsString({ message: "Nome deve ser uma string" })
        @IsNotEmpty({ message: "Nome é obrigatório" })
        @MinLength(2, { message: "Nome deve ter pelo menos 2 caracteres" })
        @MaxLength(100, { message: "Nome deve ter no máximo 100 caracteres" })
            name!: string;

        @IsOptional()
        @IsString({ message: "Descrição deve ser uma string" })
        @MaxLength(500, { message: "Descrição deve ter no máximo 500 caracteres" })
            description?: string;

        @IsNumber({}, { message: "Preço deve ser um número" })
        @IsPositive({ message: "Preço deve ser um valor positivo" })
        @Transform(({ value }: { value: string | number }) => parseFloat(String(value)))
            price!: number;

        @Transform(({ value }: { value: string }) => {
            const validCategory = findCategoryByValueOrLabel(value);
            return validCategory || value;
        })
        @Validate(IsValidCategoryConstraint)
        @IsNotEmpty({ message: "Categoria é obrigatória" })
            category!: ProductCategory;

        @IsInt({ message: "Quantidade deve ser um número inteiro" })
        @Min(0, { message: "Quantidade deve ser maior ou igual a 0" })
        @Transform(({ value }: { value: string | number }) => parseInt(String(value), 10))
            quantity!: number;
}
