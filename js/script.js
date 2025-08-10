const tasaInteresAnual = 0.45; 
let historial;

try {
  historial = JSON.parse(localStorage.getItem("historial")) || [];
} catch (error) {
  console.error("Error al cargar historial desde localStorage:", error);
  historial = [];
}

fetch("https://jsonplaceholder.typicode.com/posts?_limit=3")
  .then(res => {
    if (!res.ok) throw new Error("Error en la respuesta de la API");
    return res.json();
  })
  .then(data => {
    console.log("Datos obtenidos de la API:", data);
  })
  .catch(error => {
    console.error("Error al obtener datos de la API:", error);
  })
  .finally(() => {
    console.log("Fetch GET completado.");
  });

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

  if (!Array.isArray(historial) || historial.length === 0) {
    contenedor.innerHTML = "<p>No hay simulaciones guardadas.</p>";
    return;
  }

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

  const htmlHistorial = historialValido
    .map(
      (item, i) =>
        `<p><strong>Simulación ${i + 1}:</strong> Inversión $${item.inversion.toFixed(
          2
        )}, Meses: ${item.meses}, Tipo: ${item.tipo}, Resultado: $${Number(item.resultado).toFixed(
          2
        )}</p>`
    )
    .join("");

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

async function enviarHistorialAPI() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      body: JSON.stringify(historial),
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Error al enviar historial");
    const data = await res.json();
    console.log("Historial enviado a la API:", data);
  } catch (error) {
    console.error("Error al enviar historial a la API:", error);
  } finally {
    console.log("Fetch POST completado.");
  }
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

    await enviarHistorialAPI();

    Swal.fire({
      title: "¡Simulación guardada!",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });
  });

  // Borrar historial
  document.getElementById("borrarHistorial").addEventListener("click", () => {
    localStorage.removeItem("historial");
    historial = [];
    mostrarHistorial();
  });
}

document.addEventListener("DOMContentLoaded", inicializarApp);
