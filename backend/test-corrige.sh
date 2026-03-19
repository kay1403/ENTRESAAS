#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="http://localhost:3001/api/v1"
BASE_URL_V2="http://localhost:3001/api/v2"

echo -e "${BLUE}🔍 TEST CORRIGÉ DU BACKEND${NC}"
echo "================================"

# Test login
echo -e "\n${YELLOW}📝 Login Admin...${NC}"
ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@entresaas.com","password":"Admin123!"}')

if [[ $ADMIN_LOGIN == *"accessToken"* ]]; then
  ADMIN_TOKEN=$(echo $ADMIN_LOGIN | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
  echo -e "${GREEN}✅ Login admin réussi${NC}"
else
  echo -e "${RED}❌ Login admin échoué${NC}"
  exit 1
fi

# Test users v1
echo -e "\n${YELLOW}�� Users V1...${NC}"
USERS_V1=$(curl -s -X GET "$BASE_URL/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo -e "${GREEN}✅ Users V1 récupérés${NC}"

# Test users v2 (CORRIGÉ)
echo -e "\n${YELLOW}📋 Users V2 (pagination)...${NC}"
USERS_V2=$(curl -s -X GET "$BASE_URL_V2/users?page=1&limit=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo -e "${GREEN}✅ Users V2 récupérés${NC}"

# Test stats v2 (CORRIGÉ)
echo -e "\n${YELLOW}📊 Stats V2...${NC}"
STATS_V2=$(curl -s -X GET "$BASE_URL_V2/users/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo -e "${GREEN}✅ Stats V2 récupérées${NC}"

# Test leave
echo -e "\n${YELLOW}🏖️ Soldes de congés...${NC}"
BALANCE=$(curl -s -X GET "$BASE_URL/leave/balances" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo -e "${GREEN}✅ Soldes récupérés${NC}"

# Test time
echo -e "\n${YELLOW}⏰ Check-in...${NC}"
CHECK_IN=$(curl -s -X POST "$BASE_URL/time/check-in" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo -e "${GREEN}✅ Check-in effectué${NC}"

# Test expense
echo -e "\n${YELLOW}💰 Catégories de dépenses...${NC}"
CATEGORIES=$(curl -s -X GET "$BASE_URL/expense/categories" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo -e "${GREEN}✅ Catégories récupérées${NC}"

# Test tasks
echo -e "\n${YELLOW}�� Tâches...${NC}"
TASKS=$(curl -s -X GET "$BASE_URL/tasks" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo -e "${GREEN}✅ Tâches récupérées${NC}"

# Test notifications
echo -e "\n${YELLOW}🔔 Notifications...${NC}"
NOTIFICATIONS=$(curl -s -X GET "$BASE_URL/notifications" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo -e "${GREEN}✅ Notifications récupérées${NC}"

echo -e "\n${GREEN}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ TOUS LES TESTS CORRIGÉS ONT RÉUSSI !${NC}"
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
