import { getBackups, createBackup, restoreBackup, deleteBackup } from '@/lib/data';
import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * GET /api/backups - List all backups
 */
export async function GET(request) {
  const authResult = requireAdmin(request);
  if (authResult.error) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const backups = await getBackups();
    return NextResponse.json(backups);
  } catch (error) {
    console.error('Failed to fetch backups:', error);
    return NextResponse.json(
      { message: 'Failed to fetch backups', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/backups - Create a new backup
 */
export async function POST(request) {
  const authResult = requireAdmin(request);
  if (authResult.error) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { description } = await request.json();
    const backup = await createBackup(description || 'Manual backup');
    return NextResponse.json({ 
      message: 'Backup created successfully',
      backup
    });
  } catch (error) {
    console.error('Failed to create backup:', error);
    return NextResponse.json(
      { message: 'Failed to create backup', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/backups - Restore a backup
 */
export async function PUT(request) {
  const authResult = requireAdmin(request);
  if (authResult.error) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { backupId } = await request.json();
    
    if (!backupId) {
      return NextResponse.json(
        { message: 'Backup ID is required' },
        { status: 400 }
      );
    }

    await restoreBackup(backupId);
    return NextResponse.json({ 
      message: 'Backup restored successfully'
    });
  } catch (error) {
    console.error('Failed to restore backup:', error);
    return NextResponse.json(
      { message: 'Failed to restore backup', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/backups - Delete a backup
 */
export async function DELETE(request) {
  const authResult = requireAdmin(request);
  if (authResult.error) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const backupId = searchParams.get('id');
    
    if (!backupId) {
      return NextResponse.json(
        { message: 'Backup ID is required' },
        { status: 400 }
      );
    }

    const deleted = await deleteBackup(backupId);
    
    if (!deleted) {
      return NextResponse.json(
        { message: 'Backup not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Backup deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete backup:', error);
    return NextResponse.json(
      { message: 'Failed to delete backup', error: error.message },
      { status: 500 }
    );
  }
}

