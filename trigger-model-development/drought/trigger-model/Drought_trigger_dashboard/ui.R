header <- dashboardHeader(
  title = "FBF Trigger dashboard",
  # Trick to put logo in the corner
  tags$li(div(
    class="logo_div",
    img(src = 'https://www.510.global/wp-content/uploads/2017/07/510-LOGO-WEBSITE-01.png',#'510logo.png',
        title = "logo", height = "44px")),
    class = "dropdown")
)

ui_tab_main <- tabItem(
  "tab_main",
  fluidRow(
    column(
      width = 12,
      leafletOutput("impact_map", height=600),
      h3(textOutput("selected_district"))
    )
  ),
  fluidRow(
    column(
      width = 12,
      # sliderInput("ipc_plot", "Select SWI Threshold: ", min=10, max = 100, value=75),
      plotlyOutput("drought_indicators_plot2"),
      plotlyOutput("drought_indicators_plot"),
      plotlyOutput("drought_indicators_plot1"),
      plotlyOutput("ipc_plot"),
     # uiOutput("indicaor2_slider")

      
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
      dateRangeInput('dateRange',
                     label = 'Select date range:',
                     start = min(df_impact_raw[[1]]$date, na.rm=T), end = max(df_impact_raw[[1]]$date, na.rm=T)),
      
      radioButtons("country", "Country:", c("Ethiopia" = 1, "Kenya" = 2)),
      selectInput("Level", "Select aggregation  Level(for now only Admin ):", c("Provinces"=1, "LHZ"=10),selected=1),#"LEVEL 3"),
      sliderInput("spi_index", "Choose SPI index(months): ",max = 12, step=1,min = 1,round=TRUE,value=1),
      sliderInput("spi_threshold", "Select a Threshold for The SPI: ",
                  max = 3,
                  step=0.5,
                  min = -3,
                  value=-1),
      sliderInput("vci_threshold", "Select a Threshold for The vci: ",
                  max = 50,
                  step=10,
                  min = 0,
                  value=20),
      selectInput("Drought_indicator_variable",
                  "Select a Drought indicator",
                  choices = c("vci",  "rain"),
                  selected = "rain"),
      selectInput("climate_indicator_variable",
                  "Select climate indicator",
                  choices = c("ENSO","IOD"),
                  selected = "ENSO")
      
    )
  ),
  body
)