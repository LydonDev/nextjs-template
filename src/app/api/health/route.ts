import { NextResponse } from 'next/server';
import { loadConfig } from '@/utils/config'

export const dynamic = 'error';

export async function GET() {
    const config = await loadConfig();
    
    try {
        return NextResponse.json({ version: config.app.version });
    } catch (error) {
        console.error(error)
    }
}
