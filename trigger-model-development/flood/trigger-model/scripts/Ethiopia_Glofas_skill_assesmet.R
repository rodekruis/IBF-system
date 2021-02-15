
filenames="C:/Users/ATeklesadik/OneDrive - Rode Kruis/Documents/documents/ethiopia/GIS_DATA/data_for_skill_analysis.xlsx"
column_types = c("numeric",  "text", "numeric", "numeric", "numeric",   "numeric", "numeric", "numeric","numeric", "numeric", "numeric",  "numeric", "numeric", "numeric")

Gelda <- read_excel(filenames,sheet = "Gelda", col_types =column_types ) %>% 
  rename(Date_= "nile",col_ind="...2",Jan="...3",Feb="...4",Mar="...5",Apr="...6",May="...7",Jun="...8", Jul="...9",Aug="...10",Sep="...11",Oct="...12",Nov="...13",Dec="...14") %>% 
  mutate(year = ifelse(!grepl("Year:",col_ind), NA, substr(col_ind, 7, 10)))%>% fill(year) %>% drop_na(Date_)%>% 
  select(-col_ind) %>% gather('Month','Discharge',-Date_,-year) %>% 
  mutate(Station='Gelda',Date=as.Date(paste0(Date_,Month,year), "%d%b%Y")) %>% select(Date,Discharge,Station)



Wabi_wol <- read_excel(filenames,sheet = "Wabi wol", col_types =column_types)%>% 
  rename(Date_= "Annual Report of Daily Data: INSTANTANEOUS DAILY Flow",col_ind="...2",Jan="...3",Feb="...4",Mar="...5",Apr="...6",May="...7",Jun="...8",Jul="...9",Aug="...10",Sep="...11",Oct="...12",Nov="...13",Dec="...14")%>% 
  mutate(year = ifelse(!grepl("Year:",col_ind), NA, substr(col_ind, 7, 10)))%>% fill(year) %>% drop_na(Date_)%>% 
  select(-col_ind) %>% gather('Month','Discharge',-Date_,-year) %>% 
  mutate(Station='Wabi wol',Date=as.Date(paste0(Date_,Month,year), "%d%b%Y")) %>% select(Date,Discharge,Station)

walga_wol <- read_excel(filenames,sheet = "Walga wol", col_types = column_types)%>% 
  rename(Date_="Annual Report of Daily Data: instantaneous daily Flow",col_ind="...2",Jan="...3",Feb="...4",
         Mar="...5",Apr="...6",May="...7",Jun="...8",Jul="...9",Aug="...10",Sep="...11",Oct="...12",Nov="...13",Dec="...14")%>% 
  mutate(year = ifelse(!grepl("Year:",col_ind), NA, substr(col_ind, 7, 10)))%>% fill(year) %>% drop_na(Date_)%>% 
  select(-col_ind) %>% gather('Month','Discharge',-Date_,-year) %>% 
  mutate(Station='Walga wol',Date=as.Date(paste0(Date_,Month,year), "%d%b%Y")) %>% select(Date,Discharge,Station)

GGhibe <- read_excel(filenames,sheet = "G Ghibe", col_types = column_types)%>% 
  rename(Date_= "Merdefa nr Alem Tefri",col_ind="...2",Jan="...3",Feb="...4",Mar="...5",Apr="...6",
         May="...7",Jun="...8",Jul="...9",Aug="...10",Sep="...11",Oct="...12",Nov="...13",Dec="...14")%>% 
  mutate(year = ifelse(!grepl("Year:",col_ind), NA, substr(col_ind, 7, 10)))%>% fill(year) %>% drop_na(Date_)%>% 
  select(-col_ind) %>% gather('Month','Discharge',-Date_,-year) %>% 
  mutate(Station='G Ghibe',Date=as.Date(paste0(Date_,Month,year), "%d%b%Y")) %>% select(Date,Discharge,Station)

