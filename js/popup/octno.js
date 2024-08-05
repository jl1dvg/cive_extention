document.getElementById('btnAceptar').addEventListener('click', () => {
        const inputOD = document.getElementById('inputOD');
    const inputOI = document.getElementById('inputOI');

    if (inputOD && inputOI) {
        const ODvalue = inputOD.value;
        const OIvalue = inputOI.value;

    // Obtener el estado de los checkboxes para OD
    const ODI = document.getElementById('checkboxI').checked ? 'inferior' : '';
    const ODS = document.getElementById('checkboxS').checked ? 'superior' : '';
    const ODN = document.getElementById('checkboxN').checked ? 'nasal' : '';
    const ODT = document.getElementById('checkboxT').checked ? 'temporal' : '';

    // Obtener el estado de los checkboxes para OI
    const OII = document.getElementById('checkboxI_OI').checked ? 'inferior' : '';
    const OIS = document.getElementById('checkboxS_OI').checked ? 'superior' : '';
    const OIN = document.getElementById('checkboxN_OI').checked ? 'nasal' : '';
    const OIT = document.getElementById('checkboxT_OI').checked ? 'temporal' : '';

    // Crear un mensaje para OD y OI
    const mensajeOD = [ODI, ODS, ODN, ODT].filter(Boolean).join(', ');
    const mensajeOI = [OII, OIS, OIN, OIT].filter(Boolean).join(', ');

    let clasificacionOD = '';
    let clasificacionOI = '';

    // Clasificación para OD
        if (mensajeOD) {
            clasificacionOD = 'FUERA DE LIMITES NORMALES';
        } else if (ODvalue >= 85) {
        clasificacionOD = 'DENTRO DE LIMITES NORMALES';
        } else if (ODvalue < 85 && ODvalue !== '') {
        clasificacionOD = 'AL BORDE DE LIMITES NORMALES';
    }

    // Clasificación para OI
        if (mensajeOI) {
            clasificacionOI = 'FUERA DE LIMITES NORMALES';
        } else if (OIvalue >= 85) {
        clasificacionOI = 'DENTRO DE LIMITES NORMALES';
        } else if (OIvalue < 85 && OIvalue !== '') {
        clasificacionOI = 'AL BORDE DE LIMITES NORMALES';
    }

    // Crear un mensaje para OD
        let ODMessage = `OJO DERECHO\nCONFIABILIDAD: BUENA\n`;
        let ODdefect = '';
        if (mensajeOD) {
            ODdefect = `SE APRECIA DISMINUCIÓN DEL ESPESOR DE CAPA DE FIBRAS NERVIOSAS RETINALES EN CUADRANTES ${mensajeOD}.\n`;
        }
        ODMessage += `${ODdefect}PROMEDIO ESPESOR CFNR OD: ${ODvalue}UM\nCLASIFICACIÓN: ${clasificacionOD}`;

    // Crear un mensaje para OI
        let OIMessage = `OJO IZQUIERDO\nCONFIABILIDAD: BUENA\n`;
        let OIdefect = '';
        if (mensajeOI) {
            OIdefect = `SE APRECIA DISMINUCIÓN DEL ESPESOR DE CAPA DE FIBRAS NERVIOSAS RETINALES EN CUADRANTES ${mensajeOI}.\n`;
        }
        OIMessage += `${OIdefect}PROMEDIO ESPESOR CFNR OI: ${OIvalue}UM\nCLASIFICACIÓN: ${clasificacionOI}`;

    // Enviar los valores al padre
    window.parent.postMessage({OD: ODMessage, OI: OIMessage}, '*');
    }
});

document.getElementById('btnClose').addEventListener('click', () => {
    window.parent.postMessage({close: true}, '*'); // Mensaje para cerrar el popup
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        document.getElementById('btnAceptar').click(); // Simular clic en "Aceptar"
    }
});
