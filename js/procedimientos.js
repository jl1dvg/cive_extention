// procedimientos.js

import { cargarJSON, ejecutarTecnicos, ejecutarCodigos } from './utils.js';

export function cargarProtocolos() {
    cargarJSON('data/protocolos.json')
        .then(data => {
            console.log('Datos de protocolos cargados:', data);
            const procedimientosData = data.protocolos;
            crearBotonesProcedimientos(procedimientosData, 'contenedorProtocolos', ejecutarProtocolos);
        })
        .catch(error => console.error('Error cargando JSON de protocolos:', error));
}

function ejecutarProtocolos(id) {
    cargarJSON('data/protocolos.json')
        .then(data => {
            const item = data.protocolos.find(d => d.id === id);
            if (!item) throw new Error('ID no encontrado en el JSON');

            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: (item) => {
                        ejecutarCodigos(item)
                            .catch(error => console.error('Error en la ejecución de protocolo:', error));
                    },
                    args: [item]
                });
            });
        })
        .catch(error => console.error('Error en la ejecución de protocolo:', error));
}

function crearBotonesProcedimientos(procedimientos, contenedorId, clickHandler) {
    const contenedorBotones = document.getElementById(contenedorId);
    contenedorBotones.innerHTML = ''; // Limpiar el contenedor
    procedimientos.forEach(procedimiento => {
        const boton = document.createElement('button');
        boton.id = `${procedimiento.id}`;
        boton.textContent = `${procedimiento.cirugia}`;
        boton.addEventListener('click', () => {
            console.log(`Botón clickeado: ${procedimiento.cirugia}`);
            clickHandler(procedimiento.id);
        });
        contenedorBotones.appendChild(boton);
    });
}
