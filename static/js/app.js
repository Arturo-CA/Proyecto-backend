const apiUrl = "/gps";

// Crea un mapa en el contenedor "map"
const map = L.map("map").setView([0, 0], 18);

// Utiliza una capa de mapa de OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);
var myIcon = L.icon({
  iconUrl: "../static/resources/marker_p.png",
  shadowUrl: "../static/resources/marker_plant.png",
  iconSize: [38, 95], // size of the icon
  shadowSize: [50, 64], // size of the shadow
  iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
  shadowAnchor: [4, 62], // the same for the shadow
  popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
});
// Objeto para almacenar los marcadores
const markers = {};
const path = [];

// Función para agregar o actualizar un marcador en el mapa
function updateMarker(markerId, latitude, longitude) {
  if (!markers[markerId]) {
    markers[markerId] = L.marker([latitude, longitude], { icon: myIcon }).addTo(
      map
    );
  } else {
    markers[markerId].setLatLng([latitude, longitude, { icon: myIcon }]);
  }
  // Realiza una solicitud de geocodificación inversa para obtener el nombre del lugar
  fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
  )
    .then((response) => response.json())
    .then((data) => {
      const placeName = data.name;
      const distrito = data.address.suburb;
      document.getElementById("place-name").textContent = placeName;
      document.getElementById("distrito").textContent = distrito;
    })
    .catch((error) => {
      console.error("Error al obtener información del lugar:", error);
    });

  const datetimeElement = document.getElementById("datetime");
  const datetime = new Date(); // Usar la fecha y hora actual
  datetimeElement.textContent = datetime.toLocaleString();
  // Actualiza la información de latitud y longitud en el contenedor
  document.getElementById("latitude").textContent = latitude.toFixed(5);
  document.getElementById("longitude").textContent = longitude.toFixed(5);

  // Agrega la ubicación al rastro (path)
  path.push([latitude, longitude]);
  const polyline = L.polyline(path, {
    color: "blue",
    dashArray: "5, 5",
  }).addTo(map);
  polyline.setStyle({
    color: "black",
  });

  // Centra el mapa en la nueva ubicación del marcador
  map.panTo([latitude, longitude]);
}

// Función para eliminar un marcador del mapa
function removeMarker(markerId) {
  if (markers[markerId]) {
    map.removeLayer(markers[markerId]);
    delete markers[markerId];
  }
}

// Función para obtener y mostrar los datos en tiempo real
function fetchData() {
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data.latitude && data.longitude) {
        // Supongamos que recibes un marcador ID en los datos
        const markerId = "ubicacion_actual";
        updateMarker(markerId, data.latitude, data.longitude);
      }
    })
    .catch((error) => {
      console.error("Error al obtener datos:", error);
    });
}

// Llama a la función fetchData() cada 1.5 segundos
setInterval(fetchData, 1500);
