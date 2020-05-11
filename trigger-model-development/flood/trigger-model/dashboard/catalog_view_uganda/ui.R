all_data <- read.csv('data/Impact_Hazard_catalog.csv',sep=';')

  
ui <- fluidPage(
  titlePanel("Impact Hazard data Exploration"),
  h1("Input Fields"),
  selectInput("district", "District", choices = levels(all_data$name), selected="Nakaseke"),
  dateRangeInput('dateRange',
                 label = 'Date range input: yyyy-mm-dd',
                 start = '2000-01-01', end = '2019-06-01'
  ),
  h2("Impact"),
  plotlyOutput("impact_plot"),
  h2("Available Glofas Points"),
  plotlyOutput("glofas_plot")
  )
