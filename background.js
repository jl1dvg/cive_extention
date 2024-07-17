chrome.commands.onCommand.addListener(function(command) {
    if (command === "execute-action") {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: ejecutarAcciones
            });
        });
    }
});

function ejecutarAcciones() {
    // Aquí va el código que deseas ejecutar
    // Hacer clic en el contenedor del técnico
    const tecnicoContainer = document.querySelector('#select2-ordenexamen-0-tecnico_id-container');
    if (tecnicoContainer) {
        // Simular un evento de mouse para expandir Select2
        const event = new MouseEvent('mousedown', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        tecnicoContainer.dispatchEvent(event);

        // Añadir un retraso para asegurarse de que el Select2 se expanda
        setTimeout(() => {
            // Buscar el campo de búsqueda del Select2
            const searchField = document.querySelector('input.select2-search__field');
            if (searchField) {
                // Establecer el valor de búsqueda y disparar un evento de input
                searchField.value = "DE VERA G";
                const inputEvent = new Event('input', {
                    bubbles: true,
                    cancelable: true
                });
                searchField.dispatchEvent(inputEvent);

                // Añadir un retraso para esperar a que los resultados de la búsqueda se carguen
                setTimeout(() => {
                    // Simular presionar la tecla Enter para seleccionar la opción
                    const enterEvent = new KeyboardEvent('keydown', {
                        key: 'Enter',
                        keyCode: 13,
                        bubbles: true,
                        cancelable: true
                    });
                    searchField.dispatchEvent(enterEvent);

                    // Después de seleccionar la primera opción, hacemos clic en el segundo contenedor
                    const radiologoContainer = document.querySelector('#select2-ordenexamen-0-radiologo_id-container');
                    if (radiologoContainer) {
                        const event2 = new MouseEvent('mousedown', {
                            view: window,
                            bubbles: true,
                            cancelable: true
                        });
                        radiologoContainer.dispatchEvent(event2);

                        setTimeout(() => {
                            // Buscar el campo de búsqueda del segundo Select2
                            const searchField2 = document.querySelector('input.select2-search__field');
                            if (searchField2) {
                                // Establecer el valor de búsqueda y disparar un evento de input
                                searchField2.value = "BUSCAR...";
                                const inputEvent2 = new Event('input', {
                                    bubbles: true,
                                    cancelable: true
                                });
                                searchField2.dispatchEvent(inputEvent2);

                                setTimeout(() => {
                                    // Simular presionar la tecla Enter para seleccionar la opción en el segundo Select2
                                    const enterEvent2 = new KeyboardEvent('keydown', {
                                        key: 'Enter',
                                        keyCode: 13,
                                        bubbles: true,
                                        cancelable: true
                                    });
                                    searchField2.dispatchEvent(enterEvent2);

                                    // Añadir un retraso antes de hacer clic en el botón "Terminar"
                                    setTimeout(() => {
                                        const botonTerminar = document.querySelector('button.btn.btn-success[onclick="guardarTerminar()"]');
                                        if (botonTerminar) {
                                            botonTerminar.click();
                                        } else {
                                            console.error('El botón "Terminar" no se encontró.');
                                        }
                                    }, 1000); // 1000 milisegundos = 1 segundo

                                }, 1000); // 1000 milisegundos = 1 segundo
                            } else {
                                console.error('El campo de búsqueda del segundo Select2 no se encontró.');
                            }
                        }, 1000); // 1000 milisegundos = 1 segundo
                    } else {
                        console.error('El contenedor "select2-ordenexamen-0-radiologo_id-container" no se encontró.');
                    }

                }, 1000); // 1000 milisegundos = 1 segundo
            } else {
                console.error('El campo de búsqueda del Select2 no se encontró.');
            }
        }, 1000); // 1000 milisegundos = 1 segundo

    } else {
        console.error('El contenedor "select2-ordenexamen-0-tecnico_id-container" no se encontró.');
    }
}
