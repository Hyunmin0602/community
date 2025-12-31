const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

// Load .env manually
try {
    const envConfig = fs.readFileSync('.env', 'utf8');
    envConfig.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length === 2) {
            process.env[parts[0].trim()] = parts[1].trim().replace(/^["'](.+)["']$/, '$1');
        }
    });
} catch (e) {
    console.log("Could not read .env file");
}

async function test() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.log("NO KEY FOUND IN ENV");
        return;
    }
    console.log("Testing with Key:", key.slice(0, 5) + "...");

    const genAI = new GoogleGenerativeAI(key);
    try {
        // Try gemini-flash-latest
        const modelName = "gemini-flash-latest";
        // Or "models/gemini-2.0-flash" if the above fails

        console.log(`Attempting to generate content with ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent("Hello, are you there?");
        console.log("Success! Response:", result.response.text());
    } catch (e) {
        console.error("Generate Error:", e.message);
    }

    /*
    console.log("\nListing available models...");
    // Note: listModels might not be available in all SDK versions or requires different scopes?
    // Actually typically accessible via fetch to https://generativelanguage.googleapis.com/v1beta/models?key=...
    // But let's try via SDK or fetch manually if SDK fails.
    */

    console.log("\n--- Listing Models via HTTP ---");
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await res.json();
        if (data.error) {
            console.error("List Error:", data.error);
        } else if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
        } else {
            console.log("Unknown response:", data);
        }
    } catch (e) {
        console.error("List Fetch Error:", e);
    }
}

test();
