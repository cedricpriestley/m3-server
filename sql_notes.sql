select concat("'", i.code, "': '", a.name, "',")
from area a
inner join country_area ca ON ca.area = a.id
inner join iso_3166_1 i ON i.area = ca.area
order by a.name asc