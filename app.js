require("dotenv").config();

const {
  inquirerMenu,
  pausa,
  leerInput,
  listarLugares,
} = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

const main = async () => {
  const busquedas = new Busquedas();
  let opt;

  do {
    console.clear();
    opt = await inquirerMenu();

    switch (opt) {
      case 1:
        //Mostrar mensaje
        const termino = await leerInput("Ciudad : ");
        //Buscar lugares
        const lugares = await busquedas.ciudad(termino);
        //Seleccionar el lugar
        const id = await listarLugares(lugares);
        if (id === 0) continue;
        
        const lugarSel = lugares.find((l) => l.id === id);

        //guardar en db
        busquedas.agregarHistorial( lugarSel.nombre)
        
        // CLima
        const climaData = await busquedas.climaLugar(
          lugarSel.lat,
          lugarSel.lng
        );

        //Mostrar resultados
        console.clear();

        console.log(`\n Informacion de la ciudad \n`.green);
        console.log("Ciudad: ", lugarSel.nombre.green);
        console.log("Lat: ", lugarSel.lat);
        console.log("Lng: ", lugarSel.lng);
        console.log("Temperatura: ", climaData.temp);
        console.log("Minima: ", climaData.min);
        console.log("Maxima: ", climaData.max);
        console.log("En este momento hay", climaData.desc.green);

        break;

      case 2:

            busquedas.historialCapitalizado.forEach((lugar,i)=> {
                const idx = `${i+1}.`.green
                console.log(`${idx} ${lugar}`);
            })

        break;
    }

    if (opt !== 0) await pausa();
  } while (opt !== 0);
};

main();
