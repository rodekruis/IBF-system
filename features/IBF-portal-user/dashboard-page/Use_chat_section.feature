@ibf-portal-user
Feature: View and use chat section

Background:
    Given the user logged-in into the IBF-portal
    And is viewing the Chat section

Scenario: Use chat section
    When the user login into the dashboard
    Then there is a chat section with 'IBF' logo speech arrow
    And chat section contains 3 chat box
    And first section gives the information of last model run


Scenario: Use first chat section in Triggered mode
    When the user login to the dashboard and see the chat section on left
    Then first chat section gives the date of lastModelRun
    And it shows the last date when the model was run for selected disaster
    And it shows chat section in purple if the date is within the model run housr/month
    And it shows chat section in red if the last model run date is over for that duration(days/hrs/months)


Scenario: Use second chat section
    When the user login to the dashboard and see the chat section on left
    Then the second chat section give information about last trigger date for selected disaster
    And it contains information about the upcoming trigger date
    And it contains 2 buttons 'About Trigger' and 'Video Guide'

Scenario: View alert and video within second chat section
    When the user clicks on 'About Trigger button'
    Then the pdf gets downloaded which gives information about Trigger scenerios and history

Scenario: View video within second chat section
    When the user clicks on 'Video Guide' button
    Then the user gets the information about IBF from the video and can use IBF easily 


Scenario: Use third chat section
    When the user checks third chat section
    Then user gets the instruction that how to monitor the map
    Amd it contains the information that if the actions are available onl for Admin level

Scenario: Use actions per triggered area
    When the user selects triggered area from map
    Then the user gets the EAP actions below third chat section near the avatar image
    And it contains all events for selected area of admin level

Scenario: Use EAP-actions per triggered area
    When the user selects events from the action showing below the third chat-section
    Then the user can submit the selected events
    And save the events for specific disaster, country and admin level
    And it contains 'Disaster Risk Reduction', 'Shelter', 'Health', 'Migration', 'Livelyhoods & basic needs' exposureIndicator
    And the user can get the selection information from 'Action Summary'

Scenario: Use EAP-actions per triggered area
    When the user selects the event as per need
    Then user can close the event

Scenario: Use chat section for non-triggered startDate
    When the disaster tpye is non-triggered 
    Then chat sections grayed out
    And it contains 2 chat boxes of chat section
    And firsst chat section shows the lastRunDate 
    And secont chat section showss that there is no trigger activated
    And 'About trigger' and 'video' and works the same 
    And it does not shows trigger date anf information


