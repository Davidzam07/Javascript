function calcularInteresCompuesto(inversion, meses, tasaAnual) {
let montoFinal = inversion;
    for (let i = 1; i <= meses; i++) {
    montoFinal += montoFinal * (tasaAnual / 12);
}
return montoFinal;
}

function calcularInteresSimple(inversion, meses, tasaAnual) {
  return inversion + inversion * (tasaAnual / 12) * meses;
}