#!/bin/bash

echo "🚀 TEST COMPLET PHASE 6"
echo "========================"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Login admin
echo -e "${BLUE}📝 Login admin...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login échoué${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Token obtenu${NC}"

# 1. TEST CACHE
echo -e "\n${BLUE}📦 TEST 1: Cache Redis${NC}"
echo "Première requête (DB)..."
time curl -s -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN" > /dev/null

echo "Deuxième requête (Cache)..."
time curl -s -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN" > /dev/null

# 2. TEST API VERSIONING
echo -e "\n${BLUE}📚 TEST 2: API Versioning${NC}"
echo "API V1:"
curl -s -X GET http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer $TOKEN" | head -c 200
echo "..."

echo -e "\nAPI V2 (avec pagination):"
curl -s -X GET "http://localhost:3000/api/v2/users?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN" | head -c 200
echo "..."

# 3. TEST EXPORT
echo -e "\n${BLUE}📊 TEST 3: Export${NC}"
echo "Export Excel users:"
curl -I -s -X GET http://localhost:3000/api/export/users \
  -H "Authorization: Bearer $TOKEN" | head -n 5

# 4. TEST 2FA (si activé)
echo -e "\n${BLUE}🔐 TEST 4: 2FA Status${NC}"
curl -s -X GET http://localhost:3000/api/auth/2fa/status \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool 2>/dev/null

echo -e "\n${GREEN}✅ Tests phase 6 terminés!${NC}"
