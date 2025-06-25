//declaración de variables y constantes
const tasaInteresAnual = 0.45; // 45%
let inversion= 0;
let meses = 0;

//función de entrada de datos
function solicitarDatos() {
    inversion = parseFloat(prompt("Ingrese la inversión inicial:"));
    meses = parseInt(prompt("Ingrese la cantidad de meses:"));
}

//función de procesamiento de datos
function calcularInteres(compuesto = true) {
    if (isNaN(inversion) || isNaN(meses) || inversion <= 0 || meses <= 0) {
    alert("Datos inválidos. Inténtelo nuevamente.");
    return;
}

    let montoFinal = inversion;
    if (compuesto) {
    for (let i = 1; i <= meses; i++) {
      montoFinal += montoFinal * (tasaInteresAnual / 12);
    }
    } else {
    montoFinal = inversion + (inversion * (tasaInteresAnual / 12) * meses);
    }

    return montoFinal;
}

//función de salida de resultados
function mostrarResultado(montoFinal) {
    console.log("---- Resultado del Simulador ----");
    console.log("Inversión inicial: $" + inversion.toFixed(2));
    console.log("Meses: " + meses);
    console.log("Monto final estimado: $" + montoFinal.toFixed(2));
    alert("¡Simulación completada!\nMonto final estimado: $" + montoFinal.toFixed(2));
}

//Lógica principal
function simuladorFinanciero() {
    solicitarDatos();
    const esCompuesto = confirm("¿Desea calcular interés compuesto?\nAceptar: Compuesto / Cancelar: Simple");
    const resultado = calcularInteres(esCompuesto);
    if (resultado) {
    mostrarResultado(resultado);
    }
}

//invocación de la función principal
simuladorFinanciero();