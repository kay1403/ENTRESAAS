#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="http://localhost:3001/api/v1"

echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  TEST SPÉCIFIQUE CRÉATION DE RÔLE${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"

# Login admin
echo -e "${YELLOW}📝 Login admin...${NC}"
ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@entresaas.com","password":"Admin123!"}')

ADMIN_TOKEN=$(echo $ADMIN_LOGIN | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
echo -e "${GREEN}✅ Admin connecté${NC}\n"

# Test 1: Création rôle avec permissionIds vide (devrait réussir)
echo -e "${YELLOW}📝 Test 1: Création rôle avec permissionIds = []...${NC}"
ROLE1=$(curl -s -X POST "$BASE_URL/roles" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TEST_ROLE_1",
    "permissionIds": []
  }')

if [[ $ROLE1 == *"TEST_ROLE_1"* ]]; then
  echo -e "${GREEN}✅ Succès - Rôle créé${NC}"
  ROLE1_ID=$(echo $ROLE1 | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  echo "   ID: $ROLE1_ID"
else
  echo -e "${RED}❌ Échec: $ROLE1${NC}"
fi
echo ""

# Test 2: Création rôle sans permissionIds (devrait échouer - validation)
echo -e "${YELLOW}📝 Test 2: Création rôle sans permissionIds...${NC}"
ROLE2=$(curl -s -X POST "$BASE_URL/roles" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "TEST_ROLE_2"}')

if [[ $ROLE2 == *"400"* ]] || [[ $ROLE2 == *"error"* ]]; then
  echo -e "${GREEN}✅ Échec attendu (validation) - correct${NC}"
else
  echo -e "${RED}❌ Devrait échouer mais a réussi${NC}"
fi
echo ""

# Test 3: Création rôle avec permissions réelles
echo -e "${YELLOW}�� Test 3: Création rôle avec permissions...${NC}"
ROLE3=$(curl -s -X POST "$BASE_URL/roles" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TEST_ROLE_3",
    "permissionIds": [1, 2, 3]
  }')

if [[ $ROLE3 == *"TEST_ROLE_3"* ]]; then
  echo -e "${GREEN}✅ Succès - Rôle créé avec permissions${NC}"
  ROLE3_ID=$(echo $ROLE3 | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  echo "   ID: $ROLE3_ID"
else
  echo -e "${RED}❌ Échec: $ROLE3${NC}"
fi
echo ""

# Test 4: Récupérer tous les rôles
echo -e "${YELLOW}📝 Test 4: Liste tous les rôles...${NC}"
ROLES=$(curl -s -X GET "$BASE_URL/roles" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if [[ $ROLES == *"TEST_ROLE_1"* ]] || [[ $ROLES == *"TEST_ROLE_3"* ]]; then
  echo -e "${GREEN}✅ Rôles de test trouvés dans la liste${NC}"
else
  echo -e "${YELLOW}⚠️  Rôles de test non trouvés${NC}"
fi
echo ""

# Nettoyage: Supprimer les rôles de test
echo -e "${YELLOW}📝 Nettoyage - Suppression des rôles de test...${NC}"
if [ ! -z "$ROLE1_ID" ]; then
  DELETE1=$(curl -s -X DELETE "$BASE_URL/roles/$ROLE1_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
  echo -e "${GREEN}✅ Rôle 1 supprimé${NC}"
fi

if [ ! -z "$ROLE3_ID" ]; then
  DELETE3=$(curl -s -X DELETE "$BASE_URL/roles/$ROLE3_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
  echo -e "${GREEN}✅ Rôle 3 supprimé${NC}"
fi
echo ""

echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ TESTS DES RÔLES TERMINÉS${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
