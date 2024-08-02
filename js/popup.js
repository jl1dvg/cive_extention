import {cargarExamenes} from './examenes.js';
import {cargarProtocolos, ejecutarProtocolos} from './procedimientos.js';
import {ejecutarEnPagina} from './consulta.js'; // Importa la función desde consulta.js

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('btnExamenes').addEventListener('click', () => {
        console.log('Botón Exámenes clickeado');
        mostrarSeccion('examenes');
        cargarExamenes();
    });

    document.getElementById('btnProtocolos').addEventListener('click', () => {
        console.log('Botón Protocolos clickeado');
        mostrarSeccion('protocolos');
        cargarProtocolos();
    });

    document.getElementById('btnConsulta').addEventListener('click', () => {
        console.log('Botón Consulta clickeado');
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.scripting.executeScript({
                target: {tabId: tabs[0].id},
                function: ejecutarEnPagina
            });
        });
    });

    document.getElementById('btnBackExamenes').addEventListener('click', () => {
        console.log('Botón Back Exámenes clickeado');
        mostrarSeccion('inicio');
    });

    document.getElementById('btnBackProtocolos').addEventListener('click', () => {
        console.log('Botón Back Protocolos clickeado');
        mostrarSeccion('inicio');
    });

    document.getElementById('btnBackProcedimientos').addEventListener('click', () => {
        console.log('Botón Back Procedimientos clickeado');
        mostrarSeccion('protocolos');
    });
});

function mostrarSeccion(seccionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(seccionId).classList.add('active');
    console.log(`Sección mostrada: ${seccionId}`);
}

export function mostrarProcedimientosPorCategoria(procedimientos) {
    const contenedorProcedimientos = document.getElementById('contenedorProcedimientos');
    contenedorProcedimientos.innerHTML = ''; // Limpiar el contenedor
    procedimientos.forEach(procedimiento => {
        const col = document.createElement('div');
        col.className = 'col-sm-4'; // Cada botón ocupará un tercio del ancho de la fila
        const boton = document.createElement('button');
        boton.id = `${procedimiento.id}`;
        boton.className = 'btn btn-outline-success btn-sm'; // Estilo de botón y ancho completo
        boton.textContent = `${procedimiento.cirugia}`;
        boton.addEventListener('click', () => {
            console.log(`Botón clickeado: ${procedimiento.cirugia}`);
            ejecutarProtocolos(procedimiento.id); // Ensure this function is called correctly
        });
        col.appendChild(boton);
        contenedorProcedimientos.appendChild(col);
    });
    mostrarSeccion('procedimientos');
}
