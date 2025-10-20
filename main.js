
// Initialize the map
var map = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
maxZoom: 19,
attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Initialize marker
var marker = L.marker([51.5, -0.09]).addTo(map);
marker.on('click', function() {
    areaCard(marker, "Quick test", "Some basic infos about this area whatever Bastien wants", 75);
});

//Pop up that opens when we click on a marker. 
function areaCard(marker, areaName, areaInfo, occupencyRate) {
    var cardContent = '<div class="area-card">' +
                      '<h3>' + areaName + '</h3>' +
                      '<p>' + areaInfo + '</p>' +
                      '<p>Occupancy Rate: ' + occupencyRate + '%</p>' +
                      '</div>';
    marker.bindPopup(cardContent);
}
