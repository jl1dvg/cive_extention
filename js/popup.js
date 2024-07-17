import { cargarExamenes } from './examenes.js';
import { cargarProtocolos } from './procedimientos.js';

document.addEventListener("DOMContentLoaded", () => {
    // Asignar eventos de click a los botones independientemente
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

    document.getElementById('btnBackExamenes').addEventListener('click', () => {
        console.log('Botón Back Exámenes clickeado');
        mostrarSeccion('inicio');
    });

    document.getElementById('btnBackProtocolos').addEventListener('click', () => {
        console.log('Botón Back Protocolos clickeado');
        mostrarSeccion('inicio');
    });

    document.getElementById('btnAceptarOD_OI').addEventListener('click', () => {
        const OD = document.getElementById('inputOD').value;
        const OI = document.getElementById('inputOI').value;
        // Aquí puedes realizar las acciones necesarias con los valores de OD y OI
        console.log(`OD: ${OD}, OI: ${OI}`);
        mostrarSeccion('inicio');
    });
});

function mostrarSeccion(seccionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(seccionId).classList.add('active');
    console.log(`Sección mostrada: ${seccionId}`);
}
