import { NextRequest, NextResponse } from 'next/server';
import { checkServerStatus } from '@/lib/minecraft';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const server = await prisma.server.findUnique({
            where: { id: params.id },
            select: {
                host: true,
                port: true,
                type: true,
            },
        });

        if (!server) {
            return NextResponse.json({ error: '서버를 찾을 수 없습니다' }, { status: 404 });
        }

        const status = await checkServerStatus(server.host, server.port, server.type);

        // Update server status in database
        await prisma.server.update({
            where: { id: params.id },
            data: {
                isOnline: status.online,
                onlinePlayers: status.players?.online,
                maxPlayers: status.players?.max,
                version: status.version,
                motd: status.motd,
                icon: status.icon,
                lastChecked: new Date(),
            },
        });

        return NextResponse.json(status);
    } catch (error) {
        console.error('Failed to check server status:', error);
        return NextResponse.json(
            { error: '서버 상태를 확인하는데 실패했습니다' },
            { status: 500 }
        );
    }
}
