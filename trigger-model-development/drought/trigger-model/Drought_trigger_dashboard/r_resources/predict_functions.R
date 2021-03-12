
predict_with_spi3 <- function(df, swi_raw, impact_df, selected_pcode, threshold=-1, day_range=30) {
  df %>%
    left_join(impact_df %>% dplyr::select(date) %>% mutate(drought_events = TRUE), by = "date") %>%
    mutate(
      drought_events = replace_na(drought_events, FALSE),
      spi3_exceeds_threshold = spi3 > threshold,
      drought_correct = drought_events & spi3_exceeds_threshold,
      next_spi3_exceeds_threshold = dplyr::lag(spi3_exceeds_threshold),
      peak_start = !spi3_exceeds_threshold & next_spi3_exceeds_threshold
    ) %>%
    summarise(
      droughts = sum(drought_events),
      droughts_correct = sum(drought_correct),
      floods_incorrect = droughts - drought_correct,
      protocol_triggered = sum(peak_start, na.rm=T),
      triggered_in_vain = protocol_triggered - drought_correct,
      triggered_correct = drought_correct,
      detection_ratio = round(drought_correct / droughts, 2),
      false_alarm_ratio = round(triggered_in_vain/protocol_triggered, 2)
    )
}




predict_with_indicator <- function(df, impact_df, threshold, indicator, day_range=200)
  {
    df %>%
    left_join(impact_df %>% dplyr::select(date) %>% mutate(flood = TRUE), by = "date") %>%
    mutate(
        row_id = row_number(),
        flood = replace_na(flood, FALSE),
        dis = !!sym(indicator),
        dis = replace_na(dis, 0),
        # Create peak ranges for glofas
        glofas_exceeds_threshold = dis >= threshold,
        glofas_next_exceeds_threshold = lead(glofas_exceeds_threshold),
        glofas_prev_exceeds_threshold = dplyr::lag(glofas_exceeds_threshold),
        glofas_peak_start = glofas_exceeds_threshold & !glofas_prev_exceeds_threshold,
        glofas_peak_end = glofas_exceeds_threshold & !glofas_next_exceeds_threshold,
        glofas_peak_start_range = lead(glofas_peak_start, 0),  # There is an option here to also count days before the trigger but currently we don't use it
        glofas_peak_end_range = dplyr::lag(glofas_peak_end, day_range),  # Draw range around peak
        glofas_peak_end_range = replace_na(glofas_peak_end_range, FALSE),
        glofas_in_peak_range = cumsum(glofas_peak_start_range) > cumsum(glofas_peak_end_range), # Combine peaks within the same range into a single peak
        flood_in_which_peak = cumsum(glofas_peak_start_range) * flood * glofas_in_peak_range,
        
        # Check when protocol is triggered and whether floods are forecasted correctly
        protocol_triggered = glofas_in_peak_range & !dplyr::lag(glofas_in_peak_range),  # Counts number of times protocol is triggered
        flood_correct = flood & glofas_in_peak_range
      ) %>%
      summarise(
        floods = sum(flood),
        floods_correct = sum(flood_correct),
        floods_incorrect = floods - floods_correct,
        protocol_triggered = sum(protocol_triggered, na.rm=T),
        triggered_in_vain = protocol_triggered - (length(unique(flood_in_which_peak)) - 1),
        detection_ratio = round(floods_correct / floods, 2),
        false_alarm_ratio = round(triggered_in_vain/protocol_triggered, 2)
      )
  } 




