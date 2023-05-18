// Get elements
const cartButton = document.querySelector('.cart-button');
const cartBadge = document.querySelector('.cart-badge');
const modal = document.querySelector('.modal');
const modalClose = document.querySelector('.close');
const buyButton = document.querySelector('.buy-btn');
const cartItemsList = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const itemsGrid = document.querySelector('.items-grid');
const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');


//my get elements
const prevPageButton = document.querySelector('.prev-button');
const nextPageButton = document.querySelector('.next-button');
const pageBadge = document.querySelector('.page-badge');
const pppDropDown = document.getElementById("pppDropdown");
const sbDropDown = document.getElementById("sbDropdown");
const topButton = document.getElementById("myBtn");

var amountOfItemsPerPage = 20;
var currentPage = 1;

var items = [];
let cart = [];

//page button
function goPrevPage(){
    var lastPage = Math.ceil(items.length/amountOfItemsPerPage);
    if(currentPage == 1){
        return;
    }

    if(currentPage == lastPage){
        nextPageButton.classList.remove('disable-button');
        nextPageButton.disabled = false;

    }

    currentPage--;
    fillPokemonsPage();
    

    if(currentPage== 1){
        prevPageButton.classList.add('disable-button');
        prevPageButton.disabled = true;

    }

}
function goNextPage(){
    var lastPage = Math.ceil(items.length/amountOfItemsPerPage);
    if(currentPage == lastPage){
        return;
    }


    if(currentPage == 1){
        prevPageButton.classList.remove('disable-button');
        prevPageButton.disabled = false;

    }

    currentPage++;
    fillPokemonsPage();

    if(currentPage == lastPage){
        nextPageButton.classList.add('disable-button');
        nextPageButton.disabled = true;

    }

}
function disablePageButtons(){
    prevPageButton.removeEventListener('click', goPrevPage);
    nextPageButton.removeEventListener('click', goNextPage);
}
function enablePageButtons(){
    prevPageButton.addEventListener('click', goPrevPage);
    nextPageButton.addEventListener('click', goNextPage);
}

//dropdown control
pppDropDown.addEventListener('change', () => {
    var lastPage = Math.ceil(items.length/amountOfItemsPerPage);

    if(currentPage== 1){
        prevPageButton.classList.remove('disable-button');
        prevPageButton.disabled = false;
    }
    if(currentPage == lastPage){
        nextPageButton.classList.remove('disable-button');
        nextPageButton.disabled = false;
    }

    var prevAmount = amountOfItemsPerPage;
    amountOfItemsPerPage = pppDropDown.value;    
    
    
    currentPage = Math.floor(1 + ( (currentPage-1)*prevAmount/amountOfItemsPerPage));
    
    if(currentPage== 1){
        prevPageButton.classList.add('disable-button');
        prevPageButton.disabled = true;
    }
    if(currentPage == lastPage){
        nextPageButton.classList.add('disable-button');
        nextPageButton.disabled = true;
    }

     
    fillPokemonsPage();

});
sbDropDown.addEventListener('change', () => {
    items.sort((a,b) => a.id > b.id ? 1 : -1);

    if(sbDropDown.value == "name")
        items.sort((a,b) => a[sbDropDown.value] > b[sbDropDown.value] ? 1 : -1);
    else
        items.sort((a,b) => a[sbDropDown.value] - b[sbDropDown.value]);
    
    fillPokemonsPage();

});

//API GET call
function fetchPokemon(){

    const promises = [];
    for (let i = 1; i <= 905; i++) {
        const url = `https://pokeapi.co/api/v2/pokemon/${i}`;
        promises.push(fetch(url).then((res) => res.json()));
    }
    Promise.all(promises).then((results) => {

        const pokemons = results.map((result) => ({
            name: formatName(result.name),
            image: result.sprites.other['official-artwork'].front_default,
            type: result.types.map((type) => type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1)),
            formCount: result.forms.length,
            value: (result.stats.map((stat) => stat.base_stat).reduce((a, b) => a + b)/result.stats.length).toFixed(2),
            id: result.id,
        })).sort((a, b) => a.id > b.id ? 1 : -1);

        items = pokemons;
        fillPokemonsPage();
        enablePageButtons();
    });
};
fetchPokemon();



