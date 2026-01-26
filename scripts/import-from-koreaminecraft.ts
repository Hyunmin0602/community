import * as cheerio from 'cheerio';
import { prisma } from '../lib/prisma';

const BASE_URL = 'https://www.koreaminecraft.net';

interface ServerData {
    title: string;
    address: string;
    port: number;
    fullAddress: string;
    version: string;
    genres: string[];
    tags: string[];
    description: string;
    discord?: string;
    website?: string;
}

interface PostData {
    title: string;
    content: string;
    category: string;
    views: number;
}

// Fetch HTML from URL
async function fetchHTML(url: string): Promise<string> {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    return await response.text();
}

// Parse server list page
async function getServerIds(): Promise<string[]> {
    console.log('📋 Fetching server list...');
    const html = await fetchHTML(`${BASE_URL}/serverad`);
    const $ = cheerio.load(html);

    const serverIds: string[] = [];

    // Find all server links
    $('a[href*="/serverad/"]').each((_, element) => {
        const href = $(element).attr('href');
        if (href) {
            const match = href.match(/\/serverad\/(\d+)/);
            if (match && match[1]) {
                serverIds.push(match[1]);
            }
        }
    });

    // Remove duplicates
    return [...new Set(serverIds)];
}

// Parse individual server detail page
async function parseServerDetail(serverId: string): Promise<ServerData | null> {
    try {
        console.log(`  📡 Parsing server ${serverId}...`);
        const html = await fetchHTML(`${BASE_URL}/serverad/${serverId}`);
        const $ = cheerio.load(html);

        // Try multiple selectors for title
        let title = $('h1.title, h1.post-title, .title h1, .post-title').first().text().trim();

        // Fallback: Try to get title from meta tags or page title
        if (!title) {
            title = $('meta[property="og:title"]').attr('content')?.trim() || '';
        }
        if (!title) {
            title = $('title').text().split(' - ')[0].trim();
        }
        if (!title || title.length < 3) {
            title = 'Untitled Server';
        }

        // Extract server info from table
        let address = '';
        let version = '';
        const genres: string[] = [];
        const tags: string[] = [];

        $('table tr').each((_, row) => {
            const label = $(row).find('th').text().trim();
            const value = $(row).find('td').text().trim();

            if (label.includes('서버 주소') || label.includes('서버주소')) {
                address = value;
            } else if (label.includes('게임버전') || label.includes('버전')) {
                version = value;
            } else if (label.includes('서버장르') || label.includes('장르')) {
                genres.push(...value.split(/[,\s]+/).filter(Boolean));
            } else if (label.includes('서버태그') || label.includes('태그')) {
                tags.push(...value.split(/[,\s]+/).filter(Boolean));
            }
        });

        // Get description (main content)
        const description = $('.content, .post-content, .article-content').first().text().trim() || '';

        // Extract Discord link
        let discord: string | undefined;
        $('a[href*="discord"]').each((_, element) => {
            const href = $(element).attr('href');
            if (href) {
                discord = href;
                return false; // break
            }
        });

        if (!address) {
            console.log(`    ⚠️  Skipping server ${serverId}: No address found`);
            return null;
        }

        // Parse host and port from address
        let host = '';
        let port = 25565;
        let website: string | undefined;

        // Clean up address (remove surrounding brackets, whitespace)
        let cleanAddress = address.replace(/[\[\]]/g, '').trim();

        // Handle URL-like addresses
        if (cleanAddress.startsWith('http')) {
            try {
                const url = new URL(cleanAddress);
                host = url.hostname;
                website = cleanAddress; // Save original as website
            } catch (e) {
                host = cleanAddress;
            }
        } else {
            // Standard address handling (host:port)
            const parts = cleanAddress.split(':');
            host = parts[0];
            if (parts.length > 1) {
                const parsedPort = parseInt(parts[1]);
                if (!isNaN(parsedPort)) {
                    port = parsedPort;
                }
            }
        }

        return {
            title,
            address: host, // Return clean host
            port,          // Return clean port
            fullAddress: cleanAddress, // Keep original
            version: version || 'Unknown',
            genres,
            tags,
            description: description.substring(0, 1000), // Limit length
            discord,
            website
        };
    } catch (error) {
        console.error(`    ❌ Error parsing server ${serverId}:`, error);
        return null;
    }
}

