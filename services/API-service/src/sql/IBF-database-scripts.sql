--This script is not connected explicitly to the rest of the repository
--These views/functions are stored in Postgres and called from
--They are kept explicitly here in the repository for documentation 

--Combine CRA data in one table (input used in processDynamicDataPostgresExposure.sql)
drop view if exists "IBF-static-input"."CRA_data_2";
create or replace view "IBF-static-input"."CRA_data_2" as 
select cast('ZMB' as varchar) as country_code
	, pcode
	, row_to_json(zmb.*) as indicators
from "IBF-static-input"."ZMB_CRA_Indicators_2" zmb
union all
select cast('UGA' as varchar) as country_code
	, total.pcode
	, row_to_json(total.*) as indicators
from (
	select uga.*
		, fl."Weighted Vulnerability Index" as vulnerability_index
	from "IBF-static-input"."UGA_CRA_Indicators_2" uga
	left join "IBF-static-input"."UGA_flood_vulnerability" fl on uga.pcode_level2 = fl."pointsADM2_PCODE"
) total
;


--create API view for Glofas stations
drop view if exists "IBF-API"."Glofas_stations";
create or replace view "IBF-API"."Glofas_stations" as
select dfps.country_code
		,dfps.lead_time
		,dgsv.station_code
		,dgsv.station_name
		,ST_AsGeoJSON(ST_FlipCoordinates(dgsv.geom))::json As geom
		,dgsv.trigger_level
	  , dfps.fc
      , dfps.fc_trigger
      , dfps.fc_perc
      , dfps.fc_prob
from "IBF-pipeline-output".dashboard_glofas_stations dgsv
left join "IBF-pipeline-output".dashboard_forecast_per_station dfps on dgsv.station_code = dfps.station_code and dgsv.country_code = dfps.country_code
where current_prev = 'Current'
;
--select * from "IBF-API"."Glofas_stations" where lead_time = '3-day' and country_code = 'ZMB'

drop view if exists "IBF-API"."Trigger_per_lead_time";
create or replace view "IBF-API"."Trigger_per_lead_time" as 
select *
from "IBF-pipeline-output".dashboard_triggers_per_day
where current_prev = 'Current'
;
--select * from "IBF-API"."Trigger_per_lead_time"


drop view if exists "IBF-API"."Admin_area_static_level2";
create or replace view "IBF-API"."Admin_area_static_level2" as 
select country_code
	,geo.pcode_level2 as temp
	,geo."name"
	,geo.pcode_level1
	,ST_AsGeoJSON(geo.geom)::json As geom
	,coalesce(uga.properties,zmb.properties) as indicators
from (
	select cast('ZMB' as varchar) as country_code
			,*
	from "IBF-static-input"."ZMB_Geo_level2" zmb
	union all
	select cast('UGA' as varchar) as country_code
			,*
	from "IBF-static-input"."UGA_Geo_level2" uga
) geo
left join (select pcode, row_to_json(t.*) As properties from "IBF-static-input"."UGA_CRA_Indicators_2" t) uga on geo.pcode_level2 = uga.pcode and geo.country_code = 'UGA'
left join (select pcode, row_to_json(t.*) As properties from "IBF-static-input"."ZMB_CRA_Indicators_2" t) zmb on geo.pcode_level2 = zmb.pcode and geo.country_code = 'ZMB'
;
--select * from "IBF-API"."Admin_area_static_level2" where country_code = 'UGA'

drop view if exists "IBF-API"."Admin_area_data2";
create or replace view "IBF-API"."Admin_area_data2" as 
select geo.pcode_level2
	,geo."name"
	,geo.pcode_level1
	,ST_AsGeoJSON(geo.geom)::json As geom
	,d2.*
from (
	select cast('ZMB' as varchar) as country_code
			,*
	from "IBF-static-input"."ZMB_Geo_level2" zmb
	union all
	select cast('UGA' as varchar) as country_code
			,*
	from "IBF-static-input"."UGA_Geo_level2" uga
) geo
left join "IBF-pipeline-output".data_adm2 d2 on geo.pcode_level2 = d2.pcode
;
--select * from "IBF-API"."Admin_area_data2" where country_code = 'UGA'

drop view if exists "IBF-API"."Matrix_aggregates2";
create or replace view "IBF-API"."Matrix_aggregates2" as 
select country_code
	,lead_time
	,sum(population_affected) as population_affected
from "IBF-API"."Admin_area_data2"
where country_code is not null and current_prev = 'Current'
group by 1,2,3
;
--select * from "IBF-API"."Matrix_aggregates2"


