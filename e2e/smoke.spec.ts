import { expect, test } from "@playwright/test";

/**
 * Estas pruebas usan un contexto de navegador nuevo y anónimo (sin cookies), y deben
 * pasar igual con Supabase configurado (datos reales) que sin configurar (modo demo).
 * Por eso comprueban estructura y navegación, no contenido que dependa de si hay
 * sesión iniciada o de qué usuario esté "de mock".
 */

test.describe("Navegación pública", () => {
  test("la portada muestra el logo, el buscador y las pestañas del feed", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("/");
    await expect(page).toHaveTitle(/TheProKnow/);
    await expect(page.getByRole("img", { name: "TheProKnow" }).first()).toBeVisible();
    await expect(page.getByPlaceholder("Buscar consejos, expertos, temas…").first()).toBeVisible();
    for (const tab of ["Para ti", "Siguiendo", "Tendencias", "Nuevos"]) {
      await expect(page.getByRole("link", { name: tab, exact: true })).toBeVisible();
    }
    await expect(page.getByRole("link", { name: "Saltar al contenido" })).toHaveCount(1);

    expect(errors, `errores de JS sin capturar en la portada: ${errors.join("; ")}`).toEqual([]);
  });

  test("Explorar muestra las comunidades del mockup", async ({ page }) => {
    await page.goto("/explorar");
    // El sidebar también tiene un encabezado "Comunidades"; nos acotamos al de la sección principal.
    await expect(page.locator("#ex-comunidades")).toBeVisible();
    await expect(page.getByText("Diseño Gráfico", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Fotografía", { exact: true }).first()).toBeVisible();
  });

  test("navega de la portada a Explorar con el sidebar", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Explorar" }).first().click();
    await expect(page).toHaveURL(/\/explorar$/);
  });

  test.describe("páginas de contenido", () => {
    const pages: [string, string][] = [
      ["/sobre", "Sobre TheProKnow"],
      ["/privacidad", "Privacidad"],
      ["/terminos", "Términos de uso"],
      ["/contacto", "Contacto"],
      ["/mensajes", "Próximamente"],
    ];
    for (const [path, heading] of pages) {
      test(`${path} responde 200 y muestra "${heading}"`, async ({ page }) => {
        const res = await page.goto(path);
        expect(res?.status()).toBe(200);
        await expect(page.getByRole("heading", { name: heading })).toBeVisible();
      });
    }
  });

  test("login y registro muestran sus formularios", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Bienvenido de nuevo" })).toBeVisible();
    await expect(page.getByLabel("Correo electrónico")).toBeVisible();

    await page.goto("/registro");
    await expect(page.getByRole("heading", { name: "Crea tu cuenta" })).toBeVisible();
    await expect(page.getByLabel("Nombre de usuario")).toBeVisible();
  });
});

test.describe("Rutas inexistentes → 404", () => {
  test("una URL sin sentido muestra el 404 raíz", async ({ page }) => {
    const res = await page.goto("/esto-no-existe-" + Date.now());
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Página no encontrada" })).toBeVisible();
  });

  test("un post con UUID inexistente muestra el 404 de la app", async ({ page }) => {
    const res = await page.goto("/p/00000000-0000-0000-0000-000000000000");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "No encontramos lo que buscabas" })).toBeVisible();
  });

  test("un perfil inexistente muestra 404", async ({ page }) => {
    const res = await page.goto("/u/usuario-que-no-existe-" + Date.now());
    expect(res?.status()).toBe(404);
  });

  test("una comunidad inexistente muestra 404", async ({ page }) => {
    const res = await page.goto("/c/comunidad-que-no-existe-" + Date.now());
    expect(res?.status()).toBe(404);
  });
});

test.describe("SEO técnico", () => {
  test("robots.txt y sitemap.xml responden", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain("Sitemap:");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain("<urlset");
  });
});
