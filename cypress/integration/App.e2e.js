describe('App E2E', () => {
  it('should have a header', () => {
    cy.visit('/');
    cy.get('h1')
      .should('have.text', 'Home');

  });
  it('should have a header', () => {
    cy.visit('/about');
    cy.get('h1')
      .should('have.text', 'About');

  });
});