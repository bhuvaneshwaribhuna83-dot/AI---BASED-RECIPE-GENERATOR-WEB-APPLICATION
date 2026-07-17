async function generateRecipe() {

    const ingredient = document.getElementById("ingredients").value;
    const button = document.getElementById("generateBtn");
      
    button.disabled = true;
    button.innerHTML = "⏳ Generating...";

    if (ingredient.trim() === "") {
        document.getElementById("result").innerHTML =
            "<p>Please enter a dish name.</p>";

        button.disabled = false;
        button.innerHTML = "Generate Recipe";
        return;
    }

    document.getElementById("result").innerHTML =
        "<p>🍳 Generating Recipe...</p>";

    try {

        const response = await fetch(
            "https://ai-based-recipe-generator-web.onrender.com/generate-recipe",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
    ingredient: ingredient
})
            }
        );

        const data = await response.json();

        if (!response.ok) {
            document.getElementById("result").innerHTML =
                `<p>❌ ${data.error}</p>`;

            button.disabled = false;
            button.innerHTML = "Generate Recipe";
            return;
        }
        // Show recipe first;
        document.getElementById("result").innerHTML =
`
<div id="recipeImage"></div>
<div id="recipeContent">${data.recipe}</div>
`;

// Add image above ingredients
setTimeout(() => {
    loadImage(ingredient);
}, 100);
        // Save history
        saveHistory(ingredient);

        document.getElementById("downloadBtn").style.display = "block";
        document.getElementById("favoriteBtn").style.display = "block";

    }
    catch (error) {
        console.log(error);

        document.getElementById("result").innerHTML =
            "<p>❌ Unable to connect to backend server.</p>";
    }

    button.disabled = false;
    button.innerHTML = "Generate Recipe";
}

// ENTER KEY
function handleEnter(event) {
    if (event.key === "Enter") {
        generateRecipe();
    }
}

/* ===================== HISTORY ===================== */

function saveHistory(recipeName) {

    let history =
        JSON.parse(localStorage.getItem("recipeHistory")) || [];

    history = history.filter(item => item !== recipeName);

    history.unshift(recipeName);

    if (history.length > 5) {
        history.pop();
    }

   sessionStorage.setItem(
    "recipeHistory",
    JSON.stringify(history)
);

    displayHistory();
}

function displayHistory() {

    const history =
    JSON.parse(sessionStorage.getItem("recipeHistory")) || [];
    const historyList =
        document.getElementById("historyList");

    historyList.innerHTML = "";

    history.forEach(item => {
        historyList.innerHTML +=
            `<li onclick="searchHistory('${item}')">${item}</li>`;
    });
}

function searchHistory(name) {
    document.getElementById("ingredients").value = name;
    generateRecipe();
}

/* ===================== FAVORITES ===================== */

function addFavorite() {

    const recipeName = document.getElementById("ingredients").value;

    let favorites =
        JSON.parse(localStorage.getItem("favoriteRecipes")) || [];

    if (!favorites.includes(recipeName)) {
        favorites.unshift(recipeName);
    }

    localStorage.setItem(
        "favoriteRecipes",
        JSON.stringify(favorites)
    );

    displayFavorites();
}

function displayFavorites() {

    const favorites =
        JSON.parse(localStorage.getItem("favoriteRecipes")) || [];

    const favoriteList =
        document.getElementById("favoriteList");

    favoriteList.innerHTML = "";

    favorites.forEach(item => {

        favoriteList.innerHTML += `
        <li>
            <span onclick="searchHistory('${item}')">
                ❤️ ${item}
            </span>

            <button class="remove-btn"
                onclick="removeFavorite('${item}')">❌
                
            </button>
        </li>
        `;
    });
}
function removeFavorite(recipeName) {

    let favorites =
        JSON.parse(localStorage.getItem("favoriteRecipes")) || [];

    favorites = favorites.filter(item => item !== recipeName);

    localStorage.setItem(
        "favoriteRecipes",
        JSON.stringify(favorites)
    );

    displayFavorites();
}
/* ===================== IMAGE (FIXED) ===================== */


/* ===================== PDF ===================== */

function downloadPDF() {

    const recipe = document.getElementById("result");

    const options = {
        margin: 0.5,
        filename: "Recipe.pdf",
        image: {
            type: "jpeg",
            quality: 0.98
        },
        html2canvas: {
            scale: 3,
            useCORS: true,
            scrollY: 0
        },
        jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait"
        }
    };

    setTimeout(() => {
        html2pdf().set(options).from(recipe).save();
    }, 500);

}

/* ===================== VOICE ===================== */

function startVoiceSearch() {

    if (!('webkitSpeechRecognition' in window)) {
        alert("Voice Search is not supported in this browser.");
        return;
    }

    const recognition = new webkitSpeechRecognition();

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = function (event) {
        const text = event.results[0][0].transcript;
        document.getElementById("ingredients").value = text;
        generateRecipe();
    };

    recognition.onerror = function (event) {
        alert("Voice Error: " + event.error);
    };
}

/* ===================== THEME ===================== */

function toggleTheme() {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
}

// INIT ON LOAD
window.addEventListener("load", () => {

    displayHistory();
    displayFavorites();

    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
    }
});
/* ===================== IMAGE (UPDATED) ===================== */

async function loadImage(query) {

    const API_KEY = "BQkYD7u8t0mbvVGl5Hi8vD80UsIaIAEsrIc8Mas3Y8onNuvzE6lATIth";

    try {

        // Better search keyword for food image
        const searchQuery = query + " food dish recipe plated";

        const response = await fetch(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=5`,
            {
                headers: {
                    Authorization: API_KEY
                }
            }
        );

        const data = await response.json();


        if (!data.photos || data.photos.length === 0) {
            console.log("No image found");
            return;
        }


        // Select random image from results
        const randomImage =
            data.photos[Math.floor(Math.random() * data.photos.length)];


        const imgUrl = randomImage.src.medium;


        // Create image card
        const card = document.createElement("div");
        card.className = "image-card";


        const title = document.createElement("h3");
        title.innerText = "🍽️ " + query + " Image";


        const img = document.createElement("img");
        img.src = imgUrl;
        img.alt = query;


        card.appendChild(title);
        card.appendChild(img);

// Show image above ingredients
document.getElementById("recipeImage").appendChild(card);


    } catch (error) {

        console.log("Image Error:", error);

    }
}
document.getElementById("contactForm").addEventListener("submit", function(e){

    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;

    if(name==="" || email==="" || message===""){
        alert("Please fill all fields.");
        return;
    }

    document.getElementById("successMessage").innerHTML =
    "✅ Thank you! Your message has been sent successfully.";

    this.reset();

});
function selectCategory(category){

document.getElementById("ingredients").value=category;

generateRecipe();

}
