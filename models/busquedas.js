const fs = require("fs");
const axios = require(`axios`);

class Busquedas {
  historial = [];
  dbPath = "./db/database.json";

  constructor() {
    //TODO: leer DB si existe
    this.leerDB();
  }

  get historialCapitalizado(){

    return this.historial.map( lugar => {

        let palabras = lugar.split(` `);
        palabras = palabras.map( p => p[0].toUpperCase() + p.substring(1) )

        return palabras.join (" ")

    })
  }

  get paramsMapbox() {
    return {
      access_token: process.env.MAPBOX_KEY,
      language: "es",
    };
  }

  get paramsOpenweather() {
    return {
      appid: process.env.OPENWEATHER_KEY,
      units: "metric",
      lang: "es",
    };
  }

  async ciudad(lugar = "") {
    try {
      //peticion http

      const isntance = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
        params: this.paramsMapbox,
      });

      const resp = await isntance.get();

      return resp.data.features.map((lugar) => ({
        id: lugar.id,
        nombre: lugar.place_name,
        lng: lugar.center[0],
        lat: lugar.center[1],
      }));
    } catch (error) {
      return [];
    }
  }

  async climaLugar(lat, lon) {
    try {
      //instance axios.create()
      const instance = axios.create({
        baseURL: "https://api.openweathermap.org/data/2.5/weather",
        params: { ...this.paramsOpenweather, lat, lon },
      });

      //respuesta

      const resp = await instance.get();

      const { weather, main } = resp.data;

      return {
        desc: weather[0].description,
        min: main.temp_min,
        max: main.temp_max,
        temp: main.temp,
      };
    } catch (error) {
      console.log(error);
    }
  }

  agregarHistorial(lugar = "") {
    // TODO prevenir duplicados
    if (this.historial.includes( lugar.toLocaleLowerCase())) {
      return;
    }

    this.historial = this.historial.splice(0,5)

    this.historial.unshift(lugar);

    //grabar en db
    this.guardarDB();
  }

  guardarDB() {
    const payload = {
      historial: this.historial,
    };

    fs.writeFileSync(this.dbPath, JSON.stringify(payload));
  }

  leerDB() {
    //existe?
    if (!fs.existsSync(this.dbPath)) return;

    const info = fs.readFileSync(this.dbPath, { encoding: "utf-8" });

    const data = JSON.parse(info);

    this.historial = data.historial;
  }
}

module.exports = Busquedas;

// ----------------------------- MI FORMA -------------------------------------
//async climaLugar(lat, lon) {

//     try {

//         //instance axios.create()
//         const instance = axios.create({
//             baseURL: "https://api.openweathermap.org/data/2.5/weather",
//             params: {
//                 "appid": process.env.OPENWEATHER_KEY,
//                 lat,
//                 lon,
//                 "units": "metric",
//                 "lang": "es"
//             }
//         })

//         //respuesta

//         const resp = await instance.get()

//          return {
//              desc: resp.data.weather[0].description,
//              min: resp.data.main.temp_min,
//              max: resp.data.main.temp_max,
//              temp: resp.data.main.temp
//          }

//     } catch (error) {
//         console.log(error);
//     }
// }
