
let map;


function generateContent(business) {
  // Primero generas el título
  let contentString = `<div id="content">
                        <h3 id="firstHeading" class="firstHeading">${business.full_name}</h3>
                        <div id="bodyContent">`;

  // Mostraremos el estado
  if (business.status==true) {
    contentString+= `<p class="statusOpen">Abierto</p>`;
  }else{
    contentString+=  `<p class="statusClose">Cerrado</p>`;
  }

  // Agregamos el boton Ver Negocio
  contentString+=  `<button id="business-button" class="verNegocio">Ver Negocio</button>`;

  // Finalmente cierras los divs y retornas la cadena
  contentString += `</div></div>`;
  return contentString;
}


// Display de la lista de productos
function displayProducts(products) {
  const productList = document.getElementById('productList');

  products.forEach(product => {

    // Crea un contenedor para el producto
    let productCard = document.createElement('div');
    productCard.className = 'container-product';

    let productCardBody = document.createElement('div');
    productCardBody.className = 'container-product-body';

    // Agrega la imagen del producto
    let productImage = document.createElement('img');
    productImage.src = product.image; // Asume que la URL de la imagen está en el campo 'image'
    productImage.className = 'card-img-top mb-3';
    productCardBody.appendChild(productImage);

    // Agrega el nombre del producto
    let productName = document.createElement('h3');
    productName.innerText = product.name;
    productName.className = 'card-title';
    productCardBody.appendChild(productName);

    // Agrega el stock del producto
    let productStock = document.createElement('h4');
    productStock.innerText = "Stock: "+product.stock;
    productStock.className = 'card-description-stock';
    productCardBody.appendChild(productStock);

    if (product.price==0){
      // Agrega la precio del producto
      let productPrice = document.createElement('span');
      productPrice.innerText = "S/."+product.price;
      productPrice.className = 'card-price';
      productCardBody.appendChild(productPrice);
    }else{
      // Agrega la precio del producto
      let productPrice = document.createElement('del');
      productPrice.innerText = "S/."+product.price;
      productPrice.className = 'card-price';
      productCardBody.appendChild(productPrice);
    }

    if (product.discount_price>0){
      // Agrega la precio descontado del producto
      let productPriceDiscounted = document.createElement('span');
      productPriceDiscounted.innerText = "S/."+(product.price-product.discount_price);
      productPriceDiscounted.className = 'card-price-discounted';
      productCardBody.appendChild(productPriceDiscounted);
    }

    if (product.discount_price>0){
      // Agrega el porcentaje descontado del producto
      let productPercentageDiscounted = document.createElement('span');
      productPercentageDiscounted.innerText = Math.round(product.discount_price/product.price*-100)+"%";
      productPercentageDiscounted.className = 'card-percentage-discount';
      productCardBody.appendChild(productPercentageDiscounted);
    }

    // Agrega la descripción del producto
    let productDescription = document.createElement('span');
    productDescription.innerText = product.description;
    productDescription.className = 'card-description';
    productCardBody.appendChild(productDescription);

    // Agrega las etiquetas del producto
    let tagsContainer = document.createElement('div');
    tagsContainer.classList.add("tag-container");
    product.label.forEach(tag => {
        let tagChip = document.createElement('span');
        tagChip.innerText = tag.tag; // Asume que el nombre de la etiqueta está en el campo 'name'
        tagChip.className = 'tag-badge';
        tagsContainer.appendChild(tagChip);
    });
    productCardBody.appendChild(tagsContainer);

    // Agrega el producto al contenedor principal
    productCardBody.appendChild
    productCard.appendChild(productCardBody);
    productList.appendChild(productCard);

    // Contenedor de acciones
    const actionContainer = document.createElement("div");
    actionContainer.classList.add("action-container");

    // Botón Solicitar
    // const deleteBtn = document.createElement("button");
    // deleteBtn.id = `delete-product-button-${product.id}`;
    // deleteBtn.textContent = "Eliminar";
    // deleteBtn.classList.add("action-button-eliminar");
    // actionContainer.appendChild(deleteBtn);

    productList.appendChild(actionContainer);

    // Agrega una línea divisoria después de cada producto, excepto el último
    if (products.indexOf(product) !== products.length - 1) {
      const divider = document.createElement("hr");
      divider.className = 'hr';
      productList.appendChild(divider);
    }

    // Solicitar producto
    // deleteBtn.addEventListener("click", () => {
    //   fetchEliminarProduct(product.id,product.name);
    //   location.reload();
    // });

});}

// Función para obtener la lista de productos del servidor
async function fetchProducts(business_id) {
  try {
      const url = new URL('http://localhost:8000/product/'+business_id);
      url.searchParams.append('name', '');
      url.searchParams.append('type_user', 2);
      const response = await fetch(url);
      
      const products = await response.json();
      displayProducts(products.message);
  } catch (error) {
      console.error('Error al obtener la lista de productos:', error);
  }
}

function displayNearbyBusinesses(businesses) {
  // Crear un marcador para cada negocio y agregarlo al mapa
  businesses.forEach((business) => {
    const marker = new google.maps.Marker({
      position: { lat: business.latitude, lng: business.longitude },
      map: map,
      icon: {
        url: "./assets/restaurant.png",
        scaledSize: new google.maps.Size(30, 30),
      },
      title: business.name,
    });


    // Crear un InfoWindow para mostrar información del negocio
    const infoWindow = new google.maps.InfoWindow({
      content: generateContent(business)
    });

    // Agregar un evento de clic al marcador para mostrar el InfoWindow
    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });

    // Abrir detalle del negocio
    google.maps.event.addListener(infoWindow, 'domready', function() {
      let businessButton = document.getElementById('business-button');
      businessButton.addEventListener('click', function() {
          let productList = document.getElementById('productList');
  
          // Limpia el contenido anterior del productList
          productList.innerHTML = '';
          
                  
          //Llama a la función para obtener la lista de productos del servidor
          fetchProducts(business.id);
          
          // Muestra la lista de productos
          productList.classList.remove('productListHidden');
          productList.classList.add('productListShown');
      });
  
      let closeButton = document.getElementById('closeButton');
      closeButton.addEventListener('click', function() {
          let productList = document.getElementById('productList');
          productList.classList.remove('productListShown');
          productList.classList.add('productListHidden');
      });
    });
  
  
  });
}

//Mostrar mi ubicación
function showMyLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const myLatLng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        console.log(myLatLng);

        const myMarker = new google.maps.Marker({
          position: {lat: position.coords.latitude,lng: position.coords.longitude},
          map: map,
          title: localStorage.getItem('userName'),
          icon: {
            scaledSize: new google.maps.Size(30, 30),
          },
        });
      },
      () => {
        Swal.fire({
          icon: 'error',
          title: 'Error al mostrar mi ubicación',
          showConfirmButton: false,
          timer: 1500
        });
      }
    );
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Error al mostrar mi ubicación',
      showConfirmButton: false,
      timer: 1500
    });
  }
}

function initMap() {
  const simpleStyle = [
    {
      "featureType": "all",
      "elementType": "all",
      "stylers": [
        { "saturation": -50 },
        { "lightness": 25 }
      ]
    },
    {
      "featureType": "poi.business",
      "elementType": "all",
      "stylers": [
        { "visibility": "off" }
      ]
    }
  ];

  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const center = { lat, lng };

    map = new google.maps.Map(document.getElementById("map"), {
      center: center,
      zoom: 15,
      styles: simpleStyle
    });

    const response = await fetch("http://localhost:8000/user");
    const data = await response.json();
    displayNearbyBusinesses(data.message);  
  });
}


//DOM
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  showMyLocation();
})
