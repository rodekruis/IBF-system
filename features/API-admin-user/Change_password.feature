@api-admin-user
Feature: Change password in Swagger UI

NOTE: the below instructions are also documented on the Swagger UI page itself.

Background:
    Given a user with 'admin' role has logged in and has been authorized using the token

Scenario: Change password for a user
    Given the 'admin' user is using the `/api/user/change-password` endpoint
    Given the 'admin' user has filled in the new 'password' and the other user's 'email'
    When the user clicks 'Execute'
    Then a user is returned including a 'token' attribute
