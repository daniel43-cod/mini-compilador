class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.posicion = 0;
        this.errores = [];
        this.arbol = [];
    }

    analizar() {
        while (this.posicion < this.tokens.length) {
            this.sentencia();
        }

        return {
            errores: this.errores,
            arbol: this.arbol
        };
    }

    tokenActual() {
        return this.tokens[this.posicion];
    }

    avanzar() {
        this.posicion++;
    }

    sentencia() {
        const token = this.tokenActual();

        if (!token) return;
        if (["let", "var", "const"].includes(token.lexema)) {
    this.declaracion();
}
else if (token.lexema === "console") {
    this.consoleLog();
}
else if (token.tipo === "IDENTIFICADOR") {
    this.asignacion();
}
else {
    this.errores.push(
        new ErrorAnalisis(
            "Sintáctico",
            `Sentencia no válida cerca de "${token.lexema}"`,
            token.linea
        )
    );
    this.avanzar();
}
    }

    declaracion() {
        let nodo = {
            tipo: "Declaración",
            hijos: []
        };

        const palabra = this.tokenActual();
        nodo.hijos.push(palabra.lexema);
        this.avanzar();

        const identificador = this.tokenActual();

        if (!identificador || identificador.tipo !== "IDENTIFICADOR") {
            this.errores.push(new ErrorAnalisis("Sintáctico", "Se esperaba un identificador", palabra.linea));
            return;
        }

        nodo.hijos.push(identificador.lexema);
        this.avanzar();

        if (this.tokenActual() && this.tokenActual().lexema === "=") {
            nodo.hijos.push("=");
            this.avanzar();

            if (this.tokenActual() && ["NUMERO", "IDENTIFICADOR"].includes(this.tokenActual().tipo)) {
                nodo.hijos.push(this.tokenActual().lexema);
                this.avanzar();
            } else {
                this.errores.push(new ErrorAnalisis("Sintáctico", "Se esperaba un valor", identificador.linea));
            }
        }

        if (this.tokenActual() && this.tokenActual().lexema === ";") {
            nodo.hijos.push(";");
            this.avanzar();
        } else {
            this.errores.push(new ErrorAnalisis("Sintáctico", "Falta punto y coma ;", identificador.linea));
        }

        this.arbol.push(nodo);
    }

    asignacion() {
        let nodo = {
            tipo: "Asignación",
            hijos: []
        };

        const identificador = this.tokenActual();
        nodo.hijos.push(identificador.lexema);
        this.avanzar();

        if (this.tokenActual() && this.tokenActual().lexema === "=") {
            nodo.hijos.push("=");
            this.avanzar();
        } else {
            this.errores.push(new ErrorAnalisis("Sintáctico", "Se esperaba =", identificador.linea));
            return;
        }

        if (this.tokenActual() && ["NUMERO", "IDENTIFICADOR"].includes(this.tokenActual().tipo)) {
            nodo.hijos.push(this.tokenActual().lexema);
            this.avanzar();
        } else {
            this.errores.push(new ErrorAnalisis("Sintáctico", "Se esperaba un valor", identificador.linea));
            return;
        }

        if (this.tokenActual() && this.tokenActual().lexema === ";") {
            nodo.hijos.push(";");
            this.avanzar();
        } else {
            this.errores.push(new ErrorAnalisis("Sintáctico", "Falta punto y coma ;", identificador.linea));
        }

        this.arbol.push(nodo);
    }

    consoleLog() {
        let nodo = {
            tipo: "Impresión",
            hijos: []
        };

        const secuencia = ["console", ".", "log", "(", null, ")", ";"];

        for (let esperado of secuencia) {
            const actual = this.tokenActual();

            if (!actual) return;

            if (esperado === null) {
                if (["IDENTIFICADOR", "NUMERO"].includes(actual.tipo)) {
                    nodo.hijos.push(actual.lexema);
                    this.avanzar();
                } else {
                    this.errores.push(new ErrorAnalisis("Sintáctico", "Se esperaba valor dentro de console.log", actual.linea));
                    return;
                }
            } else {
                if (actual.lexema === esperado) {
                    nodo.hijos.push(actual.lexema);
                    this.avanzar();
                } else {
                    this.errores.push(new ErrorAnalisis("Sintáctico", `Se esperaba "${esperado}"`, actual.linea));
                    return;
                }
            }
        }

        this.arbol.push(nodo);
    }
    sentencia() {
    const token = this.tokenActual();

    if (!token) return;

    if (["let", "var", "const"].includes(token.lexema)) {
        this.declaracion();
    } 
    else if (token.lexema === "console") {
        this.consoleLog();
    }
    else if (token.lexema === "if") {
        this.ifSentencia();
    }
    else if (token.lexema === "while") {
    this.whileSentencia();
    }
    else if (token.lexema === "for") {
    this.forSentencia();
    }
    else if (token.tipo === "IDENTIFICADOR") {
        this.asignacion();
    }
    else {
        this.errores.push(
            new ErrorAnalisis(
                "Sintáctico",
                `Sentencia no válida cerca de "${token.lexema}"`,
                token.linea
            )
        );
        this.avanzar();
    }
}


