import { test, expect, Page } from '@playwright/test';


// FUNÇÕES AUXILIARES


async function login(page: Page, username: string, password: string) {
  await page.goto("https://www.saucedemo.com/");
  await page.getByPlaceholder("Username").fill(username);
  await page.getByPlaceholder("Password").fill(password);
  await page.locator('[data-test="login-button"]').click();
}

async function adicionarAoCarrinho(page: Page, produtoId: string) {
  await page.locator(`[data-test="add-to-cart-${produtoId}"]`).click();
}

async function removerDoCarrinho(page: Page, produtoId: string) {
  await page.locator(`[data-test="remove-${produtoId}"]`).click();
}


// CASOS DE TESTE


test.describe("Automação SauceDemo", () => {

  // CT-01: Login válido
  test("1. Login com credenciais válidas", async ({ page }) => {
    await login(page, "standard_user", "secret_sauce");
    
    await expect(page).toHaveURL("https://www.saucedemo.com/inventory.html");
    await expect(page.locator(".title")).toHaveText("Products");
  });

  // CT-02: Login inválido
  test("2. Login com credenciais inválidas", async ({ page }) => {
    await login(page, "usuario_invalido", "senha_incorreta");
    
    const mensagemErro = page.locator('[data-test="error"]');
    await expect(mensagemErro).toBeVisible();
    await expect(mensagemErro).toContainText("Username and password do not match");
  });

  // CT-03: Adicionar itens ao carrinho
test("3. Adicionar produtos ao carrinho", async ({ page }) => {
  await login(page, "standard_user", "secret_sauce"); // <-- FALTAVA ESTA LINHA

  await adicionarAoCarrinho(page, "sauce-labs-backpack");
  await adicionarAoCarrinho(page, "sauce-labs-bike-light");

  await expect(page.locator(".shopping_cart_badge")).toHaveText("2");
});

  // CT-04: Remover item do carrinho
  test("4. Remover produto do carrinho", async ({ page }) => {
    await login(page, "standard_user", "secret_sauce");
    
    await adicionarAoCarrinho(page, "sauce-labs-backpack");
    await removerDoCarrinho(page, "sauce-labs-backpack");
    
    await expect(page.locator(".shopping_cart_badge")).toBeHidden();
  });

  // CT-05: Ordenação e Navegação para o Carrinho
  test("5. Ordenar produtos e navegar até o carrinho", async ({ page }) => {
    await login(page, "standard_user", "secret_sauce");
    
    // Ordena de menor para maior preço
    await page.locator('[data-test="product-sort-container"]').selectOption("lohi");
    await expect(page.locator(".inventory_item_price").first()).toHaveText("$7.99");
    
    // Adiciona o item mais barato e vai para o carrinho
    await adicionarAoCarrinho(page, "sauce-labs-onesie");
    await page.locator(".shopping_cart_link").click();
    
    await expect(page).toHaveURL("https://www.saucedemo.com/cart.html");
    await expect(page.locator(".title")).toHaveText("Your Cart");
  });

});