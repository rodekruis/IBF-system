rm(list=ls())

# set seed for reproducibility
set.seed(100)

# load required packages
library(tidyverse);library(rpart);library(rpart.plot);library(caret);library(randomForest);library(FFTrees);library(psych);library(DescTools);library(rcompanion);library(boot); library(dplyr)


# load data
NsCh <- read.csv("F:/Afstuderen/Data/Input_FFTree/NsCh_GS.csv", sep=";")
View(NsCh)
NsCh_All <- NsCh[1:68,]
NsCh_Nov <- NsCh[1:14,]
NsCh_Dec <- NsCh[15:28,]
NsCh_Jan <- NsCh[29:40,]
NsCh_Feb <- NsCh[41:54,]
NsCh_Mrt <- NsCh[55:68,]
View(NsCh_Mrt)

setwd("F:/Afstuderen/Data Overview/Mikalango_1")

Y15 = quantile(NsCh_Mrt$Anomaly_VOD_march_1, c(0.20,0.40,0.50))
View(Y15)

m<-1


x_list <- list("Mrt"=NsCh_Mrt, "Feb" = NsCh_Feb, "Jan"= NsCh_Jan, "Dec"= NsCh_Dec, "Nov" = NsCh_Nov) #Order Leadtime 1, 2, 3, 4, 5


