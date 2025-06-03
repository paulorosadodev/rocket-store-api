# 🚀 Rocket Store API

Uma API completa para gerenciamento de loja virtual construída com NestJS, Prisma e TypeScript, oferecendo funcionalidades para produtos, carrinho de compras e pedidos.

## 📋 Índice

- [Características](#-características)
- [Tecnologias](#-tecnologias)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Executando a aplicação](#-executando-a-aplicação)
- [Documentação da API](#-documentação-da-api)
- [Endpoints](#-endpoints)
- [Estrutura do Banco de Dados](#-estrutura-do-banco-de-dados)
- [Testes](#-testes)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Licença](#-licença)

## ✨ Características

- **Gerenciamento de Produtos**: CRUD completo com categorização e controle de estoque
- **Carrinho de Compras**: Adicionar, atualizar e remover itens do carrinho
- **Sistema de Pedidos**: Conversão de carrinho em pedidos com cálculo automático de totais
- **Validação Robusta**: Validação de dados com class-validator
- **Documentação Swagger**: Interface interativa para teste de APIs
- **Testes Abrangentes**: Testes unitários e de integração (E2E)
- **Tipagem Forte**: TypeScript em todo o projeto
- **Banco de Dados**: SQLite com Prisma ORM

## 🛠 Tecnologias

### Backend
- **NestJS** - Framework Node.js progressivo
- **TypeScript** - Linguagem com tipagem estática
- **Prisma** - ORM moderno para bancos de dados
- **SQLite** - Banco de dados leve e portátil

### Validação e Documentação
- **class-validator** - Validação baseada em decoradores
- **class-transformer** - Transformação de objetos
- **Swagger/OpenAPI** - Documentação interativa da API

### Testes
- **Jest** - Framework de testes
- **Supertest** - Testes de API HTTP

### Ferramentas de Desenvolvimento
- **ESLint** - Linting de código
- **Prettier** - Formatação de código
- **pnpm** - Gerenciador de pacotes

## 📦 Instalação

1. **Clonar o repositório**
```bash
git clone <repository-url>
cd rocket-store-api
```

2. **Instalar dependências**
```bash
pnpm install
```

## ⚙️ Configuração

1. **Configurar variáveis de ambiente**
```bash
# Criar arquivo .env na raiz do projeto
DATABASE_URL="file:./dev.db"
```

2. **Configurar o banco de dados**
```bash
# Executar migrações
pnpm prisma migrate dev

# (Opcional) Popular com dados de exemplo
pnpm prisma db seed
```

## 🚀 Executando a aplicação

### Desenvolvimento
```bash
pnpm run start:dev
```

### Produção
```bash
pnpm run build
pnpm run start:prod
```

A aplicação estará disponível em `http://localhost:3000`

## 📚 Documentação da API

A documentação interativa da API está disponível em:
- **Swagger UI**: `http://localhost:3000/api/docs`

## 🔗 Endpoints

### Produtos (`/products`)
- `GET /products` - Listar todos os produtos
- `GET /products/:id` - Buscar produto por ID
- `GET /products/category/:category` - Buscar produtos por categoria
- `POST /products` - Criar novo produto
- `PUT /products/:id` - Atualizar produto
- `DELETE /products/:id` - Remover produto

### Carrinho (`/carts`)
- `POST /carts` - Criar novo carrinho
- `GET /carts/:id` - Buscar carrinho por ID
- `POST /carts/:id/items` - Adicionar item ao carrinho
- `PUT /carts/:cartId/items/:productId` - Atualizar quantidade do item
- `DELETE /carts/:cartId/items/:productId` - Remover item do carrinho
- `DELETE /carts/:id` - Limpar carrinho

### Pedidos (`/orders`)
- `POST /orders/checkout/:cartId` - Fazer checkout do carrinho
- `GET /orders` - Listar todos os pedidos
- `GET /orders/:id` - Buscar pedido por ID

## 🗄️ Estrutura do Banco de Dados

### Modelos Principais

#### Product
```typescript
{
  id: string
  name: string
  description?: string
  price: number
  category: ProductCategory
  inStock: boolean
  quantity: number
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### Cart
```typescript
{
  id: string
  createdAt: DateTime
  updatedAt: DateTime
  items: CartItem[]
}
```

#### CartItem
```typescript
{
  id: string
  cartId: string
  productId: string
  quantity: number
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### Order
```typescript
{
  id: string
  total: number
  createdAt: DateTime
  updatedAt: DateTime
  items: OrderItem[]
}
```

#### OrderItem
```typescript
{
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Categorias de Produtos
- `ELETRONICOS` - Eletrônicos
- `ROUPAS` - Roupas e Acessórios
- `LIVROS` - Livros
- `CASA_JARDIM` - Casa e Jardim
- `ESPORTES` - Esportes e Lazer
- `BELEZA` - Beleza e Cuidados
- `BRINQUEDOS` - Brinquedos
- `AUTOMOTIVO` - Automotivo
- `ALIMENTOS_BEBIDAS` - Alimentos e Bebidas
- `SAUDE` - Saúde

## 🧪 Testes

### Executar todos os testes
```bash
pnpm test
```

### Testes em modo watch
```bash
pnpm test:watch
```

### Testes de cobertura
```bash
pnpm test:cov
```

### Testes E2E
```bash
pnpm test:e2e
```

### Relatório de Cobertura
O relatório de cobertura é gerado na pasta `coverage/` e pode ser visualizado abrindo o arquivo `coverage/lcov-report/index.html` no navegador.

## 📁 Estrutura do Projeto

```
src/
├── app.module.ts              # Módulo principal da aplicação
├── main.ts                    # Ponto de entrada da aplicação
├── prisma/                    # Configuração do Prisma
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── product/                   # Módulo de produtos
│   ├── dto/                   # Data Transfer Objects
│   ├── entities/              # Entidades do domínio
│   ├── enums/                 # Enumerações
│   ├── product.controller.ts  # Controlador REST
│   ├── product.module.ts      # Configuração do módulo
│   ├── product.service.ts     # Lógica de negócios
│   └── *.spec.ts             # Testes unitários
├── cart/                      # Módulo do carrinho
│   ├── dto/
│   ├── entities/
│   ├── cart.controller.ts
│   ├── cart.module.ts
│   ├── cart.service.ts
│   └── *.spec.ts
└── order/                     # Módulo de pedidos
    ├── entities/
    ├── order.controller.ts
    ├── order.module.ts
    ├── order.service.ts
    └── *.spec.ts

prisma/
├── schema.prisma             # Schema do banco de dados
├── dev.db                    # Banco SQLite de desenvolvimento
└── migrations/               # Migrações do banco

test/
├── app.e2e-spec.ts          # Testes E2E da aplicação
├── product.e2e-spec.ts      # Testes E2E de produtos
└── jest-e2e.json            # Configuração Jest para E2E
```

## 📜 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `pnpm start` | Iniciar aplicação |
| `pnpm start:dev` | Iniciar em modo desenvolvimento (watch) |
| `pnpm start:debug` | Iniciar em modo debug |
| `pnpm start:prod` | Iniciar em modo produção |
| `pnpm build` | Compilar projeto |
| `pnpm test` | Executar testes unitários |
| `pnpm test:watch` | Executar testes em modo watch |
| `pnpm test:cov` | Executar testes com cobertura |
| `pnpm test:e2e` | Executar testes E2E |
| `pnpm lint` | Executar linting |
| `pnpm format` | Formatar código |

## 📋 Exemplo de Uso

### 1. Criar um produto
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Smartphone Samsung Galaxy",
    "description": "Smartphone com 128GB de armazenamento",
    "price": 1299.99,
    "category": "ELETRONICOS",
    "quantity": 50
  }'
```

### 2. Criar um carrinho
```bash
curl -X POST http://localhost:3000/carts
```

### 3. Adicionar item ao carrinho
```bash
curl -X POST http://localhost:3000/carts/{cartId}/items \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "{productId}",
    "quantity": 2
  }'
```

### 4. Fazer checkout
```bash
curl -X POST http://localhost:3000/orders/checkout/{cartId}
```

## 🔒 Validações

A API implementa validações robustas usando class-validator:

- **Produtos**: Nome obrigatório, preço positivo, categoria válida
- **Carrinho**: Quantidade positiva, produto existente
- **Pedidos**: Carrinho deve existir e ter itens

## 🚨 Tratamento de Erros

A API retorna códigos HTTP apropriados:

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `404` - Recurso não encontrado
- `500` - Erro interno do servidor


## 📄 Licença

Este projeto está sob a licença UNLICENSED. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**Desenvolvido com 💜 para a Rocketlab**
