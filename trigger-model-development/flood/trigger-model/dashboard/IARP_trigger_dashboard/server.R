server <- function(input, output) {
  selected_pcode <- reactiveVal("020104")
  has_glofas <- reactiveVal(TRUE)
  country <- reactive({
    cat(input$country)
    as.numeric(input$country)
    })

  glofas <- reactive({
    req(input$glofas_station_selected)
    cat(input$glofas_station_selected)
    glofas_raw %>%
      filter(station == input$glofas_station_selected) %>%
      filter(date >= isolate(input$dateRange[1]), date <= isolate(input$dateRange[2]))
  })


  rainfall <- reactive({
    rainfall_raw[[country()]] %>%
      filter(
        pcode == selected_pcode(),
        date >= isolate(input$dateRange[1]),
        date <= isolate(input$dateRange[2])
      )
  })

  rp_glofas <- reactive({
    req(input$glofas_station_selected)

    rp_glofas_station %>%
      filter(station == input$glofas_station_selected)
  })

  output$selected_district <- renderText({
    paste("You have selected", as.data.frame(admin[[country()]])[which(as.data.frame(admin[[country()]])[layerId[[country()]]] == selected_pcode()),label[[country()]]])
  })

  impact_df <- reactive({
    df_impact_raw[[country()]] %>%
      filter(pcode == selected_pcode(),
             date >= isolate(input$dateRange[1]),
             date <= isolate(input$dateRange[2]))
  })
  extra_impact_df <- reactive({
    df_extra_impact[[country()]] %>%
      filter(pcode == selected_pcode(),
             date >= isolate(input$dateRange[1]),
             date <= isolate(input$dateRange[2]))
  })

  # swi <- reactive({
  #   swi_raw %>%
  #     filter(pcode == selected_pcode(),
  #            date >= input$dateRange[1],
  #            date <= input$dateRange[2])
  # })

  # output$swi_plot <- renderPlotly({
  #   p <- plot_swi(swi(), df_impact(), input$swi_threshold)
  #   p
  # })

  output$rainfall_glofas_plot <- renderPlotly({
    req(input$rainfall_threshold)
    req((input$glofas_threshold | !has_glofas()))

    p <- plot_rainfall_glofas(
      isolate(rainfall()),
      isolate(glofas()),
      impact_df(),
      extra_impact_df(),
      input$rainfall_threshold,
      input$glofas_threshold,
      isolate(has_glofas()),
      input$glofas_variable,
      isolate(rp_glofas()))
    p
  })

  # result_table <- reactive({predict_with_swi(all_days, swi_raw, df_impact_raw, selected_pcode(), input$swi_threshold)})
  result_table <- reactive({
    req(input$rainfall_threshold)
    req((input$glofas_threshold | !has_glofas()))

    predict_with_glofas_and_rainfall(all_days, rainfall(), glofas(), impact_df(), input$rainfall_threshold,
                                     input$glofas_threshold, isolate(has_glofas()), input$glofas_variable)
  })

  floods_val <- reactive({result_table() %>% pull(floods)})
  floods_correct_val <- reactive({result_table() %>% pull(floods_correct)})
  floods_incorrect_val <- reactive({result_table() %>% pull(floods_incorrect)})
  protocol_triggered_val <- reactive({result_table() %>% pull(protocol_triggered)})
  detection_ratio_val <- reactive({result_table() %>% pull(detection_ratio)})
  fals_alarm_ratio_val <- reactive({result_table() %>% pull(false_alarm_ratio)})

  output$result_html <- renderUI({
    HTML(
      paste0(
        '<span style="font-size:20px"> Floods: </span> ', floods_val(), "<br />",
        '<span style="font-size:20px"> Floods Correct: </span> ', floods_correct_val(), "<br />",
        '<span style="font-size:20px"> Floods Incorrect: </span> ', floods_incorrect_val(), "<br />",
        '<span style="font-size:20px"> Protocol Triggered: </span> ', protocol_triggered_val(), "<br />",
        '<span style="font-size:20px"> Detection Ratio: </span> ', detection_ratio_val(), "<br />",
        '<span style="font-size:20px"> False Alarm Ratio: </span> ', fals_alarm_ratio_val(), "<br />"
      )
    )
  })

  output$glofas_dropdown <- renderUI({
    station_options <- glofas_mapping[[country()]] %>%
      filter(pcode == selected_pcode()) %>%
      pull(station_name) %>% unique()

    if (length(station_options) > 0) {
      has_glofas(TRUE)
      selectInput("glofas_station_selected", "Select A GLOFAS Station: ", choices = station_options)
    } else {
      has_glofas(FALSE)
      HTML("<h3> No Glofas stations available for this region </h3> <br />")
    }
  })

  output$glofas_slider <- renderUI({
    if(isolate(has_glofas())) {
      sliderInput("glofas_threshold", "Select a Threshold for The GLOFAS Station in(cms): ", min=0,
                  max = round(max(isolate(glofas())$dis, na.rm=T)),
                  value=round(quantile(glofas()$dis, 0.95, na.rm=T)))
    } else {
      NULL
    }
  })

  output$glofas_var_selector <- renderUI({
    if(isolate(has_glofas())) {
      selectInput("glofas_variable",
                  "Select lead time(dis=0,dis_3=3 days or dis_7=7 days) discharge variable",
                  choices = c("dis", "dis_3", "dis_7"),
                  selected = "dis")
    } else {
      NULL
    }
  })

  output$rainfall_slider <- renderUI({
    sliderInput("rainfall_threshold", "Select Rainfall Threshold (in mm): ", min=0,
                max = round(max(isolate(rainfall())$rainfall, na.rm=T)),
                value=round(quantile(isolate(rainfall())$rainfall, 0.99, na.rm=T)))
  })

  output$impact_map <- renderLeaflet({
    flood_palette <- colorNumeric(palette = "YlOrRd", domain = admin[[country()]]$n_floods)
    leaflet() %>%
      addProviderTiles(providers$OpenStreetMap) %>%
      addPolygons(data = admin[[country()]], label=admin[[country()]] %>% pull(label[[country()]]),
                  layerId=admin[[country()]] %>% pull(layerId[[country()]]),
                  col=~flood_palette(n_floods), fillOpacity=0.8, opacity = 1, weight=1.2) %>%
      addLegend("topleft",pal = flood_palette,
                values = admin[[country()]]$n_floods,
                title = "Number of reported Floods\n imapct (2000-2020)",
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