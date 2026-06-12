document.getElementById("btnAnalizar").addEventListener("click", () => {
    const codigo = document.getElementById("codigo").value;

    const lexer = new Lexer(codigo);
    const resultadoLexico = lexer.analizar();

    const parser = new Parser(resultadoLexico.tokens);
    const resultadoSintactico = parser.analizar();

    mostrarInfo(resultadoLexico);
    mostrarTokens(resultadoLexico.tokens);
    mostrarSimbolos(resultadoLexico.simbolos);
    mostrarErrores([...resultadoLexico.errores, ...resultadoSintactico.errores]);
    mostrarArbol(resultadoSintactico.arbol);
});

function mostrarInfo(resultado) {
    document.getElementById("info").innerHTML = `
        <p><strong>Líneas analizadas:</strong> ${resultado.lineas}</p>
        <p><strong>Cantidad de tokens:</strong> ${resultado.tokens.length}</p>
        <p><strong>Identificadores:</strong> ${resultado.simbolos.length}</p>
    `;
}

function mostrarTokens(tokens) {
    const tabla = document.getElementById("tablaTokens");
    tabla.innerHTML = "";

    tokens.forEach(token => {
        tabla.innerHTML += `
            <tr>
                <td>${token.lexema}</td>
                <td>${token.tipo}</td>
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

    if (errores.length === 0) {
        contenedor.innerHTML = `<p class="correcto">No se encontraron errores.</p>`;
        return;
    }

    contenedor.innerHTML = "";

    errores.forEach(error => {
        contenedor.innerHTML += `
            <p class="error">
                ${error.tipo}: ${error.mensaje} en línea ${error.linea}
            </p>
        `;
    });
}

function mostrarArbol(arbol) {
    const contenedor = document.getElementById("arbol");

    let codigoMermaid = "graph TD\n";
    let contador = 0;

    function crearNodo(texto) {
        const id = "N" + contador++;
        codigoMermaid += `${id}["${String(texto).replace(/"/g, '\\"')}"]\n`;
        return id;
    }

    function recorrer(nodo, padreId = null) {
        const actualId = crearNodo(nodo.tipo || nodo);

        if (padreId) {
            codigoMermaid += `${padreId} --> ${actualId}\n`;
        }

        if (nodo.hijos) {
            nodo.hijos.forEach(hijo => {
                if (typeof hijo === "object") {
                    recorrer(hijo, actualId);
                } else {
                    const hijoId = crearNodo(hijo);
                    codigoMermaid += `${actualId} --> ${hijoId}\n`;
                }
            });
        }
    }

    arbol.forEach(nodo => recorrer(nodo));

    contenedor.removeAttribute("data-processed");
    contenedor.innerHTML = codigoMermaid;

    mermaid.initialize({ startOnLoad: false });
    mermaid.init(undefined, contenedor);
}