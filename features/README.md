# Features

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

Features of the IBF-portal are described in this folder in a standardizes way using the [Gherkin-language](https://cucumber.io/docs/gherkin/).

### For IBF-portal user

- [Visit Log in page](IBF-portal-user/Visit_login_page.feature)
- IBF-dashboard page
    - [Header section](IBF-portal-user/dashboard-page/View_use_header_section.feature)
      - View section
      - Log out
      - Export View
    - [Menu Section](IBF-portal-user/dashboard-page/View_situational_overview_section.feature)
      - Menu list
    - Situational Overview section
      - View
    - Chat section
      - View section
      - Switch Disaster Type
      - Click about trigger
      - Click video guide
      - Actions per triggered area
        - View
        - Check EAP-action
        - Close event
    - Aggregate section
      - View
      - Click info buttons
    - Area of Focus summary
      - View
    - Timeline section
      - View
      - Switch leadtime
    - Admin-level section
      - View
      - Switch admin-level
    - Map section
      - View
      - Click admin-area
      - Click on point-layer markers
      - Zoom in to a marker-cluster layer
      - Toggle matrix section
    - Matrix section
      - View
      - Toggle layer
      - Click info button


### For Dashboard admin-user

- Open & View menu
- Switch country
- Upload mock data
- Open activation report

### For API admin-user 

From Swagger UI:

- Create user


### For external pipeline user

- Upload dynamic data
  - (Email and how it looks is part of this "scenario")


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
