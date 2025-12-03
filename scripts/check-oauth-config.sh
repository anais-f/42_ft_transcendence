#!/bin/bash

# Script de vérification de la configuration OAuth Google

echo "🔍 Vérification de la Configuration OAuth Google"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Fichier .env non trouvé${NC}"
    echo "   Créez-le à partir de .env.example :"
    echo "   cp .env.example .env"
    exit 1
fi

echo -e "${GREEN}✅ Fichier .env trouvé${NC}"
echo ""

# Source .env
set -a
source .env
set +a

# Check GOOGLE_CLIENT_ID
echo "📋 Vérification des variables d'environnement..."
echo ""

if [ -z "$GOOGLE_CLIENT_ID" ]; then
    echo -e "${RED}❌ GOOGLE_CLIENT_ID non défini${NC}"
    MISSING_VARS=true
else
    echo -e "${GREEN}✅ GOOGLE_CLIENT_ID défini${NC}"
    echo "   Valeur: ${GOOGLE_CLIENT_ID:0:20}..."
fi

# Check GOOGLE_CLIENT_SECRET
if [ -z "$GOOGLE_CLIENT_SECRET" ]; then
    echo -e "${RED}❌ GOOGLE_CLIENT_SECRET non défini${NC}"
    MISSING_VARS=true
else
    echo -e "${GREEN}✅ GOOGLE_CLIENT_SECRET défini${NC}"
    echo "   Valeur: ${GOOGLE_CLIENT_SECRET:0:10}..."
fi

# Check GOOGLE_CALLBACK_URI (optional)
if [ -z "$GOOGLE_CALLBACK_URI" ]; then
    echo -e "${YELLOW}⚠️  GOOGLE_CALLBACK_URI non défini (utilise la valeur par défaut)${NC}"
    CALLBACK_URI="http://localhost:8080/auth/login/google/callback"
    echo "   Défaut: $CALLBACK_URI"
else
    echo -e "${GREEN}✅ GOOGLE_CALLBACK_URI défini${NC}"
    CALLBACK_URI="$GOOGLE_CALLBACK_URI"
    echo "   Valeur: $CALLBACK_URI"
fi

echo ""

if [ "$MISSING_VARS" = true ]; then
    echo -e "${RED}❌ Configuration incomplète${NC}"
    echo ""
    echo "📚 Pour configurer OAuth :"
    echo "   1. Créez un projet sur https://console.cloud.google.com/"
    echo "   2. APIs & Services → Credentials"
    echo "   3. Créez un OAuth 2.0 Client ID"
    echo "   4. Ajoutez l'URI de redirection : $CALLBACK_URI"
    echo "   5. Copiez Client ID et Client Secret dans .env"
    echo ""
    echo "📖 Guide complet : services/auth/GOOGLE_OAUTH_SETUP.md"
    exit 1
fi

echo "🎯 URI de Callback à Configurer dans Google Cloud Console"
echo "==========================================================="
echo ""
echo "Allez sur : https://console.cloud.google.com/"
echo "Navigation : APIs & Services → Credentials → Votre OAuth Client"
echo ""
echo "Ajoutez cette URI dans 'Authorized redirect URIs' :"
echo -e "${GREEN}$CALLBACK_URI${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker n'est pas démarré${NC}"
    echo "   Démarrez Docker avant de continuer"
else
    echo -e "${GREEN}✅ Docker est démarré${NC}"
fi

echo ""
echo "📋 Prochaines Étapes"
echo "==================="
echo ""
echo "1. Vérifiez que l'URI est bien ajoutée dans Google Cloud Console"
echo "2. Redémarrez l'application :"
echo "   docker-compose down"
echo "   docker-compose up --build"
echo ""
echo "3. Vérifiez les logs du service auth :"
echo "   docker-compose logs auth | grep OAuth"
echo ""
echo "4. Testez la connexion Google :"
echo "   http://localhost:8080"
echo ""
echo "🆘 En cas de problème :"
echo "   Consultez services/auth/GOOGLE_OAUTH_SETUP.md"
echo ""
