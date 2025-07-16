const tasaInteresAnual = 0.45;
let historialMontos = [];

document.getElementById("formSimulador").addEventListener("submit", function (e) {
e.preventDefault();

  // capturar datos
    const inversion = parseFloat(document.getElementById("inversion").value);
    const meses = parseInt(document.getElementById("meses").value);
    const tipo = document.getElementById("tipo").value;

if (isNaN(inversion) || isNaN(meses) || inversion <= 0 || meses <= 0) {
    mostrarEnDOM("Por favor ingrese valores válidos.");
    return;
}

  // calcular resultado
const resultado = calcularInteres(inversion, meses, tipo === "compuesto");

  // mostrar resultado
mostrarResultado(inversion, meses, resultado, tipo === "compuesto");

  // guardar en el localstorage
const simulacion = {
    inversion,
    meses,
    tipo,
    resultado,
    historial: historialMontos
};

localStorage.setItem("ultimasimulacion", JSON.stringify(simulacion));
});

function calcularInteres(inversion, meses, compuesto = true) {
historialMontos = [];
let montoFinal = inversion;

if (compuesto) {
    for (let i = 1; i <= meses; i++) {
      montoFinal += montoFinal * (tasaInteresAnual / 12);
    historialMontos.push(montoFinal);
    }
} else {
    montoFinal = inversion + (inversion * (tasaInteresAnual / 12) * meses);
}

return montoFinal;
}

function mostrarResultado(inversion, meses, resultado, compuesto) {
let resultadoHTML = `
    <h2>Resultado:</h2>
    <p><strong>Inversión inicial:</strong> $${inversion.toFixed(2)}</p>
    <p><strong>Meses:</strong> ${meses}</p>
    <p><strong>Tipo de interés:</strong> ${compuesto ? "Compuesto" : "Simple"}</p>
    <p><strong>Monto final estimado:</strong> $${resultado.toFixed(2)}</p>
`;

if (compuesto && historialMontos.length > 0) {
    resultadoHTML += `<h3>Historial por mes</h3><ul>`;
    historialMontos.forEach((monto, i) => {
    resultadoHTML += `<li>Mes ${i + 1}: $${monto.toFixed(2)}</li>`;
    });
    resultadoHTML += `</ul>`;
}

mostrarEnDOM(resultadoHTML);
}

function mostrarEnDOM(html) {
document.getElementById("resultado").innerHTML = html;
}



