import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { Player } from '@/types';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { processImage, deleteImage } from '@/lib/uploadImage';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body: Omit<Player, 'id'> = await request.json();
    const { name, position, number, image_data } = body;

    if (!name || !position || number === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch existing player to get old image
    const [existingPlayers] = await pool.query<RowDataPacket[]>(
      'SELECT image_data FROM players WHERE id = ?',
      [id]
    );
    const oldImage = existingPlayers.length > 0 ? existingPlayers[0].image_data : null;

    const processedImageUrl = await processImage(image_data);

    // If the image changed, delete the old one
    if (oldImage && oldImage !== processedImageUrl) {
      await deleteImage(oldImage);
    }

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE players SET name = ?, position = ?, number = ?, image_data = ? WHERE id = ?',
      [name, position, number, processedImageUrl || null, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    return NextResponse.json({ id: parseInt(id), ...body, image_data: processedImageUrl });
  } catch (error) {
    console.error('Error updating player:', error);
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Fetch existing player to delete image
    const [existingPlayers] = await pool.query<RowDataPacket[]>(
      'SELECT image_data FROM players WHERE id = ?',
      [id]
    );
    const oldImage = existingPlayers.length > 0 ? existingPlayers[0].image_data : null;

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM players WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    if (oldImage) {
      await deleteImage(oldImage);
    }

    return NextResponse.json({ message: 'Player deleted successfully' });
  } catch (error) {
    console.error('Error deleting player:', error);
    return NextResponse.json({ error: 'Failed to delete player' }, { status: 500 });
  }
}
