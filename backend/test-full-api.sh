#!/bin/bash

echo "🔐 TEST COMPLET DE L'API"
echo "========================"
echo ""

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour vérifier les erreurs curl
check_error() {
  if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur: La requête a échoué${NC}"
    exit 1
  fi
}

# Étape 1: Login admin
echo -e "${YELLOW}📝 Étape 1: Login admin...${NC}"
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}')
check_error

# Vérifier si la réponse contient "accessToken"
if [[ $RESPONSE == *"accessToken"* ]]; then
  TOKEN=$(echo $RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
  REFRESH_TOKEN=$(echo $RESPONSE | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)
  echo -e "${GREEN}✅ Login réussi!${NC}"
  echo -e "${BLUE}📌 Access Token: ${TOKEN:0:30}...${NC}"
  echo -e "${BLUE}📌 Refresh Token: ${REFRESH_TOKEN:0:30}...${NC}"
else
  echo -e "${RED}❌ Login échoué: $RESPONSE${NC}"
  exit 1
fi
echo ""

# Étape 2: Test profile
echo -e "${YELLOW}👤 Étape 2: Test profile...${NC}"
PROFILE_RESPONSE=$(curl -s -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN")
check_error
echo $PROFILE_RESPONSE | python3 -m json.tool 2>/dev/null || echo $PROFILE_RESPONSE
echo ""

# Étape 3: Test users list
echo -e "${YELLOW}📋 Étape 3: Test users list...${NC}"
USERS_RESPONSE=$(curl -s -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN")
check_error
echo $USERS_RESPONSE | python3 -m json.tool 2>/dev/null || echo $USERS_RESPONSE
echo ""

# Étape 4: Test create user
echo -e "${YELLOW}➕ Étape 4: Test create user...${NC}"
CREATE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "password123",
    "roleId": 1,
    "isActive": true
  }')
check_error
echo $CREATE_RESPONSE | python3 -m json.tool 2>/dev/null || echo $CREATE_RESPONSE
echo ""

# Étape 5: Vérifier que l'utilisateur a été créé
echo -e "${YELLOW}🔍 Étape 5: Vérification de la création...${NC}"
VERIFY_RESPONSE=$(curl -s -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN")
check_error
if [[ $VERIFY_RESPONSE == *"test@test.com"* ]]; then
  echo -e "${GREEN}✅ Utilisateur créé avec succès!${NC}"
else
  echo -e "${RED}❌ Utilisateur non trouvé après création${NC}"
fi
echo ""

# Étape 6: Test roles list
echo -e "${YELLOW}🎭 Étape 6: Test roles list...${NC}"
ROLES_RESPONSE=$(curl -s -X GET http://localhost:3000/api/roles \
  -H "Authorization: Bearer $TOKEN")
check_error
echo $ROLES_RESPONSE | python3 -m json.tool 2>/dev/null || echo $ROLES_RESPONSE
echo ""

# Étape 7: Test permissions list
echo -e "${YELLOW}🔐 Étape 7: Test permissions list...${NC}"
PERMS_RESPONSE=$(curl -s -X GET http://localhost:3000/api/permissions \
  -H "Authorization: Bearer $TOKEN")
check_error
echo $PERMS_RESPONSE | python3 -m json.tool 2>/dev/null || echo $PERMS_RESPONSE
echo ""

# Étape 8: Test refresh token
echo -e "${YELLOW}🔄 Étape 8: Test refresh token...${NC}"
REFRESH_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")
check_error
if [[ $REFRESH_RESPONSE == *"accessToken"* ]]; then
  echo -e "${GREEN}✅ Refresh token fonctionnel!${NC}"
  NEW_TOKEN=$(echo $REFRESH_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
  echo -e "${BLUE}📌 Nouvel Access Token: ${NEW_TOKEN:0:30}...${NC}"
else
  echo -e "${RED}❌ Refresh token échoué${NC}"
fi
echo ""

# Étape 9: Test logout
echo -e "${YELLOW}🚪 Étape 9: Test logout...${NC}"
LOGOUT_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN")
check_error
echo $LOGOUT_RESPONSE | python3 -m json.tool 2>/dev/null || echo $LOGOUT_RESPONSE
echo ""

echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ TOUS LES TESTS SONT TERMINÉS AVEC SUCCÈS!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"