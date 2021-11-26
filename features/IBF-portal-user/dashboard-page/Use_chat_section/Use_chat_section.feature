@ibf-portal-user
Feature: View and use chat section

Background:
    Given the user logged-in into the IBF-portal
    And is viewing the Chat section

Scenario: Use chat section
    When the user login into the dashboard
    Then there is a chat section on the left of dashboard
    And it contains different disaster types as per slected country
    And it contains triggered and non-triggered mode
    And the user selects the disasters
    And the user can see differnt results as per selected disaster
 
Scenario: View Disaster in triggered mode
    When the disaster is in triggered mode
    Then it displays as a default selected disaster to user
    And it displays in dark purple color
    And user can see 2 more disaster in triggered mode
    And only 1 disaster is in dark purple it shows default selected disaster
    And if it is triggered but not selcted then it shows disaster icons with purple outline
    And it indicated to user that disaster type is activated/triggered for selected country
    And the dashboard displays purple for whole daashboard
    And displays areas affected with that disaster
    And it displays area/data in map with default admin_level for selected country
    And disasters contains lead-time as per there type
    And displays lead-time in day/months/hours/years
    And it also displays default selcted layers from matrix section

Scenario: View Disaster in non-triggered mode
    When the disaster is in non-triggered mode
    Then the IBF-dashboard truns into gray color
    And it displays in disaster icons in navy blue color
    And the user can see 2 or more disasters in non-triggered mode
    And it displays selecte disater with dask navy-vlue color
    And it also contains disater which are non-triggered but not selected 
    And it disaplys that disater icons with nav-blue outline
    And it indicates to user that the disaster type is not activated for that country
    And it does not shows any default selection for that country
    And does not display default admin-level
    And diplays no data and selected area in the map

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
    And first chat section shows the lastRunDate 
    And second chat section showss that there is no trigger activated
    And the 'About trigger' and 'video' buttons works the same 
    And it does not shows trigger date and information
