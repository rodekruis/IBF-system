# What is new in IBF?

Find here the latest changes to the IBF-system.

- Not all changes to the IBF-system are listed here. Only those that result in different functionality or different user experience.
- This list is meant to explain changes since the last manual. Please open the manual from the dashboard for a full explanation on the IBF-system.

### 16-10-2023 (v0.259.0)

- Flash-floods, Heavy rain, Dengue, Malaria and Floods: Replaced the map admin-level switcher with breadcrumbs.

### 18-09-2023 (v0.258.4)

- IBF Kenya: Cropland and grassland layers removed from Drought portal. Still available in Floods portal.

### 31-07-2023 (v0.251.0)

- All IBF: Layer color/icon information moved from layer selection menu to map legend.

### 03-07-2023 (v0.250.1)

- All IBF: various performance/speed improvements.

### 02-06-2023 (v0.246.0)

- IBF Drought & Typhoon: The event name is shown more clearly in the chat and aggregates sections.
- All IBF: The timeline is redesigned and shows warning icons for triggered lead times.

### 03-04-2023 (v0.235.1)

- IBF Drought: When there are multiple events simultaneously, the portal loads first in 'overview'-mode, showing all events. From there an event can be selected in either chat-section, or timeline, or map.
- All IBF: Information in the chat-section is now combined into 1 speech bubble per event, instead of 2.
- All IBF: The last model update date is conveyed more clearly in the top-left.
- All IBF: The legend of admin-area-layers shows a purple or grey gradient now instead of just 1 shade of purple or grey.
- IBF Uganda Drought: this disaster-type is added to IBF
- IBF Uganda Heavy Rainfall: this disaster-type is added to IBF (focus on Kasese district only)

### 17-02-2023 (v0.226.1)

- All IBF: Bug fixed where not always all layers were showing correctly

### 06-02-2023 (v0.224.1)

- All IBF: Point layer markers have better readable icons both in map and in layer-overview
- All IBF: A loading spinner shows until the dashboard is done loading, which prevents clicking too soon on something else.
- All IBF: Login page loads faster
- All IBF: Layer descriptions can more easily be updated (when for exampe a mistake is spotted)

### 20-01-2023 (v0.221.1)

- IBF Floods: Notifications are sent now also on the 1st day the forecast is below trigger again.
- All IBF: Changed name 'activation log' to 'trigger/alert' log + add explanation.
- All IBF: Hyperlinks in popups are always opened in a new tab.
- All IBF: In the action summary, 'areas of focus' are now called 'sectors' and an info-button with explanation is added for each.
- All IBF: Icons in middle column (exposed area overview + action-summary) are updated.
- All IBF: If opened from mobile device then a popup explains that IBF-portal is not optimized for mobile phones yet. If opened from a tablet, a popup explains that the user should switch to landscape mode.
- All IBF: After checking an EAP-action, the portal stays in area view instead of returning to national view.
- All IBF: If there is at least 1 area for which the trigger is manually stopped, then a 'stopped area overview' appears in the middle column, below the 'exposed area overview'.

### 16-12-2022 (v0.209.1)

- Philippines Typhoon: only events of category Severe Tropical Storm and higher lead to email-notifications
- Philippines Typhoon: pipeline runs every 6 hours (instead of every 12 hours)
- Philippines Typhoon: trackpoint of first landfall (or point closest to land) is highlighted
- Philippines Typhoon: landfall time is included in email
- Philippines Typhoon: '% of houses affected' is the main exposure variable, instead of 'Affected population' (which is still available as well)
- Philippines Typhoon: an event map image is included in the email attachment
- Philippines Typhoon: if no events or if no landfall cannot be determined yet for an event, then no lead-time is communicated
- Malawi Floods: Lead-time updated to 6 days (instead of 7 days)

### 28-10-2022 (v0.193.2)

- All IBF: Password in login-screen can be toggled to see characters
- All IBF: Name of the parent admin-area added in brackets (e.g. province-name behind the municipality-name)
- All IBF: Possibility to reactivate stopped trigger
- IBF Philippines now contains disaster-type Typhoon

### 03-10-2022 (v0.183.1)

- All IBF: Triggered and stopped areas in the chat are now clickable.\
  By clicking on them, the area on the map is selected and the map zooms to it.
- All IBF: The layer overview on the top right of the map has been redesigned.

### 11-07-2022 (v0.168.0)

- Zimbabwe Drought: Added message to inform user about pipeline update day.

### 01-07-2022 (v0.167.0)

- All IBF: Trigger notification emails now handle multiple events.

### 30-05-2022 (0.159.0)

- All Droughts: Drought seasons can now be differentiated by region.
- All IBF: Areas in the map that are hovered over or clicked on, are now highlighted via thicker borders, instead of via different color shades.
- All IBF: Also when hovering over an area, the area name appears in the middle column.
- Ethiopia Floods: now offers multiple administrative levels.

### 29-04-2022 (v0.151.0)

- All IBF: The "video guide" popup (both in login page & dashboard page) contains now also a link to the PDF manual, and is now called "IBF guide" popup.

### 15-04-2022 (v0.149.0)

- All IBF: Color changes in the "chat" section of IBF-portal. Speech bubbles in the triggered state are now light purple instead of dark purple. The speech bubbles related to triggered areas now have a red outline just like the red outline of triggered areas in the map.

### 04-04-2022 (v0.141.4)

- All IBF: "Stop mechanism" added. By clicking on any triggered area in the map, the trigger/alert for that area can be stopped. "Stopped" areas can be recognized by a black outline in the map, and are summarized in a corresponding speech bubble with black outline the "chat" section.
