
import fs from 'fs';
import path from 'path';

// Manual .env parsing
try {
    const envPath = path.resolve(process.cwd(), '.env');
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
} catch (e) {
    console.warn('⚠️ Could not read .env file');
}

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error('❌ GEMINI_API_KEY is missing in .env');
    process.exit(1);
}

async function listModels() {
    console.log('🔍 Fetching available Gemini models...');
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const models = data.models || [];

        console.log(`✅ Found ${models.length} models:`);

        const flashModels = models.filter((m: any) => m.name.includes('flash'));
        const proModels = models.filter((m: any) => m.name.includes('pro'));

        console.log('\n⚡️ Flash Models:');
        flashModels.forEach((m: any) => console.log(` - ${m.name.replace('models/', '')} (${m.displayName})`));

        console.log('\n🧠 Pro Models:');
        proModels.forEach((m: any) => console.log(` - ${m.name.replace('models/', '')} (${m.displayName})`));

        console.log('\n📋 Other Models:');
        models
            .filter((m: any) => !m.name.includes('flash') && !m.name.includes('pro'))
            .forEach((m: any) => console.log(` - ${m.name.replace('models/', '')}`));

    } catch (error) {
        console.error('❌ Failed to list models:', error);
    }
}

listModels();
