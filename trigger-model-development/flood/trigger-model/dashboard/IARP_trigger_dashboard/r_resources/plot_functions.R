plot_swi <- function(swi, impact_df, threshold){
  p <- swi %>%
    ggplot(aes(x=date, y=swi, color=depth, group=depth)) +
    geom_line() +
    geom_vline(data = impact_df, aes(xintercept = as.numeric(date)), col="red") +
    geom_hline(yintercept = threshold)

  p <- ggplotly(p)

  return(p)
}

plot_rainfall_glofas <- function(rainfall, glofas, impact_df, extra_impact_df, rainfall_threshold, glofas_threshold, has_glofas, glofas_variable,rp_glofas){
  max_rain = max(rainfall$rainfall, na.rm=T)
  if (has_glofas) {
    max_glofas = max(glofas$dis, na.rm=T)

    p1 <- plot_ly(rainfall) %>%
      add_lines(x=~date, y=~rainfall) %>%
      add_segments(x=~min(date), xend=~max(date), y = rainfall_threshold, yend=rainfall_threshold, line=list(color="black")) %>%
      layout(yaxis=list(title="Rainfal (mm)", autorange="reversed"), showlegend=FALSE)

    p2 <- plot_ly(glofas) %>%
      add_lines(x=~date, y=as.formula(paste0('~', glofas_variable)), line=list(color="rgb(98, 211, 234)")) %>%
      add_segments(x=~min(date), xend=~max(date), y = glofas_threshold, yend=glofas_threshold, line=list(color="black")) %>%
      add_segments(x=~min(date), xend=~max(date), y = ~mean(q50), yend=~mean(q50), name = 'q50', line=list(color="rgb(253, 130, 155)", width = 2,dash = "dot")) %>%
      add_segments(x=~min(date), xend=~max(date),  y = ~mean(q95), yend=~mean(q95), name = 'q95', line=list(color="rgb(205, 12, 24)",width = 2, dash = "dash")) %>%
      #add_segments(x=~min(date), xend=~max(date), y = rp_glofas$q10, yend=rp_glofas$q10, name = 'q10', line=list(color="rgb(253, 130, 155)", width = 2,dash = "dot")) %>%
      #add_segments(x=~min(date), xend=~max(date), y = rp_glofas$q50, yend=rp_glofas$q50, name = 'q50', line=list(color="rgb(205, 12, 24)",width = 2, dash = "dash")) %>%
      layout(yaxis=list(title=paste0("Station", glofas_variable)), showlegend=FALSE)

    for(date in as.character(impact_df$date)) {
      p1 <- p1 %>%
        add_segments(x=date ,xend=date, y=0, yend=max_rain, name = 'Impact event',line=list(color="rgb(255, 153, 0)",width = 4))

      p2 <- p2 %>%
        add_segments(x=date ,xend=date, y=0, yend=max_glofas,name = 'Impact event', line=list(color="rgb(255, 153, 0)",width = 4))
    }

    for(date in as.character(extra_impact_df$date)) {
      p1 <- p1 %>%
        add_segments(x=date ,xend=date, y=0, yend=max_rain, name = 'Extra Impact event',line=list(color="rgb(128, 0, 128)",width = 4))

      p2 <- p2 %>%
        add_segments(x=date ,xend=date, y=0, yend=max_glofas,name = 'Extra Impact event', line=list(color="rgb(128, 0, 128)",width = 4))
    }

    p3 <- subplot(p1, p2, nrows=2)
  } else {
    p3 <- plot_ly(rainfall) %>%
      add_lines(x=~date, y=~rainfall) %>%
      add_segments(x=~min(date), xend=~max(date), y = rainfall_threshold, yend=rainfall_threshold, line=list(color="black")) %>%
      layout(yaxis=list(title="Rainfal (mm)", autorange="reversed"), showlegend=FALSE)

    for(date in as.character(impact_df$date)) {
      p3 <- p3 %>%
        add_segments(x=date ,xend=date, y=0, yend=max_rain, line=list(color="rgb(255, 153, 0)",width = 4))
    }
    for(date in as.character(extra_impact_df$date)) {
      p3 <- p3 %>%
        add_segments(x=date ,xend=date, y=0, yend=max_rain, line=list(color="rgb(128, 0, 128)",width = 4))
      }

  }

  return(p3)
}

prettify_result_table <- function(result_table) {
  result_table %>%
    mutate(
      floods = as.integer(floods),
      floods_correct = as.integer(floods_correct),
      floods_incorrect = as.integer(floods_incorrect),
      protocol_triggered = as.integer(protocol_triggered),
      triggered_in_vain = as.integer(triggered_in_vain),
      triggered_correct = as.integer(triggered_correct)
    ) %>%
    rename(
      `Floods` = floods,
      `Correct Floods` = floods_correct,
      `Incorrect Floods` = floods_incorrect,
      `Protocol Triggered` = protocol_triggered,
      `Triggered in vain` = triggered_in_vain,
      `Triggered Correctly` = triggered_correct,
      `Detection Ratio` = detection_ratio,
      `Fals Alarm Ratio` = false_alarm_ratio
    ) %>%
    gather(var, val)
}