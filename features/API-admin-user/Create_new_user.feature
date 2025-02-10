@api-admin-user
Feature: Create new user

    Background:
        Given a logged-in user on the Swagger UI page
        Given the user has access to 'email', 'first name' and 'last name' of the user to create

    Scenario: Successfully create new 'disaster-manager' user
        Given the user is using the `POST /api/user` endpoint
        Given the user has filled in 'email', 'first name' and 'last name'
        Given the 'middleName' property is removed (as it's optional)
        Given the user has generated a random password using https://passwordsgenerator.net/ and filled it in
        Given the user has trimmed the country-list to only the relevant countries
        Given the user has trimmed the disasterTypes-list to only the relevant disaster types
        Given the user leaves the role on 'disaster-manager' and the status on 'active'
        When the user presses 'Execute'
        Then a status 201 is returned and an object with 'email' and 'token' properties



