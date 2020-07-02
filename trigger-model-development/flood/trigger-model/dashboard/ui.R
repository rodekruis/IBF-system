header <- dashboardHeader(
  title = "IARP FBF Trigger dashboard",
  # Trick to put logo in the corner
  tags$li(div(
    class="logo_div",
    img(src = 'https://www.510.global/wp-content/uploads/2017/07/510-LOGO-WEBSITE-01.png',#'510logo.png',
        title = "logo", height = "44px")),
    class = "dropdown")
)
ui_tab_main <- tabItem(
  "tab_main",
  fluidPage(
    column(
      width = 12,
      leafletOutput("impact_map", height=600),
      h3(textOutput("selected_district"))
    )
  )
  )


body <- dashboardBody(
  # Loads CSS and JS from www/custom.css in
  tags$head(tags$link(rel = "stylesheet",
                      type = "text/css", href = "custom_css.css")),
  tags$head(tags$script(src="main.js")),
  tabItems(
    ui_tab_main
  )
)

ui <- dashboardPage(
  header,
  dashboardSidebar(
    collapsed=F,
    
    sidebarMenu(
      menuItem("Main Tab", tabName = "tab_main"),
      dateRangeInput('dateRange',label = 'Select date range:',start = min(df_impact_raw[[1]]$date, na.rm=T), end = max(df_impact_raw[[1]]$date, na.rm=T)),
      selectInput("country", "Select Country:", c("Ethiopia", "Kenya","Uganda"),selected="Ethiopia"),
      radioButtons("level", "select admin level:", c("LEVEL 2", "LEVEL 3"),selected="Ethiopia")      )
  ),
  body
)




