for (m in 1:length(x_list)){
  Nov_tree<-x_list[[m]]#dataset

  print('month', m)
  #Y15 = quantile(NsCh_Jan$Anomaly_VOD_march_1, c(0.15,0.2,0.25, 0.30, 0.35, 0.40, 0.50))
  #View(Y15)

  quantiles=c(0.20, 0.40, 0.50) #0.20 correspont to once in the 5-yrs return period
  Performance_NsCh_Nov<-as.data.frame(matrix(NA,15,15))  # dataframe to select performance data of the model. 
  colnames(Performance_NsCh_Nov)<-c("FAR","MS","CR","HR","NPV","PPV","AUC","DPRIME","WACC","Mean", "STD", "Upper Bound", "Lower Bound", "MaxLevel","Quantile")
  predictionsFFT <- as.data.frame(matrix(NA,nrow(Nov_tree),length(quantiles)))  # data frame to record FFTrees predictions
  
  b<-1 # index for iterating the rows when saving runs
  a<-1
  
  for (g in 1:length(quantiles)){
    thre=quantiles[g] 
    Nov_tree$Drought_VOD<-ifelse(Nov_tree$Anomaly_VOD_march_1>quantile(Nov_tree$Anomaly_VOD_march_1,thre),0,1) #creating a binary variable based on my threshold level
    Cue<-cuerank(Drought_VOD~ ONIjuly + P_Cum + Anomaly_SM + Anomaly_Teff + DS_Cat1_Cum + Anomaly_VOD, data = Nov_tree,  goal = "wacc",sens.w = 0.75) #here I rank my dataset to select only 5 best variables
    Cue_d<-Cue[order(-Cue$wacc),]
    Cue_Names<-Cue_d [1:5,1] #get 5 best
    Nov_cue<-Nov_tree[,Cue_Names] #select in Nov_tree only the variables that are the 5 best
    Nov_cue$Drought_VOD<-Nov_tree$Drought_VOD
    
    #print(Cue_d)
    print('quantile', g)
    
    
    for (a in 1:5){  #max.levels for pruning
      print('for leave',a)
      
      
      Stats <- as.data.frame(matrix(NA,nrow(Nov_tree),4)) #dataframe to save the statistics of the leave-one-out cross validation. In column 1 I save the False alarms; in column 2 I save the Miss rate;  in column 3 the correct rejection; and in column 4 the Hit Rate. From lines 46 on, I compare my original values (based on the binary classification that I established given the threshold) with the FFT predictions.
      for (i in 1:nrow(Nov_cue)){
        print('i', i)
        data.train <- Nov_cue[-i, ,drop = FALSE] #train sample
        data.test <- Nov_cue[i, ,drop = FALSE] #test sample
        Maize.FFT<- FFTrees(Drought_VOD~., data = data.train, goal = "wacc",progress = F, max.levels = a, 
                            algorithm = "dfan",do.comp = F,sens.w = 0.75, main='March') #Fitting an FFT
        pred.FFT<-predict(Maize.FFT,data.test) #Predicting using the FFT model
        predictionsFFT[i,g] <- pred.FFT #store value of prediction (predictions are 0 or 1)
        
        if  (!is.na(Nov_tree[i,"Drought_VOD"]) & Nov_tree[i,"Drought_VOD"]==0 & predictionsFFT[i,g]==TRUE ){
          
          Stats[i,1] <- 1 #False Alarms
          
          
        } else if (!is.na(Nov_tree[i,"Drought_VOD"]) & Nov_tree[i,"Drought_VOD"]==1 & predictionsFFT[i,g]==FALSE) {
          
          Stats[i,2] <- 1 #Misses
          
        } else if (!is.na(Nov_tree[i,"Drought_VOD"]) & Nov_tree[i,"Drought_VOD"]==0 & predictionsFFT[i,g]==FALSE) {
          
          Stats[i,3] <- 1 #Correct rejection
          
          
        } else if  (!is.na(Nov_tree[i,"Drought_VOD"]) & Nov_tree[i,"Drought_VOD"]==1 & predictionsFFT[i,g]==TRUE){
          
          Stats[i,4] <- 1 #hits
          
        } else {
          
          Stats[i,1:4]<- NA
        }
        #print(c(a,g,i))
      }
      
      FAR<- sum(Stats[,1],na.rm=T) #sum number of false alarms
      MS<- sum(Stats[,2],na.rm=T) #sum number of misses
      CR<- sum(Stats[,3],na.rm=T) #sum number of correct rejection 
      HR<-sum(Stats[,4],na.rm=T) #sum number of hits 
      #For bootstrap 1:1000, van Stats willekeuring 14 samples uit met teruglegging, 1000 accuracy 
      
      #write.csv(Maize.FFT$tree.definitions,sprintf("NsCh_FFT_VOD_VdS_a%02d_g%02d_%02d.csv", a,g,m), row.names = F)
      
      WACC_Stats <- as.data.frame(matrix(NA,1000,5)) #dataframe to save the statistics of the bootstrapping. 
      colnames(WACC_Stats)<-c("FAR_boot", "MS_boot", "CR_boot", "HR_boot", "WACC")
      for (b in 1:1000){
        idx <- sample(1:14, 14, replace=T)
        Stats_sample <- Stats[idx,]
        #print(Stats_sample)
        #idx opslaan in een matrix
        FAR_boot<- sum(Stats_sample[,1],na.rm=T) #sum number of false alarms
        MS_boot<- sum(Stats_sample[,2],na.rm=T) #sum number of misses
        CR_boot<- sum(Stats_sample[,3],na.rm=T) #sum number of correct rejection 
        HR_boot<-sum(Stats_sample[,4],na.rm=T)
        
        WACC_sample <- (HR_boot/((HR_boot+MS_boot)))*0.75+(CR_boot/(CR_boot+FAR_boot))*(1-0.75)
        WACC_Stats[b,1] <- FAR_boot
        WACC_Stats[b,2] <- MS_boot
        WACC_Stats[b,3] <- CR_boot
        WACC_Stats[b,4] <- HR_boot
        WACC_Stats[b,5] <- WACC_sample
        
        mean <- mean(WACC_Stats[,5], na.rm = T)
        #View(mean)
        sd <- sd(WACC_Stats[,5], na.rm = T)
        #View(sd)
        
        #ci_up = mean(WACC_Stats[,5], na.rm = T) + 2.145 * (sd(WACC_Stats[,5], na.rm = T)/ sqrt(14))
        #ci_low = mean(WACC_Stats[,5], na.rm = T) - 2.145 * (sd(WACC_Stats[,5], na.rm = T)/ sqrt(14))
        ci_up = mean(WACC_Stats[,5], na.rm = T) + 1.962 * (sd(WACC_Stats[,5], na.rm = T)/ sqrt(1000))
        ci_low = mean(WACC_Stats[,5], na.rm = T) - 1.962 * (sd(WACC_Stats[,5], na.rm = T)/ sqrt(1000))
        b <-b+1
      }

      Performance_NsCh_Nov[m,1]<- FAR / sum(Nov_tree[,"Drought_VOD"]==0,na.rm = T) #calculates the false alarm rate
      Performance_NsCh_Nov[m,2]<- MS / sum(Nov_tree[,"Drought_VOD"]==1,na.rm = T)
      Performance_NsCh_Nov[m,3]<- CR / sum(Nov_tree[,"Drought_VOD"]==0,na.rm = T)
      Performance_NsCh_Nov[m,4]<- HR / sum(Nov_tree[,"Drought_VOD"]==1,na.rm = T)
      Performance_NsCh_Nov[m,5]<- HR / (FAR+HR)
      Performance_NsCh_Nov[m,6]<- CR / (MS+CR)
      Performance_NsCh_Nov[m,7]<-auc(Performance_NsCh_Nov[m,4],Performance_NsCh_Nov[m,3]) #calculates AUC from tested model
      dFAR<-ifelse(Performance_NsCh_Nov[m,1]==0,0.5/(FAR+CR),ifelse(Performance_NsCh_Nov[m,1]==1,((FAR+CR)-0.5)/(FAR+CR),Performance_NsCh_Nov[m,1]))
      dHR<-ifelse(Performance_NsCh_Nov[m,4]==0,0.5/(HR+MS),ifelse(Performance_NsCh_Nov[m,4]==1,((HR+MS)-0.5)/(HR+MS),Performance_NsCh_Nov[m,4])) #adjusting the AUC
      Performance_NsCh_Nov[m,8]<-qnorm(dHR) - qnorm(dFAR) #dprime
      Performance_NsCh_Nov[m,9]<-(HR/((HR+MS)))*0.75+(CR/(CR+FAR))*(1-0.75)

      
      Performance_NsCh_Nov[m,10] <- mean
      Performance_NsCh_Nov[m,11] <- sd
      Performance_NsCh_Nov[m,12] <- ci_up
      Performance_NsCh_Nov[m,13] <- ci_low
      
      Performance_NsCh_Nov[m,14]<-a
      Performance_NsCh_Nov[m,15]<-g
      
      
      m<-m+1
      
    }

    #write.csv(Cue_d,sprintf("NsCh_Cue_VOD_VdS_%02d.csv", g), row.names = F) #Return the Cue order per quantile 
    write.csv(Cue_d,sprintf("Mikalango_Cue_VdS_g%02d_%02d.csv", g,m), row.names = F)
  }
  #Leaves <- filter_all(Performance_NsCh_Nov, any_vars(Performance_NsCh_Nov$MaxLevel>1))
  #max_ <- Leaves[which.max(Leaves$Mean),]
  #write.csv(Maize.FFT$tree.definitions,sprintf("TreeDef_NsCh_m_VOD_VdS_%02d.csv", m), row.names = F)
  #write.csv(WACC_Stats,sprintf("WACC_Stats_NsCh_m_VOD_VdS_%02d.csv", m), row.names = F) # For each month it return the WACC_Stats 
  #write.csv(Maize.FFT$tree.definitions,"treedef_NsCh_Nov_CI_VOD_ESA_02.csv",row.names = F)
  #write.csv(WACC_Stats,sprintf("WACC_Stats_NsCh_m_VOD_VdS_m%02d_q%02d_a%02d.csv", m, g, a), row.names = F)
  write.csv(Performance_NsCh_Nov,sprintf("Performance_Mikalango_VOD_VdS_%02d.csv", m), row.names = F)
}





#Maize.FFT$tree.definitions

plot(Maize.FFT, tree=2)

plot(pred.FFT)

#summary(Maize.FFT)
