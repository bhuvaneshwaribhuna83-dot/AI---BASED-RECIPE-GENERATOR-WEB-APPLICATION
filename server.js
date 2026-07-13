const express = require("express");
const cors = require("cors");
require("dotenv").config();
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
    res.send("AI Recipe Generator Backend Running");
});

app.post("/generate-recipe", async (req, res) => {

    const { ingredient } = req.body;

    if (!ingredient) {
        return res.status(400).json({
            error: "Ingredient is required."
        });
    }

    const prompt = `
Generate a recipe for ${ingredient}.

Return ONLY HTML.

Use this format:

<h2>Recipe Name</h2>

<h3>Ingredients</h3>
<ul>
<li>Ingredient</li>
</ul>

<h3>Steps</h3>
<ol>
<li>Step</li>
</ol>

<h3>Cooking Time</h3>
<p>20 Minutes</p>

<h3>You May Also Like</h3>
<ul>
<li>Related Recipe 1</li>
<li>Related Recipe 2</li>
<li>Related Recipe 3</li>
<li>Related Recipe 4</li>
<li>Related Recipe 5</li>
</ul>

Return ONLY HTML.
Do NOT use Markdown.
`;

    try {

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
             model: "openrouter/free",

                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],

                temperature: 0.7
            },

            {
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",

                    // Optional but recommended
                    "HTTP-Referer": "http://localhost:5000",
                    "X-Title": "Recipe Generator"
                }
            }
        );

        let recipe =
            response.data.choices[0].message.content;

        recipe = recipe.replace(/```html/g, "");
        recipe = recipe.replace(/```/g, "");

        res.json({
            recipe
        });

    }
    catch (error) {

        console.log("========== OPENROUTER ERROR ==========");

        if (error.response) {
            console.log(error.response.data);
        } else {
            console.log(error.message);
        }

        console.log("======================================");

        res.status(500).json({
            error: "Something went wrong"
        });
    }

});

app.listen(5000, () => {
    console.log("✅ Server running on http://localhost:5000");
});
