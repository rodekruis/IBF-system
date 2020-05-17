
selected_pcode <- "020104"
selected_station <- "G1045"
selected_lowdate <- "2000-07-19"
selected_highdate <- "2018-04-05"
rainfall_threshold <- 38
glofas_threshold <- 915

glofas <-glofas_raw %>%
    filter(station == selected_station) %>%
    filter(date >= selected_lowdate, date <= selected_highdate)

rainfall <- rainfall_raw %>%
    filter(
      pcode == selected_pcode,
      date >= selected_lowdate,
      date <= selected_highdate)

impact_df <- df_impact_raw %>%
    filter(pcode == selected_pcode,
           date >= selected_lowdate,
           date <= selected_highdate)

plot_rainfall_glofas(rainfall, glofas, impact_df, rainfall_threshold, glofas_threshold, TRUE)

predict_with_glofas_and_rainfall(all_days, rainfall, glofas, impact_df, rainfall_threshold, glofas_threshold, TRUE)
predict_with_glofas_and_rainfall2(all_days, rainfall, glofas, impact_df, rainfall_threshold, glofas_threshold, TRUE)

day_range = 30

glofas %>%
  left_join(rainfall, by = "date") %>%
  left_join(impact_df %>% dplyr::select(date) %>% mutate(flood = TRUE), by = "date") %>%
  mutate(
    row_id = row_number(),
    flood = replace_na(flood, FALSE),
    rainfall = replace_na(rainfall, 0),
    dis = replace_na(dis, 0),

    # Create peak ranges for combined glofas and rainfall
    rainfall_exceeds_threshold = rainfall >= rainfall_threshold,
    glofas_exceeds_threshold = dis >= glofas_threshold,
    either_exceeds_threshold = rainfall_exceeds_threshold | glofas_exceeds_threshold,
    either_next_exceeds_threshold = lead(either_exceeds_threshold),
    either_prev_exceeds_threshold = lag(either_exceeds_threshold),
    either_peak_start = either_exceeds_threshold & !either_prev_exceeds_threshold,
    either_peak_end = either_exceeds_threshold & !either_next_exceeds_threshold,
    either_peak_start_range = lead(either_peak_start, 0),  # There is an option here to also count days before the trigger but currently we don't use it
    either_peak_end_range = lag(either_peak_end, day_range),  # Count events day_range amount of days after the trigger as the same peak
    either_peak_end_range = replace_na(either_peak_end_range, FALSE),
    either_in_peak_range = cumsum(either_peak_start_range) > cumsum(either_peak_end_range), # Combine peaks within the same range into a single peak

    # Check when protocol is triggered and whether floods are forecasted correctly
    protocol_triggered = either_in_peak_range & !lag(either_in_peak_range),  # Counts number of times protocol is triggered
    flood_correct = flood & either_in_peak_range
  ) %>% View()
  summarise(
    floods = sum(flood),
    floods_correct = sum(flood_correct),
    floods_incorrect = floods - floods_correct,
    protocol_triggered = sum(protocol_triggered, na.rm=T),
    triggered_in_vain = protocol_triggered - floods_correct,
    detection_ratio = round(floods_correct / floods, 2),
    false_alarm_ratio = round(triggered_in_vain/protocol_triggered, 2)
  )
