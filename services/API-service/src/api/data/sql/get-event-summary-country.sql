


select
  to_char(max("endDate") , 'yyyy-mm-dd') as "endDate",
  to_char(min("startDate"), 'yyyy-mm-dd') as "startDate",
  max(countryCodeISO3) as "countryCodeISO3",
  max("activeTrigger"::int)::boolean as "activeTrigger"
from
  (
  select
    e."placeCode" ,
    coalesce(a2.countryCodeISO3 , a1.countryCodeISO3) as countryCodeISO3,
    coalesce(a2.exposureValue, a1.exposureValue) as exposureValue,
    e."endDate",
    e."startDate",
    e."activeTrigger"
  from
    "IBF-app".event_place_code e
  left join "IBF-API"."Admin_area_data2" a2 on
    a2."placeCode" = e."placeCode"
    and a2.countryCodeISO3 is not null
  left join "IBF-API"."Admin_area_data1" a1 on
    a1."placeCode" = e."placeCode"
    and a1.countryCodeISO3 is not null
  where
    closed = false
  group by
    e."placeCode",
    a2.exposureValue,
    a1.exposureValue,
    a2.countryCodeISO3,
    a1.countryCodeISO3,
    e."endDate",
    e."startDate",
    e."activeTrigger"
  order by
    exposureValue desc ) as event_place_code_country where countryCodeISO3 = $1
