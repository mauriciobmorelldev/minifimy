describe("Home age filter", () => {
  function verifyAgeFilter() {
    cy.visit("/");
    cy.get("#home-age-filter-title").scrollIntoView().should("be.visible").and("contain.text", "Comprá por talle");
    cy.get('[aria-labelledby="home-age-filter-title"] ul a')
      .should("have.length.greaterThan", 0)
      .first()
      .should("have.attr", "href")
      .and("match", /^\/catalogo\?talle=/);
  }

  it("shows the real size links on mobile", () => {
    cy.viewport(390, 844);
    verifyAgeFilter();
    cy.screenshot("home-age-filter-mobile");
  });

  it("shows the real size links on desktop", () => {
    cy.viewport(1440, 1000);
    verifyAgeFilter();
    cy.screenshot("home-age-filter-desktop");
  });
});