// Parse posts from /all
async function getPosts(limit: number = 50): Promise<PostData[]> {
    console.log('📋 Fetching posts...');
    const html = await fetchHTML(`${BASE_URL}/all`);
    const $ = cheerio.load(html);

    const posts: PostData[] = [];

    // Use the correct class for post links found by the browser agent
    $('a.ed.link-reset').slice(0, limit).each((_, element) => {
        // Extract title (exclude category inside strong tag)
        const titleElement = $(element).clone();
        titleElement.find('strong').remove(); // Remove category
        titleElement.find('span.count').remove(); // Remove comment count
        titleElement.find('span.f_new').remove(); // Remove new badge

        const title = titleElement.text().trim();
        const href = $(element).attr('href');

        if (!title || !href || title.length < 2) return;

        // Try to guess category from href or category tag
        let category = 'FREE';
        const categoryText = $(element).find('strong').text();

        if (href.includes('/question/') || categoryText.includes('질문')) category = 'QUESTION';
        else if (href.includes('/tip/') || categoryText.includes('팁')) category = 'TIP';
        else if (href.includes('/serverad/') || categoryText.includes('홍보')) category = 'NOTICE';

        posts.push({
            title,
            content: `Imported from koreaminecraft.net\n\nOriginal Link: ${BASE_URL}${href}\n\n${title}`,
            category,
            views: Math.floor(Math.random() * 100),
        });
    });

    return posts;
}

// Main import function
async function importData() {
    console.log('🚀 Starting import from koreaminecraft.net...\n');

    try {
        // Get or create a default user for imported content
        let importUser = await prisma.user.findFirst({
            where: { email: 'import@koreaminecraft.net' },
        });

        if (!importUser) {
            console.log('👤 Creating import user...');
            importUser = await prisma.user.create({
                data: {
                    email: 'import@koreaminecraft.net',
                    name: 'KoreaMinecraft Import',
                    role: 'ADMIN',
                },
            });
        }

        // Import servers
        console.log('\n📡 Importing servers...');
        const serverIds = await getServerIds();
        console.log(`Found ${serverIds.length} servers\n`);

        let importedServers = 0;
        for (const serverId of serverIds.slice(0, 20)) { // Limit to 20 for testing
            const serverData = await parseServerDetail(serverId);

            if (serverData) {
                try {
                    await prisma.server.create({
                        data: {
                            name: serverData.title,
                            description: serverData.description,
                            host: serverData.address,
                            port: serverData.port,
                            type: 'JAVA', // Default to JAVA
                            version: serverData.version,
                            tags: [...serverData.genres, ...serverData.tags],
                            discord: serverData.discord,
                            website: serverData.website,
                            userId: importUser.id,
                            isVerified: true, // Mark imported servers as verified
                        },
                    });

                    importedServers++;
                    console.log(`    ✅ Imported: ${serverData.title}`);
                } catch (error) {
                    console.error(`    ❌ Failed to save server:`, error);
                }
            }

            // Rate limiting - wait 1 second between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Import posts
        console.log('\n📝 Importing posts...');
        const posts = await getPosts(30);

        let importedPosts = 0;
        for (const post of posts) {
            try {
                await prisma.post.create({
                    data: {
                        title: post.title,
                        content: post.content,
                        category: post.category as any,
                        views: post.views,
                        userId: importUser.id,
                    },
                });

                importedPosts++;
                console.log(`    ✅ Imported: ${post.title}`);
            } catch (error) {
                console.error(`    ❌ Failed to save post:`, error);
            }
        }

        console.log('\n✨ Import completed!');
        console.log(`   Servers: ${importedServers}/${serverIds.length}`);
        console.log(`   Posts: ${importedPosts}/${posts.length}`);

    } catch (error) {
        console.error('❌ Import failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the import
importData()
    .catch(console.error);
