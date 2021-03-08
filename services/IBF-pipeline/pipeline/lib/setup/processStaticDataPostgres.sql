--DROP TABLE IF EXISTS "IBF-static-input".dashboard_glofas_stations cascade;
truncate TABLE "IBF-static-input".dashboard_glofas_stations;
insert into "IBF-static-input".dashboard_glofas_stations
SELECT cast('ZMB' as varchar) as country_code 
	, station_code
	, station_name
	, "10yr_threshold" as trigger_level
	, "2yr_threshold"
	, "5yr_threshold"
	, "10yr_threshold"
	, "20yr_threshold"
	,st_SetSrid(st_MakePoint(lat, lon), 4326) as geom
--INTO "IBF-static-input".dashboard_glofas_stations
FROM "IBF-static-input"."ZMB_glofas_stations"
union all
SELECT 'UGA' as country_code
	, station_code
	, station_name
	, "5yr_threshold" as trigger_level
	, "2yr_threshold"
	, "5yr_threshold"
	, "10yr_threshold"
	, "20yr_threshold"
	,st_SetSrid(st_MakePoint(lat, lon), 4326) as geom
FROM "IBF-static-input"."UGA_glofas_stations"
where station_code in (select station_code_7day from "IBF-static-input"."UGA_waterstation_per_district" group by 1)
union all
SELECT 'KEN' as country_code
	, station_code
	, station_name
	, "5yr_threshold" as trigger_level
	, "2yr_threshold"
	, "5yr_threshold"
	, "10yr_threshold"
	, "20yr_threshold"
	,st_SetSrid(st_MakePoint(lat, lon), 4326) as geom
FROM "IBF-static-input"."KEN_glofas_stations"
where station_code in (select station_code_7day from "IBF-static-input"."KEN_waterstation_per_district" group by 1)
union all
SELECT 'ETH' as country_code
	, station_code
	, station_name
	, "10yr_threshold_7day" as trigger_level
	, "2yr_threshold"
	, "5yr_threshold"
	, "10yr_threshold"
	, "20yr_threshold"
	,st_SetSrid(st_MakePoint(lat, lon), 4326) as geom
FROM "IBF-static-input"."ETH_glofas_stations"
where station_code in (select station_code_7day from "IBF-static-input"."ETH_waterstation_per_district" group by 1)
;
--select * from "IBF-static-input".dashboard_glofas_stations

DROP TABLE IF EXISTS "IBF-static-input".waterstation_per_district;
SELECT cast('ZMB' as varchar) as country_code 
	, "distName"
	, cast(pcode as varchar)
	, station_code_3day
	, station_code_7day
INTO "IBF-static-input".waterstation_per_district
FROM "IBF-static-input"."ZMB_waterstation_per_district"
union all 
SELECT cast('UGA' as varchar) as country_code 
	, "distName"
	, cast(pcode as varchar)
	, station_code_3day
	, station_code_7day
FROM "IBF-static-input"."UGA_waterstation_per_district"
union all
SELECT cast('KEN' as varchar) as country_code 
	, "County"
	, cast(pcode as varchar)
	, null
	, station_code_7day
FROM "IBF-static-input"."KEN_waterstation_per_district"
union all
SELECT cast('ETH' as varchar) as country_code 
	, zone
	, cast(pcode as varchar)
	, null
	, station_code_7day
FROM "IBF-static-input"."ETH_waterstation_per_district"

--union all
--SELECT cast('EGY' as varchar) as country_code
--	, "distName"
--	, cast(pcode as varchar)
--	, station_code_3day
--	, station_code_7day
--FROM "IBF-static-input"."EGY_waterstation_per_district"
;
--select * from "IBF-static-input".waterstation_per_district

DROP TABLE IF EXISTS "IBF-static-input".dashboard_redcross_branches;
SELECT  'ZMB' as country_code
	, initcap("BRANCH") as name
	, "TOTAL" as nr_volunteers
	, "PRESIDENT" as contact_person
	, "LOCATION OF OFFICE" as contact_address
	, null as contact_number
	, ST_AsGeoJSON(st_SetSrid(st_MakePoint(lon, lat), 4326))::json as geom
INTO "IBF-static-input".dashboard_redcross_branches
FROM "IBF-static-input"."ZMB_redcross_branches"
union all
SELECT 'UGA' as country_code 
	, initcap("BranchName") as name 
	, null as nr_volunteers 
	, null as contact_person 
	, null as contact_address 
	, null as contact_number 
	, ST_AsGeoJSON(st_SetSrid(st_MakePoint(longitude, latitude), 4326))::json as geom
FROM "IBF-static-input"."UGA_redcross_branches";
;
--select * from "IBF-static-input".dashboard_redcross_branches

--Combine CRA data in one table (input used in processDynamicDataPostgresExposure.sql)
drop table if exists "IBF-static-input"."CRA_data_2";
create table "IBF-static-input"."CRA_data_2" as 
select cast('ZMB' as varchar) as country_code
	, pcode
	, row_to_json(zmb.*) as indicators
from "IBF-static-input"."ZMB_CRA_Indicators_2" zmb
union all
select cast('ETH' as varchar) as country_code
	, pcode
	, row_to_json(
		ken.*
		) as indicators
from "IBF-static-input"."ETH_CRA_Indicators_2" ken
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
--select * from "IBF-static-input"."CRA_data_2" where country_code = 'UGA'

--Combine CRA data in one table (input used in processDynamicDataPostgresExposure.sql)
drop table if exists "IBF-static-input"."CRA_data_1";
create table "IBF-static-input"."CRA_data_1" as 
select cast('KEN' as varchar) as country_code
	, pcode
	, row_to_json(ken.*) as indicators
from "IBF-static-input"."KEN_CRA_Indicators_1" ken
union all 
select cast('EGY' as varchar) as country_code
	, pcode
	, null as indicators
from "IBF-app"."adminArea" 
where "countryCode" = 'EGY'
;
--select * from "IBF-static-input"."CRA_data_1" where country_code = 'UGA'
