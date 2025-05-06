window.addEventListener("load", () => {
    if (window.inicializarUI) window.inicializarUI();
    if (window.habilitarArrastre) window.habilitarArrastre();
    if (window.inicializarEventos) window.inicializarEventos();
    if (window.inicializarTablaPacientes) window.inicializarTablaPacientes();
    if (window.iniciarObservadores) window.iniciarObservadores();

    // Verificar si las funciones de admision.js están disponibles
    if (window.extraerDatosYEnviarDesdeModal) {
        console.log("extraerDatosYEnviarDesdeModal disponible.");
    } else {
        console.warn("⚠️ extraerDatosYEnviarDesdeModal no está definido.");
    }

    if (window.registrarCambiosEnCampos) {
        console.log("registrarCambiosEnCampos disponible.");
        window.registrarCambiosEnCampos(); // Ejecutar la inicialización de los campos
    } else {
        console.warn("⚠️ registrarCambiosEnCampos no está definido.");
    }

    // Asegurar que la función existe antes de asignar el evento al botón
    if (window.extraerDatosYEnviar) {
        console.log("extraerDatosYEnviar disponible, esperando interacción del usuario.");

        const botonGuardar = document.querySelector("#botonGuardar");
        if (botonGuardar) {
            botonGuardar.addEventListener("click", (e) => {
                e.preventDefault(); // Evita el envío automático del formulario
                console.log("Botón 'Guardar Toda la Consulta' presionado. Enviando datos...");
                window.extraerDatosYEnviar();
            });
        }
    } else {
        console.warn("⚠️ extraerDatosYEnviar no está definida en el contexto global.");
    }

    // Asegurar que la función existe antes de asignar el evento al botón
    if (window.extraerDatosSolicitudYEnviar) {
        console.log("extraerDatosSolicitudYEnviar disponible, esperando interacción del usuario.");

        const botonGuardar = document.querySelector("#botonGuardar");
        if (botonGuardar) {
            botonGuardar.addEventListener("click", (e) => {
                e.preventDefault();
                console.log("Botón 'Guardar Toda la Consulta' presionado. Enviando datos...");
                window.extraerDatosSolicitudYEnviar(botonGuardar); // <== AQUÍ
            });
        }
    } else {
        console.warn("⚠️ extraerDatosSolicitudYEnviar no está definida en el contexto global."); // <== CORREGIDO
    }

    // Ejecutar detección de insumos si la función existe
    if (window.detectarInsumosPaciente) {
        console.log("🟢 detectInsumosPaciente disponible. Iniciando...");
        window.detectarInsumosPaciente();
    } else {
        console.warn("⚠️ detectarInsumosPaciente no está definida.");
    }

    // Ejecutar la extracción de insumos si la función existe
    if (window.detectarProcedimientosAlGuardar) {
        console.log("🟢 detectarProcedimientosAlGuardar disponible. Iniciando...");
        window.detectarProcedimientosAlGuardar();
    } else {
        console.warn("⚠️ detectarProcedimientosAlGuardar no está definida.");
    }

    // Ejecutar detección de admisión si la función existe
    if (window.inicializarDeteccionModalAdmision) {
        console.log("🟢 inicializarDeteccionModalAdmision disponible. Iniciando...");
        window.inicializarDeteccionModalAdmision();
    } else {
        console.warn("⚠️ inicializarDeteccionModalAdmision no está definida.");
    }
});