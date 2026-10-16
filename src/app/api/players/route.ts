import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { Player } from '@/types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { processImage } from '@/lib/uploadImage';

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM players ORDER BY id DESC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: Omit<Player, 'id'> = await request.json();
    const { name, position, number, image_data } = body;

    if (!name || !position || number === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const processedImageUrl = await processImage(image_data);

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO players (name, position, number, image_data) VALUES (?, ?, ?, ?)',
      [name, position, number, processedImageUrl || null]
    );

    return NextResponse.json({ id: result.insertId, ...body, image_data: processedImageUrl }, { status: 201 });
  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json({ error: 'Failed to create player' }, { status: 500 });
  }
}
