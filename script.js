const palabrasReservadas = ["let", "if", "else", "while", "for", "function", "return"];
const operadores = ["==", "!=", ">=", "<=", "=", "+", "-", "*", "/", ">", "<"];
const simbolos = ["(", ")", "{", "}", ";", ","];

function cargarEjemplo() {
  document.getElementById("codigo").value = `let x = 10;
let y = 5;
if (x > y) {
  x = x + 1;
}`;
}

function limpiar() {
  document.getElementById("codigo").value = "";
  document.getElementById("tablaTokens").innerHTML = "";
  document.getElementById("tablaSimbolos").innerHTML = "";
  document.getElementById("errores").innerHTML = "";
  document.getElementById("arbol").textContent = "";
  document.getElementById("lineas").textContent = "0";
  document.getElementById("totalTokens").textContent = "0";
  document.getElementById("totalIds").textContent = "0";
  document.getElementById("totalErrores").textContent = "0";
}

function analizar() {
  const codigo = document.getElementById("codigo").value;
  const resultadoLexico = analizadorLexico(codigo);
  const resultadoSintactico = analizadorSintactico(resultadoLexico.tokens);

  mostrarTokens(resultadoLexico.tokens);
  mostrarSimbolos(resultadoLexico.simbolos);
  mostrarErrores([...resultadoLexico.errores, ...resultadoSintactico.errores]);
  mostrarArbol(resultadoSintactico.arbol);

  document.getElementById("lineas").textContent = codigo.split("\n").length;
  document.getElementById("totalTokens").textContent = resultadoLexico.tokens.length;
  document.getElementById("totalIds").textContent = resultadoLexico.simbolos.length;
  document.getElementById("totalErrores").textContent =
    resultadoLexico.errores.length + resultadoSintactico.errores.length;
}

function analizadorLexico(codigo) {
  let tokens = [];
  let errores = [];
  let simbolos = [];
  let lineas = codigo.split("\n");

  lineas.forEach((lineaTexto, indiceLinea) => {
    let linea = indiceLinea + 1;
    let i = 0;

    while (i < lineaTexto.length) {
      let char = lineaTexto[i];

      if (/\s/.test(char)) {
        i++;
        continue;
      }

      if (char === '"' || char === "'") {
        let comilla = char;
        let valor = char;
        i++;

        while (i < lineaTexto.length && lineaTexto[i] !== comilla) {
          valor += lineaTexto[i];
          i++;
        }

        if (i < lineaTexto.length) {
          valor += lineaTexto[i];
          tokens.push(crearToken(valor, "CADENA", linea));
          i++;
        } else {
          errores.push(`Error léxico en línea ${linea}: cadena sin cerrar.`);
        }
        continue;
      }

      let doble = lineaTexto.substring(i, i + 2);
      if (operadores.includes(doble)) {
        tokens.push(crearToken(doble, "OPERADOR", linea));
        i += 2;
        continue;
      }

      if (operadores.includes(char)) {
        tokens.push(crearToken(char, "OPERADOR", linea));
        i++;
        continue;
      }

      if (simbolos.includes(char)) {
        tokens.push(crearToken(char, "SÍMBOLO", linea));
        i++;
        continue;
      }

      if (/[0-9]/.test(char)) {
        let numero = "";

        while (i < lineaTexto.length && /[0-9.]/.test(lineaTexto[i])) {
          numero += lineaTexto[i];
          i++;
        }

        if (/^[0-9]+(\.[0-9]+)?$/.test(numero)) {
          tokens.push(crearToken(numero, "NÚMERO", linea));
        } else {
          errores.push(`Error léxico en línea ${linea}: número inválido "${numero}".`);
        }
        continue;
      }

      if (/[a-zA-Z_]/.test(char)) {
        let palabra = "";

        while (i < lineaTexto.length && /[a-zA-Z0-9_]/.test(lineaTexto[i])) {
          palabra += lineaTexto[i];
          i++;
        }

        if (palabrasReservadas.includes(palabra)) {
          tokens.push(crearToken(palabra, "PALABRA_RESERVADA", linea));
        } else {
          tokens.push(crearToken(palabra, "IDENTIFICADOR", linea));

          if (!simbolos.some(s => s.nombre === palabra)) {
            simbolos.push({
              nombre: palabra,
              tipo: "Variable",
              linea: linea
            });
          }
        }
        continue;
      }

      errores.push(`Error léxico en línea ${linea}: símbolo no reconocido "${char}".`);
      i++;
    }
  });

  return { tokens, errores, simbolos };
}

