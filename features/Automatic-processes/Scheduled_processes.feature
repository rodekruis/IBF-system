@automatic-processes
Feature: Scheduled processes

Background:
    Given a running API on some environment

Scenario: Delete old data
    When it is midnight of every day
    Then per country*disasterType*eventName*leadTime the maximum date is determined for dynamic pipeline data
    And subsequently all pipeline data with a date earlier than this maximum date is deleted (as it is no longer relevant and takes space/performance)
    And this is now only done for 'floods'

Scenario: Update actionValue in event table
    When it is midnight of every day
    Then for all unclosed event records in the event-place-code table the actionValue is updated from the latest dynamic pipeline data
    And this is not done immediately upon pipeline upload because of performance reasons

