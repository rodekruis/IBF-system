library(googleLanguageR)
Sys.setlocale("LC_ALL","Arabic")
gl_auth("My First Project-9df13c475b8e.json")

translate.others.arabic <- function(data, ignore.cols = NULL) {
  cols <- names(data)[endsWith(names(data), "_other")]
  if (!is.null(ignore.cols)) {
    cols <- cols[-which(!is.na(match(cols, ignore.cols)))]
  }
  result <- data.frame(question.name = character(), uuid = character(), row = numeric(), arabic = character(),
                       english = character(), stringsAsFactors = F)
  for (i in 1:length(cols)) {
    cat(sprintf("%d/%d\n", i, length(cols)))
    indices <- which(!is.na(data[,cols[i]]) & data[,cols[i]] != "")
    if (length(indices) > 0) {
      for (j in 1:length(indices)) {
        result[nrow(result) + 1, 1] <- cols[i]
        result$row[nrow(result)] <- indices[j]
        result$uuid[nrow(result)] <- data$X_uuid[indices[j]]
        arab <- data[indices[j], cols[i]]
        result$arabic[nrow(result)] <- arab
        if (is.character(arab)) {
          translation <- gl_translate(arab, target = "en")
          result$english[nrow(result)] <- translation$translatedText
        } else {
          result$english[nrow(result)] <- "ERROR: input is not text"
        }
      }
    }
  }
  return(result)
}