function crearToken(lexema, categoria, linea) {
  return { lexema, categoria, linea };
}

function analizadorSintactico(tokens) {
  let errores = [];
  let arbol = "PROGRAMA\n";
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];

    if (token.lexema === "let") {
      let resultado = validarDeclaracion(tokens, i);
      errores.push(...resultado.errores);
      arbol += resultado.arbol;
      i = resultado.nuevoIndice;
      continue;
    }

    if (token.lexema === "if") {
      let resultado = validarIf(tokens, i);
      errores.push(...resultado.errores);
      arbol += resultado.arbol;
      i = resultado.nuevoIndice;
      continue;
    }

    if (token.categoria === "IDENTIFICADOR") {
      let resultado = validarAsignacion(tokens, i);
      errores.push(...resultado.errores);
      arbol += resultado.arbol;
      i = resultado.nuevoIndice;
      continue;
    }

    errores.push(`Error sintáctico en línea ${token.linea}: instrucción no válida cerca de "${token.lexema}".`);
    i++;
  }

  return { errores, arbol };
}

function validarDeclaracion(tokens, i) {
  let errores = [];
  let inicio = tokens[i];
  let arbol = " ├── DECLARACIÓN\n";
  arbol += ` │   ├── Palabra reservada: ${tokens[i]?.lexema}\n`;

  if (tokens[i + 1]?.categoria !== "IDENTIFICADOR") {
    errores.push(`Error sintáctico en línea ${inicio.linea}: se esperaba un identificador después de "let".`);
  } else {
    arbol += ` │   ├── Identificador: ${tokens[i + 1].lexema}\n`;
  }

  if (tokens[i + 2]?.lexema !== "=") {
    errores.push(`Error sintáctico en línea ${inicio.linea}: se esperaba "=".`);
  } else {
    arbol += ` │   ├── Operador asignación: =\n`;
  }

  if (!["NÚMERO", "CADENA", "IDENTIFICADOR"].includes(tokens[i + 3]?.categoria)) {
    errores.push(`Error sintáctico en línea ${inicio.linea}: se esperaba un valor.`);
  } else {
    arbol += ` │   ├── Valor: ${tokens[i + 3].lexema}\n`;
  }

  if (tokens[i + 4]?.lexema !== ";") {
    errores.push(`Error sintáctico en línea ${inicio.linea}: falta punto y coma ";".`);
    return { errores, arbol, nuevoIndice: i + 4 };
  }

  arbol += " │   └── Fin: ;\n";
  return { errores, arbol, nuevoIndice: i + 5 };
}

function validarAsignacion(tokens, i) {
  let errores = [];
  let inicio = tokens[i];
  let arbol = " ├── ASIGNACIÓN\n";
  arbol += ` │   ├── Identificador: ${tokens[i]?.lexema}\n`;

  if (tokens[i + 1]?.lexema !== "=") {
    errores.push(`Error sintáctico en línea ${inicio.linea}: se esperaba "=" en asignación.`);
  } else {
    arbol += " │   ├── Operador asignación: =\n";
  }

  if (!["NÚMERO", "CADENA", "IDENTIFICADOR"].includes(tokens[i + 2]?.categoria)) {
    errores.push(`Error sintáctico en línea ${inicio.linea}: se esperaba un valor.`);
  } else {
    arbol += ` │   ├── Expresión: ${tokens[i + 2].lexema}`;

    if (tokens[i + 3]?.categoria === "OPERADOR" && tokens[i + 3]?.lexema !== "=") {
      arbol += ` ${tokens[i + 3].lexema} ${tokens[i + 4]?.lexema || ""}\n`;
      if (!["NÚMERO", "IDENTIFICADOR"].includes(tokens[i + 4]?.categoria)) {
        errores.push(`Error sintáctico en línea ${inicio.linea}: expresión incompleta.`);
      }

      if (tokens[i + 5]?.lexema !== ";") {
        errores.push(`Error sintáctico en línea ${inicio.linea}: falta punto y coma ";".`);
        return { errores, arbol, nuevoIndice: i + 5 };
      }

      arbol += " │   └── Fin: ;\n";
      return { errores, arbol, nuevoIndice: i + 6 };
    } else {
      arbol += "\n";
    }
  }

  if (tokens[i + 3]?.lexema !== ";") {
    errores.push(`Error sintáctico en línea ${inicio.linea}: falta punto y coma ";".`);
    return { errores, arbol, nuevoIndice: i + 3 };
  }

  arbol += " │   └── Fin: ;\n";
  return { errores, arbol, nuevoIndice: i + 4 };
}

