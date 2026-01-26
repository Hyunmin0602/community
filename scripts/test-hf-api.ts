
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_KEY = process.env.HUGGINGFACE_API_KEY;

if (!API_KEY) {
    console.error('Error: HUGGINGFACE_API_KEY not found in .env');
    process.exit(1);
}

const HOSTS = [
    'https://router.huggingface.co/models',
    'https://router.huggingface.co/hf-inference/models',
    'https://api-inference.huggingface.co/models'
];

const MODELS = [
    'gpt2',
    'black-forest-labs/FLUX.1-schnell',
    'stabilityai/stable-diffusion-xl-base-1.0',
    'runwayml/stable-diffusion-v1-5',
    'stabilityai/stable-diffusion-2-1',
];

async function testConnection() {
    console.log('Testing Hugging Face API Connectivity...');
    console.log(`API Key present: ${!!API_KEY}`);

    for (const host of HOSTS) {
        console.log(`\n--- Testing Host: ${host} ---`);
        for (const model of MODELS) {
            const url = `${host}/${model}`;
            console.log(`Testing ${url}...`);

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    // Minimal payload
                    body: JSON.stringify({
                        inputs: "minecraft skin, pixel art",
                    }),
                });

                if (response.ok) {
                    console.log(`✅ SUCCESS: ${response.status} ${response.statusText}`);
                    // return; // Don't return, we want to see all that work
                } else {
                    const text = await response.text();
                    console.log(`❌ FAILED: ${response.status} ${response.statusText} - ${text.substring(0, 100)}`);
                }
            } catch (error) {
                console.log(`❌ ERROR: ${error}`);
            }
        }
    }
}

testConnection();
