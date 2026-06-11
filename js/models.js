class Token {
    constructor(lexema, tipo, linea) {
        this.lexema = lexema;
        this.tipo = tipo;
        this.linea = linea;
    }
}

class ErrorAnalisis {
    constructor(tipo, mensaje, linea) {
        this.tipo = tipo;
        this.mensaje = mensaje;
        this.linea = linea;
    }
}