function validarIf(tokens, i) {
  let errores = [];
  let inicio = tokens[i];
  let arbol = " ├── ESTRUCTURA IF\n";
  arbol += " │   ├── Palabra reservada: if\n";

  if (tokens[i + 1]?.lexema !== "(") {
    errores.push(`Error sintáctico en línea ${inicio.linea}: se esperaba "(".`);
  }

  if (tokens[i + 2]?.categoria !== "IDENTIFICADOR") {
    errores.push(`Error sintáctico en línea ${inicio.linea}: se esperaba identificador en condición.`);
  }

  if (!["==", "!=", ">", "<", ">=", "<="].includes(tokens[i + 3]?.lexema)) {
    errores.push(`Error sintáctico en línea ${inicio.linea}: se esperaba operador relacional.`);
  }

  if (!["NÚMERO", "IDENTIFICADOR"].includes(tokens[i + 4]?.categoria)) {
    errores.push(`Error sintáctico en línea ${inicio.linea}: se esperaba valor en condición.`);
  }

  if (tokens[i + 5]?.lexema !== ")") {
    errores.push(`Error sintáctico en línea ${inicio.linea}: se esperaba ")".`);
  }

  if (tokens[i + 6]?.lexema !== "{") {
    errores.push(`Error sintáctico en línea ${inicio.linea}: se esperaba "{".`);
  }

  arbol += ` │   ├── Condición: ${tokens[i + 2]?.lexema || "?"} ${tokens[i + 3]?.lexema || "?"} ${tokens[i + 4]?.lexema || "?"}\n`;
  arbol += " │   └── Bloque de instrucciones\n";

  let j = i + 7;
  while (j < tokens.length && tokens[j].lexema !== "}") {
    if (tokens[j].categoria === "IDENTIFICADOR") {
      let resultado = validarAsignacion(tokens, j);
      errores.push(...resultado.errores);
      arbol += " │       " + resultado.arbol.replaceAll("\n", "\n │       ");
      j = resultado.nuevoIndice;
    } else {
      errores.push(`Error sintáctico en línea ${tokens[j].linea}: instrucción inválida dentro del if.`);
      j++;
    }
  }

  if (tokens[j]?.lexema !== "}") {
    errores.push(`Error sintáctico en línea ${inicio.linea}: falta cerrar el bloque con "}".`);
    return { errores, arbol, nuevoIndice: j };
  }

  arbol += "\n │   └── Cierre de bloque: }\n";
  return { errores, arbol, nuevoIndice: j + 1 };
}

function mostrarTokens(tokens) {
  const tabla = document.getElementById("tablaTokens");
  tabla.innerHTML = "";

  tokens.forEach((token, index) => {
    tabla.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${token.lexema}</td>
        <td>${token.categoria}</td>
        <td>${token.linea}</td>
      </tr>
    `;
  });
}

function mostrarSimbolos(simbolos) {
  const tabla = document.getElementById("tablaSimbolos");
  tabla.innerHTML = "";

  simbolos.forEach(simbolo => {
    tabla.innerHTML += `
      <tr>
        <td>${simbolo.nombre}</td>
        <td>${simbolo.tipo}</td>
        <td>${simbolo.linea}</td>
      </tr>
    `;
  });
}

function mostrarErrores(errores) {
  const contenedor = document.getElementById("errores");
  contenedor.innerHTML = "";

  if (errores.length === 0) {
    contenedor.innerHTML = `<p class="correcto">No se encontraron errores léxicos ni sintácticos.</p>`;
    return;
  }

  errores.forEach(error => {
    contenedor.innerHTML += `<p class="error">${error}</p>`;
  });
}

function mostrarArbol(arbol) {
  document.getElementById("arbol").textContent = arbol;
}
