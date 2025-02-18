@ibf-portal-user
Feature: View area-of-focus section

    Background:
        Given a logged-in user on the dashboard page

# Are those to be part of map feature? What are areas of focus? do we maybe already cover them?
# This is called Actions-summary check if we cover it with existing tests

# We have sufficient tests for Actions-summary already in AZ test plan
    Scenario: View area of focus section in NON-TRIGGERED mode
        Given there are no events or only warning events
        When the user enters the dashboard page
        Then this section is not visible

    Scenario: View area of focus section in TRIGGERED mode
        Given there is at least 1 trigger event
        Given no event selection
        When the user enters the dashboard page
        Then the user sees the Area-of-focus summary at the bottom of the middle column
        And it mentions an 'Actions Summary' title
        And it has light-purple background
        And it mentions a list of 7 "areas of focus" with an icon for each
        And for each "area of focus" it lists the "checked" number of actions vs. the total number of actions
        And the total number of actions is the nr of triggered areas times the nr of actions in that area
        And the "checked" number of actions is based on actions in the chat-section (see 'Use_chat_section.feature')
        And the numbers are the total accross all triggered events
        And if no actions available for a 'sector' it shows 'N/A' in grey
        And it contains an info-icon per row, which upon clicking opens a popup with a description

    Scenario: View area of focus section for 1 event
        Given there are at least 2 trigger events
        When the user selects 1 event
        Then the user sees the Area-of-focus summary as described above
        And the numbers are only about the selected event

    Scenario: View area of focus section for 1 admin-area
        When the user selects an admin-area (via map or chat list)
        Then the user sees the Area-of-focus summary as described above
        And the numbers are only about the selected admin-area