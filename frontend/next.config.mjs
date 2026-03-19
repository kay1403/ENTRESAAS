/** @type {import('next').NextConfig} */
const nextConfig = {
  // Supprimer swcMinify car c'est automatique avec Turbopack
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Configuration Turbopack
  turbopack: {
    // Configurer les règles pour les loaders si nécessaire
    rules: {
      // Support pour les fichiers SVG comme composants React
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
    // Aliases de résolution
    resolveAlias: {
      '@/*': './src/*',
    },
    // Extensions à résoudre
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  },
  // Note: La configuration webpack n'est pas supportée par Turbopack
  // Si vous avez besoin de fonctionnalités webpack spécifiques, 
  // utilisez la configuration turbopack ci-dessus
}

export default nextConfig
