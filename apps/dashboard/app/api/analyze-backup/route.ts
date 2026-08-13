import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), '../../backup.txt');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const schema: Record<string, any> = {};
    for (const key in data) {
      schema[key] = {
        count: data[key].length,
        firstItem: data[key][0]
      };
    }
    return NextResponse.json(schema);
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
