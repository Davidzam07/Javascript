const tasaInteresAnual = 0.45; 
let historial;

try {
  historial = JSON.parse(localStorage.getItem("historial")) || [];
} catch (error) {
  console.error("Error al cargar historial desde localStorage:", error);
  historial = [];
}

function calcularInteresSimple(inversion, meses, tasaAnual) {
  return inversion + (inversion * tasaAnual * (meses / 12));
}

function calcularInteresCompuesto(inversion, meses, tasaAnual) {
  return inversion * Math.pow(1 + tasaAnual / 12, meses);
}

function mostrarHistorial() {
  const contenedor = document.getElementById("historial");
  contenedor.innerHTML = "";

  console.log("Historial completo RAW:", historial);


  const historialValido = historial.filter(item =>
    item &&
    typeof item === "object" &&
    !isNaN(Number(item.resultado)) &&
    typeof item.inversion === "number" &&
    typeof item.meses === "number"
  );

  if (historialValido.length === 0) {
    contenedor.innerHTML = "<p>No hay simulaciones válidas en el historial.</p>";
    return;
  }

const htmlHistorial = historialValido.map((item, i) =>
  `<div class="hist-item" data-index="${i}">
    <p><strong>Simulación ${i + 1}:</strong> Inversión $${item.inversion.toFixed(2)}, Meses: ${item.meses}, Tipo: ${item.tipo}, Resultado: $${Number(item.resultado).toFixed(2)}</p>
    <button type="button" class="btn-eliminar" aria-label="Eliminar simulación ${i + 1}">Eliminar</button>
  </div>`
).join("");
contenedor.innerHTML = htmlHistorial;
}

// guardar historial en localstorage
function guardarHistorial() {
  localStorage.setItem("historial", JSON.stringify(historial));
}

async function eliminarHistorialPorIndice(indiceEnValido) {
  // Mapear el índice mostrado (sobre historialValido) al índice real en 'historial'
  // Dado que historialValido filtra por validez y preserva orden, podemos reconstruir el mapeo en el momento de borrar.
  const indicesValidos = historial
    .map((item, idx) => ({ item, idx }))
    .filter(({ item }) => item && typeof item === "object" && !isNaN(Number(item.resultado)) && typeof item.inversion === "number" && typeof item.meses === "number")
    .map(({ idx }) => idx);

  const indiceReal = indicesValidos[indiceEnValido];
  if (typeof indiceReal !== "number") return;

  // Simular operación asíncrona (p.ej. request al servidor)
  await new Promise(resolve => setTimeout(resolve, 150));

  historial.splice(indiceReal, 1);
  guardarHistorial();
  mostrarHistorial();
}

function mostrarResultado(inversion, meses, resultado, tipo) {
  const resultadoHTML = `
    <h2>Resultado:</h2>
    <p><strong>Inversión inicial:</strong> $${inversion.toFixed(2)}</p>
    <p><strong>Meses:</strong> ${meses}</p>
    <p><strong>Tipo de interés:</strong> ${tipo === "compuesto" ? "Compuesto" : "Simple"}</p>
    <p><strong>Monto final estimado:</strong> $${resultado.toFixed(2)}</p>
  `;
  document.getElementById("resultado").innerHTML = resultadoHTML;
}

function inicializarApp() {
  mostrarHistorial();

  const toggleThemeBtn = document.getElementById("toggleTheme");
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    toggleThemeBtn.textContent = "☀️ Modo Claro";
  } else {
    toggleThemeBtn.textContent = "🌙 Modo Oscuro";
  }

  toggleThemeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
      localStorage.setItem("theme", "dark");
      toggleThemeBtn.textContent = "☀️ Modo Claro";
    } else {
      localStorage.setItem("theme", "light");
      toggleThemeBtn.textContent = "🌙 Modo Oscuro";
    }
  });

  document.getElementById("formSimulador").addEventListener("submit", async (e) => {
    e.preventDefault();

    const inversion = parseFloat(document.getElementById("inversion").value);
    const meses = parseInt(document.getElementById("meses").value);
    const tipo = document.getElementById("tipo").value;

    if (isNaN(inversion) || inversion <= 0 || isNaN(meses) || meses <= 0) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Por favor ingrese valores válidos.",
      });
      return;
    }

    const compuesto = tipo === "compuesto";
    const resultado = compuesto
      ? calcularInteresCompuesto(inversion, meses, tasaInteresAnual)
      : calcularInteresSimple(inversion, meses, tasaInteresAnual);

    mostrarResultado(inversion, meses, resultado, tipo);

    const simulacion = {
      inversion: Number(inversion),
      meses: Number(meses),
      tipo: String(tipo),
      resultado: Number(resultado),
    };

    historial.push(simulacion);
    guardarHistorial();
    mostrarHistorial();
    Swal.fire({
      title: "¡Simulación guardada!",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });
  });

  // Delegación de eventos para eliminar individualmente
  const contenedorHistorial = document.getElementById("historial");
  contenedorHistorial.addEventListener("click", (ev) => {
    const boton = ev.target;
    if (boton && boton.classList && boton.classList.contains("btn-eliminar")) {
      const padre = boton.closest(".hist-item");
      if (!padre) return;
      const indice = Number(padre.getAttribute("data-index"));
      if (Number.isInteger(indice)) {
        eliminarHistorialPorIndice(indice);
      }
    }
  });

  // borrar historial completo
  document.getElementById("borrarHistorial").addEventListener("click", () => {
    localStorage.removeItem("historial");
    historial = [];
    mostrarHistorial();
    const resultado = document.getElementById("resultado");
    if (resultado) resultado.innerHTML = "";
  });
}

inicializarApp();
