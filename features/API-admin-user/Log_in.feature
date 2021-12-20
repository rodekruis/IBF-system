@api-admin-user
Feature: Log in Swagger UI

NOTE: the below instructions are also documented on the Swagger UI page itself.

Background:
    Given a user on the Swagger UI page at <ibf-url>/docs

Scenario: Successfully get token
    Given the user has inlog credentials
    Given the user is using the `/api/user/login` endpoint
    Given the user has filled in existing 'email' and 'password'
    When the user clicks 'Execute'
    Then a user is returned including a 'token' attribute

Scenario: Successully authorize using token
    Given the user has succesfully gotten a token (see previous scenario)
    Given the user has filled this in in the 'Authorize' button in the topright of the Swagger UI page
    Given the user has pressed 'Authorize'
    When the user calls the `api/authentication` endpoint 
    Then it returns 'API authentication is working'
    And the user will also be authorized to use all other endpoints (depending on role)



