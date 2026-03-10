import { NextResponse } from 'next/server';

const FLASK_BACKEND_URL = process.env.FLASK_BACKEND_URL || 'http://127.0.0.1:5000';

export async function GET(
    request: Request,
    { params }: any
) {
    try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        const backendUrl = `${FLASK_BACKEND_URL}/api/projects/${id}`;

        const response = await fetch(backendUrl, { cache: 'no-store' });

        if (!response.ok) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[API Proxy] EXCEPTION fetching project:', error);
        return NextResponse.json({ error: 'Failed to fetch project', details: error?.message }, { status: 500 });
    }
}
