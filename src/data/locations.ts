export interface LocationData {
  [department: string]: {
    [province: string]: string[];
  };
}

export const peruLocations: LocationData = {
  "Lima": {
    "Lima": ["Ancón", "Ate", "Barranco", "Breña", "Carabayllo", "Chaclacayo", "Chorrillos", "Cieneguilla", "Comas", "El Agustino", "Independencia", "Jesús María", "La Molina", "La Victoria", "Lince", "Los Olivos", "Lurigancho", "Lurín", "Magdalena del Mar", "Miraflores", "Pachacámac", "Pucusana", "Pueblo Libre", "Puente Piedra", "Punta Hermosa", "Punta Negra", "Rímac", "San Bartolo", "San Borja", "San Isidro", "San Juan de Lurigancho", "San Juan de Miraflores", "San Luis", "San Martín de Porres", "San Miguel", "Santa Anita", "Santa María del Mar", "Santa Rosa", "Santiago de Surco", "Surquillo", "Villa El Salvador", "Villa María del Triunfo"],
    "Barranca": ["Barranca", "Paramonga", "Pativilca", "Supe", "Supe Puerto"],
    "Cajatambo": ["Cajatambo", "Copa", "Gorgor", "Huancapón", "Manás"],
    "Canta": ["Canta", "Arahuay", "Huamantanga", "Huaros", "Lachaqui", "San Buenaventura", "Santa Rosa de Quives"],
    "Cañete": ["San Vicente de Cañete", "Asia", "Calango", "Cerro Azul", "Coayllo", "Chilca", "Imperial", "Lunahuaná", "Mala", "Nuevo Imperial", "Pacarán", "Quilmaná", "San Antonio", "San Luis", "Santa Cruz de Flores", "Zúñiga"],
    "Huaral": ["Huaral", "Atavillos Alto", "Atavillos Bajo", "Aucallama", "Chancay", "Ihuarí", "Lampian", "Pacaraos", "San Miguel de Acos", "Santa Cruz de Andamarca", "Sumbilca", "27 de Noviembre"],
    "Huarochirí": ["Matucana", "Antioquía", "Callahuanca", "Carampoma", "Chicla", "Cuenca", "Huachupampa", "Huanza", "Huarochirí", "Lahuaytambo", "Langa", "Laraos", "Mariatana", "Ricardo Palma", "San Andrés de Tupicocha", "San Antonio", "San Bartolomé", "San Damián", "San Juan de Iris", "San Juan de Tantaranche", "San Lorenzo de Quinti", "San Mateo", "San Mateo de Otao", "San Pedro de Casta", "San Pedro de Huancayre", "Sangallaya", "Santa Cruz de Cocachacra", "Santa Eulalia", "Santiago de Anchucaya", "Santiago de Tuna", "Santo Domingo de los Olleros", "Surco"],
    "Huaura": ["Huacho", "Ambar", "Caleta de Carquín", "Checras", "Hualmay", "Huaura", "Leoncio Prado", "Paccho", "Santa Leonor", "Santa María", "Sayán", "Végueta"],
    "Oyón": ["Oyón", "Andajes", "Caujul", "Cochamarca", "Naván", "Pachangara"],
    "Yauyos": ["Yauyos", "Alis", "Ayauca", "Ayaviri", "Azángaro", "Cacra", "Carania", "Catahuasi", "Chacos", "Chongos Alto", "Cochas", "Colonia", "Hongos", "Huampara", "Huancaya", "Huangáscar", "Huantán", "Huañec", "Laraos", "Lincha", "Madean", "Miraflores", "Omas", "Putinza", "Quinches", "Quinocay", "San Joaquín", "San Pedro de Pilas", "Tanta", "Tauripampa", "Tomas", "Tupe", "Viñac", "Vitis"]
  },
  "Arequipa": {
    "Arequipa": ["Arequipa", "Alto Selva Alegre", "Cayma", "Cerro Colorado", "Characato", "Chiguata", "Jacobo Hunter", "La Joya", "Mariano Melgar", "Miraflores", "Mollebaya", "Paucarpata", "Pocsi", "Polobaya", "Quequeña", "Sabandía", "Sachaca", "San Juan de Siguas", "San Juan de Tarucani", "Santa Isabel de Siguas", "Santa Rita de Siguas", "Socabaya", "Tiabaya", "Uchumayo", "Vitor", "Yanahuara", "Yarabamba", "Yura", "José Luis Bustamante y Rivero"],
    "Camaná": ["Camaná", "José María Quimper", "Mariano Nicolás Valcárcel", "Mariscal Cáceres", "Nicolás de Piérola", "Ocoña", "Quilca", "Samuel Pastor"],
    "Caravelí": ["Caravelí", "Acarí", "Atico", "Atiquipa", "Bella Unión", "Cahuacho", "Chala", "Chaparra", "Huanuhuanu", "Jaqui", "Lomas", "Quicacha", "Yauca"],
    "Castilla": ["Aplao", "Andagua", "Ayo", "Chachas", "Chilcaymarca", "Choco", "Huancarqui", "Machaguay", "Orcopampa", "Pampacolca", "Tipan", "Uñon", "Uraca", "Viraco"],
    "Caylloma": ["Chivay", "Achoma", "Cabanaconde", "Callalli", "Caylloma", "Coporaque", "Huambo", "Huanca", "Ichupampa", "Lari", "Lluta", "Maca", "Madrigal", "Majes", "Pinchollo", "San Antonio de Chuca", "Sibayo", "Tapay", "Tisco", "Tuti", "Yanque"],
    "Condesuyos": ["Chuquibamba", "Andaray", "Cayarani", "Chichas", "Iray", "Río Grande", "Salamanca", "Yanaquihua"],
    "Islay": ["Mollendo", "Cocachacra", "Dean Valdivia", "Islay", "Mejía", "Punta de Bombón"],
    "La Unión": ["Cotahuasi", "Alca", "Charcana", "Huaynacotas", "Pampamarca", "Puyca", "Quechualla", "Sayla", "Tauria", "Tomepampa", "Toro"]
  },
  "Cusco": {
    "Cusco": ["Cusco", "Ccorca", "Poroy", "San Jerónimo", "San Sebastián", "Santiago", "Saylla", "Wanchaq"],
    "Acomayo": ["Acomayo", "Acopia", "Acos", "Mosoc Llacta", "Pomacanchi", "Rondocan", "Sangarará"],
    "Anta": ["Anta", "Ancahuasi", "Cachimayo", "Chinchaypujio", "Huarocondo", "Limatambo", "Mollepata", "Pucyura", "Zurite"],
    "Calca": ["Calca", "Coya", "Lamay", "Lares", "Pisac", "San Salvador", "Taray", "Yanatile"],
    "Canas": ["Yanaoca", "Checca", "Kunturkanki", "Langui", "Layo", "Pampamarca", "Quehue", "Tupac Amaru"],
    "Canchis": ["Sicuani", "Checacupe", "Combapata", "Marangani", "Pitumarca", "San Pablo", "San Pedro", "Tinta"],
    "Chumbivilcas": ["Santo Tomás", "Capacmarca", "Colquemarca", "Livitaca", "Llusco", "Quiñota", "Velille"],
    "Espinar": ["Yauri", "Condoroma", "Coporaque", "Ocoruro", "Pallpata", "Pichigua", "Suyckutambo", "Alto Pichigua"],
    "La Convención": ["Santa Ana", "Echarate", "Huayopata", "Maranura", "Ocobamba", "Quellouno", "Quimbiri", "Santa Teresa", "Vilcabamba", "Pichari", "Inkawasi", "Villa Virgen"],
    "Paruro": ["Paruro", "Accha", "Ccapi", "Colcha", "Huanoquite", "Omacha", "Paccaritambo", "Pillpinto", "Yaurisque"],
    "Paucartambo": ["Paucartambo", "Caicay", "Challabamba", "Colquepata", "Huancarani", "Kosñipata"],
    "Quispicanchi": ["Urcos", "Andahuaylillas", "Camanti", "Ccarhuayo", "Ccatca", "Cusipata", "Huaro", "Lucre", "Marcapata", "Ocongate", "Oropesa", "Quiquijana"],
    "Urubamba": ["Urubamba", "Chinchero", "Huayllabamba", "Machupicchu", "Maras", "Ollantaytambo", "Yucay"]
  },
  "La Libertad": {
    "Trujillo": ["Trujillo", "El Porvenir", "Florencia de Mora", "Huanchaco", "La Esperanza", "Laredo", "Moche", "Salaverry", "Víctor Larco Herrera", "Poroto", "Simbal"],
    "Ascope": ["Ascope", "Chicama", "Chocope", "Magdalena de Cao", "Paiján", "Rázuri", "Santiago de Cao", "Casa Grande"],
    "Bolívar": ["Bolívar", "Bambamarca", "Condormarca", "Longotea", "Uchumarca", "Ucuncha"],
    "Chepén": ["Chepén", "Pacanga", "Pueblo Nuevo"],
    "Julcán": ["Julcán", "Calamarca", "Huaso", "Carabamba"],
    "Otuzco": ["Otuzco", "Agallpampa", "Charat", "Huaranchal", "La Cuesta", "Mache", "Paranday", "Salpo", "Sinsicap", "Usquil"],
    "Pacasmayo": ["San Pedro de Lloc", "Guadalupe", "Jequetepeque", "Pacasmayo", "San José"],
    "Pataz": ["Tayabamba", "Buldibuyo", "Chillia", "Huancaspata", "Huaylillas", "Huayo", "Ongón", "Parcoy", "Pataz", "Pias", "Santiago de Challas", "Taurija", "Urpay"],
    "Sánchez Carrión": ["Huamachuco", "Chugay", "Curgos", "Marcabal", "Sanagorán", "Sarin", "Sartimbamba", "Cochorco"],
    "Santiago de Chuco": ["Santiago de Chuco", "Angasmarca", "Cachicadán", "Mollebaya", "Mollepata", "Quiruvilca", "Santa Cruz de Chuca", "Sitabamba"],
    "Gran Chimú": ["Cascas", "Lucma", "Marmot", "Sayapullo"],
    "Virú": ["Virú", "Chao", "Guadalupito"]
  },
  "Lambayeque": {
    "Chiclayo": ["Chiclayo", "Chongoyape", "Eten", "Eten Puerto", "José Leonardo Ortiz", "La Victoria", "Lagunas", "Monsefú", "Nueva Arica", "Oyotún", "Picsi", "Pimentel", "Reque", "Santa Rosa", "Saña", "Cayaltí", "Patapo", "Pomalca", "Pucalá", "Tumán"],
    "Ferreñafe": ["Ferreñafe", "Cañaris", "Incahuasi", "Manuel Antonio Mesones Muro", "Pitipo", "Pueblo Nuevo"],
    "Lambayeque": ["Lambayeque", "Chochope", "Illimo", "Jayanca", "Mochumí", "Mórrope", "Motupe", "Olmos", "Pacora", "Salas", "San José", "Túcume"]
  },
  "Piura": {
    "Piura": ["Piura", "Castilla", "Catacaos", "Cura Mori", "El Tallán", "La Arena", "La Unión", "Las Lomas", "Tambo Grande", "Veintiséis de Octubre"],
    "Ayabaca": ["Ayabaca", "Frias", "Jilili", "Lagunas", "Montero", "Pacaipampa", "Paimas", "Sapillica", "Sicchez", "Suyo"],
    "Huancabamba": ["Huancabamba", "Canchaque", "El Faique", "Huarmaca", "Lalaquiz", "San Miguel de El Faique", "Sondor", "Sondorillo"],
    "Paita": ["Paita", "Amotape", "Arenal", "Colán", "La Huaca", "Tamarindo", "Vichayal"],
    "Sullana": ["Sullana", "Bellavista", "Ignacio Escudero", "Lancones", "Marcavelica", "Miguel Checa", "Querecotillo", "Salitral"],
    "Talara": ["Pariñas", "El Alto", "La Brea", "Lobitos", "Los Órganos", "Máncora"],
    "Sechura": ["Sechura", "Bellavista de la Unión", "Bernal", "Cristo Nos Valga", "Vice", "Rinconada Llicuar"],
    "Morropón": ["Chulucanas", "Buenos Aires", "Chalaco", "La Matanza", "Morropón", "Salitral", "San Juan de Bigote", "Santa Catalina de Mossa", "Santo Domingo", "Yamango"]
  },
  "Ica": {
    "Ica": ["Ica", "La Tinguiña", "Los Aquijes", "Ocucaje", "Pachacutec", "Parcona", "Pueblo Nuevo", "Salas", "San José de los Molinos", "San Juan Bautista", "Santiago", "Subtanjalla", "Tate", "Yauca del Rosario"],
    "Chincha": ["Chincha Alta", "Alto Larán", "Chavín", "Chincha Baja", "El Carmen", "El Recreo", "Grocio Prado", "Pueblo Nuevo", "San Juan de Yanac", "San Pedro de Huacarpana", "Sunampe", "Tambo de Mora"],
    "Nasca": ["Nasca", "Changuillo", "El Ingenio", "Marcona", "Vista Alegre"],
    "Palpa": ["Palpa", "Llipata", "Santa Cruz", "Río Grande", "Tibillo"],
    "Pisco": ["Pisco", "Huancano", "Humay", "Independencia", "Paracas", "San Andrés", "San Clemente", "Tupac Amaru Inca"]
  },
  "Junín": {
    "Huancayo": ["Huancayo", "Carhuacallanga", "Chacapampa", "Chicche", "Chilca", "Chongos Alto", "Chupuro", "Colca", "Cullhuas", "El Tambo", "Huacrapuquio", "Hualhuas", "Huancán", "Huasicancha", "Huayucachi", "Ingenio", "Pariahuanca", "Pilcomayo", "Pucará", "Quichuay", "Quilcas", "San Agustín", "San Jerónimo de Tunán", "Saño", "Sapallanga", "Sicaya", "Santo Domingo de Acobamba", "Viques"],
    "Concepción": ["Concepción", "Aco", "Andamarca", "Chambara", "Cochas", "Comas", "Heroínas Toledo", "Manzanares", "Mariscal Castilla", "Matahuasi", "Mito", "Nueve de Julio", "Orcotuna", "San José de Quero", "Santa Rosa de Ocopa"],
    "Chanchamayo": ["La Merced", "San Luis de Shuaro", "Perené", "Vitoc", "San Ramón", "Pichanaqui"],
    "Jauja": ["Jauja", "Acolla", "Apata", "Ataura", "Canchayllo", "Curicaca", "El Mantaro", "Huamali", "Huaripampa", "Huertas", "Janjaillo", "Julcán", "Leonor Ordóñez", "Llocllapampa", "Marco", "Masma", "Masma Chicche", "Molinos", "Monobamba", "Muqui", "Muquiyauyo", "Paca", "Paccha", "Pancán", "Parco", "Pomacancha", "Ricrán", "San Lorenzo", "San Pedro de Chunán", "Sausa", "Sincos", "Tunan Marca", "Yauli", "Yauyos"],
    "Junín": ["Junín", "Carhuamayo", "Ondores", "Ulcumayo"],
    "Satipo": ["Satipo", "Coviriali", "Llaylla", "Mazamari", "Pampa Hermosa", "Pangoa", "Río Negro", "Río Tambo", "Vizcatán del Ene"],
    "Tarma": ["Tarma", "Acobamba", "Huaracayo", "Huasahuasi", "La Unión", "Palca", "Palcamayo", "San Pedro de Cajas", "Tapo"],
    "Yauli": ["La Oroya", "Chacapalpa", "Huay-Huay", "Marcapomacocha", "Morococha", "Paccha", "Santa Bárbara de Carhuacayán", "Santa Rosa de Sacco", "Suitucancha", "Yauli"],
    "Chupaca": ["Chupaca", "Ahuac", "Chongos Bajo", "Huachac", "Huamancaca Chico", "San Juan de Iscos", "San Juan de Jarpa", "Tres de Diciembre", "Yanacancha"]
  },
  "Ancash": {
    "Huaraz": ["Huaraz", "Cochabamba", "Colcabamba", "Huanchay", "Jangas", "La Libertad", "Olleros", "Pampas Grande", "Pariacoto", "Pira", "Tarica", "Independencia"],
    "Aija": ["Aija", "Coris", "Huacllan", "La Merced", "Succha"],
    "Antonio Raymondi": ["Llamellín", "Aczo", "Chaccho", "Chingas", "Mirgas", "San Juan de Rontoy"],
    "Asunción": ["Chacas", "Acochaca"],
    "Bolognesi": ["Chiquián", "Abelardo Pardo Lezameta", "Antonio Encinas", "Aquia", "Cajacay", "Canis", "Colquioc", "Huallanca", "Huasta", "Huayllacayán", "La Primavera", "Mangas", "Pacllón", "San Miguel de Corpanqui", "Ticllos"],
    "Carhuaz": ["Carhuaz", "Acopampa", "Amashca", "Anta", "Cascapara", "Marcará", "Pariahuanca", "San Miguel de Aco", "Shilla", "Tinco", "Yungar"],
    "Carlos Fermín Fitzcarrald": ["San Luis", "San Nicolás", "Yauya"],
    "Casma": ["Casma", "Buena Vista Alta", "Comandante Noel", "Yaután"],
    "Corongo": ["Corongo", "Aco", "Bambas", "Cusca", "La Pampa", "Yánac", "Yupán"],
    "Huari": ["Huari", "Anra", "Cajay", "Chavín de Huántar", "Huacachi", "Huacchis", "Huachis", "Huantar", "Masin", "Paucas", "Pontó", "Rahuapampa", "Rapayán", "San Marcos", "San Pedro de Chaná", "Uco"],
    "Huarmey": ["Huarmey", "Cochapeti", "Culebras", "Huayan", "Malvas"],
    "Huaylas": ["Caraz", "Huallanca", "Huata", "Huaylas", "Mato", "Pamparomás", "Pueblo Libre", "Santa Cruz", "Santo Toribio", "Yuracmarca"],
    "Mariscal Luzuriaga": ["Piscobamba", "Casca", "Eleazar Guzmán Barrón", "Fidel Olivas Escudero", "Llama", "Llumpa", "Lucma", "Musga"],
    "Ocros": ["Ocros", "Acas", "Cajamarquilla", "Carhuapampa", "Cochas", "Congas", "Llipa", "San Cristóbal de Raján", "San Pedro", "Santiago de Chilcas"],
    "Pallasca": ["Cabana", "Bolognesi", "Conchucos", "Huacaschuque", "Huandoval", "Lacabamba", "Llapo", "Pallasca", "Pampas", "Santa Rosa", "Tauca"],
    "Pomabamba": ["Pomabamba", "Huayllán", "Parobamba", "Quinuabamba"],
    "Recuay": ["Recuay", "Catac", "Cotaparaco", "Huayllapampa", "Llacllín", "Marca", "Pampas Chico", "Pararín", "Tapacocha", "Ticapampa"],
    "Santa": ["Chimbote", "Cáceres del Perú", "Coishco", "Macate", "Moro", "Nepeña", "Samanco", "Santa", "Nuevo Chimbote"],
    "Sihuas": ["Sihuas", "Acobamba", "Alfonso Ugarte", "Cashapampa", "Chingalpo", "Huayllabamba", "Quiches", "Ragash", "San Juan", "Sicsibamba"],
    "Yungay": ["Yungay", "Cascapara", "Manco", "Matacoto", "Quillo", "Ranrahirca", "Shupluy", "Yanama"]
  }
};
