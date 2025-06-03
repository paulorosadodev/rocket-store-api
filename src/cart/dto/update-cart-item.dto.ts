import { IsInt, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateCartItemDto {
    @ApiProperty({
        description: "Nova quantidade do item no carrinho",
        example: 3,
        minimum: 1
    })
    @IsInt()
    @Min(1)
        quantity: number;
}
