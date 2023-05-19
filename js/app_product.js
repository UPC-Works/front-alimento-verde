
function extractDailyData(day) {

 
  let isOpen = document.querySelector(`#${day}-available`).checked;
  const startTime = document.querySelector(`#${day}-start-time`).value;
  const endTime = document.querySelector(`#${day}-end-time`).value;
  const id_owner =localStorage.getItem('userId');
  let id_day = 0;

  if (day=="Lunes"){
    id_day=1
  }
  if (day=="Martes"){
    id_day=2
  }
  if (day=="Miercoles"){
    id_day=3
  }
  if (day=="Jueves"){
    id_day=4
  }
  if (day=="Viernes"){
    id_day=5
  }
  if (day=="Sabado"){
    id_day=6
  }
  if (day=="Domingo"){
    id_day=7
  }

  return {
    id_owner:id_owner,
    id_day: id_day,
    start_hour: startTime,
    end_hour: endTime,
    available: isOpen
  };
};

//Enviar los datos del horarios
async function sendWeeklyData() {
  const daysOfWeek = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];

  for (const day of daysOfWeek) {
    const dailyData = extractDailyData(day);

    console.log("----->",dailyData)

    try {
      const response = await fetch('http://localhost:8000/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dailyData)
      });

      if (!response.ok) {
        throw new Error(`Error sending data for ${day}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
};

//Enviar los datos de la ubicación
async function sendLocation() {
  try {
    const response = await fetch('http://localhost:8000/user/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({id:localStorage.getItem('userId'),latitude: document.querySelector(`#latitude`).value, longitude: document.querySelector(`#longitude`).value })
    });
   
    if (!response.ok) {
      throw new Error(`Error sending data for location`);
    }

    localStorage.setItem('userLatitude', document.querySelector(`#latitude`).value);
    localStorage.setItem('userLongitude', document.querySelector(`#longitude`).value);

  } catch (error) {
    console.error('Error:', error);
  }
}

//Agregar las etiquetas
function addTag(tagValue) {
  const tagContainer = document.getElementById("tagsContainer");

  // Crear el elemento de la etiqueta y establecer su contenido
  const tagElement = document.createElement("span");
  tagElement.classList.add("tag");
  tagElement.textContent = tagValue;

  // Crear el botón de eliminar y añadir el evento click para eliminar la etiqueta
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-button");
  deleteButton.textContent = "X";
  deleteButton.addEventListener("click", () => {
    tagContainer.removeChild(tagElement);
    tagContainer.removeChild(deleteButton);
  });

  // Agregar la etiqueta y el botón de eliminar al contenedor
  tagContainer.appendChild(tagElement);
  tagContainer.appendChild(deleteButton);
}

//Obtener las etiquetas del contenedor de etiquetas y convertirlas en una lista de JSON
function getTagsJson() {
  const tags = [];
  const tagElements = document.querySelectorAll("#tagsContainer .tag");
  tagElements.forEach((tagElement) => {
    tags.push({ tag: tagElement.textContent });
  });
  return tags;
}

//Enviar los datos de del producot
async function sendProduct() {
  
  const productName = document.getElementById("productName").value;
  const productDescription = document.getElementById("productDescription").value;
  const productStock = document.getElementById("productStock").value;
  const productPrice = document.getElementById("productPrice").value;
  const productDiscountPrice = document.getElementById("productDiscountPrice").value;
  const productImage = document.getElementById("productImage").files[0];
  const productTags = getTagsJson();

  // Crear FormData y agregar el archivo de imagen
  const formData = new FormData();
  formData.append("image", productImage);
  

  // Enviar la imagen a la API usando post
  const imageResponse = await fetch("http://localhost:8000/product/upload", {
    method: "POST",
    body: formData,
  });

  const imageUrl = await imageResponse.json();

  // Enviar los datos del producto a la API usando POST
  const productData = {
    name: productName,
    id_owner:localStorage.getItem('userId'),
    description: productDescription,
    image: imageUrl.message,
    label: productTags,
    stock:productStock,
    price:productPrice,
    discount_price:productDiscountPrice,
  };

  // Enviar los datos a crear el producto
  const response = await fetch("http://localhost:8000/product", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  });

  if (response.ok) {

    Swal.fire({
      icon: 'success',
      title: 'Producto creado exitosamente',
      showConfirmButton: false,
      timer: 1500
    })

  } else {
    Swal.fire({
      icon: 'error',
      title: 'Error al guardar el producto',
      showConfirmButton: false,
      timer: 1500
    })
  }
}

