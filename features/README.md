# Table of Contents

<!-- TOC: -->

- [All features / scenario's](#all-features--scenarios)
  - [For IBF-portal user](#for-ibf-portal-user)
  - [For IBF-portal Admin-user](#for-dashboard-admin-user)
  - [For API Admin-user](#for-api-admin-user)
  - [For External pipeline user](#for-external-pipeline-user)
- [Reference](#reference)
- [Tools](#tools)
- [How to describe features / define scenarios](#how-to-describe-features--define-scenarios)

---

## All features / scenario's

IMPORTANT: 
- A major distinction in every feature is whether the Portal is in TRIGGERED or NON-TRIGGERED mode.
- These distinctions are made within each file.
- In practice there can be a 3rd (more rare) scenario: OLD-EVENT. This is sometimes explicity mentioned. Where not further specified, it falls under NON-TRIGGERED.

### For IBF-portal user

- Log-in page
    - [Use Log in page](IBF-portal-user/Use_login_page.feature)
- IBF-portal page
    - [Use Header section](IBF-portal-user/dashboard-page/Use_header_section.feature)
    - [Use Situational Overview section](IBF-portal-user/dashboard-page/Use_situational_overview_section.feature)
    - [Use Chat section](IBF-portal-user/dashboard-page/Use_chat_section.feature)
    - [Use Aggregate section](IBF-portal-user/dashboard-page/Use_aggregate_section.feature)
    - [View Area-of-focus summary](IBF-portal-user/dashboard-page/View_area_of_focus_section.feature)
    - [Use Timeline section](IBF-portal-user/dashboard-page/Use_timeline_section.feature)
    - [Use Admin-level section](IBF-portal-user/dashboard-page/Use_admin_level_section.feature)
    - [Use Map section](IBF-portal-user/dashboard-page/Use_map_section.feature)
    - [Use Layers section](IBF-portal-user/dashboard-page/Use_layers_section.feature)

### For Dashboard admin-user

These are actions run from the dev-menu in the dashboard, accessible only to an admin-user.

- [Use Dev Menu](IBF-portal-admin-user/Use_dev_menu.feature)

### For API admin-user 

These are actions run from the Swagger UI (<ibf-url>/docs).

- Create new user
- Update static data

### For external pipeline (user)

In practice, the pipeline is often time-scheduled and not manually triggered by a user. But nonetheless the processes that follow from this action (such as email) must be described somewhere.

- Run external pipeline
  - Upload data
  - Create and send email
- Upload mock data
  - Upload mock data for all countries and disasters at once
  - Upload mock data for a specific country and disasterptype

---

## Reference

- The complete definition of the Gherkin syntax: <https://cucumber.io/docs/gherkin/reference/>
- A comprehensive guide on BDD by Automation Panda:
  - [The Gherkin Language](https://automationpanda.com/2017/01/26/bdd-101-the-gherkin-language/)
  - [Gherkin by example](https://automationpanda.com/2017/01/27/bdd-101-gherkin-by-example/)
  - [Writing good Gherkin](https://automationpanda.com/2017/01/30/bdd-101-writing-good-gherkin/)

## Tools

- [BDD Editor](http://www.bddeditor.com/editor): A 'wizard'-like interface to create feature-files in a browser.
- [AssertThat Gherkin editor](https://www.assertthat.com/gherkin_editor): An editor, syntax-highlighting and validator in a browser.
- VSCode-extension: [Cucumber (Gherkin) Full Support](https://marketplace.visualstudio.com/items?itemName=alexkrechik.cucumberautocomplete)

## How to describe features / define scenarios

Features can be added to this folder by:

- Create a `.feature`-file, named after its title with `_` for spaces;  
  i.e. `Log_in.feature`
- Add a reference to the list above at the appropriate _actor_.
