@ibf-portal-user
Feature: Use disaster-type section

    Background:
        Given a logged-in user on the dashboard page

    Scenario: View the disaster type section
        When the user enters the dashboard page asdf
        Then the user sees the Situational overview section on the left between the Header and the Chat section
        And it contains a "disaster-type selector" (see details below)
        And it contains today's date and time, which is always the date of visiting the dashboard, not the last model run date

    Scenario: View Disaster-type selector with 1 "disaster-type"
        Given the "country" has only 1 "disaster-type"
        When the users views the disaster-type selector
        Then the user sees 1 icon representing a disaster-type
        And it is always "selected", meaning colored background with white icon

    Scenario: View Disaster-type selector with multiple "disaster-types"
        Given the "country" has more than 1 "disaster-type"
        When the users views the disaster-type selector
        Then the user sees 2 or more icons representing a disaster-type
        And only one is "selected", meaning colored background with white icon, and text label
        And the others are "unselected", meaning white background with colored icon and no text label
        And the "triggered" disaster-types are purple with white
        And the "non-triggered" disaster-types are navy-blue with white
        And the "default selected" disaster-type is always the "triggered"
        And if multiple, it is the first from the left
        And if none, then the far-left icon is selected
        And the rest of the dashboard is indeed showing data relating to the "selected" disaster-type

    Scenario: Switch Disaster-type
        Given the "country" has more than 1 "disaster-type"
        When the user clicks on a "non-selected" disaster-type
        Then the icon switches to "selected" mode
        And the previous selected icon switches to "unselected" mode
        And the "disaster-type" in the header section switches to the selected "disaster-type"
        And the data of the rest the dashboard updates to the new "selected" disaster-type


