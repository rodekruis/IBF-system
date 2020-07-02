
server <- function(input, output) {
  
 # selected_pcode <- reactiveVal("020104")
  
 if((input$country=='Ethiopia') & (input$level == "LEVEL 2"))  {
    country_lev <- 1
  } else if ((input$country=='Ethiopia') & (input$level == "LEVEL 3")){
    country_lev <- 1
  } else if ((input$country=='Kenya') & (input$level == "LEVEL 2")){
    country_lev <- 2
  } else if ((input$country=='Kenya') & (input$level == "LEVEL 3")){
    country_lev <- 2
    
  } else if ((input$country=='Uganda') & (input$level == "LEVEL 2")){
    country_lev <- 2
  } else if ((input$country=='Uganda') & (input$level == "LEVEL 3")){
    country_lev <- 2
  }
  
  flood_palette <- colorNumeric(palette = "YlOrRd", domain = admin[[country_lev]]$n_floods)
  

  #output$selected_district <- renderText({paste("You have selected", as.data.frame(admin[[country_lev]])[which(as.data.frame(admin[[country_lev]])[layerId[[country_lev]]] == selected_pcode()),label[[country_lev]]])})
  
 # output$impact_map <- renderLeaflet({leaflet() %>% addProviderTiles(providers$OpenStreetMap)# %>% 
      #addPolygons(data = admin[[country_lev]], label=admin[[country_lev]] %>% pull(label[[country_lev]]),layerId=admin[[country_lev]] %>% pull(layerId[[country_lev]]),col=~flood_palette(n_floods), fillOpacity=0.8, opacity = 1, weight=1.2) %>%  addLegend("topleft",pal = flood_palette,values = admin[[country_lev]]$n_floods,  title = "Number of reported Floods\n imapct (2000-2020)",opacity = 1)
  #})
  
 
}






















## Only run examples in interactive R sessions
if (interactive()) {
  
  ui <- fluidPage(
    p("The first radio button group controls the second"),
    radioButtons("inRadioButtons", "Input radio buttons",
                 c("Item A", "Item B", "Item C")),
    radioButtons("inRadioButtons2", "Input radio buttons 2",
                 c("Item A", "Item B", "Item C"))
  )
  
  server <- function(input, output) {
    observe({
      x <- input$inRadioButtons
      
      # Can also set the label and select items
      updateRadioButtons(session, "inRadioButtons2",
                         label = paste("radioButtons label", x),
                         choices = x,
                         selected = x
      )
    })
  }
  
  shinyApp(ui, server)
}