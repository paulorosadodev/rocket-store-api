import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, 
            forbidNonWhitelisted: true, 
            transform: true, 
        }),
    );

    // Configuração do Swagger
    const config = new DocumentBuilder()
        .setTitle("Rocket Store API")
        .setDescription("API completa para gerenciamento de loja virtual com produtos, carrinho e pedidos")
        .setVersion("1.0")
        .addTag("products", "Operações relacionadas aos produtos")
        .addTag("cart", "Operações relacionadas ao carrinho de compras")
        .addTag("orders", "Operações relacionadas aos pedidos")
        .addServer("http://localhost:3000", "Servidor de desenvolvimento")
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document, {
        customSiteTitle: "Rocket Store API Documentation",
        customfavIcon: "/favicon.ico",
        customCss: ".swagger-ui .topbar { display: none }",
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
        },
    });

    await app.listen(3000);
}

void bootstrap();
