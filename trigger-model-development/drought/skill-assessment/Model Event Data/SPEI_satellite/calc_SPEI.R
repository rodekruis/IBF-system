library(dplyr)
library(SPEI)

path = '../datasets/'

#filename = 'UG_merged_adm1'

filename = 'KE_merged_adm1'

out_filename = paste0(filename,'_with_spei')

Prec_colname = 'Rainf_f_tavg_mean'

Evt_colname = 'Evap_tavg_mean'

district_colname = 'ADM1_EN'

scale = 2.628*10^6

Showplot = FALSE

full_data = read.csv(paste0(path,filename,'.csv'))

full_data['Bal'] = scale*(full_data[Prec_colname] - full_data[Evt_colname])

districts = unique(full_data[district_colname])

spei_scales = 1:12

new_data = data.frame()

for (n in (1:dim(districts)[1])){
  
  district = as.character(districts[n,district_colname])
  data = full_data %>% filter(full_data[district_colname]==as.character(district))
  for (spei_scale in spei_scales){
    SPEI = spei(data['Bal'],scale = spei_scale)
    colname = paste0('spei_',spei_scale)
    data[,colname] = SPEI$fitted
  }
  
  new_data = rbind(new_data,data)
  
  if (Showplot){
    plot(SPEI, main=paste('SPEI (', district,')'))}
}

write.csv(new_data, file = paste0(path,out_filename,'.csv'), row.names=FALSE)