// Función para eliminar producto
async function fetchEliminarProduct(id='',name='') {
  try {
    await fetch("http://localhost:8000/product/"+id, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
     });
     Swal.fire({
      icon: 'success',
      title: 'Producto '+name+' eliminado exitosamente',
      showConfirmButton: false,
      timer: 1500
    })    
  } catch (error) {
    console.error('Error al obtener la lista de productos:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error al eliminar el producto',
      showConfirmButton: false,
      timer: 1500
    })
  }
}

// Función para editar producto
async function editProduct() {
  document.getElementById('product-title').textContent="Editar Producto";
  document.getElementById('productoOverlay').style.display = 'flex';
  document.getElementById('productoOverlay').style.flexDirection ='column';
  document.getElementById('editProductBtn').style.display = 'block';
  document.getElementById('saveProductBtn').style.display = 'none';
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

    // Botón Eliminar
    const deleteBtn = document.createElement("button");
    deleteBtn.id = `delete-product-button-${product.id}`;
    deleteBtn.textContent = "Eliminar";
    deleteBtn.classList.add("action-button-eliminar");
    actionContainer.appendChild(deleteBtn);

    // Botón Editar
    const editBtn = document.createElement("button");
    editBtn.id = `edit-product-button-${product.id}`;
    editBtn.textContent = "Editar";
    editBtn.classList.add("action-button-editar");
    actionContainer.appendChild(editBtn);

    productList.appendChild(actionContainer);

    // Agrega una línea divisoria después de cada producto, excepto el último
    if (products.indexOf(product) !== products.length - 1) {
      const divider = document.createElement("hr");
      divider.className = 'hr';
      productList.appendChild(divider);
    }

    // Eliminar producto
    deleteBtn.addEventListener("click", () => {
      fetchEliminarProduct(product.id,product.name);
      location.reload();
    });

    // Editar producto
    editBtn.addEventListener("click", () => {
      editProduct(product.id,product.name);
    });

});}

// Función para obtener la lista de productos del servidor
async function fetchProducts(name='') {
  try {
      const url = new URL('http://localhost:8000/product/'+localStorage.getItem('userId'));
      url.searchParams.append('name', name);
      url.searchParams.append('type_user', 1);
      const response = await fetch(url);
      
      const products = await response.json();
      displayProducts(products.message);
  } catch (error) {
      console.error('Error al obtener la lista de productos:', error);
  }
}

// Función para obtener la lista de productos filtradas por nombres del servidor
async function fetchProductsFiltered(searchTerm) {
  try {
    const response = await fetch(`http://localhost:8000/product/`+localStorage.getItem('userId')+"?name="+searchTerm);
    const products = await response.json();
  
    //Limpiamos la lista para mostrar la nueva lista
    const productList = document.getElementById("productList");
    productList.innerHTML = '';

    //Mostramos la lista filtrada
    displayProducts(products.message);
  
  } catch (error) {
      console.error('Error al obtener la lista de productos:', error);
  }
}


