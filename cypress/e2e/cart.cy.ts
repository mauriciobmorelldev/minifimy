describe("Cart flow", () => {
  it("adds a product to the cart", () => {
    cy.visit("/producto/body-nube");
    cy.contains("Agregar al carrito").click();
    cy.get("header").contains("Carrito");
    cy.get("header").contains("1");
  });
});
