import { GoogleGenerativeAI } from "@google/generative-ai";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

//api key and model init
const API_KEY = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
console.log(API_KEY);
//variables
const ingredient1 = document.getElementById("ingredient1");
const ingredient2 = document.getElementById("ingredient2");
const generateBttn = document.querySelector(".generate-bttn");
const recipeContainer = document.querySelector(".recipe");
const spinnerContainer = document.querySelector(".spinner-container");

//spinner
function toggleSpinner() {
  spinnerContainer.classList.toggle("hide");
  generateBttn.classList.toggle("hide");
}

//fetch the recipe from Gemini
async function getData(e) {
  try {
    location.hash = "";
    e.preventDefault();
    const ing1 = ingredient1.value;
    const ing2 = ingredient2.value;
    if (!(ing1 && ing2)) {
      alert("❌Please enter the ingredients!");
      return;
    }
    toggleSpinner();
    recipeContainer.classList.add("hide");
    ingredient1.value = ingredient2.value = "";
    const prompt = `I want a recipe which can be normal or weird, made combining two main ingredients which are ${ing1}  and ${ing2}.I want a response with the following json schema:
  
      {recipename: 'string',
      ingredients:[list of all ingredients needed],
      steps: [{
              thingsNeeded: [list of things needed in this step],
              description: 'string'
      }]
      }
  
      if one or both of them are not edible items, then return an empty json object {}
      `;
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```|json/g, "").trim();
    text = JSON.parse(text);
    if (Object.keys(text).length === 0) {
      console.log("not valid");
      toggleSpinner();
      alert("❌Please enter edible ingredients!");
      return;
    }
    displayRecipe(text);
  } catch (error) {
    console.error(error);
    toggleSpinner();
    alert("❌Some error occured!");
  }
}

//display the fetched recipe
function displayRecipe(data) {
  recipeContainer.innerHTML = "";
  const html = `<h2 class="recipe-name">${data.recipename}</h2>
      <section class="ingredient">
        <h3 class="ingredient-title">Ingredients:</h3>
        <ul class="ingredient-list">
        ${data.ingredients
          .map((ing) => `<li class="ingredient">✅${ing}</li>`)
          .join("")}
        </ul>
      </section>
      <h3 class="direction-title">Direction:</h3>
      <section class="step">
      ${data.steps
        .map(
          (step, i) => `<h4 class="step-title">Step: ${i + 1}</h4>
        <p class="needed-title"><b>Ingredients Needed:</b> ${step.thingsNeeded.join(
          ", "
        )}</p>
        <p class="task-title"><b>Task:</b> ${step.description}</p>`
        )
        .join("")}
      </section>`;
  toggleSpinner();
  recipeContainer.classList.remove("hide");
  recipeContainer.insertAdjacentHTML("afterbegin", html);
  location.hash = "#recipe-container";
}

generateBttn.addEventListener("click", getData);