//DOM
document.addEventListener('DOMContentLoaded', () => {

  //Llama a la función para obtener la lista de productos del servidor
  fetchProducts(document.getElementById('search-input').value);
  
  //Filtrar busqueda
  document.getElementById("searchButton").addEventListener("click", () => {
    const searchInput = document.getElementById('search-input').value;
    fetchProductsFiltered(searchInput);
  });

  // Escucha el evento de click en el botón "Editar horario"
  document.querySelector('#editHoursOption').addEventListener('click', () => {
    console.log('Editar horario clickeado');
    document.querySelector('#hoursOverlay').style.display = 'block';
  });

  // Escucha el evento de click en el botón "CANCELAR" de "Editar horario"
  document.querySelector('#cancelHours').addEventListener('click', () => {
    console.log('Cancelar clickeado');
    document.querySelector('#hoursOverlay').style.display = 'none';
  });

  // Subir el formulario
  document.querySelector('#hoursForm').addEventListener('submit', (e) => {
    e.preventDefault();
    // Aquí puedes añadir el código para enviar los datos del formulario
  });

  //Cambiar el available de un horario
  const availableCheckboxes = document.querySelectorAll('.available');
  availableCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', (e) => {
      const startTime = e.target.nextElementSibling;
      const endTime = startTime.nextElementSibling;
  
      if (e.target.checked) {
        startTime.disabled = false;
        endTime.disabled = false;
      } else {
        startTime.disabled = true;
        endTime.disabled = true;
      }
    });
  });
  
  // Llama a la función sendWeeklyData cuando se haga clic en el botón "GUARDAR"
  document.querySelector('#saveHours').addEventListener('click', () => {
    sendWeeklyData()
    document.querySelector('#hoursOverlay').style.display = 'none';
    Swal.fire({
      icon: 'success',
      title: 'Guardado exitosamente',
      showConfirmButton: false,
      timer: 1500
    })
  })

  // Escucha el evento de click en el botón "Editar ubicacion"
  document.querySelector('#editLocationOption').addEventListener('click', () => {
    document.querySelector('#ubicacionOverlay').style.display = 'flex';
  });

  // Escucha el evento de click en el botón "CANCELAR" de "Editar ubicacion"
  document.querySelector('#cancelLocation').addEventListener('click', () => {
    document.querySelector('#ubicacionOverlay').style.display = 'none';
  });

  // Llama a la función sendLocation cuando se haga clic en el botón "GUARDAR"
  document.querySelector('#saveLocation').addEventListener('click', () => {
    sendLocation()
    document.querySelector('#ubicacionOverlay').style.display = 'none';
    Swal.fire({
      icon: 'success',
      title: 'Guardado exitosamente',
      showConfirmButton: false,
      timer: 1500
    })
  })  

  // Mostrar el formulario de producto
  document.getElementById('add-product-button').addEventListener('click', () => {
    document.getElementById('product-title').textContent="Nuevo Producto";
    document.getElementById('editProductBtn').style.display = 'none';
    document.getElementById('saveProductBtn').style.display = 'in-block';
    document.getElementById('productoOverlay').style.display = 'flex';
    document.getElementById('productoOverlay').style.flexDirection ='column'
  });

  // Ocultar el formulario de producto
  document.getElementById('cancelProductBtn').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('productoOverlay').style.display = 'none';
  });

  // Añadir etiqueta
  document.getElementById('addTagBtn').addEventListener('click', () => {
    const tagValue = prompt("Ingrese el valor de la etiqueta:");
    if (tagValue) {
      addTag(tagValue);
    }
  });

  // Enviar el formulario de producto
  document.querySelector('#saveProductBtn').addEventListener('click', (e) => {
    e.preventDefault();
    sendProduct();
    // Limpiar el formulario después de guardar los datos
    document.getElementById('productName').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productImage').value = '';
    document.getElementById('productStock').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productDiscountPrice').value = '';

    // Limpiar la sección de etiquetas
    let tagsContainer = document.getElementById('tagsContainer');
    while (tagsContainer.firstChild) {
        tagsContainer.removeChild(tagsContainer.firstChild);
    }
  });

  //Cerrar sesion
  document.getElementById('logout-button').addEventListener('click', () => {
    window.location.href = 'index.html';
    alert("Sesión cerrada");
  });

});