// Fill Pokemons
function fillPokemonsAll() {
    for (const item of items) {
        let itemElement = document.createElement('div');
        itemElement.classList.add('item');
        itemElement.id = item.id.toString();
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" loading="lazy">
            <h2 style="text-align:center">${item.name}</h2>
            <p>$${item.value}</p>
            <button class="add-to-cart-btn" data-id="${item.id}">Add to cart</button>
        `;
        itemsGrid.appendChild(itemElement);
    }
}
function fillPokemonsPage() {
    itemsGrid.innerHTML = "";
    pageBadge.textContent = currentPage;

    var pokemonsToShow = currentPage*amountOfItemsPerPage <= items.length ? 
        amountOfItemsPerPage : 
        items.length - (currentPage-1)*amountOfItemsPerPage;

    for(let step = 0; step<pokemonsToShow; step++ ){
        item = items[step+(amountOfItemsPerPage*(currentPage-1))];
        createPokemon(item);
    }


}
function createPokemon(item){
    let itemElement = document.createElement('div');
        itemElement.classList.add('item');
        itemElement.id = item.id.toString();
        var imagePath = findBackgroundImage(item.type);
        console.log(imagePath);
        itemElement.innerHTML = `
            <gimg style="background-image:${imagePath};">
                <img src="${item.image}" alt="${item.name}" loading="lazy" class="pokemon-image">
            </gimg>
            <h2 style="text-align:center">${item.name}</h2>
            <p>ID: ${item.id}</p>
            <p>Type: ${item.type.join(', ')}</p>
            <p>$${item.value}</p>
            <button class="add-to-cart-btn blue-hover-btn" data-id="${item.id}" onclick="addToCart(this);">Add to cart</button>
        `;
        itemsGrid.appendChild(itemElement);
}



//cart control
function addToCart(button){
    var item = items.find((el) => el.id == button.getAttribute('data-id'));
    
    var found = cart.find((el) => el.pokemon.id == button.getAttribute('data-id'));
    if(found){
        found.quantity++;
        
    }
    else{
        cart.push({pokemon: item, quantity: 1});
        cart.sort( (a,b) => a.pokemon.id > a.pokemon.id ? 1 : -1 );
    }
    
    updateCartList();
    

}
function removeFromCart(button){
    var found = cart.find((el) => el.pokemon.id == button.getAttribute('data-id'));

    found.quantity--;
    if(found.quantity<=0){
        cart.splice(cart.indexOf(found) ,1);
    }

    updateCartList();

}
function updateCartList(){
    cartItemsList.innerHTML = "";
    if(cart.length<=0){
        cartTotal.textContent = "$0.00";
        cartBadge.textContent = "0";
        return;
    }

    var image = document.createElement('img');
    image.src = "images/thinLineSeperator.png";
    cartItemsList.appendChild(image);

    var totalCost = 0;
    var totalItems = 0;
    cart.forEach( (item) => {
        let itemElement = document.createElement('li');
    
        itemElement.classList.add('cart-items');
        itemElement.id = item.pokemon.id.toString();
        itemElement.innerHTML = `
            <p class="name">${item.pokemon.name}</p>
            <p>Quantity: ${item.quantity}</p>
            <button class="cart-items-btn" data-id="${item.pokemon.id}" onclick="removeFromCart(this);">Remove</button>       
        `;
        cartItemsList.appendChild(itemElement);

        totalCost+=item.pokemon.value*item.quantity;
        totalItems+=item.quantity;
    });
    
    cartTotal.textContent = `$${totalCost.toFixed(2)}`;
    cartBadge.textContent = totalItems;

    image = document.createElement('img');
    image.src = "images/thinLineSeperator.png";
    cartItemsList.appendChild(image);

}
buyButton.addEventListener('click', () =>{
    var cartTotal = 0
    cart.forEach(el => cartTotal+=el.quantity);

    cart = [];
    updateCartList();

    if(cartTotal!=0){
        alert(`You have bought ${cartTotal} Pokemon!`);
    }
    else{
        alert("There are no Pokemon in your cart :'( , maybe buy some pls?");
    }
    

    

})


//utility
function formatName(name){
    var itemName = "";
    name.split('-').forEach((section => itemName+=section.charAt(0).toUpperCase() + section.slice(1) + " "));
    return itemName;
}
function findBackgroundImage(types){

    if(types.includes("Grass") || types.includes("Bug") || types.includes("Normal") || types.includes("Fairy")){
        return "url('images/forest.jpg')";
    }else if(types.includes("Fire") || types.includes("Fighting") || types.includes("Steel")){
        return "url('images/volcano.jpg')";
    }else if(types.includes("Water") || types.includes("Psychic")){
        return "url('images/coast.jpg')";
    }else if(types.includes("Electric") || types.includes("Ice")){
        return "url('images/glacier.jpg')";
    }else if(types.includes("Poison") || types.includes("Ghost") || types.includes("Dark")){
        return "url('images/cave.jpg')";
    }else if(types.includes("Ground") || types.includes("Rock") || types.includes("Flying") || types.includes("Dragon")){
        return "url('images/canyon.jpg')";
    }
    else{
        return "url(images/city.jpg)";
    }


}



//back to top button functionality
function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      topButton.style.display = "block";
    } else {
      topButton.style.display = "none";
    }
  }
  
  // When the user clicks on the button, scroll to the top of the document
  function topFunction() {
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  }



// Adding the .show-modal class to an element will make it visible
// because it has the CSS property display: block; (which overrides display: none;)
// See the CSS file for more details.
function toggleModal() {
  modal.classList.toggle('show-modal');
}



//execution
prevPageButton.disabled = true;
window.onscroll = function() {scrollFunction()};


// Example of DOM methods for adding event handling
cartButton.addEventListener('click', toggleModal);
modalClose.addEventListener('click', toggleModal);


