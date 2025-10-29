// Initialize the map
var map = L.map('map').setView([50.846, 4.35], 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Load and parse CSV data
loadCsvData();

const ElementEmojiDict = {
    'Building': '🏢',
    'Gare': '🚉',
    'Vehicle': '🚋',
    'Restaurant': '🍽️',
    'Hopital': '🏥'
};

async function loadCsvData() {
    try {
        const response = await fetch('./Book1.csv');
        const csvText = await response.text();
        const parsedData = parseCsvData(csvText);
        
        // Display markers for each data point
        parsedData.forEach(item => {
            console.log('Item data:', item); // Debug log
            console.log('Raw type value:', JSON.stringify(item.type)); // Debug the exact type value
            
            // Clean the type value and compare
            const cleanType = item.type ? item.type.trim() : '';
            const markerColor = cleanType === 'Building' ? 'red' : 'blue';
            
            console.log('Clean type:', cleanType, 'Marker color:', markerColor); // Debug log
            initMarker(
                item.lat, 
                item.long, 
                item.name, 
                item.co2,
                item.temp,
                item.occupancyrate,
                markerColor,
                cleanType,
                item.wagons // pass wagons (may be undefined)
            );
        });
        
        // Update information section
        updateInfoSection(parsedData);
        
    } catch (error) {
        console.error('Error loading CSV data:', error);
    }
}
function getOccupancyColor(rate) {
  const r = Math.max(0, Math.min(100, Number(rate) || 0)); 
  const hue = 120 - (r * 1.2); 
  return `hsl(${hue}deg 75% 45%)`;
}

//marker init with custom colors
function initMarker(lat, lon, areaName, co2, temp, occupancyRate, color, type, wagons) {
    console.log('Creating marker with color:', color, 'for type:', type); // Debug log
    const occupancyColor = getOccupancyColor(occupancyRate);
    const emoji = ElementEmojiDict[type] || '❓';

    var customIcon = L.divIcon({
        className: 'custom-marker-pin',
        html: `<div class="pin" style="--pin-color: ${occupancyColor};">
                 <span class="emoji">${emoji}</span>
               </div>`,
        iconSize: [36, 46],
        iconAnchor: [18, 46],
        popupAnchor: [0, -40]
    });

    var newMarker = L.marker([lat, lon], {icon: customIcon}).addTo(map);
    
    // Build popup content: for Vehicle show wagons, otherwise show gauge
    let innerHtml = '';
    if ((type || '').toLowerCase() === 'vehicle' && Array.isArray(wagons) && wagons.length > 0) {
        const wagonBoxes = wagons.map((v, idx) => {
            const val = Number(v) || 0;
            const c = getOccupancyColor(val);
            return `
              <div class="wagon-item" style="background:${c};">
                <div class="wagon-icon">🚋</div>
                <div class="wagon-occupancy">${val}%</div>
              </div>
            `;
        }).join('');
        innerHtml = `
          <div class="wagons-container">
            <div class="wagons-label"><strong>Wagons:</strong></div>
            <div class="wagons-list">
              ${wagonBoxes}
            </div>
          </div>
        `;
    } else {
        innerHtml = `
          <div class="gauge" style="width: 200px; --rotation: ${ (Number(occupancyRate)||0) * 1.8 }deg; --color:${occupancyColor}; --background:#e9ecef;">
            <div class="percentage"></div>
            <div class="mask"></div>
            <span class="value"> <strong>Occupancy</strong></span>
          </div>
        `;
    }

    var cardContent = `
      <div class="area-card">
        <h3>${areaName}</h3>
        <div class="card-info">
          <p><strong>CO2:</strong> ${co2} ppm</p>
          <p><strong>Temperature:</strong> ${temp}°C</p>
          ${innerHtml}
          <p><strong>Type:</strong> ${type}</p>
        </div>
      </div>
    `;
    newMarker.bindPopup(cardContent);
    
    newMarker.on('click', function() {
        newMarker.openPopup();
        updateStatusSection(areaName, type, occupancyRate);
    });
    
    // Store marker data for filtering (include wagons)
    allMarkers.push({
        marker: newMarker,
        lat: lat,
        long: lon,
        name: areaName,
        type: type,
        occupancyRate: occupancyRate,
        wagons: wagons
    });
}

function parseCsvData(csvData) {
    const lines = csvData.trim().split('\n');
    const result = [];
    const headers = lines[0].split(';').map(h => h.toLowerCase().trim());
    console.log('CSV Headers:', headers); // Debug log

    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue; // Skip empty lines
        
        const currentLine = lines[i].split(';');
        const obj = {};

        for (let j = 0; j < headers.length; j++) {
            const header = headers[j];
            let value = currentLine[j] ? currentLine[j].trim() : '';
            
            // Parse numeric values and handle decimal commas
            if (header === 'lat' || header === 'long') {
                obj[header] = parseFloat(value.replace(',', '.'));
            } else if (header === 'co2' || header === 'occupancyrate' || header === 'id') {
                obj[header] = value === '' ? null : parseInt(value);
            } else if (header === 'temp') {
                obj[header] = value === '' ? null : parseFloat(value.replace(',', '.'));
            } else if (header === 'wagonsoccupancylist') {
                // Parse wagons list from JSON or comma-separated values
                let wagons = undefined;
                if (value) {
                    try {
                        // Try JSON parse: [20,47,38,79]
                        wagons = JSON.parse(value.replace(/,\s+/g, ','));
                        if (!Array.isArray(wagons)) wagons = undefined;
                    } catch (e) {
                        // Fallback: extract numbers
                        const nums = value.match(/-?\d+(\.\d+)?/g);
                        if (nums) wagons = nums.map(n => Number(n));
                    }
                }
                obj.wagons = wagons;
            } else {
                obj[header] = value;
            }
        }

        console.log('Parsed object:', obj); // Debug log
        result.push(obj);
    }
    return result;
}



