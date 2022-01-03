@ibf-portal-user
Feature: Use login page

  Background:
    Given any not logged in user

  Scenario: View login page
    When the user visits the IBF-portal URL
    Then the user is redirected automatically to the login page
    And it contains a header bar with a menu-icon on the left and the version-number on the left
    And the header contains the text 'IBF PORTAL' followed by the country-name if the environment contains just one country (production) and the environment-name (development/test/stage) otherwise
    And it shows a 'Welcome to IBF' card with IBF logo that explains where the user is
    And it contains a link to a video guide
    And it contains a warning about browsers to use
    And it contains the date and time
    And it contains a login form with "email" and "password" 
    And it contains a disabled "log in" button
    And above the 'welcome-card' it shows all disaster-types currently included anywhere in IBF
    And all icons for disaster-types included for countries included on the current environment/server are in "navy-blue" and others in "grey"
    And when hovering over an icon it shows the disaster-type name     
  
  Scenario: Click version-number
    Given a user on the login-page
    When the user clicks the version-number in the header
    Then a new tab opens on the IBF Github repository, specifically to the version tag

  Sencario: Watch video guide
    Given a user on the login-page
    When the user clicks the 'watch video guide' link
    Then a popup opens with the video

  Scenario: Fill in login form
    Given a user on the login-page
    When the user has filled in a valid email address and a password of at least 4 characters
    Then the "log in" button gets enabled

  Scenario: Log in successfully
    Given a successfully filled in login form
    Given the credentials are known to IBF-system
    When the user clicks "log in" 
    Then the page switches to the dashboard-page

  Scenario: Log in unsuccessfully
    Given a successfully filled in login form
    Given the credentials are not known to IBF-system
    When the user clicks "log in" 
    Then no feedback message is shown at the moment (should be improved in future)
    And 'email' and 'password' fields are emptied
    And 'log in' button is disabled again
  