select * 
from "IBF-API"."Admin_area_data2" where country_code='UGA' order by 2


{"pcode":"21UGA001001","birth_certificate_0_17":0.441525395636586,"birth_u18":0.195950391980465,"copmleted_o_level":0.04801131403197,"disability":0.160151199429202,"drinking_water":0.0108004777331165,"drought_phys_exp":0.0818892301760699,"earthquake7_phys_exp":0,"education_density":6.78044219119074,"electricity_access":0.0572796644345865,"elevation":1088.35406369051,"far_health":0.319545617308297,"far_school":0.123183302385563,"far_school_sec":0.667183630328519,"far_waterpoint":0.561313805955267,"female_head_hh":0.235103457139185,"flood_phys_exp":0.000174552956139846,"has_bank_account":0.140353185699914,"health_density":1.26232303090198,"illiteracy":0.434835004808353,"incident_density":0,"internet_access":0.0606479089204916,"land_area":3525.97879952767,"married_u18":null,"mobile_phone_access":0.185055488834429,"mosquito_nets":0.962722024028469,"no_toilet":0.522492127153234,"nr_of_hospitals":2.65263307171758,"nr_refugees":null,"old_head_hh":0.165786664244025,"orphanhood":0.0059721780287083,"own_bicycle":0.489807368966847,"own_computer":0.0109112072289263,"own_radio":0.35906711751437,"own_television":0.0195461712659928,"owner_plot":0.912862166462072,"pop_density":63.9961306716385,"population":225649,"population_over65":0.0282640251009311,"population_u8":0.343915656617136,"poverty_incidence":0.741822667948894,"received_remittances":0.0585879396762228,"refugee_density":null,"roof_type":0.144460507247982,"school_not_attending":0.17776166967281,"subsistence_farming_old":0.915404537190397,"traveltime":319.10534383711,"wall_type":0.123074403165979,"working_10_17":0.660150388435136,"working_18plus":0.900399975182695,"young_head_hh":0.00266434152156668,"pcode_level2":"21UGA001001","pcode_level1_copy":"21UGA001","population_copy":225649,"flood_phys_exp_score":0.5729,"earthquake7_phys_exp_score":0.0000,"drought_phys_exp_score":2.1084,"incident_density_score":0.0000,"hazard_score":0.7080,"wall_type_score":8.9295,"roof_type_score":9.4040,"poverty_incidence_score":7.5394,"orphanhood_score":2.4435,"mosquito_nets_score":1.1352,"disability_score":5.4417,"population_over65_score":3.6818,"working_18plus_score":1.1142,"working_10_17_score":6.6337,"birth_certificate_0_17_score":2.0313,"school_not_attending_score":1.5730,"married_u18_score":null,"female_head_hh_score":3.7427,"young_head_hh_score":1.1420,"copmleted_o_level_score":7.8441,"population_u8_score":7.9682,"illiteracy_score":4.4719,"old_head_hh_score":5.2123,"vulnerability_score":5.4922,"mobile_phone_access_score":8.2674,"internet_access_score":8.8070,"health_density_score":7.1141,"electricity_access_score":9.5137,"education_density_score":1.4891,"drinking_water_score":9.8966,"traveltime_score":8.9794,"owner_plot_score":0.7555,"received_remittances_score":9.5002,"own_bicycle_score":3.5211,"far_school_sec_score":8.5270,"has_bank_account_score":8.2694,"far_waterpoint_score":7.0205,"own_computer_score":9.6314,"far_school_score":1.9978,"own_television_score":9.8016,"far_health_score":4.0374,"own_radio_score":5.8681,"no_toilet_score":5.8957,"coping_capacity_score":7.6973,"risk_score":5.2674}



--create function (not used for now)
CREATE OR REPLACE FUNCTION "IBF-API".get_stations(country character varying, current_prev character varying, lead_time character varying, OUT result json)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
	BEGIN
	EXECUTE format('
		with data as (
		select * from "IBF-API"."Glofas_stations"
		where 0=0
		and current_prev = ''%s''
		and lead_time = ''%s''
		)
		SELECT row_to_json(featcoll)
		FROM (
			SELECT ''FeatureCollection'' As type, array_to_json(array_agg(feat)) As features
			FROM (
				SELECT ''Feature'' As type
					,ST_AsGeoJSON(tbl.geom)::json As geometry
					,row_to_json((SELECT l FROM (SELECT tbl.*) As l)) As properties
				FROM data As tbl
				)  As feat
			)  As featcoll
		;',current_prev, lead_time)
	INTO result;
	END
$function$
;
--select "IBF-API".get_stations('ZMB','Current','3-day')
