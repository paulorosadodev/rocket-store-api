import { IsString, IsInt, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AddToCartDto {
    @ApiProperty({
        description: "ID do produto a ser adicionado ao carrinho",
        example: "clp1a2b3c4d5e6f7g8h9i0j1"
    })
    @IsString()
        productId: string;

    @ApiProperty({
        description: "Quantidade do produto a ser adicionada",
        example: 2,
        minimum: 1
    })
    @IsInt()
    @Min(1)
        quantity: number;
}
