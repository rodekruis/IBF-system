server <- function(input, output) {
  
  selected_pcode <- reactiveVal("ET0505")
  #selected_pcode <- reactiveVal("LSA")
  #selected_indicator <- reactiveVal("spi3")
  #selected_indicator2 <- reactiveVal("spi6")
  country1 <- reactive({
    cat(input$country)
    as.numeric(input$country)
    })
  
  country <- reactive({
    req(input$country)
    as.numeric(input$country)*as.numeric(input$Level)
  })
  
 # selected_indicator <- reactive({
  #  req(input$Drought_indicator_variable)
  #  as.character(input$Drought_indicator_variable)
  #})
  

  
  df <- reactive({
    df_indicators[[country()]] %>%
      filter(
        ADM2_PCODE == selected_pcode(),
        #indicator_var==selected_indicator(),
        date >= isolate(input$dateRange[1]),
        date <= isolate(input$dateRange[2])
      )
  })
  

  
  ipc_df <- reactive({
    req(input$dateRange)
    ipc_filled%>%
      filter(
        ADM2_PCODE == selected_pcode(),
        #indicator_var==selected_indicator2(),
        date >= isolate(input$dateRange[1]),
        date <= isolate(input$dateRange[2])
      )
  })
  
  
  df_SST <- reactive({
    req(input$dateRange)
    SST_var %>%
      filter(
        date >= isolate(input$dateRange[1]),
        date <= isolate(input$dateRange[2])
      )
  })
  
  RAIN_PCODE <- reactive({
    req(input$dateRange)
    rain_df_daily %>%
      filter(
        ADM2_PCODE == selected_pcode(),
        date >= isolate(input$dateRange[1]),
        date <= isolate(input$dateRange[2])
      )
  })
  
  vci_PCODE <- reactive({
    req(input$dateRange)
    vci_df %>%
      filter(
        ADM2_PCODE == selected_pcode(),
        date >= isolate(input$dateRange[1]),
        date <= isolate(input$dateRange[2])
      )
  })
  
  
  
  
  



  output$selected_district <- renderText({
    paste("You have selected", as.data.frame(admin[[country()]])[which(as.data.frame(admin[[country()]])[layerId[[country()]]] == selected_pcode()),label[[country()]]])
  })

  impact_df <- reactive({
    df_impact_raw[[country()]] %>%
      filter(pcode == selected_pcode(),
             date >= isolate(input$dateRange[1]),
             date <= isolate(input$dateRange[2])
             )
  })
  
  
  output$drought_indicators_plot <- renderPlotly({
    req(input$Drought_indicator_variable)
    req(input$climate_indicator_variable)
    #req(input$spi_threshold)
    #req(input$spi_threshold)
    p <- plot_drought_indicators(
      isolate(df()),
      impact_df(),
      df_SST(),
      RAIN_PCODE(),
      input$Drought_indicator_variable,
      input$climate_indicator_variable
      #input$spi_threshold,
      #input$enso_threshold
      )
    p
  })

  output$drought_indicators_plot1 <- renderPlotly({
    req(input$spi_threshold)
    req(input$spi_index)
    
    p <- plot_matrix_spi(
      input$spi_index,
      input$spi_threshold,
      RAIN_PCODE()
    )
    p
  })
  
  output$ipc_plot <- renderPlotly({
    p <- plot_ipc(
      ipc_df()
    )
    p
  })
  

  output$drought_indicators_plot2 <- renderPlotly({
    req(input$vci_threshold)
    p <- plot_matrix_vci(
      input$vci_threshold,
      vci_PCODE()
    )
    p
  })
  
  # result_table <- reactive({predict_with_swi(all_days, swi_raw, df_impact_raw, selected_pcode(), input$swi_threshold)})
 
   # result_table <- reactive({
  #   req(input$rainfall_threshold)
  #   req((input$glofas_threshold))
  # 
  #   predict_with_glofas_and_rainfall(all_days, rainfall(), glofas(), impact_df(), input$rainfall_threshold,
  #                                    input$glofas_threshold, isolate(has_glofas()), input$glofas_variable)
  # })

  # floods_val <- reactive({result_table() %>% pull(floods)})
  # floods_correct_val <- reactive({result_table() %>% pull(floods_correct)})
  # floods_incorrect_val <- reactive({result_table() %>% pull(floods_incorrect)})
  # protocol_triggered_val <- reactive({result_table() %>% pull(protocol_triggered)})
  # detection_ratio_val <- reactive({result_table() %>% pull(detection_ratio)})
  # fals_alarm_ratio_val <- reactive({result_table() %>% pull(false_alarm_ratio)})
  # 
  # output$result_html <- renderUI({
  #   HTML(
  #     paste0(
  #       '<span style="font-size:20px"> Floods: </span> ', floods_val(), "<br />",
  #       '<span style="font-size:20px"> Floods Correct: </span> ', floods_correct_val(), "<br />",
  #       '<span style="font-size:20px"> Floods Incorrect: </span> ', floods_incorrect_val(), "<br />",
  #       '<span style="font-size:20px"> Protocol Triggered: </span> ', protocol_triggered_val(), "<br />",
  #       '<span style="font-size:20px"> Detection Ratio: </span> ', detection_ratio_val(), "<br />",
  #       '<span style="font-size:20px"> False Alarm Ratio: </span> ', fals_alarm_ratio_val(), "<br />"
  #     )
  #   )
  # })

  # output$indicator1_dropdown <- renderUI({
  #   station_options <- glofas_mapping[[country()]] %>%
  #     filter(pcode == selected_pcode()) %>%
  #     pull(station_name) %>% unique()
  # 
  #   if (length(station_options) > 0) {
  #     has_glofas(TRUE)
  #     selectInput("glofas_station_selected", "Select A GLOFAS Station: ", choices = station_options)
  #   } else {
  #     has_glofas(FALSE)
  #     HTML("<h3> No Glofas stations available for this region </h3> <br />")
  #   }
  # })

   # output$indicaor1_slider <- renderUI({
   # 
   #     sliderInput("spi_threshold", "Select a Threshold for The SPI: ",
   #                 max = 3,
   #                 step=0.5,
   #                 min = -3,
   #                 value=-1)
   # 
   # })
  
  #  output$indicaor2_slider <- renderUI({
  #  
  #      sliderInput("spi_index", "Choose SPI index(months): ",
  #                  max = 12,
  #                  step=1,
  #                  min = 1,round=TRUE,
  #                  value=1)
  #  
  # })
   
   # output$indicaor3_slider <- renderUI({
   #   
   #   sliderInput("vci_threshold", "Select a Threshold for The vci: ",
   #               max = 50,
   #               step=10,
   #               min = 0,
   #               value=10)
   #   
   # })
# 
#   output$indicator1_dropdown <- renderUI({
#         selectInput("Drought_indicator_variable",
#                   "Select a Drought indicator",
#                   choices = c("vci",  "rain"),
#                   selected = "rain")
#   })
  # output$indicaor2_slider <- renderUI({
  #   
  #   sliderInput("enso_threshold", "Select a Threshold for ENSO: ",
  #               max = 4,
  #               min = -4,
  #               value=0)
  #   
  # })
  
  # output$indicator2_dropdown <- renderUI({
  #   selectInput("climate_indicator_variable",
  #               "Select climate indicator",
  #               choices = c("ENSO","IOD"),
  #               selected = "ENSO")
  # })
  

 

  output$impact_map <- renderLeaflet({
    flood_palette <- colorNumeric(palette = "YlOrRd", domain = admin[[country()]]$n_events)
    leaflet() %>%
      addProviderTiles(providers$OpenStreetMap) %>%
      addPolygons(data = admin[[country()]], label=admin[[country()]] %>% pull(label[[country()]]),
                  layerId=admin[[country()]] %>% pull(layerId[[country()]]),
                  col=~flood_palette(n_events), fillOpacity=0.8, opacity = 1, weight=1.2) %>%
      addLegend("topleft",pal = flood_palette,
                values = admin[[country()]]$n_events,
                title = "Number of reported Drought\n imapct (2000-2020)",
                #labFormat = labelFormat(prefix = "# reported floods "),
                opacity = 1)
  })

  observeEvent(input$impact_map_shape_click, {  
    event <- input$impact_map_shape_click
    selected_pcode(event$id)
    cat(event$id)

    if (is.null(event$id)) { return() }  # Do nothing if it is a random click

  })
}