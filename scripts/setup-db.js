import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load env vars
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = process.env.DATABASE_URL;

if (!connectionString || connectionString.includes('[YOUR-PASSWORD]')) {
    console.error('❌ Erro: DATABASE_URL não configurada corretamente no .env');
    console.error('👉 Por favor, edite o arquivo .env e coloque sua senha real na variável DATABASE_URL.');
    process.exit(1);
}

const sql = postgres(connectionString);

async function setupDatabase() {
    try {
        console.log('🔌 Conectando ao Supabase...');

        // Read SQL file
        // Note: Adjust path to where the artifact is stored or copy it to project
        // For now, let's assume we read from the artifacts path which is known
        const schemaPath = '/Users/wendrickcardoso/.gemini/antigravity/brain/041e9189-2f70-41f0-87c0-73aeaf35b74e/database_schema.sql';

        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Arquivo SQL não encontrado em: ${schemaPath}`);
        }

        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('🚀 Executando script de criação de tabelas...');

        // Execute SQL
        await sql.unsafe(schemaSql);

        console.log('✅ Sucesso! Tabelas criadas/atualizadas.');
    } catch (error) {
        console.error('❌ Erro ao configurar banco de dados:', error);
    } finally {
        await sql.end();
    }
}

setupDatabase();
