class Lexer {
    constructor(codigo) {
        this.codigo = codigo;
        this.tokens = [];
        this.errores = [];
        this.simbolos = [];
    }

    analizar() {
        const lineas = this.codigo.split("\n");

        const palabrasReservadas = [
            "let", "var", "const", "if", "else", "for", "while", 
            "function", "return", "true", "false"
        ];

       const regex = /(".*?"|'.*?'|\d+\.\d+|\d+|\+=|-=|\*=|\/=|==|!=|<=|>=|\+\+|--|[a-zA-Z_áéíóúÁÉÍÓÚñÑ][a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]*|[+\-*\/=<>;,.(){}[\]])/g; 

        lineas.forEach((lineaTexto, index) => {
            const linea = index + 1;
            let encontrados = lineaTexto.match(regex);

            if (encontrados) {
                encontrados.forEach(lexema => {
                    let tipo = this.identificarTipo(lexema, palabrasReservadas);
                    this.tokens.push(new Token(lexema, tipo, linea));

                    if (tipo === "IDENTIFICADOR") {
                        this.agregarSimbolo(lexema, linea);
                    }
                });
            }

            this.detectarErroresLexicos(lineaTexto, linea, regex);
        });

        return {
            tokens: this.tokens,
            errores: this.errores,
            simbolos: this.simbolos,
            lineas: lineas.length
        };
    }

   identificarTipo(lexema, palabrasReservadas) {
    if (/^(true|false)$/.test(lexema))
    return "LITERAL_BOOLEANO";
    if (palabrasReservadas.includes(lexema)) return "PALABRA_RESERVADA";

    if (/^".*"$/.test(lexema) || /^'.*'$/.test(lexema))
        return "LITERAL_CADENA";

    if (/^(true|false)$/.test(lexema))
        return "LITERAL_BOOLEANO";

    if (/^\d+\.\d+$/.test(lexema))
        return "LITERAL_DECIMAL";

    if (/^\d+$/.test(lexema))
        return "LITERAL_NUMERICO";

    if (/^[a-zA-Z_áéíóúÁÉÍÓÚñÑ][a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]*$/.test(lexema))
        return "IDENTIFICADOR";
 
    if (/^(==|!=|<=|>=|=|<|>|\+=|-=|\*=|\/=)$/.test(lexema))
      return "OPERADOR_RELACIONAL/ASIGNACION";

    if (/^(\+|\-|\*|\/|\+\+|--)$/.test(lexema))
        return "OPERADOR_ARITMETICO";

    if (/^[;,.(){}[\]]$/.test(lexema))
        return "SIMBOLO_ESPECIAL";

    return "DESCONOCIDO";
}

    agregarSimbolo(nombre, linea) {
        const existe = this.simbolos.find(s => s.nombre === nombre);

        if (!existe) {
            this.simbolos.push({
                nombre: nombre,
                tipo: "Variable/Identificador",
                linea: linea
            });
        }
    }

    detectarErroresLexicos(lineaTexto, linea, regex) {
        const textoLimpio = lineaTexto.replace(regex, "").replace(/\s/g, "");

        if (textoLimpio.length > 0) {
            this.errores.push(
                new ErrorAnalisis(
                    "Léxico",
                    `Símbolo no reconocido: ${textoLimpio}`,
                    linea
                )
            );
        }
    }
}