ifSentencia() {
    let nodo = {
        tipo: "Condicional IF",
        hijos: []
    };

    this.avanzar(); // consume if
    nodo.hijos.push("if");

    if (!this.tokenActual() || this.tokenActual().lexema !== "(") {
        this.errores.push(new ErrorAnalisis("Sintáctico", "Se esperaba ( después de if", this.tokens[this.posicion - 1].linea));
        return;
    }

    nodo.hijos.push("(");
    this.avanzar();

    if (!this.tokenActual() || this.tokenActual().tipo !== "IDENTIFICADOR") {
        this.errores.push(new ErrorAnalisis("Sintáctico", "Se esperaba un identificador en la condición", this.tokens[this.posicion - 1].linea));
        return;
    }

    nodo.hijos.push(this.tokenActual().lexema);
    this.avanzar();

    if (!this.tokenActual() || !["==", "!=", "<", ">", "<=", ">="].includes(this.tokenActual().lexema)) {
        this.errores.push(new ErrorAnalisis("Sintáctico", "Se esperaba un operador relacional", this.tokens[this.posicion - 1].linea));
        return;
    }

    nodo.hijos.push(this.tokenActual().lexema);
    this.avanzar();

    if (!this.tokenActual() || !["IDENTIFICADOR", "NUMERO"].includes(this.tokenActual().tipo)) {
        this.errores.push(new ErrorAnalisis("Sintáctico", "Se esperaba un valor en la condición", this.tokens[this.posicion - 1].linea));
        return;
    }

    nodo.hijos.push(this.tokenActual().lexema);
    this.avanzar();

    if (!this.tokenActual() || this.tokenActual().lexema !== ")") {
        this.errores.push(new ErrorAnalisis("Sintáctico", "Se esperaba )", this.tokens[this.posicion - 1].linea));
        return;
    }

    nodo.hijos.push(")");
    this.avanzar();

    if (!this.tokenActual() || this.tokenActual().lexema !== "{") {
        this.errores.push(new ErrorAnalisis("Sintáctico", "Se esperaba {", this.tokens[this.posicion - 1].linea));
        return;
    }

    nodo.hijos.push("{");
    this.avanzar();

    while (this.tokenActual() && this.tokenActual().lexema !== "}") {
        const antes = this.arbol.length;
        this.sentencia();

        if (this.arbol.length > antes) {
            nodo.hijos.push(this.arbol.pop());
        }
    }

    if (!this.tokenActual() || this.tokenActual().lexema !== "}") {
        this.errores.push(new ErrorAnalisis("Sintáctico", "Se esperaba }", this.tokens[this.posicion - 1].linea));
        return;
    }

    nodo.hijos.push("}");
    this.avanzar();

    this.arbol.push(nodo);
}

forSentencia() {

    let nodo = {
        tipo: "Bucle FOR",
        hijos: []
    };

    nodo.hijos.push("for");
    this.avanzar();

    if (!this.tokenActual() || this.tokenActual().lexema !== "(") {
        this.errores.push(
            new ErrorAnalisis(
                "Sintáctico",
                "Se esperaba ( después de for",
                this.tokens[this.posicion - 1].linea
            )
        );
        return;
    }

    nodo.hijos.push("(");
    this.avanzar();

    while (
        this.tokenActual() &&
        this.tokenActual().lexema !== ")"
    ) {
        nodo.hijos.push(this.tokenActual().lexema);
        this.avanzar();
    }

    if (!this.tokenActual()) {
        return;
    }

    nodo.hijos.push(")");
    this.avanzar();

    if (
        !this.tokenActual() ||
        this.tokenActual().lexema !== "{"
    ) {
        this.errores.push(
            new ErrorAnalisis(
                "Sintáctico",
                "Se esperaba {",
                this.tokens[this.posicion - 1].linea
            )
        );
        return;
    }

    nodo.hijos.push("{");
    this.avanzar();

    while (
        this.tokenActual() &&
        this.tokenActual().lexema !== "}"
    ) {
        this.sentencia();
    }

    if (
        this.tokenActual() &&
        this.tokenActual().lexema === "}"
    ) {
        nodo.hijos.push("}");
        this.avanzar();
    }

    this.arbol.push(nodo);
}

whileSentencia() {
    this.estructuraConBloque("while", "Bucle WHILE");
}
estructuraConBloque(palabraClave, tipoNodo) {
    let nodo = {
        tipo: tipoNodo,
        hijos: []
    };

    nodo.hijos.push(palabraClave);
    this.avanzar();

    if (!this.tokenActual() || this.tokenActual().lexema !== "(") {
        this.errores.push(new ErrorAnalisis("Sintáctico", `Se esperaba ( después de ${palabraClave}`, this.tokens[this.posicion - 1].linea));
        return;
    }

    nodo.hijos.push("(");
    this.avanzar();

    while (this.tokenActual() && this.tokenActual().lexema !== ")") {
        nodo.hijos.push(this.tokenActual().lexema);
        this.avanzar();
    }

    if (!this.tokenActual() || this.tokenActual().lexema !== ")") {
        this.errores.push(new ErrorAnalisis("Sintáctico", `Se esperaba ) en ${palabraClave}`, this.tokens[this.posicion - 1].linea));
        return;
    }

    nodo.hijos.push(")");
    this.avanzar();

    if (!this.tokenActual() || this.tokenActual().lexema !== "{") {
        this.errores.push(new ErrorAnalisis("Sintáctico", `Se esperaba { después de ${palabraClave}`, this.tokens[this.posicion - 1].linea));
        return;
    }

    nodo.hijos.push("{");
    this.avanzar();

    while (this.tokenActual() && this.tokenActual().lexema !== "}") {
        const antes = this.arbol.length;
        this.sentencia();

        if (this.arbol.length > antes) {
            nodo.hijos.push(this.arbol.pop());
        }
    }

    if (!this.tokenActual() || this.tokenActual().lexema !== "}") {
        this.errores.push(new ErrorAnalisis("Sintáctico", `Se esperaba } al final de ${palabraClave}`, this.tokens[this.posicion - 1].linea));
        return;
    }

    nodo.hijos.push("}");
    this.avanzar();

    this.arbol.push(nodo);
}

}