predict_with_glofas_and_rainfall <- function(all_days, rainfall, glofas, impact_df, rainfall_threshold, glofas_threshold, has_glofas, glofas_variable, day_range=30) {
  rainfall <- rainfall %>%
    filter(!is.na(rainfall))

  if ((nrow(rainfall) > 0) & has_glofas) {
    glofas %>%
      left_join(rainfall, by = "date") %>%
      left_join(impact_df %>% dplyr::select(date) %>% mutate(flood = TRUE), by = "date") %>%
      mutate(
        row_id = row_number(),
        flood = replace_na(flood, FALSE),
        rainfall = replace_na(rainfall, 0),
        dis = !!sym(glofas_variable),  # name the selected glofas variable discharge
        dis = replace_na(dis, 0),

        # Create peak ranges for combined glofas and rainfall
        rainfall_exceeds_threshold = rainfall >= rainfall_threshold,
        glofas_exceeds_threshold = dis >= glofas_threshold,
        either_exceeds_threshold = rainfall_exceeds_threshold | glofas_exceeds_threshold,
        either_next_exceeds_threshold = lead(either_exceeds_threshold),
        either_prev_exceeds_threshold = dplyr::lag(either_exceeds_threshold),
        either_peak_start = either_exceeds_threshold & !either_prev_exceeds_threshold,
        either_peak_end = either_exceeds_threshold & !either_next_exceeds_threshold,
        either_peak_start_range = lead(either_peak_start, 0),  # There is an option here to also count days before the trigger but currently we don't use it
        either_peak_end_range = dplyr::lag(either_peak_end, day_range),  # Count events day_range amount of days after the trigger as the same peak
        either_peak_end_range = replace_na(either_peak_end_range, FALSE),
        either_in_peak_range = cumsum(either_peak_start_range) > cumsum(either_peak_end_range), # Combine peaks within the same range into a single peak
        flood_in_which_peak = cumsum(either_peak_start_range) * flood * either_in_peak_range,

        # Check when protocol is triggered and whether floods are forecasted correctly
        protocol_triggered = either_in_peak_range & !dplyr::lag(either_in_peak_range),  # Counts number of times protocol is triggered
        flood_correct = flood & either_in_peak_range
      ) %>%
      summarise(
        floods = sum(flood),
        floods_correct = sum(flood_correct),
        floods_incorrect = floods - floods_correct,
        protocol_triggered = sum(protocol_triggered, na.rm=T),
        triggered_in_vain = protocol_triggered - (length(unique(flood_in_which_peak)) - 1),
        detection_ratio = round(floods_correct / floods, 2),
        false_alarm_ratio = round(triggered_in_vain/protocol_triggered, 2)
      )
  } else if (nrow(rainfall) == 0 & has_glofas){
    glofas %>%
      left_join(impact_df %>% dplyr::select(date) %>% mutate(flood = TRUE), by = "date") %>%
      mutate(
        row_id = row_number(),
        flood = replace_na(flood, FALSE),
        dis = !!sym(glofas_variable),
        dis = replace_na(dis, 0),

        # Create peak ranges for glofas
        glofas_exceeds_threshold = dis >= glofas_threshold,
        glofas_next_exceeds_threshold = lead(glofas_exceeds_threshold),
        glofas_prev_exceeds_threshold = dplyr::lag(glofas_exceeds_threshold),
        glofas_peak_start = glofas_exceeds_threshold & !glofas_prev_exceeds_threshold,
        glofas_peak_end = glofas_exceeds_threshold & !glofas_next_exceeds_threshold,
        glofas_peak_start_range = lead(glofas_peak_start, 0),  # There is an option here to also count days before the trigger but currently we don't use it
        glofas_peak_end_range = dplyr::lag(glofas_peak_end, day_range),  # Draw range around peak
        glofas_peak_end_range = replace_na(glofas_peak_end_range, FALSE),
        glofas_in_peak_range = cumsum(glofas_peak_start_range) > cumsum(glofas_peak_end_range), # Combine peaks within the same range into a single peak
        flood_in_which_peak = cumsum(glofas_peak_start_range) * flood * glofas_in_peak_range,

        # Check when protocol is triggered and whether floods are forecasted correctly
        protocol_triggered = glofas_in_peak_range & !dplyr::lag(glofas_in_peak_range),  # Counts number of times protocol is triggered
        flood_correct = flood & glofas_in_peak_range
      ) %>%
      summarise(
        floods = sum(flood),
        floods_correct = sum(flood_correct),
        floods_incorrect = floods - floods_correct,
        protocol_triggered = sum(protocol_triggered, na.rm=T),
        triggered_in_vain = protocol_triggered - (length(unique(flood_in_which_peak)) - 1),
        detection_ratio = round(floods_correct / floods, 2),
        false_alarm_ratio = round(triggered_in_vain/protocol_triggered, 2)
      )
  } else {
    rainfall %>%
      left_join(impact_df %>% dplyr::select(date) %>% mutate(flood = TRUE), by = "date") %>%
      mutate(
        row_id = row_number(),
        flood = replace_na(flood, FALSE),
        rainfall = replace_na(rainfall, 0),

        # Create peak ranges for rainfall
        rainfall_exceeds_threshold = rainfall >= rainfall_threshold,
        rainfall_next_exceeds_threshold = lead(rainfall_exceeds_threshold),
        rainfall_prev_exceeds_threshold = dplyr::lag(rainfall_exceeds_threshold),
        rainfall_peak_start = rainfall_exceeds_threshold & !rainfall_prev_exceeds_threshold,
        rainfall_peak_end = rainfall_exceeds_threshold & !rainfall_next_exceeds_threshold,
        rainfall_peak_start_range = lead(rainfall_peak_start, 0),  # There is an option here to also count days before the trigger but currently we don't use it
        rainfall_peak_end_range = dplyr::lag(rainfall_peak_end, day_range),  # Draw range around peak
        rainfall_peak_end_range = replace_na(rainfall_peak_end_range, FALSE),
        rainfall_in_peak_range = cumsum(rainfall_peak_start_range) > cumsum(rainfall_peak_end_range), # Combine peaks within the same range into a single peak
        flood_in_which_peak = cumsum(rainfall_peak_start_range) * flood * rainfall_in_peak_range,

        # Check when protocol is triggered and whether floods are forecasted correctly
        protocol_triggered = rainfall_in_peak_range & !dplyr::lag(rainfall_in_peak_range),  # Counts number of times protocol is triggered
        flood_correct = flood & rainfall_in_peak_range
      ) %>%
      summarise(
        floods = sum(flood),
        floods_correct = sum(flood_correct),
        floods_incorrect = floods - floods_correct,
        protocol_triggered = sum(protocol_triggered, na.rm=T),
        triggered_in_vain = protocol_triggered - (length(unique(flood_in_which_peak)) - 1),
        detection_ratio = round(floods_correct / floods, 2),
        false_alarm_ratio = round(triggered_in_vain/protocol_triggered, 2)
      )
  }
}