Gojeb <- read_excel(filenames,sheet = "Gojeb nr shebe", col_types = column_types)%>% 
  rename(Date_= "Merdefa nr Alem Tefri",col_ind="...2",Jan="...3",Feb="...4",Mar="...5",Apr="...6",
         May="...7",Jun="...8",Jul="...9",Aug="...10",Sep="...11",Oct="...12",Nov="...13",Dec="...14")%>% 
  mutate(year = ifelse(!grepl("Year:",col_ind), NA, substr(col_ind, 7, 10)))%>% fill(year) %>% drop_na(Date_)%>% 
  select(-col_ind) %>% gather('Month','Discharge',-Date_,-year) %>% 
  mutate(Station='Gojeb nr shebe',Date=as.Date(paste0(Date_,Month,year), "%d%b%Y")) %>% select(Date,Discharge,Station)

Ghibe_seka <- read_excel(filenames,sheet = "Ghibe nr seka", col_types = column_types)%>% 
  rename(Date_= "Merdefa nr Alem Tefri",col_ind="...2",Jan="...3",Feb="...4",Mar="...5",Apr="...6",
         May="...7",Jun="...8",Jul="...9",Aug="...10",Sep="...11",Oct="...12",Nov="...13",Dec="...14")%>% 
  mutate(year = ifelse(!grepl("Year:",col_ind), NA, substr(col_ind, 7, 10)))%>% fill(year) %>% drop_na(Date_)%>% 
  select(-col_ind) %>% gather('Month','Discharge',-Date_,-year) %>% 
  mutate(Station='Ghibe nr seka',Date=as.Date(paste0(Date_,Month,year), "%d%b%Y")) %>% select(Date,Discharge,Station)

Ribb <- read_excel(filenames,sheet = "Ribb", col_types = column_types)%>% 
  rename(Date_= "nile",col_ind="...2",Jan="...3",Feb="...4",Mar="...5",Apr="...6",May="...7",
         Jun="...8",Jul="...9",Aug="...10",Sep="...11",Oct="...12",Nov="...13",Dec="...14")%>% 
  mutate(year = ifelse(!grepl("Year:",col_ind), NA, substr(col_ind, 7, 10)))%>% fill(year) %>% drop_na(Date_)%>% 
  select(-col_ind) %>% gather('Month','Discharge',-Date_,-year) %>% 
  mutate(Station='Ribb',Date=as.Date(paste0(Date_,Month,year), "%d%b%Y")) %>% select(Date,Discharge,Station)

L_tana <- read_excel(filenames,sheet = "L tana", col_types = column_types) %>% 
  rename(Date_= "nile",col_ind="...2",Jan="...3",Feb="...4",Mar="...5",Apr="...6",May="...7",
         Jun="...8",Jul="...9",Aug="...10",Sep="...11",Oct="...12",Nov="...13",Dec="...14")%>% 
  mutate(year = ifelse(!grepl("Year:",col_ind), NA, substr(col_ind, 7, 10)))%>% fill(year) %>% drop_na(Date_)%>% 
  select(-col_ind) %>% gather('Month','Discharge',-Date_,-year) %>% 
  mutate(Station='L_tana',Date=as.Date(paste0(Date_,Month,year), "%d%b%Y")) %>% select(Date,Discharge,Station)


Baro_ga <- read_excel(filenames,sheet = "Baro ga", col_types = column_types) %>% 
  rename(Date_= "Merdefa nr Alem Tefri",col_ind="...2",Jan="...3",Feb="...4",Mar="...5",Apr="...6",
         May="...7",Jun="...8",Jul="...9",Aug="...10",Sep="...11",Oct="...12",Nov="...13",Dec="...14") %>% 
  mutate(year = ifelse(!grepl("Year:",col_ind), NA, substr(col_ind, 7, 10)))%>% fill(year) %>% drop_na(Date_)%>% 
  select(-col_ind) %>% gather('Month','Discharge',-Date_,-year) %>% 
  mutate(Station='Baro_ga',Date=as.Date(paste0(Date_,Month,year), "%d%b%Y")) %>% select(Date,Discharge,Station)

Discharge_df=rbind(Gelda,Wabi_wol,walga_wol,GGhibe,Gojeb,Ghibe_seka,Ribb,L_tana,Baro_ga)



