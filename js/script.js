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
    `<div class="hist-item">
      <p><strong>Simulación ${i + 1}:</strong> Inversión $${item.inversion.toFixed(2)}, Meses: ${item.meses}, Tipo: ${item.tipo}, Resultado: $${Number(item.resultado).toFixed(2)}</p>
      <button class="eliminar-item" data-index="${i}">Eliminar</button>
    </div>`
  ).join("");
  contenedor.innerHTML = htmlHistorial;
}

// guardar historial en localstorage
function guardarHistorial() {
  localStorage.setItem("historial", JSON.stringify(historial));
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

  // borrar historial
  document.getElementById("borrarHistorial").addEventListener("click", async () => {
    let isConfirmed = true;
    if (typeof Swal !== "undefined") {
      const result = await Swal.fire({
        title: "¿Borrar historial?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, borrar",
        cancelButtonText: "Cancelar"
      });
      isConfirmed = result.isConfirmed;
    } else {
      isConfirmed = window.confirm("¿Borrar historial?");
    }

    if (!isConfirmed) {
      return;
    }

    try {
      localStorage.removeItem("historial");
      historial = [];
      mostrarHistorial();
      const resultadoEl = document.getElementById("resultado");
      if (resultadoEl) {
        resultadoEl.innerHTML = "";
      }
      if (typeof Swal !== "undefined") {
        await Swal.fire({
          title: "Historial borrado",
          icon: "success",
          timer: 1200,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error("Error al borrar historial:", error);
      if (typeof Swal !== "undefined") {
        Swal.fire({
          icon: "error",
          title: "No se pudo borrar el historial"
        });
      }
    }
  });

  // eliminar item individual con delegación
  const contenedorHistorial = document.getElementById("historial");
  contenedorHistorial.addEventListener("click", (event) => {
    const target = event.target;
    if (target && target.classList.contains("eliminar-item")) {
      const index = Number(target.getAttribute("data-index"));
      if (!isNaN(index) && index >= 0 && index < historial.length) {
        historial.splice(index, 1);
        guardarHistorial();
        mostrarHistorial();
      }
    }
  });
}
inicializarApp();