// Update information section in sidebar
function updateInfoSection(data) {
    const totalDevices = data.length;
    const connectedDevices = data.filter(item => item.occupancyrate > 0).length;
    
    document.getElementById('infoContent').innerHTML = 
        `${connectedDevices} devices connected / ${totalDevices} total devices`;
}

// Update status section when marker is clicked
function updateStatusSection(name, type, occupancyRate) {
    document.getElementById('statusContent').innerHTML = 
        `Selected: <strong>${name}</strong><br>Type: ${type}<br>Occupancy: ${occupancyRate}%`;
}

// Store all markers for filtering
let allMarkers = [];

// Add filter functionality
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('vehicleButton').addEventListener('click', function() {
        filterMarkers('Vehicle');
    });

    document.getElementById('buildingButton').addEventListener('click', function() {
        filterMarkers('Building');
    });

    document.getElementById('hopitalButton').addEventListener('click', function() {
        filterMarkers('Hopital');
    });
    document.getElementById('restaurantButton').addEventListener('click', function() {
        filterMarkers('Restaurant');
    });

    document.getElementById('allButton').addEventListener('click', function() {
        showAllMarkers();
    });
    
    document.getElementById('searchButton').addEventListener('click', function() {
        searchLocation();
    });
    
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchLocation();
        }
    });
});

function filterMarkers(type) {
    allMarkers.forEach(markerData => {
        if (markerData.type === type) {
            markerData.marker.addTo(map);
        } else {
            map.removeLayer(markerData.marker);
        }
    });
}

function showAllMarkers() {
    allMarkers.forEach(markerData => {
        markerData.marker.addTo(map);
    });
}

function searchLocation() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const found = allMarkers.find(markerData => 
        markerData.name.toLowerCase().includes(searchTerm)
    );
    
    if (found) {
        map.setView([found.lat, found.long], 20);
        found.marker.openPopup();
        updateStatusSection(found.name, found.type, found.occupancyRate);
    } else {
        alert('Location not found!');
    }
}
