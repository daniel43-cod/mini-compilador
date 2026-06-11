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

    esValorValido(token) {
        return token && [
            "IDENTIFICADOR",
            "NUMERO",
            "CADENA",
            "LITERAL_NUMERICO",
            "LITERAL_DECIMAL",
            "LITERAL_CADENA",
            "LITERAL_BOOLEANO"
        ].includes(token.tipo);
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
        else if (token.lexema === "for") {
            this.forSentencia();
        }
        else if (token.lexema === "else") {
    this.elseSentencia();
}
        else if (token.lexema === "while") {
            this.whileSentencia();
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
            this.errores.push(
                new ErrorAnalisis(
                    "Sintáctico",
                    "Se esperaba un identificador",
                    palabra.linea
                )
            );
            return;
        }

        nodo.hijos.push(identificador.lexema);
        this.avanzar();

        if (this.tokenActual() && this.tokenActual().lexema === "=") {
            nodo.hijos.push("=");
            this.avanzar();

            if (this.esValorValido(this.tokenActual())) {
                nodo.hijos.push(this.tokenActual().lexema);
                this.avanzar();
            } else {
                this.errores.push(
                    new ErrorAnalisis(
                        "Sintáctico",
                        "Se esperaba un valor",
                        identificador.linea
                    )
                );
                return;
            }
        }

        if (this.tokenActual() && this.tokenActual().lexema === ";") {
            nodo.hijos.push(";");
            this.avanzar();
        } else {
            this.errores.push(
                new ErrorAnalisis(
                    "Sintáctico",
                    "Falta punto y coma ;",
                    identificador.linea
                )
            );
            return;
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

       if (
    !this.tokenActual() ||
    !["=", "+=", "-=", "*=", "/="].includes(this.tokenActual().lexema)
) {
    this.errores.push(
        new ErrorAnalisis(
            "Sintáctico",
            "Se esperaba operador de asignación",
            identificador.linea
        )
    );
    return;
}

nodo.hijos.push(this.tokenActual().lexema);
this.avanzar();

        if (this.esValorValido(this.tokenActual())) {
            nodo.hijos.push(this.tokenActual().lexema);
            this.avanzar();
        } else {
            this.errores.push(
                new ErrorAnalisis(
                    "Sintáctico",
                    "Se esperaba un valor",
                    identificador.linea
                )
            );
            return;
        }

        if (this.tokenActual() && this.tokenActual().lexema === ";") {
            nodo.hijos.push(";");
            this.avanzar();
        } else {
            this.errores.push(
                new ErrorAnalisis(
                    "Sintáctico",
                    "Falta punto y coma ;",
                    identificador.linea
                )
            );
            return;
        }

        this.arbol.push(nodo);
    }

    consoleLog() {
        let nodo = {
            tipo: "Impresión",
            hijos: []
        };

        const inicio = ["console", ".", "log", "("];

        for (let esperado of inicio) {
            const actual = this.tokenActual();

            if (!actual || actual.lexema !== esperado) {
                this.errores.push(
                    new ErrorAnalisis(
                        "Sintáctico",
                        `Se esperaba "${esperado}"`,
                        actual ? actual.linea : 0
                    )
                );
                return;
            }

            nodo.hijos.push(actual.lexema);
            this.avanzar();
        }

        while (this.tokenActual() && this.tokenActual().lexema !== ")") {
            const actual = this.tokenActual();

            if (this.esValorValido(actual) || actual.lexema === ",") {
                nodo.hijos.push(actual.lexema);
                this.avanzar();
            } else {
                this.errores.push(
                    new ErrorAnalisis(
                        "Sintáctico",
                        "Valor no válido dentro de console.log",
                        actual.linea
                    )
                );
                this.avanzar();
            }
        }

        if (!this.tokenActual() || this.tokenActual().lexema !== ")") {
            this.errores.push(
                new ErrorAnalisis(
                    "Sintáctico",
                    "Se esperaba )",
                    0
                )
            );
            return;
        }

        nodo.hijos.push(")");
        this.avanzar();

        if (!this.tokenActual() || this.tokenActual().lexema !== ";") {
            this.errores.push(
                new ErrorAnalisis(
                    "Sintáctico",
                    "Falta punto y coma ;",
                    0
                )
            );
            return;
        }

        nodo.hijos.push(";");
        this.avanzar();

        this.arbol.push(nodo);
    }

    ifSentencia() {
        this.estructuraConBloque("if", "Condicional IF");
    }

    whileSentencia() {
        this.estructuraConBloque("while", "Bucle WHILE");
    }

    forSentencia() {
        this.estructuraConBloque("for", "Bucle FOR");
    }

    estructuraConBloque(palabraClave, tipoNodo) {
        let nodo = {
            tipo: tipoNodo,
            hijos: []
        };

        nodo.hijos.push(palabraClave);
        this.avanzar();

        if (!this.tokenActual() || this.tokenActual().lexema !== "(") {
            this.errores.push(
                new ErrorAnalisis(
                    "Sintáctico",
                    `Se esperaba ( después de ${palabraClave}`,
                    this.tokens[this.posicion - 1].linea
                )
            );
            return;
        }

        nodo.hijos.push("(");
        this.avanzar();

        while (this.tokenActual() && this.tokenActual().lexema !== ")") {
            nodo.hijos.push(this.tokenActual().lexema);
            this.avanzar();
        }

        if (!this.tokenActual() || this.tokenActual().lexema !== ")") {
            this.errores.push(
                new ErrorAnalisis(
                    "Sintáctico",
                    `Se esperaba ) en ${palabraClave}`,
                    this.tokens[this.posicion - 1].linea
                )
            );
            return;
        }

        nodo.hijos.push(")");
        this.avanzar();

        if (!this.tokenActual() || this.tokenActual().lexema !== "{") {
            this.errores.push(
                new ErrorAnalisis(
                    "Sintáctico",
                    `Se esperaba { después de ${palabraClave}`,
                    this.tokens[this.posicion - 1].linea
                )
            );
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
            this.errores.push(
                new ErrorAnalisis(
                    "Sintáctico",
                    `Se esperaba } al final de ${palabraClave}`,
                    this.tokens[this.posicion - 1].linea
                )
            );
            return;
        }

        nodo.hijos.push("}");
        this.avanzar();

        this.arbol.push(nodo);
    }
    elseSentencia() {
    let nodo = {
        tipo: "Condicional ELSE",
        hijos: []
    };

    nodo.hijos.push("else");
    this.avanzar();

    if (this.tokenActual() && this.tokenActual().lexema === "if") {
        const antes = this.arbol.length;
        this.ifSentencia();

        if (this.arbol.length > antes) {
            nodo.hijos.push(this.arbol.pop());
        }

        this.arbol.push(nodo);
        return;
    }

    if (!this.tokenActual() || this.tokenActual().lexema !== "{") {
        this.errores.push(
            new ErrorAnalisis(
                "Sintáctico",
                "Se esperaba { después de else",
                this.tokens[this.posicion - 1].linea
            )
        );
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
        this.errores.push(
            new ErrorAnalisis(
                "Sintáctico",
                "Se esperaba } al final de else",
                this.tokens[this.posicion - 1].linea
            )
        );
        return;
    }

    nodo.hijos.push("}");
    this.avanzar();

    this.arbol.push(nodo);
}
}