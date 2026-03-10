import { NextResponse } from 'next/server';

const FLASK_BACKEND_URL = process.env.FLASK_BACKEND_URL || 'http://127.0.0.1:5000';

export async function GET() {
    try {
        const response = await fetch(`${FLASK_BACKEND_URL}/api/projects`);
        if (!response.ok) throw new Error('Failed to fetch projects');
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const response = await fetch(`${FLASK_BACKEND_URL}/api/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error('Failed to save project');
        const data = await response.json();
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Error saving project:', error);
        return NextResponse.json({ error: 'Failed to save project' }, { status: 500 });
    }
}
