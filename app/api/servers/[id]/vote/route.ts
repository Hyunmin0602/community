import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
        }

        // Check if user already voted
        const existingVote = await prisma.vote.findUnique({
            where: {
                serverId_userId: {
                    serverId: params.id,
                    userId: session.user.id,
                },
            },
        });

        if (existingVote) {
            // Remove vote
            await prisma.vote.delete({
                where: {
                    serverId_userId: {
                        serverId: params.id,
                        userId: session.user.id,
                    },
                },
            });

            return NextResponse.json({ voted: false });
        } else {
            // Add vote
            await prisma.vote.create({
                data: {
                    serverId: params.id,
                    userId: session.user.id,
                },
            });

            return NextResponse.json({ voted: true });
        }
    } catch (error) {
        console.error('Failed to vote:', error);
        return NextResponse.json({ error: '추천에 실패했습니다' }, { status: 500 });
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ voted: false });
        }

        const vote = await prisma.vote.findUnique({
            where: {
                serverId_userId: {
                    serverId: params.id,
                    userId: session.user.id,
                },
            },
        });

        return NextResponse.json({ voted: !!vote });
    } catch (error) {
        console.error('Failed to check vote status:', error);
        return NextResponse.json({ voted: false });
    }
}
