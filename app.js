const API_URL = "https://script.google.com/macros/s/AKfycbwwKbVmYr1LZ3x1pp32o52MmvylBEzpBA7cVK3krqounaubYk0wl8sbdins-8Y_0I4EHg/exec";


const guardarGasto =
    document.getElementById("guardarGasto");


const pantallaInicio =
    document.getElementById("pantallaInicio");


const pantallaAñadir =
    document.getElementById("pantallaAñadir");


const pantallaHistorial =
    document.getElementById("pantallaHistorial");


const navInicio =
    document.getElementById("navInicio");


const navAñadir =
    document.getElementById("navAñadir");


const navHistorial =
    document.getElementById("navHistorial");


const importeInput =
    document.getElementById("importe");


const conceptoInput =
    document.getElementById("concepto");


const categoriaInput =
    document.getElementById("categoria");


const fechaInput =
    document.getElementById("fecha");


const totalElement =
    document.getElementById("total");


const listaGastos =
    document.getElementById("listaGastos");


const filtroMes =
    document.getElementById("filtroMes");


const filtroCategoria =
    document.getElementById("filtroCategoria");


let mesInicio =
    document.getElementById("mesInicio");


let gastos = [];


let presupuestos = [];


let gastoEditando = null;


let periodoActual = "mes";


/* ==========================================
   SELECTOR DE PERIODO
   ========================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const botonesPeriodo =
            document.querySelectorAll(
                ".boton-periodo"
            );


        botonesPeriodo.forEach(
            function(boton) {

                boton.addEventListener(
                    "click",
                    function() {

                        periodoActual =
                            boton.dataset.periodo;


                        botonesPeriodo.forEach(
                            function(otroBoton) {

                                otroBoton.classList.remove(
                                    "activo"
                                );

                            }
                        );


                        boton.classList.add(
                            "activo"
                        );


                        actualizarSelectorPeriodo();


                        actualizarTotal();

                    }
                );

            }
        );

    }
);


/* ==========================================
   SELECTOR DE DETALLE DEL PERIODO
   ========================================== */

function actualizarSelectorPeriodo() {

    const contenedor =
        document.getElementById(
            "selectorDetallePeriodo"
        );


    if (!contenedor) {

        return;

    }


    /* ======================================
       MES
       ====================================== */

    if (
        periodoActual === "mes"
    ) {

        contenedor.innerHTML = `

            <select id="mesInicio">

                <option value="">
                    Cargando...
                </option>

            </select>

        `;


        mesInicio =
            document.getElementById(
                "mesInicio"
            );


        actualizarMesInicio();


        mesInicio.addEventListener(
            "change",
            function() {

                actualizarTotal();

            }
        );


        return;

    }


    /* ======================================
       SEMANA
       ====================================== */

    if (
        periodoActual === "semana"
    ) {

        contenedor.innerHTML = `

            <select id="semanaInicio">

            </select>

        `;


        const semanaInicio =
            document.getElementById(
                "semanaInicio"
            );


        actualizarSelectorSemanas();


        semanaInicio.addEventListener(
            "change",
            function() {

                actualizarTotal();

            }
        );


        return;

    }


    /* ======================================
       DÍA
       ====================================== */

    if (
        periodoActual === "dia"
    ) {

        contenedor.innerHTML = `

            <input
                type="date"
                id="diaInicio">

        `;


        const input =
            document.getElementById(
                "diaInicio"
            );


        const hoy =
            new Date();


        input.value =
            convertirFechaAInput(
                hoy
            );


        input.addEventListener(
            "input",
            function() {

                actualizarTotal();

            }
        );


        input.addEventListener(
            "change",
            function() {

                actualizarTotal();

            }
        );


        return;

    }

}


/* ==========================================
   DATOS GUARDADOS LOCALMENTE
   ========================================== */

let datosGuardados =
    localStorage.getItem(
        "erasmusExpensesDatos"
    );


if (datosGuardados) {

    try {

        const datosLocales =
            JSON.parse(
                datosGuardados
            );


        gastos =
            datosLocales.gastos || [];


        presupuestos =
            datosLocales.presupuestos || [];

    }

    catch (error) {

        console.error(
            "No se han podido cargar los datos guardados:",
            error
        );

    }

}


/* ==========================================
   FECHA ACTUAL
   ========================================== */

const hoy =
    new Date();


const fechaHoy =
    convertirFechaAInput(
        hoy
    );


fechaInput.value =
    fechaHoy;


/* ==========================================
   FUNCIONES DE FECHA
   ========================================== */

