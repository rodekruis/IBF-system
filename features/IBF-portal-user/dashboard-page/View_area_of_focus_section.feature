@ibf-portal-user
Feature: View area-of-focus section

Background:
    Given a logged-in user on the dashboard page

Scenario: View area of focus section in NON-TRIGGERED mode
    When the user enters the dashboard page
    Then this section is not visible 

Scenario: View area of focus section in TRIGGERED or OLD-EVENT mode
    When the user enters the dashboard page
    Then the user sees the Area-of-focus summary at the bottom of the middle column
    And it mentions an 'Actions Summary' title
    And it has grey background in OLD-EVENT mode and light-purple background in TRIGGERED mode
    And it mentions a list of 7 "areas of focus" with an icon for each
    And for each "area of focus" it lists the "checked" number of actions vs. the total number of actions
    And the total number of actions is the nr of triggered areas times the nr of actions in that area
    And the "checked" number of actions is based on actions in the chat-section (see 'Use_chat_section.feature')
