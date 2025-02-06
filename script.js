// Get DOM elements
const form = document.querySelector('form');
const recipeList = document.querySelector('#recipe-list');
const noRecipes = document.getElementById('no-recipes');
const searchBox = document.getElementById('search-box');
const filterIngredients = document.getElementById('filter-ingredients');

// Define recipes array (load from localStorage if available)
let recipes = JSON.parse(localStorage.getItem('recipes')) || [];

// Recipe class to encapsulate recipe-related logic
class Recipe {
  constructor(name, ingredients, method, image = '') {
    this.name = name;
    this.ingredients = ingredients;
    this.method = method;
    this.image = image; // Base64 image string
  }
}

// Function to preview the uploaded image
function previewImage(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const imgElement = document.createElement('img');
    imgElement.src = e.target.result;
    imgElement.alt = 'Recipe Image Preview';
    imgElement.classList.add('recipe-image'); // Add your styling class
    const previewArea = document.querySelector('#image-preview-area'); // Make sure to create this in your HTML
    previewArea.innerHTML = ''; // Clear previous previews
    previewArea.appendChild(imgElement);
  };

  if (file) {
    reader.readAsDataURL(file);
  }
}

// Handle form submit
function handleSubmit(event) {
  event.preventDefault();

  const nameInput = document.querySelector('#recipe-name');
  const ingrInput = document.querySelector('#recipe-ingredients');
  const methodInput = document.querySelector('#recipe-method');
  const imageInput = document.querySelector('#file-upload'); // Update to match the new input ID

  const name = nameInput.value.trim();
  const ingredients = ingrInput.value.trim().split(',').map(i => i.trim());
  const method = methodInput.value.trim();
  const imageFile = imageInput.files[0];

  // Validate inputs
  if (!name || ingredients.length === 0 || !method) {
    displayError('Please fill out all fields correctly.');
    return;
  }

  // Convert image to Base64
  const reader = new FileReader();
  reader.onload = function (e) {
    const image = e.target.result;
    addRecipe(name, ingredients, method, image);
  };

  if (imageFile) {
    // Validate image type
    if (!imageFile.type.startsWith('image/')) {
      displayError('Please upload a valid image file.');
      return;
    }
    reader.readAsDataURL(imageFile);
  } else {
    addRecipe(name, ingredients, method);
  }
}

// Add a new recipe
function addRecipe(name, ingredients, method, image = '') {
  const newRecipe = new Recipe(name, ingredients, method, image);
  recipes.push(newRecipe);
  saveRecipes();
  clearForm();
  displayRecipes();
}

// Clear form inputs
function clearForm() {
  document.querySelector('#recipe-name').value = '';
  document.querySelector('#recipe-ingredients').value = '';
  document.querySelector('#recipe-method').value = '';
  document.querySelector('#file-upload').value = ''; // Update to match the new input ID
  document.querySelector('#image-preview-area').innerHTML = ''; // Clear the image preview
}

// Display recipes in the recipe list
function displayRecipes(filteredRecipes = recipes) {
  recipeList.innerHTML = '';

  if (filteredRecipes.length === 0) {
    noRecipes.style.display = 'flex';
    return;
  }

  noRecipes.style.display = 'none';
  filteredRecipes.forEach((recipe, index) => {
    const recipeEl = createRecipeElement(recipe, index);
    recipeList.appendChild(recipeEl);
  });
}

// Create a recipe element
function createRecipeElement(recipe, index) {
  const recipeDiv = document.createElement('div');
  recipeDiv.classList.add('recipe');
  recipeDiv.innerHTML = `
    ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.name}" class="recipe-image">` : ''}
    <h3>${recipe.name}</h3>
    <p><strong>Ingredients:</strong></p>
    <ul>
      ${recipe.ingredients.map(ingr => `<li>${ingr}</li>`).join('')}
    </ul>
    <p><strong>Method:</strong> ${recipe.method}</p>
    <button class="edit-button" onclick="editRecipe(${index})">Edit</button>
    <button class="delete-button" onclick="deleteRecipe(${index})">Delete</button>
  `;
  return recipeDiv;
}

// Edit a recipe
function editRecipe(index) {
  const recipe = recipes[index];
  document.querySelector('#recipe-name').value = recipe.name;
  document.querySelector('#recipe-ingredients').value = recipe.ingredients.join(', ');
  document.querySelector('#recipe-method').value = recipe.method;
  // Set the image preview if available
  if (recipe.image) {
    const previewArea = document.querySelector('#image-preview-area');
    previewArea.innerHTML = `<img src="${recipe.image}" alt="Recipe Image Preview" class="recipe-image">`;
  }
  // Remove the recipe from the list for editing
  recipes.splice(index, 1);
  saveRecipes();
  displayRecipes();
}

// Delete a recipe
function deleteRecipe(index) {
  recipes.splice(index, 1);
  saveRecipes();
  displayRecipes();
}

// Save recipes to localStorage
function saveRecipes() {
  localStorage.setItem('recipes', JSON.stringify(recipes));
}

// Display error messages
function displayError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
  setTimeout(() => {
    errorDiv.remove();
  }, 3000);
}

// Filter recipes based on search and ingredient input
function filterRecipes() {
  const searchQuery = searchBox.value.toLowerCase();
  const filterQuery = filterIngredients.value.toLowerCase();
  const filteredRecipes = recipes.filter(recipe => {
    const matchesName = recipe.name.toLowerCase().includes(searchQuery);
    const matchesIngredients = recipe.ingredients.some(ingr => ingr.toLowerCase().includes(filterQuery));
    return matchesName && matchesIngredients;
  });
  displayRecipes(filteredRecipes);
}

// Initialize the app
function init() {
  displayRecipes();
}

// Event listeners
form.addEventListener('submit', handleSubmit);
searchBox.addEventListener('input', filterRecipes);
filterIngredients.addEventListener('input', filterRecipes);
document.querySelector('#file-upload').addEventListener('change', previewImage);

// Call init on page load
init();