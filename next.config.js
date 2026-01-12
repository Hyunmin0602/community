/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['api.dicebear.com', 'cafeptthumb-phinf.pstatic.net', 'images.unsplash.com', 'images.velog.io'],
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
};

module.exports = nextConfig;
