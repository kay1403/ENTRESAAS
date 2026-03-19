#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="http://localhost:3001/api/v1"

echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}              TEST MODULES RH ENTRESAAS                          ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"

# Login admin
echo -e "${YELLOW}📝 Login admin...${NC}"
ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@entresaas.com","password":"Admin123!"}')

ADMIN_TOKEN=$(echo $ADMIN_LOGIN | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
echo -e "${GREEN}✅ Admin connecté${NC}\n"

# Login manager
echo -e "${YELLOW}📝 Login manager...${NC}"
MANAGER_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@entresaas.com","password":"Manager123!"}')

MANAGER_TOKEN=$(echo $MANAGER_LOGIN | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
echo -e "${GREEN}✅ Manager connecté${NC}\n"

# Login user
echo -e "${YELLOW}📝 Login user...${NC}"
USER_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@entresaas.com","password":"User123!"}')

USER_TOKEN=$(echo $USER_LOGIN | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $USER_LOGIN | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo -e "${GREEN}✅ User connecté (ID: $USER_ID)${NC}\n"

# ==============================================
# TEST INFORMATIONS EMPLOYÉ
# ==============================================
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  TEST INFORMATIONS EMPLOYÉ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}Récupération profil utilisateur...${NC}"
PROFILE=$(curl -s -X GET "$BASE_URL/auth/profile" \
  -H "Authorization: Bearer $USER_TOKEN")

if [[ $PROFILE == *"employeeInfo"* ]]; then
  echo -e "${GREEN}✅ Informations employé récupérées${NC}"
  echo "$PROFILE" | python3 -m json.tool 2>/dev/null | head -20
else
  echo -e "${YELLOW}⚠️  Pas d'informations employé${NC}"
fi
echo ""

# ==============================================
# TEST CONGÉS
# ==============================================
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  TEST CONGÉS${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"

# Solde de congés
echo -e "${YELLOW}Solde de congés...${NC}"
BALANCES=$(curl -s -X GET "$BASE_URL/leave/balances" \
  -H "Authorization: Bearer $USER_TOKEN")

if [[ $BALANCES == *"leaveType"* ]]; then
  echo -e "${GREEN}✅ Solde récupéré${NC}"
  echo "$BALANCES" | python3 -m json.tool 2>/dev/null
else
  echo -e "${YELLOW}⚠️  Pas de solde${NC}"
fi
echo ""

# Demandes de congés
echo -e "${YELLOW}Demandes de congés...${NC}"
REQUESTS=$(curl -s -X GET "$BASE_URL/leave/requests" \
  -H "Authorization: Bearer $USER_TOKEN")

if [[ $REQUESTS == *"status"* ]]; then
  echo -e "${GREEN}✅ Demandes récupérées${NC}"
  echo "$REQUESTS" | python3 -m json.tool 2>/dev/null | head -30
else
  echo -e "${YELLOW}⚠️  Pas de demandes${NC}"
fi
echo ""

# ==============================================
# TEST POINTAGE
# ==============================================
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  TEST POINTAGE${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"

# Check-in
echo -e "${YELLOW}Check-in...${NC}"
CHECK_IN=$(curl -s -X POST "$BASE_URL/time/check-in" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"note": "Début journée"}')

if [[ $CHECK_IN == *"id"* ]] || [[ $CHECK_IN == *"success"* ]]; then
  echo -e "${GREEN}✅ Check-in effectué${NC}"
else
  echo -e "${YELLOW}⚠️  Check-in impossible${NC}"
fi
echo ""

# Check-out
echo -e "${YELLOW}Check-out...${NC}"
CHECK_OUT=$(curl -s -X POST "$BASE_URL/time/check-out" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"note": "Fin journée"}')

if [[ $CHECK_OUT == *"id"* ]] || [[ $CHECK_OUT == *"success"* ]]; then
  echo -e "${GREEN}✅ Check-out effectué${NC}"
else
  echo -e "${YELLOW}⚠️  Check-out impossible${NC}"
fi
echo ""

# Entrées du jour
echo -e "${YELLOW}Entrées du jour...${NC}"
TODAY=$(date +%Y-%m-%d)
TODAY_ENTRIES=$(curl -s -X GET "$BASE_URL/time/today" \
  -H "Authorization: Bearer $USER_TOKEN")

if [[ $TODAY_ENTRIES == *"type"* ]]; then
  echo -e "${GREEN}✅ Entrées récupérées${NC}"
  echo "$TODAY_ENTRIES" | python3 -m json.tool 2>/dev/null
else
  echo -e "${YELLOW}⚠️  Pas d'entrées${NC}"
fi
echo ""

# ==============================================
# TEST NOTES DE FRAIS
# ==============================================
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  TEST NOTES DE FRAIS${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"

# Catégories de dépenses
echo -e "${YELLOW}Catégories de dépenses...${NC}"
CATEGORIES=$(curl -s -X GET "$BASE_URL/expense/categories" \
  -H "Authorization: Bearer $USER_TOKEN")

if [[ $CATEGORIES == *"name"* ]]; then
  echo -e "${GREEN}✅ Catégories récupérées${NC}"
  echo "$CATEGORIES" | python3 -m json.tool 2>/dev/null | head -20
else
  echo -e "${YELLOW}⚠️  Pas de catégories${NC}"
fi
echo ""

# Création note de frais
echo -e "${YELLOW}Création note de frais...${NC}"
TODAY=$(date +%Y-%m-%d)
EXPENSE=$(curl -s -X POST "$BASE_URL/expense/claims" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"categoryId\": 1,
    \"amount\": 25.50,
    \"currency\": \"EUR\",
    \"date\": \"$TODAY\",
    \"description\": \"Repas d'affaires\"
  }")

if [[ $EXPENSE == *"id"* ]]; then
  EXPENSE_ID=$(echo $EXPENSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  echo -e "${GREEN}✅ Note de frais créée (ID: $EXPENSE_ID)${NC}"
else
  echo -e "${RED}❌ Échec création note de frais${NC}"
fi
echo ""

# ==============================================
# TEST TÂCHES
# ==============================================
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  TEST TÂCHES${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"

# Création tâche
echo -e "${YELLOW}Création tâche...${NC}"
TASK=$(curl -s -X POST "$BASE_URL/tasks" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Tâche test\",
    \"description\": \"Description de test\",
    \"priority\": \"MEDIUM\",
    \"assigneeIds\": [$USER_ID]
  }")

if [[ $TASK == *"id"* ]]; then
  TASK_ID=$(echo $TASK | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  echo -e "${GREEN}✅ Tâche créée (ID: $TASK_ID)${NC}"
else
  echo -e "${RED}❌ Échec création tâche${NC}"
fi
echo ""

# Liste des tâches
echo -e "${YELLOW}Liste des tâches...${NC}"
TASKS=$(curl -s -X GET "$BASE_URL/tasks" \
  -H "Authorization: Bearer $USER_TOKEN")

if [[ $TASKS == *"title"* ]]; then
  echo -e "${GREEN}✅ Tâches récupérées${NC}"
  echo "$TASKS" | python3 -m json.tool 2>/dev/null | head -20
else
  echo -e "${YELLOW}⚠️  Pas de tâches${NC}"
fi
echo ""

# ==============================================
# TEST NOTIFICATIONS
# ==============================================
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  TEST NOTIFICATIONS${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"

# Notifications
echo -e "${YELLOW}Liste des notifications...${NC}"
NOTIFICATIONS=$(curl -s -X GET "$BASE_URL/notifications" \
  -H "Authorization: Bearer $USER_TOKEN")

if [[ $NOTIFICATIONS == *"title"* ]]; then
  echo -e "${GREEN}✅ Notifications récupérées${NC}"
  echo "$NOTIFICATIONS" | python3 -m json.tool 2>/dev/null | head -20
else
  echo -e "${YELLOW}⚠️  Pas de notifications${NC}"
fi
echo ""

# Nombre non lues
echo -e "${YELLOW}Notifications non lues...${NC}"
UNREAD=$(curl -s -X GET "$BASE_URL/notifications/unread" \
  -H "Authorization: Bearer $USER_TOKEN")

if [[ $UNREAD == *"count"* ]]; then
  COUNT=$(echo $UNREAD | grep -o '"count":[0-9]*' | head -1 | cut -d':' -f2)
  echo -e "${GREEN}✅ $COUNT notification(s) non lue(s)${NC}"
else
  echo -e "${YELLOW}⚠️  Impossible de compter${NC}"
fi
echo ""

# ==============================================
# RÉSULTATS
# ==============================================
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}           ✅ TESTS RH TERMINÉS${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
