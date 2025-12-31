import { status as javaStatus, statusBedrock } from 'minecraft-server-util';

export interface ServerStatus {
    online: boolean;
    players?: {
        online: number;
        max: number;
    };
    version?: string;
    motd?: string;
    icon?: string;
}

export async function checkJavaServer(
    host: string,
    port: number = 25565
): Promise<ServerStatus> {
    try {
        const response = await javaStatus(host, port, {
            timeout: 5000,
            enableSRV: true,
        });

        return {
            online: true,
            players: {
                online: response.players.online,
                max: response.players.max,
            },
            version: response.version.name,
            motd: response.motd.clean,
            icon: response.favicon || undefined,
        };
    } catch (error) {
        console.error(`Failed to check Java server ${host}:${port}:`, error);
        return {
            online: false,
        };
    }
}

export async function checkBedrockServer(
    host: string,
    port: number = 19132
): Promise<ServerStatus> {
    try {
        const response = await statusBedrock(host, port, {
            timeout: 5000,
        });

        return {
            online: true,
            players: {
                online: response.players.online,
                max: response.players.max,
            },
            version: response.version.name,
            motd: response.motd.clean,
        };
    } catch (error) {
        console.error(`Failed to check Bedrock server ${host}:${port}:`, error);
        return {
            online: false,
        };
    }
}

export async function checkServerStatus(
    host: string,
    port: number,
    type: 'JAVA' | 'BEDROCK'
): Promise<ServerStatus> {
    if (type === 'JAVA') {
        return checkJavaServer(host, port);
    } else {
        return checkBedrockServer(host, port);
    }
}
