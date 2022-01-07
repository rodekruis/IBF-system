@api-admin-user
Feature: Create new user

Background:
    Given a logged-in user on the Swagger UI page
    Given the user has access to 'email', 'first name' and 'last name' of the user to create 

Scenario: Successfully create new 'disaster-manager' user
    Given the user is using the `api/user` endpoint
    Given the user has filled in 'email', 'first name' and 'last name'
    Given the user also uses the 'email' as 'username'
    Given the 'middleName' property is removed (as it's optional)
    Given the user has generated a random password using https://passwordsgenerator.net/ and filled it in
    Given the user has trimmed the country-list to only the relevant countries (on production: always just 1 country)
    Given the user leaves the role on 'disaster-manager' and the status on 'active'
    When the user presses 'Execute'
    Then a status 201 is returned and an object with 'email' and 'token' properties

Scenario: Successfully create new 'guest' user
    Given the user is using the `api/user` endpoint
    Given everything is filled in as in previous scenario, except role = 'guest'
    When the user presses 'Execute'
    Then a status 201 is returned and an object with 'email' and 'token' properties

--------------------------------
NOTE: Below scenario is not in the exact right location at the moment, but closely related to above scenarios.

Scenario: Successfully create new user in Mailchimp 1-by-1
    Given the user is logged in to mailchimp 'IbfSystem' using credentials from Bitwarden
    Given the user has navigated via 'Audience' and 'All contacts' and 'Add contacts' to 'Add subscriber'
    Given the user has filled in 'email', 'first name' and 'last name'
    Given the user has added the right country-tag (e.g. 'Zambia' for 'Zambia')
    Given the user has checked the permission checkbox
    When clicking 'subscribe'
    Then the user appears in the audience with the right tag and the status 'Subscribed'

Scenario: Successfully create new user in Mailchimp through import 
    Given the user is logged in to mailchimp 'IbfSystem' using credentials from Bitwarden
    When the user has navigated via 'Audience' and 'All contacts' and 'Add contacts' to 'Import contacts'
    Then this can be used to achieve the same result as above in bulk


