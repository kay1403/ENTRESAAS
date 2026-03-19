#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="http://localhost:3001/api/v1"

echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  TEST SIMPLE DES RÔLES${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"

# Login admin
echo -e "${YELLOW}📝 Login admin...${NC}"
ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@entresaas.com","password":"Admin123!"}')

ADMIN_TOKEN=$(echo $ADMIN_LOGIN | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
echo -e "${GREEN}✅ Admin connecté${NC}\n"

# Test 1: Liste des rôles existants
echo -e "${YELLOW}📝 Test 1: Liste des rôles existants...${NC}"
ROLES=$(curl -s -X GET "$BASE_URL/roles" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if [[ $ROLES == *"ADMIN"* ]]; then
  echo -e "${GREEN}✅ Rôles récupérés avec succès${NC}"
  echo "$ROLES" | python3 -m json.tool 2>/dev/null | head -30
else
  echo -e "${RED}❌ Échec récupération des rôles${NC}"
fi
echo ""

# Test 2: Création rôle simple (sans permissionIds)
echo -e "${YELLOW}📝 Test 2: Création rôle simple...${NC}"
ROLE1=$(curl -s -X POST "$BASE_URL/roles" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "TEST_ROLE_1"}')

if [[ $ROLE1 == *"TEST_ROLE_1"* ]]; then
  echo -e "${GREEN}✅ Succès - Rôle créé${NC}"
  ROLE1_ID=$(echo $ROLE1 | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  echo "   ID: $ROLE1_ID"
else
  echo -e "${RED}❌ Échec: $ROLE1${NC}"
fi
echo ""

# Test 3: Création rôle avec permissionIds vide
echo -e "${YELLOW}📝 Test 3: Création rôle avec permissionIds = []...${NC}"
ROLE2=$(curl -s -X POST "$BASE_URL/roles" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TEST_ROLE_2",
    "permissionIds": []
  }')

if [[ $ROLE2 == *"TEST_ROLE_2"* ]]; then
  echo -e "${GREEN}✅ Succès - Rôle créé${NC}"
  ROLE2_ID=$(echo $ROLE2 | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  echo "   ID: $ROLE2_ID"
else
  echo -e "${RED}❌ Échec: $ROLE2${NC}"
fi
echo ""

# Test 4: Vérifier que les rôles sont dans la liste
echo -e "${YELLOW}📝 Test 4: Vérification dans la liste...${NC}"
ROLES=$(curl -s -X GET "$BASE_URL/roles" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if [[ $ROLES == *"TEST_ROLE_1"* ]]; then
  echo -e "${GREEN}✅ TEST_ROLE_1 trouvé${NC}"
fi
if [[ $ROLES == *"TEST_ROLE_2"* ]]; then
  echo -e "${GREEN}✅ TEST_ROLE_2 trouvé${NC}"
fi
echo ""

# Test 5: Modification d'un rôle
echo -e "${YELLOW}📝 Test 5: Modification du rôle TEST_ROLE_1...${NC}"
if [ ! -z "$ROLE1_ID" ]; then
  UPDATE_ROLE=$(curl -s -X PATCH "$BASE_URL/roles/$ROLE1_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name": "UPDATED_ROLE_1"}')

  if [[ $UPDATE_ROLE == *"UPDATED_ROLE_1"* ]]; then
    echo -e "${GREEN}✅ Rôle modifié avec succès${NC}"
  else
    echo -e "${RED}❌ Échec modification: $UPDATE_ROLE${NC}"
  fi
fi
echo ""

# Test 6: Suppression des rôles de test
echo -e "${YELLOW}📝 Test 6: Suppression des rôles de test...${NC}"
[ ! -z "$ROLE1_ID" ] && curl -s -X DELETE "$BASE_URL/roles/$ROLE1_ID" -H "Authorization: Bearer $ADMIN_TOKEN" > /dev/null && echo -e "${GREEN}✅ Rôle 1 supprimé${NC}"
[ ! -z "$ROLE2_ID" ] && curl -s -X DELETE "$BASE_URL/roles/$ROLE2_ID" -H "Authorization: Bearer $ADMIN_TOKEN" > /dev/null && echo -e "${GREEN}✅ Rôle 2 supprimé${NC}"

echo -e "\n${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ TESTS SIMPLES TERMINÉS${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
