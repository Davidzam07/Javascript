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

  const html = historial
    .map((item, idx) => {
      if (
        !item ||
        typeof item !== "object" ||
        isNaN(Number(item.resultado)) ||
        typeof item.inversion !== "number" ||
        typeof item.meses !== "number"
      ) {
        return "";
      }
      return `<div class="hist-item" data-index="${idx}">
        <p><strong>Simulación ${idx + 1}:</strong> Inversión $${item.inversion.toFixed(2)}, Meses: ${item.meses}, Tipo: ${item.tipo}, Resultado: $${Number(item.resultado).toFixed(2)}</p>
        <button type="button" class="btn-eliminar" aria-label="Eliminar simulación ${idx + 1}">Eliminar</button>
      </div>`;
    })
    .join("");

  contenedor.innerHTML = html || "<p>No hay simulaciones válidas en el historial.</p>";
}

// guardar historial en localstorage
function guardarHistorial() {
  localStorage.setItem("historial", JSON.stringify(historial));
}

function eliminarPorIndice(indice) {
  if (!Number.isInteger(indice)) return;
  historial.splice(indice, 1);
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

  // Clicks en el historial (eliminar uno)
  const contenedorHistorial = document.getElementById("historial");
  contenedorHistorial.addEventListener("click", (ev) => {
    const boton = ev.target;
    if (boton && boton.classList && boton.classList.contains("btn-eliminar")) {
      const padre = boton.closest(".hist-item");
      if (!padre) return;
      const indice = Number(padre.getAttribute("data-index"));
      eliminarPorIndice(indice);
    }
  });

  // Borrar todo
  document.getElementById("borrarHistorial").addEventListener("click", () => {
    localStorage.removeItem("historial");
    historial = [];
    mostrarHistorial();
    const resultado = document.getElementById("resultado");
    if (resultado) resultado.innerHTML = "";
  });
}

inicializarApp();
