document.getElementById('btnAceptar').addEventListener('click', () => {
    window.addEventListener('load', () => {
        const inputOD = document.getElementById('inputOD');
        console.log(inputOD); // Verifica si el elemento se encuentra
        if (inputOD) {
            setTimeout(() => {
                inputOD.focus();
            }, 100);
        }
    });

    const OD = document.getElementById('inputOD').value;
    const OI = document.getElementById('inputOI').value;

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

    // Enviar los valores al padre
    window.parent.postMessage({OD, OI, mensajeOD, mensajeOI}, '*');
});

document.getElementById('btnClose').addEventListener('click', () => {
    window.parent.postMessage({close: true}, '*'); // Mensaje para cerrar el popup
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        document.getElementById('btnAceptar').click(); // Simular clic en "Aceptar"
    }
});
