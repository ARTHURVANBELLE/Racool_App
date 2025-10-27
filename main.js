
// Initialize the map
var map = L.map('map').setView([51.505, -0.09], 18);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Load and parse CSV data
loadCsvData();

async function loadCsvData() {
    try {
        const response = await fetch('/Book1.csv');
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
                cleanType
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
function initMarker(lat, lon, areaName, co2, temp, occupancyRate, color, type) {
    console.log('Creating marker with color:', color, 'for type:', type); // Debug log
    // Create custom icon based on type with green outer circle
    var customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-icon ${color}-marker"></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
    
    var newMarker = L.marker([lat, lon], {icon: customIcon}).addTo(map);
    const occupancyColor = getOccupancyColor(occupancyRate);
    
    // Bind popup content once when marker is created
    var cardContent = `
      <div class="area-card">
        <h3>${areaName}</h3>
        <div class="card-info">
          <p><strong>CO2:</strong> ${co2} ppm</p>
          <p><strong>Temperature:</strong> ${temp}°C</p>
          <div class="gauge" style="width: 200px; --rotation: ${occupancyRate*1.8}deg; --color:${occupancyColor}; --background:#e9ecef;">
            <div class="percentage"></div>
            <div class="mask"></div>
            <span class="value"> <strong>Occupancy</strong></span>
          </div>
          <p><strong>Type:</strong> ${type}</p>
        </div>
      </div>
    `;
    newMarker.bindPopup(cardContent);
    
    newMarker.on('click', function() {
        newMarker.openPopup(); // Just open the already bound popup
        updateStatusSection(areaName, type, occupancyRate);
    });
    
    // Store marker data for filtering
    allMarkers.push({
        marker: newMarker,
        lat: lat,
        long: lon,
        name: areaName,
        type: type,
        occupancyRate: occupancyRate // This parameter comes correctly from the function call
    });
}

function parseCsvData(csvData) {
    const lines = csvData.trim().split('\n');
    const result = [];
    const headers = lines[0].split(';');
    console.log('CSV Headers:', headers); // Debug log

    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue; // Skip empty lines
        
        const currentLine = lines[i].split(';');
        const obj = {};

        for (let j = 0; j < headers.length; j++) {
            const header = headers[j].toLowerCase().trim(); // Added trim() to remove any whitespace
            let value = currentLine[j] ? currentLine[j].trim() : ''; // Trim all values
            
            // Parse numeric values and handle decimal commas
            if (header === 'lat' || header === 'long') {
                obj[header] = parseFloat(value);
            } else if (header === 'co2' || header === 'occupancyrate') {
                obj[header] = parseInt(value);
            } else if (header === 'temp') {
                obj[header] = parseFloat(value.replace(',', '.'));
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
    document.getElementById('startButton').addEventListener('click', function() {
        filterMarkers('Vehicle');
    });
    
    document.getElementById('stopButton').addEventListener('click', function() {
        filterMarkers('Building');
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
