-- Update existing product categories from English to Portuguese values

-- Update ELECTRONICS to ELETRONICOS
UPDATE products SET category = 'ELETRONICOS' WHERE category = 'ELECTRONICS';

-- Update CLOTHING to ROUPAS
UPDATE products SET category = 'ROUPAS' WHERE category = 'CLOTHING';

-- Update BOOKS to LIVROS
UPDATE products SET category = 'LIVROS' WHERE category = 'BOOKS';

-- Update HOME_GARDEN to CASA_JARDIM
UPDATE products SET category = 'CASA_JARDIM' WHERE category = 'HOME_GARDEN';

-- Update SPORTS to ESPORTES
UPDATE products SET category = 'ESPORTES' WHERE category = 'SPORTS';

-- Update BEAUTY to BELEZA
UPDATE products SET category = 'BELEZA' WHERE category = 'BEAUTY';

-- Update TOYS to BRINQUEDOS
UPDATE products SET category = 'BRINQUEDOS' WHERE category = 'TOYS';

-- Update AUTOMOTIVE to AUTOMOTIVO
UPDATE products SET category = 'AUTOMOTIVO' WHERE category = 'AUTOMOTIVE';

-- Update FOOD_BEVERAGE to ALIMENTOS_BEBIDAS
UPDATE products SET category = 'ALIMENTOS_BEBIDAS' WHERE category = 'FOOD_BEVERAGE';

-- Update HEALTH to SAUDE
UPDATE products SET category = 'SAUDE' WHERE category = 'HEALTH';