/* chart-utils.js - FitCoach Pro Charting Utilities */

// Configuration des couleurs du Design System
export const chartColors = {
    primary: '#ccff00',   // Vert Citron
    secondary: '#ff4400', // Orange Vif
    blue: '#00ccff',      // Bleu Cyan
    text: '#888888',      // Gris Texte
    grid: 'rgba(255, 255, 255, 0.05)', // Grille subtile
    background: '#1a1a1a', // Fond Card
    tooltipBg: 'rgba(26, 26, 26, 0.9)'
};

// Configuration globale par défaut pour Chart.js
if (typeof Chart !== 'undefined') {
    Chart.defaults.font.family = "'Roboto', sans-serif";
    Chart.defaults.color = chartColors.text;
    Chart.defaults.scale.grid.color = chartColors.grid;
}

/**
 * Crée un graphique linéaire de progression (Poids, Max Reps, etc.)
 * @param {HTMLCanvasElement} canvas - L'élément canvas du DOM
 * @param {Array<string>} labels - Les étiquettes (ex: Dates)
 * @param {Array<number>} data - Les valeurs
 * @param {string} label - Le nom de la série de données
 * @param {string} colorHex - La couleur principale (hex)
 * @returns {Chart} L'instance du graphique
 */
export function createProgressChart(canvas, labels, data, label, colorHex = chartColors.primary) {
    const ctx = canvas.getContext('2d');

    // Création du dégradé vertical
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, hexToRgba(colorHex, 0.5));
    gradient.addColorStop(1, hexToRgba(colorHex, 0));

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                borderColor: colorHex,
                backgroundColor: gradient,
                borderWidth: 3,
                pointBackgroundColor: chartColors.background,
                pointBorderColor: colorHex,
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 7,
                pointHoverBackgroundColor: colorHex,
                pointHoverBorderColor: '#fff',
                fill: true,
                tension: 0.4 // Courbe lissée
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index',
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: chartColors.tooltipBg,
                    titleColor: '#fff',
                    titleFont: { family: "'Oswald', sans-serif", size: 14 },
                    bodyColor: '#ccc',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false, // S'adapte aux valeurs min/max
                    grid: {
                        color: chartColors.grid,
                        drawBorder: false
                    },
                    ticks: {
                        color: chartColors.text,
                        font: { size: 11 }
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: chartColors.text,
                        font: { size: 11 },
                        maxRotation: 45,
                        minRotation: 0
                    }
                }
            }
        }
    });
}

/**
 * Crée un graphique en barres pour l'activité hebdomadaire
 * @param {HTMLCanvasElement} canvas 
 * @param {Array<string>} labels - Jours de la semaine
 * @param {Array<number>} data - Minutes ou Calories
 * @returns {Chart}
 */
export function createActivityChart(canvas, labels, data) {
    const ctx = canvas.getContext('2d');

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Activité',
                data: data,
                backgroundColor: chartColors.primary,
                borderRadius: 5,
                borderSkipped: false,
                barThickness: 20
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: chartColors.tooltipBg,
                    titleFont: { family: "'Oswald', sans-serif" },
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y} min`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: chartColors.grid,
                        drawBorder: false
                    }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

/**
 * Met à jour les données d'un graphique existant
 * @param {Chart} chartInstance 
 * @param {Array<string>} newLabels 
 * @param {Array<number>} newData 
 * @param {string} newLabel (Optionnel)
 * @param {string} newColor (Optionnel)
 */
export function updateChartData(chartInstance, newLabels, newData, newLabel = null, newColor = null) {
    if (!chartInstance) return;

    chartInstance.data.labels = newLabels;
    chartInstance.data.datasets[0].data = newData;

    if (newLabel) {
        chartInstance.data.datasets[0].label = newLabel;
    }

    if (newColor) {
        const ctx = chartInstance.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, hexToRgba(newColor, 0.5));
        gradient.addColorStop(1, hexToRgba(newColor, 0));

        chartInstance.data.datasets[0].borderColor = newColor;
        chartInstance.data.datasets[0].backgroundColor = gradient;
        chartInstance.data.datasets[0].pointBorderColor = newColor;
        chartInstance.data.datasets[0].pointHoverBackgroundColor = newColor;
    }

    chartInstance.update();
}

/**
 * Utilitaire pour convertir HEX en RGBA
 * @param {string} hex 
 * @param {number} alpha 
 * @returns {string}
 */
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}