function convertirFechaAInput(
    fecha
) {

    const año =
        fecha.getFullYear();


    const mes =
        String(
            fecha.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const dia =
        String(
            fecha.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        año +
        "-" +
        mes +
        "-" +
        dia
    );

}


/*
   IMPORTANTE:

   Esta función NO utiliza new Date("AAAA-MM-DD")
   porque eso puede provocar desfases de día
   dependiendo de la zona horaria.

   Siempre construimos la fecha manualmente.
*/

function convertirFechaLocal(
    fecha
) {

    if (!fecha) {

        return null;

    }


    if (
        fecha instanceof Date
    ) {

        return new Date(
            fecha.getFullYear(),
            fecha.getMonth(),
            fecha.getDate()
        );

    }


    const texto =
        String(
            fecha
        ).trim();


    const coincidencia =
        texto.match(
            /^(\d{4})-(\d{2})-(\d{2})/
        );


    if (
        coincidencia
    ) {

        const año =
            Number(
                coincidencia[1]
            );


        const mes =
            Number(
                coincidencia[2]
            ) - 1;


        const dia =
            Number(
                coincidencia[3]
            );


        return new Date(
            año,
            mes,
            dia
        );

    }


    const fechaConvertida =
        new Date(
            texto
        );


    if (
        isNaN(
            fechaConvertida.getTime()
        )
    ) {

        return null;

    }


    return new Date(
        fechaConvertida.getFullYear(),
        fechaConvertida.getMonth(),
        fechaConvertida.getDate()
    );

}


/*
   Devuelve siempre:

   AAAA-MM-DD

   Esto nos permite comparar fechas
   sin depender de horas ni zonas horarias.
*/

function obtenerClaveFecha(
    fecha
) {

    const fechaLocal =
        convertirFechaLocal(
            fecha
        );


    if (!fechaLocal) {

        return "";

    }


    return convertirFechaAInput(
        fechaLocal
    );

}


/* ==========================================
   MES ACTUAL
   ========================================== */

function obtenerMesActual() {

    const ahora =
        new Date();


    return (
        ahora.getFullYear() +
        "-" +
        String(
            ahora.getMonth() + 1
        ).padStart(
            2,
            "0"
        )
    );

}


/* ==========================================
   OBTENER PRESUPUESTO DEL MES
   ========================================== */

function obtenerPresupuestoMes(
    año,
    mes
) {

    let presupuesto = 0;


    presupuestos.forEach(
        function(
            presupuestoFila
        ) {

            const fechaPresupuesto =
                convertirFechaLocal(
                    presupuestoFila[0]
                );


            if (!fechaPresupuesto) {

                return;

            }


            if (
                fechaPresupuesto.getFullYear()
                    === año
                &&
                fechaPresupuesto.getMonth()
                    === mes
            ) {

                presupuesto =
                    Number(
                        presupuestoFila[10]
                    ) || 0;

            }

        }
    );


    return presupuesto;

}


/* ==========================================
   OBTENER LUNES DE UNA SEMANA
   ========================================== */

function obtenerLunes(
    fecha
) {

    const resultado =
        convertirFechaLocal(
            fecha
        );


    if (!resultado) {

        return null;

    }


    const diaSemana =
        resultado.getDay();


    const diferencia =
        diaSemana === 0
            ? 6
            : diaSemana - 1;


    resultado.setDate(
        resultado.getDate() -
        diferencia
    );


    resultado.setHours(
        0,
        0,
        0,
        0
    );


    return resultado;

}


/* ==========================================
   OBTENER DOMINGO DE UNA SEMANA
   ========================================== */

function obtenerDomingo(
    fecha
) {

    const lunes =
        obtenerLunes(
            fecha
        );


    if (!lunes) {

        return null;

    }


    const domingo =
        new Date(
            lunes
        );


    domingo.setDate(
        domingo.getDate() + 6
    );


    domingo.setHours(
        23,
        59,
        59,
        999
    );


    return domingo;

}


/* ==========================================
   FORMATO DE SEMANA
   ========================================== */

function formatearSemana(
    lunes
) {

    const domingo =
        obtenerDomingo(
            lunes
        );


    const opcionesDia = {
        day: "numeric",
        month: "short"
    };


    const inicio =
        lunes.toLocaleDateString(
            "es-ES",
            opcionesDia
        );


    const fin =
        domingo.toLocaleDateString(
            "es-ES",
            opcionesDia
        );


    return (
        inicio +
        " - " +
        fin
    );

}


/* ==========================================
   SELECTOR DE SEMANAS
   ========================================== */

function actualizarSelectorSemanas() {

    const selector =
        document.getElementById(
            "semanaInicio"
        );


    if (!selector) {

        return;

    }


    selector.innerHTML =
        "";


    const fechaActual =
        new Date();


    const lunesActual =
        obtenerLunes(
            fechaActual
        );


    /*
       Creamos semanas desde septiembre
       de 2026 hasta agosto de 2027.
    */

    const inicio =
        new Date(
            2026,
            8,
            1
        );


    const lunesInicial =
        obtenerLunes(
            inicio
        );


    const fin =
        new Date(
            2027,
            7,
            31
        );


    const domingoFinal =
        obtenerDomingo(
            fin
        );


    let semana =
        new Date(
            lunesInicial
        );


    while (
        semana <= domingoFinal
    ) {

        const valor =
            convertirFechaAInput(
                semana
            );


        const opcion =
            document.createElement(
                "option"
            );


        opcion.value =
            valor;


        opcion.textContent =
            formatearSemana(
                semana
            );


        selector.appendChild(
            opcion
        );


        semana.setDate(
            semana.getDate() + 7
        );

    }


    const semanaActualValor =
        convertirFechaAInput(
            lunesActual
        );


    const existe =
        [
            ...selector.options
        ].some(
            function(opcion) {

                return (
                    opcion.value
                    ===
                    semanaActualValor
                );

            }
        );


    if (existe) {

        selector.value =
            semanaActualValor;

    }

    else if (
        selector.options.length > 0
    ) {

        selector.selectedIndex =
            0;

    }

}


/* ==========================================
   ACTUALIZAR RESUMEN DE INICIO
   ========================================== */

function actualizarTotal() {

    let total = 0;

    let comida = 0;

    let transporte = 0;

    let residencia = 0;

    let compras = 0;

    let ocio = 0;

    let viajes = 0;

    let universidad = 0;

    let otros = 0;


    let fechaInicio = null;

    let fechaFin = null;

    let presupuestoActual = 0;

    let diasPeriodo = 0;


    /* ======================================
       DETERMINAR PERIODO
       ====================================== */

    if (
        periodoActual === "mes"
    ) {

        const selectorMes =
            document.getElementById(
                "mesInicio"
            );


        let mesSeleccionado =
            selectorMes
                ? selectorMes.value
                : obtenerMesActual();


        if (!mesSeleccionado) {

            mesSeleccionado =
                obtenerMesActual();

        }


        const partes =
            mesSeleccionado.split("-");


        const año =
            Number(
                partes[0]
            );


        const mes =
            Number(
                partes[1]
            ) - 1;


        fechaInicio =
            new Date(
                año,
                mes,
                1
            );


        fechaFin =
            new Date(
                año,
                mes + 1,
                0,
                23,
                59,
                59,
                999
            );


        diasPeriodo =
            fechaFin.getDate();


        presupuestoActual =
            obtenerPresupuestoMes(
                año,
                mes
            );

    }


    else if (
        periodoActual === "semana"
    ) {

        const selectorSemana =
            document.getElementById(
                "semanaInicio"
            );


        if (!selectorSemana) {

            return;

        }


        const valorSemana =
            selectorSemana.value;


        if (!valorSemana) {

            return;

        }


        const fechaLunes =
            convertirFechaLocal(
                valorSemana
            );


        if (!fechaLunes) {

            return;

        }


        fechaInicio =
            new Date(
                fechaLunes
            );


        fechaInicio.setHours(
            0,
            0,
            0,
            0
        );


        fechaFin =
            new Date(
                fechaInicio
            );


        fechaFin.setDate(
            fechaFin.getDate() + 6
        );


        fechaFin.setHours(
            23,
            59,
            59,
            999
        );


        diasPeriodo =
            7;

    }


    else if (
        periodoActual === "dia"
    ) {

        const selectorDia =
            document.getElementById(
                "diaInicio"
            );


        if (!selectorDia) {

            return;

        }


        if (!selectorDia.value) {

            return;

        }


        fechaInicio =
            convertirFechaLocal(
                selectorDia.value
            );


        if (!fechaInicio) {

            return;

        }


        fechaInicio.setHours(
            0,
            0,
            0,
            0
        );


        fechaFin =
            new Date(
                fechaInicio
            );


        fechaFin.setHours(
            23,
            59,
            59,
            999
        );


        diasPeriodo =
            1;

    }


    /* ======================================
       CLAVES DE FECHA DEL PERIODO
       ====================================== */

    const claveFechaInicio =
        obtenerClaveFecha(
            fechaInicio
        );


    const claveFechaFin =
        obtenerClaveFecha(
            fechaFin
        );


    /* ======================================
       CALCULAR GASTOS
       ====================================== */

    gastos.forEach(
        function(gasto) {

            const claveGasto =
                obtenerClaveFecha(
                    gasto.fecha
                );


            if (!claveGasto) {

                return;

            }


            if (
                claveGasto <
                    claveFechaInicio
                ||
                claveGasto >
                    claveFechaFin
            ) {

                return;

            }


            const importe =
                Number(
                    gasto.importe
                ) || 0;


            total +=
                importe;


            const categoria =
                String(
                    gasto.categoria || ""
                ).toUpperCase();


            if (
                categoria === "COMIDA"
            ) {

                comida += importe;

            }


            if (
                categoria === "TRANSPORTE"
            ) {

                transporte += importe;

            }


            if (
                categoria === "RESIDENCIA"
            ) {

                residencia += importe;

            }


            if (
                categoria === "COMPRAS"
            ) {

                compras += importe;

            }


            if (
                categoria === "OCIO"
            ) {

                ocio += importe;

            }


            if (
                categoria === "VIAJES"
            ) {

                viajes += importe;

            }


            if (
                categoria === "UNIVERSIDAD"
            ) {

                universidad += importe;

            }


            if (
                categoria === "OTROS"
            ) {

                otros += importe;

            }

        }
    );


    /* ======================================
       TOTAL
       ====================================== */

    totalElement.textContent =
        total
            .toFixed(2)
            .replace(
                ".",
                ","
            )
        +
        " €";


    document.getElementById(
        "totalComida"
    ).textContent =
        comida
            .toFixed(2)
            .replace(
                ".",
                ","
            )
        +
        " €";


    document.getElementById(
        "totalTransporte"
    ).textContent =
        transporte
            .toFixed(2)
            .replace(
                ".",
                ","
            )
        +
        " €";


    document.getElementById(
        "totalResidencia"
    ).textContent =
        residencia
            .toFixed(2)
            .replace(
                ".",
                ","
            )
        +
        " €";


    document.getElementById(
        "totalCompras"
    ).textContent =
        compras
            .toFixed(2)
            .replace(
                ".",
                ","
            )
        +
        " €";


    document.getElementById(
        "totalOcio"
    ).textContent =
        ocio
            .toFixed(2)
            .replace(
                ".",
                ","
            )
        +
        " €";


    document.getElementById(
        "totalViajes"
    ).textContent =
        viajes
            .toFixed(2)
            .replace(
                ".",
                ","
            )
        +
        " €";


    document.getElementById(
        "totalUniversidad"
    ).textContent =
        universidad
            .toFixed(2)
            .replace(
                ".",
                ","
            )
        +
        " €";


    document.getElementById(
        "totalOtros"
    ).textContent =
        otros
            .toFixed(2)
            .replace(
                ".",
                ","
            )
        +
        " €";


    /* ======================================
       PRESUPUESTO
       ====================================== */

    const presupuestoElemento =
        document.getElementById(
            "presupuesto"
        );


    const disponibleElemento =
        document.getElementById(
            "disponible"
        );


    const porcentajeElemento =
        document.getElementById(
            "porcentajePresupuesto"
        );


    const barra =
        document.getElementById(
            "barraPresupuesto"
        );


    if (
        periodoActual === "mes"
    ) {

        presupuestoElemento.textContent =
            presupuestoActual
                .toFixed(2)
                .replace(
                    ".",
                    ","
                )
            +
            " €";


        const disponible =
            presupuestoActual -
            total;


        disponibleElemento.textContent =
            disponible
                .toFixed(2)
                .replace(
                    ".",
                    ","
                )
            +
            " €";


        let porcentaje =
            0;


        if (
            presupuestoActual > 0
        ) {

            porcentaje =
                (
                    total /
                    presupuestoActual
                ) *
                100;

        }


        let porcentajeBarra =
            porcentaje;


        if (
            porcentajeBarra > 100
        ) {

            porcentajeBarra =
                100;

        }


        barra.style.width =
            porcentajeBarra +
            "%";


        porcentajeElemento.textContent =
            porcentaje
                .toFixed(2)
            +
            "%";


        if (
            porcentaje > 75
        ) {

            barra.style.background =
                "#dc2626";


            disponibleElemento.style.color =
                "#dc2626";

        }

        else if (
            porcentaje > 50
        ) {

            barra.style.background =
                "#f59e0b";


            disponibleElemento.style.color =
                "#f59e0b";

        }

        else {

            barra.style.background =
                "#16a34a";


            disponibleElemento.style.color =
                "#16a34a";

        }

    }


    else {

        presupuestoElemento.textContent =
            "—";


        disponibleElemento.textContent =
            "—";


        porcentajeElemento.textContent =
            "—";


        barra.style.width =
            "0%";


        barra.style.background =
            "#dbe3f5";


        disponibleElemento.style.color =
            "#172554";

    }


    /* ======================================
       GASTO MEDIO DIARIO
       ====================================== */

    let diasParaMedia =
        diasPeriodo;


    if (
        periodoActual === "mes"
    ) {

        const ahora =
            new Date();


        const mesSeleccionado =
            document.getElementById(
                "mesInicio"
            );


        if (
            mesSeleccionado
            &&
            mesSeleccionado.value
                ===
                obtenerMesActual()
        ) {

            diasParaMedia =
                ahora.getDate();

        }

        else {

            const mesSeleccionadoValor =
                mesSeleccionado
                    ? mesSeleccionado.value
                    : "";


            if (
                mesSeleccionadoValor
            ) {

                const partes =
                    mesSeleccionadoValor
                        .split("-");


                const año =
                    Number(
                        partes[0]
                    );


                const mes =
                    Number(
                        partes[1]
                    ) - 1;


                const fechaMes =
                    new Date(
                        año,
                        mes,
                        1
                    );


                if (
                    fechaMes > ahora
                ) {

                    diasParaMedia =
                        0;

                }

                else {

                    diasParaMedia =
                        new Date(
                            año,
                            mes + 1,
                            0
                        ).getDate();

                }

            }

        }

    }


    let gastoMedioDiario =
        0;


    if (
        diasParaMedia > 0
    ) {

        gastoMedioDiario =
            total /
            diasParaMedia;

    }


    const gastoMedioElemento =
        document.getElementById(
            "gastoMedioDiario"
        );


    if (
        periodoActual === "dia"
    ) {

        gastoMedioElemento.textContent =
            "—";

    }

    else {

        gastoMedioElemento.textContent =
            gastoMedioDiario
                .toFixed(2)
                .replace(
                    ".",
                    ","
                )
            +
            " € / día";

    }


    /* ======================================
       MOSTRAR / OCULTAR ELEMENTOS
       ====================================== */

    const tituloResumen =
        document.querySelector(
            "#pantallaInicio .resumen .titulo"
        );


    const bloquePresupuesto =
        document.querySelector(
            "#pantallaInicio .presupuesto-info"
        );


    const barraFondo =
        document.querySelector(
            "#pantallaInicio .barra-fondo"
        );


    const barraTexto =
        document.querySelector(
            "#pantallaInicio .barra-texto"
        );


    const bloqueMedia =
        document.querySelector(
            "#pantallaInicio .estadistica-diaria"
        );


    if (tituloResumen) {

        if (
            periodoActual === "mes"
        ) {

            tituloResumen.textContent =
                "GASTADO ESTE MES";

        }

        else if (
            periodoActual === "semana"
        ) {

            tituloResumen.textContent =
                "GASTADO ESTA SEMANA";

        }

        else {

            tituloResumen.textContent =
                "GASTADO ESTE DÍA";

        }

    }


    if (bloquePresupuesto) {

        bloquePresupuesto.style.display =
            periodoActual === "mes"
                ? "flex"
                : "none";

    }


    if (barraFondo) {

        barraFondo.style.display =
            periodoActual === "mes"
                ? "block"
                : "none";

    }


    if (barraTexto) {

        barraTexto.style.display =
            periodoActual === "mes"
                ? "flex"
                : "none";

    }


    if (bloqueMedia) {

        bloqueMedia.style.display =
            periodoActual === "dia"
                ? "none"
                : "flex";

    }

}


/* ==========================================
   CREAR SELECTOR DE MESES DE INICIO
   ========================================== */

function actualizarMesInicio() {

    mesInicio =
        document.getElementById(
            "mesInicio"
        );


    if (!mesInicio) {

        return;

    }


    const mesSeleccionadoAntes =
        mesInicio.value;


    mesInicio.innerHTML =
        "";


    presupuestos.forEach(
        function(
            presupuesto
        ) {

            const fecha =
                convertirFechaLocal(
                    presupuesto[0]
                );


            if (!fecha) {

                return;

            }


            const año =
                fecha.getFullYear();


            const mes =
                fecha.getMonth();


            const valor =
                año +
                "-" +
                String(
                    mes + 1
                ).padStart(
                    2,
                    "0"
                );


            const nombreMes =
                fecha.toLocaleDateString(
                    "es-ES",
                    {
                        month: "long",
                        year: "numeric"
                    }
                );


            const opcion =
                document.createElement(
                    "option"
                );


            opcion.value =
                valor;


            opcion.textContent =
                nombreMes
                    .charAt(0)
                    .toUpperCase()
                +
                nombreMes.slice(1);


            mesInicio.appendChild(
                opcion
            );

        }
    );


    const mesActual =
        obtenerMesActual();


    if (
        mesSeleccionadoAntes
        &&
        [
            ...mesInicio.options
        ].some(
            function(opcion) {

                return (
                    opcion.value
                    ===
                    mesSeleccionadoAntes
                );

            }
        )
    ) {

        mesInicio.value =
            mesSeleccionadoAntes;

    }

    else if (
        [
            ...mesInicio.options
        ].some(
            function(opcion) {

                return (
                    opcion.value
                    ===
                    mesActual
                );

            }
        )
    ) {

        mesInicio.value =
            mesActual;

    }

    else if (
        mesInicio.options.length > 0
    ) {

        mesInicio.selectedIndex =
            0;

    }

}


/* ==========================================
   CAMBIO DE MES EN INICIO
   ========================================== */

document.addEventListener(
    "change",
    function(evento) {

        if (
            evento.target.id
                ===
                "mesInicio"
        ) {

            actualizarTotal();

        }

    }
);


/* ==========================================
   HISTORIAL
   ========================================== */

function actualizarLista() {

    listaGastos.innerHTML =
        "";


    const mesResumen =
        filtroMes.value;


    if (
        mesResumen === "todos"
    ) {

        document.getElementById(
            "presupuestoHistorial"
        ).textContent =
            "—";


        document.getElementById(
            "gastadoHistorial"
        ).textContent =
            "—";


        document.getElementById(
            "disponibleHistorial"
        ).textContent =
            "—";


        document.getElementById(
            "disponibleHistorial"
        ).style.color =
            "#172554";

    }

    else {

        const partesMes =
            mesResumen.split("-");


        const añoResumen =
            Number(
                partesMes[0]
            );


        const numeroMesResumen =
            Number(
                partesMes[1]
            ) - 1;


        const presupuestoMes =
            obtenerPresupuestoMes(
                añoResumen,
                numeroMesResumen
            );


        let gastadoMes =
            0;


        gastos.forEach(
            function(gasto) {

                const fechaGasto =
                    convertirFechaLocal(
                        gasto.fecha
                    );


                if (
                    !fechaGasto
                ) {

                    return;

                }


                if (
                    fechaGasto.getFullYear()
                        ===
                        añoResumen
                    &&
                    fechaGasto.getMonth()
                        ===
                        numeroMesResumen
                ) {

                    gastadoMes +=
                        Number(
                            gasto.importe
                        ) || 0;

                }

            }
        );


        const disponibleMes =
            presupuestoMes -
            gastadoMes;


        document.getElementById(
            "presupuestoHistorial"
        ).textContent =
            presupuestoMes
                .toFixed(2)
                .replace(
                    ".",
                    ","
                )
            +
            " €";


        document.getElementById(
            "gastadoHistorial"
        ).textContent =
            gastadoMes
                .toFixed(2)
                .replace(
                    ".",
                    ","
                )
            +
            " €";


        const disponibleHistorial =
            document.getElementById(
                "disponibleHistorial"
            );


        disponibleHistorial.textContent =
            disponibleMes
                .toFixed(2)
                .replace(
                    ".",
                    ","
                )
            +
            " €";


        const porcentajeHistorial =
            presupuestoMes > 0
                ?
                (
                    gastadoMes /
                    presupuestoMes
                ) *
                100
                :
                0;


        if (
            porcentajeHistorial > 75
        ) {

            disponibleHistorial.style.color =
                "#dc2626";

        }

        else if (
            porcentajeHistorial > 50
        ) {

            disponibleHistorial.style.color =
                "#f59e0b";

        }

        else {

            disponibleHistorial.style.color =
                "#16a34a";

        }

    }


    const mesSeleccionado =
        filtroMes.value;


    const categoriaSeleccionada =
        filtroCategoria.value;


    let totalFiltrado =
        0;


    gastos
        .slice()
        .sort(
            function(a, b) {

                return (
                    convertirFechaLocal(
                        b.fecha
                    )
                    -
                    convertirFechaLocal(
                        a.fecha
                    )
                );

            }
        )
        .forEach(
            function(gasto) {

                const fechaGasto =
                    convertirFechaLocal(
                        gasto.fecha
                    );


                if (!fechaGasto) {

                    return;

                }


                const año =
                    fechaGasto.getFullYear();


                const mes =
                    String(
                        fechaGasto.getMonth() + 1
                    ).padStart(
                        2,
                        "0"
                    );


                const mesGasto =
                    año +
                    "-" +
                    mes;


                if (
                    mesSeleccionado !== "todos"
                    &&
                    mesGasto !==
                        mesSeleccionado
                ) {

                    return;

                }


                if (
                    categoriaSeleccionada !==
                        "todas"
                    &&
                    gasto.categoria !==
                        categoriaSeleccionada
                ) {

                    return;

                }


                totalFiltrado +=
                    Number(
                        gasto.importe
                    ) || 0;


                const elemento =
                    document.createElement(
                        "div"
                    );


                elemento.className =
                    "gasto";


                elemento.dataset.fila =
                    gasto.fila;


                elemento.innerHTML = `
                    <div>
                        <strong>
                            ${gasto.concepto}
                        </strong>

                        <small>
                            ${obtenerEmojiCategoria(gasto.categoria)}
                            ${gasto.categoria} ·
                            ${fechaGasto.toLocaleDateString("es-ES")}
                        </small>
                    </div>

                    <div class="gasto-derecha">

                        <strong>
                            ${Number(gasto.importe)
                                .toFixed(2)
                                .replace(".", ",")} €
                        </strong>

                        <button class="boton-editar">
                            ✏️
                        </button>

                        <button class="boton-borrar">
                            🗑️
                        </button>

                    </div>
                `;


                listaGastos.appendChild(
                    elemento
                );


                elemento
                    .querySelector(
                        ".boton-editar"
                    )
                    .addEventListener(
                        "click",
                        function() {

                            gastoEditando =
                                gasto;


                            document.getElementById(
                                "editarImporte"
                            ).value =
                                gasto.importe;


                            document.getElementById(
                                "editarConcepto"
                            ).value =
                                gasto.concepto;


                            document.getElementById(
                                "editarCategoria"
                            ).value =
                                gasto.categoria
                                    .charAt(0)
                                +
                                gasto.categoria
                                    .slice(1)
                                    .toLowerCase();


                            document.getElementById(
                                "editarFecha"
                            ).value =
                                obtenerClaveFecha(
                                    gasto.fecha
                                );


                            const formularioEdicion =
                                document.getElementById(
                                    "formularioEdicion"
                                );


                            formularioEdicion.style.display =
                                "block";


                            formularioEdicion.scrollIntoView({
                                behavior:
                                    "smooth",
                                block:
                                    "start"
                            });

                        }
                    );


                elemento
                    .querySelector(
                        ".boton-borrar"
                    )
                    .addEventListener(
                        "click",
                        async function() {

                            const confirmar =
                                confirm(
                                    "¿Quieres eliminar este gasto?"
                                );


                            if (!confirmar) {

                                return;

                            }


                            const datosFormulario =
                                new URLSearchParams();


                            datosFormulario.append(
                                "fila",
                                gasto.fila
                            );


                            await fetch(
                                API_URL,
                                {
                                    method:
                                        "POST",
                                    body:
                                        datosFormulario
                                }
                            );


                            await cargarGastos();


                            alert(
                                "Gasto eliminado correctamente"
                            );

                        }
                    );

            }
        );


    document.getElementById(
        "totalFiltrado"
    ).textContent =
        totalFiltrado
            .toFixed(2)
            .replace(
                ".",
                ","
            )
        +
        " €";


    const hayGastos =
        gastos.some(
            function(gasto) {

                const fechaGasto =
                    convertirFechaLocal(
                        gasto.fecha
                    );


                if (!fechaGasto) {

                    return false;

                }


                const año =
                    fechaGasto.getFullYear();


                const mes =
                    String(
                        fechaGasto.getMonth() + 1
                    ).padStart(
                        2,
                        "0"
                    );


                const mesGasto =
                    año +
                    "-" +
                    mes;


                if (
                    filtroMes.value !== "todos"
                    &&
                    mesGasto !==
                        filtroMes.value
                ) {

                    return false;

                }


                if (
                    filtroCategoria.value !==
                        "todas"
                    &&
                    gasto.categoria !==
                        filtroCategoria.value
                ) {

                    return false;

                }


                return true;

            }
        );


    if (!hayGastos) {

        listaGastos.innerHTML = `
            <div class="sin-gastos">

                <span>
                    📭
                </span>

                <p>
                    No hay gastos para esta selección.
                </p>

            </div>
        `;

    }

}


/* ==========================================
   EMOJIS
   ========================================== */

function obtenerEmojiCategoria(
    categoria
) {

    const emojis = {

        "COMIDA":
            "🍔",

        "TRANSPORTE":
            "🚆",

        "RESIDENCIA":
            "🏠",

        "COMPRAS":
            "🛍️",

        "OCIO":
            "🎉",

        "VIAJES":
            "✈️",

        "UNIVERSIDAD":
            "🎓",

        "OTROS":
            "📦"

    };


    return (
        emojis[categoria]
        ||
        "📦"
    );

}


/* ==========================================
   FILTROS HISTORIAL
   ========================================== */

filtroMes.addEventListener(
    "change",
    function() {

        actualizarLista();

    }
);


filtroCategoria.addEventListener(
    "change",
    function() {

        actualizarLista();

    }
);


/* ==========================================
   CARGAR GASTOS
   ========================================== */

async function cargarGastos() {

    try {

        const respuesta =
            await fetch(
                API_URL
            );


        const datos =
            await respuesta.json();


        document.getElementById(
            "avisoOffline"
        ).style.display =
            "none";


        gastos =
            datos.gastos.map(
                function(gasto) {

                    return {

                        fila:
                            gasto.fila,

                        fecha:
                            gasto.fecha,

                        concepto:
                            gasto.concepto,

                        categoria:
                            gasto.categoria,

                        importe:
                            Number(
                                gasto.importe
                            )

                    };

                }
            );


        presupuestos =
            datos.presupuestos;


        localStorage.setItem(
            "erasmusExpensesDatos",
            JSON.stringify({

                gastos:
                    gastos,

                presupuestos:
                    presupuestos

            })
        );


        if (
            periodoActual === "mes"
        ) {

            actualizarMesInicio();

        }


        if (
            periodoActual === "semana"
        ) {

            actualizarSelectorSemanas();

        }


        actualizarFiltroMes();

        actualizarTotal();

        actualizarLista();

    }

    catch (error) {

        document.getElementById(
            "avisoOffline"
        ).style.display =
            "block";


        console.error(
            "No se han podido cargar los gastos:",
            error
        );

    }

}


/* ==========================================
   FILTRO DE MESES DEL HISTORIAL
   ========================================== */

function actualizarFiltroMes() {

    const meses = [];


    gastos.forEach(
        function(gasto) {

            const fecha =
                convertirFechaLocal(
                    gasto.fecha
                );


            if (!fecha) {

                return;

            }


            const año =
                fecha.getFullYear();


            const mes =
                fecha.getMonth();


            const valor =
                año +
                "-" +
                String(
                    mes + 1
                ).padStart(
                    2,
                    "0"
                );


            if (
                !meses.includes(
                    valor
                )
            ) {

                meses.push(
                    valor
                );

            }

        }
    );


    meses.sort().reverse();


    filtroMes.innerHTML =
        '<option value="todos">Todos los meses</option>';


    meses.forEach(
        function(mes) {

            const partes =
                mes.split("-");


            const año =
                partes[0];


            const numeroMes =
                Number(
                    partes[1]
                );


            const nombreMes =
                new Date(
                    Number(año),
                    numeroMes - 1,
                    1
                ).toLocaleDateString(
                    "es-ES",
                    {
                        month:
                            "long",
                        year:
                            "numeric"
                    }
                );


            const opcion =
                document.createElement(
                    "option"
                );


            opcion.value =
                mes;


            opcion.textContent =
                nombreMes
                    .charAt(0)
                    .toUpperCase()
                +
                nombreMes.slice(1);


            filtroMes.appendChild(
                opcion
            );

        }
    );

}


/* ==========================================
   GUARDAR GASTO
   ========================================== */

guardarGasto.addEventListener(
    "click",
    async function() {

        const importe =
            parseFloat(
                importeInput.value
            );


        const concepto =
            conceptoInput.value;


        const categoria =
            categoriaInput.value;


        const fecha =
            fechaInput.value;


        if (
            isNaN(importe)
            ||
            concepto === ""
            ||
            fecha === ""
        ) {

            alert(
                "Completa todos los campos"
            );

            return;

        }


        const datosFormulario =
            new URLSearchParams();


        datosFormulario.append(
            "fecha",
            fecha
        );


        datosFormulario.append(
            "concepto",
            concepto
        );


        datosFormulario.append(
            "categoria",
            categoria
        );


        datosFormulario.append(
            "importe",
            importe
        );


        try {

            await fetch(
                API_URL,
                {
                    method:
                        "POST",
                    body:
                        datosFormulario
                }
            );


            await cargarGastos();


            importeInput.value =
                "";


            conceptoInput.value =
                "";


            categoriaInput.value =
                "Comida";


            fechaInput.value =
                fechaHoy;


            mostrarPantalla(
                pantallaInicio
            );


            alert(
                "Gasto guardado correctamente"
            );

        }

        catch (error) {

            alert(
                "No se ha podido guardar el gasto"
            );


            console.error(
                error
            );

        }

    }
);


/* ==========================================
   CANCELAR EDICIÓN
   ========================================== */

document.getElementById(
    "cancelarEdicion"
).addEventListener(
    "click",
    function() {

        gastoEditando =
            null;


        document.getElementById(
            "formularioEdicion"
        ).style.display =
            "none";

    }
);


/* ==========================================
   GUARDAR EDICIÓN
   ========================================== */

document.getElementById(
    "guardarEdicion"
).addEventListener(
    "click",
    async function() {

        if (!gastoEditando) {

            return;

        }


        const importe =
            parseFloat(
                document.getElementById(
                    "editarImporte"
                ).value
            );


        const concepto =
            document.getElementById(
                "editarConcepto"
            ).value.trim();


        const categoria =
            document.getElementById(
                "editarCategoria"
            ).value;


        const fecha =
            document.getElementById(
                "editarFecha"
            ).value;


        if (
            isNaN(importe)
            ||
            concepto === ""
            ||
            fecha === ""
        ) {

            alert(
                "Completa todos los campos"
            );

            return;

        }


        const datosFormulario =
            new URLSearchParams();


        datosFormulario.append(
            "fila",
            gastoEditando.fila
        );


        datosFormulario.append(
            "editar",
            "true"
        );


        datosFormulario.append(
            "fecha",
            fecha
        );


        datosFormulario.append(
            "concepto",
            concepto
        );


        datosFormulario.append(
            "categoria",
            categoria
        );


        datosFormulario.append(
            "importe",
            importe
        );


        try {

            await fetch(
                API_URL,
                {
                    method:
                        "POST",
                    body:
                        datosFormulario
                }
            );


            gastoEditando =
                null;


            document.getElementById(
                "formularioEdicion"
            ).style.display =
                "none";


            await cargarGastos();


            alert(
                "Gasto actualizado correctamente"
            );

        }

        catch (error) {

            alert(
                "No se han podido guardar los cambios"
            );


            console.error(
                error
            );

        }

    }
);


/* ==========================================
   CAMBIO DE PANTALLA
   ========================================== */

function mostrarPantalla(
    pantalla
) {

    pantallaInicio.style.display =
        "none";


    pantallaAñadir.style.display =
        "none";


    pantallaHistorial.style.display =
        "none";


    pantalla.style.display =
        "block";


    navInicio.classList.remove(
        "activo"
    );


    navAñadir.classList.remove(
        "activo"
    );


    navHistorial.classList.remove(
        "activo"
    );


    if (
        pantalla === pantallaInicio
    ) {

        navInicio.classList.add(
            "activo"
        );

    }


    if (
        pantalla === pantallaAñadir
    ) {

        navAñadir.classList.add(
            "activo"
        );

    }


    if (
        pantalla === pantallaHistorial
    ) {

        navHistorial.classList.add(
            "activo"
        );

    }

}


/* ==========================================
   NAVEGACIÓN
   ========================================== */

navInicio.addEventListener(
    "click",
    function() {

        mostrarPantalla(
            pantallaInicio
        );

    }
);


navAñadir.addEventListener(
    "click",
    function() {

        mostrarPantalla(
            pantallaAñadir
        );

    }
);


navHistorial.addEventListener(
    "click",
    function() {

        mostrarPantalla(
            pantallaHistorial
        );

    }
);


/* ==========================================
   CARGA INICIAL
   ========================================== */

if (
    gastos.length > 0
    ||
    presupuestos.length > 0
) {

    actualizarMesInicio();

    actualizarFiltroMes();

    actualizarTotal();

    actualizarLista();

}


mostrarPantalla(
    pantallaInicio
);


cargarGastos();