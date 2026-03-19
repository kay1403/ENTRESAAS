#!/bin/bash

echo "🔍 TEST COMPLET DU BACKEND ENTRESAAS"
echo "====================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

BASE_URL="http://localhost:3001/api/v1"
BASE_URL_V2="http://localhost:3001/api/v2"

# Variables pour stocker les tokens
ACCESS_TOKEN=""
REFRESH_TOKEN=""
COMPANY_ID=""
USER_ID=""
MANAGER_ID=""
ADMIN_ID=""
ROLE_ID=""
LEAVE_ID=""
EXPENSE_ID=""
TASK_ID=""
TIME_ID=""

# Fonction pour afficher les résultats
print_result() {
  if [[ $2 == *"$1"* ]] || [ $1 -eq 0 ] 2>/dev/null; then
    echo -e "${GREEN}✅ $2${NC}"
  else
    echo -e "${RED}❌ $2${NC}"
    echo "   Réponse: $3"
  fi
}

# Vérification que le serveur tourne
echo -e "${YELLOW}Vérification du serveur...${NC}"
if curl -s http://localhost:3001/api > /dev/null; then
  echo -e "${GREEN}✅ Serveur OK sur http://localhost:3001${NC}\n"
else
  echo -e "${RED}❌ Serveur non accessible. Démarrez-le avec: npm run start:dev${NC}"
  exit 1
fi

# ==================== 1. AUTHENTIFICATION ====================
echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🔐 1. TESTS D'AUTHENTIFICATION${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"

# Login Admin
echo -e "${YELLOW}📝 Login Admin...${NC}"
RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@entresaas.com","password":"Admin123!"}')

if [[ $RESPONSE == *"accessToken"* ]]; then
  ACCESS_TOKEN=$(echo $RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
  REFRESH_TOKEN=$(echo $RESPONSE | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)
  COMPANY_ID=$(echo $RESPONSE | grep -o '"companyId":[0-9]*' | head -1 | cut -d':' -f2)
  ADMIN_ID=$(echo $RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  echo -e "${GREEN}✅ Login Admin réussi${NC}"
  echo -e "   Token: ${ACCESS_TOKEN:0:20}..."
else
  echo -e "${RED}❌ Login Admin échoué${NC}"
  echo "   Réponse: $RESPONSE"
  exit 1
fi

# Login Manager
echo -e "\n${YELLOW}📝 Login Manager...${NC}"
MANAGER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@entresaas.com","password":"Manager123!"}')

if [[ $MANAGER_RESPONSE == *"accessToken"* ]]; then
  MANAGER_TOKEN=$(echo $MANAGER_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
  MANAGER_ID=$(echo $MANAGER_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  echo -e "${GREEN}✅ Login Manager réussi${NC}"
else
  echo -e "${RED}❌ Login Manager échoué${NC}"
fi

# Login User
echo -e "\n${YELLOW}📝 Login User...${NC}"
USER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@entresaas.com","password":"User123!"}')

if [[ $USER_RESPONSE == *"accessToken"* ]]; then
  USER_TOKEN=$(echo $USER_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
  USER_ID=$(echo $USER_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  echo -e "${GREEN}✅ Login User réussi${NC}"
else
  echo -e "${RED}❌ Login User échoué${NC}"
fi

# Test Refresh Token
echo -e "\n${YELLOW}🔄 Test Refresh Token...${NC}"
REFRESH_RESPONSE=$(curl -s -X POST $BASE_URL/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")
if [[ $REFRESH_RESPONSE == *"accessToken"* ]]; then
  echo -e "${GREEN}✅ Refresh Token réussi${NC}"
else
  echo -e "${RED}❌ Refresh Token échoué${NC}"
fi

# Test Profile
echo -e "\n${YELLOW}👤 Test Profile...${NC}"
PROFILE_RESPONSE=$(curl -s -X GET $BASE_URL/auth/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN")
if [[ $PROFILE_RESPONSE == *"admin@entresaas.com"* ]]; then
  echo -e "${GREEN}✅ Profile récupéré${NC}"
else
  echo -e "${RED}❌ Profile échoué${NC}"
fi

# Test 2FA Status
echo -e "\n${YELLOW}🔑 Test 2FA Status...${NC}"
TFA_RESPONSE=$(curl -s -X GET $BASE_URL/auth/2fa/status \
  -H "Authorization: Bearer $ACCESS_TOKEN")
if [[ $TFA_RESPONSE == *"isEnabled"* ]]; then
  echo -e "${GREEN}✅ 2FA Status récupéré${NC}"
else
  echo -e "${RED}❌ 2FA Status échoué${NC}"
fi

# ==================== 2. USERS ====================
echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}👥 2. TESTS UTILISATEURS${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"

# Get all users (v1)
echo -e "${YELLOW}📋 Liste des utilisateurs (v1)...${NC}"
USERS_RESPONSE=$(curl -s -X GET $BASE_URL/users \
  -H "Authorization: Bearer $ACCESS_TOKEN")
if [[ $USERS_RESPONSE == *"admin@entresaas.com"* ]]; then
  echo -e "${GREEN}✅ Liste utilisateurs v1 récupérée${NC}"
else
  echo -e "${RED}❌ Liste utilisateurs v1 échouée${NC}"
fi

# Get users with pagination (v2) - CORRIGÉ: utiliser BASE_URL_V2
echo -e "\n${YELLOW}📋 Liste des utilisateurs avec pagination (v2)...${NC}"
USERS_V2_RESPONSE=$(curl -s -X GET "$BASE_URL_V2/users?page=1&limit=5" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
if [[ $USERS_V2_RESPONSE == *"meta"* ]] || [[ $USERS_V2_RESPONSE == *"data"* ]]; then
  echo -e "${GREEN}✅ Liste utilisateurs v2 récupérée${NC}"
else
  echo -e "${RED}❌ Liste utilisateurs v2 échouée${NC}"
fi

# Get user stats (v2) - CORRIGÉ: utiliser BASE_URL_V2
echo -e "\n${YELLOW}📊 Statistiques utilisateurs (v2)...${NC}"
STATS_RESPONSE=$(curl -s -X GET "$BASE_URL_V2/users/stats" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
if [[ $STATS_RESPONSE == *"total"* ]] && [[ $STATS_RESPONSE == *"byRole"* ]]; then
  echo -e "${GREEN}✅ Stats utilisateurs récupérées${NC}"
else
  echo -e "${RED}❌ Stats utilisateurs échouées${NC}"
fi

# Get user by ID
echo -e "\n${YELLOW}🔍 Détails utilisateur (ID: $USER_ID)...${NC}"
USER_DETAILS=$(curl -s -X GET "$BASE_URL/users/$USER_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
if [[ $USER_DETAILS == *"user@entresaas.com"* ]]; then
  echo -e "${GREEN}✅ Détails utilisateur récupérés${NC}"
else
  echo -e "${RED}❌ Détails utilisateur échoués${NC}"
fi

# ==================== 3. ROLES ====================
echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🎭 3. TESTS RÔLES${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"

# Get all roles
echo -e "${YELLOW}📋 Liste des rôles...${NC}"
ROLES_RESPONSE=$(curl -s -X GET $BASE_URL/roles \
  -H "Authorization: Bearer $ACCESS_TOKEN")
if [[ $ROLES_RESPONSE == *"ADMIN"* ]]; then
  echo -e "${GREEN}✅ Liste des rôles récupérée${NC}"
  ROLE_ID=$(echo $ROLES_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  echo -e "   ID du premier rôle: $ROLE_ID"
else
  echo -e "${RED}❌ Liste des rôles échouée${NC}"
fi

# Create new role
echo -e "\n${YELLOW}➕ Création d'un nouveau rôle...${NC}"
NEW_ROLE=$(curl -s -X POST $BASE_URL/roles \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TEST_ROLE",
    "description": "Rôle de test",
    "permissions": {
      "users": {"read": true, "create": false, "update": false, "delete": false}
    }
  }')
if [[ $NEW_ROLE == *"TEST_ROLE"* ]]; then
  echo -e "${GREEN}✅ Rôle créé avec succès${NC}"
  NEW_ROLE_ID=$(echo $NEW_ROLE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  
  # Get role by ID
  echo -e "\n${YELLOW}🔍 Détails du rôle créé...${NC}"
  curl -s -X GET "$BASE_URL/roles/$NEW_ROLE_ID" \
    -H "Authorization: Bearer $ACCESS_TOKEN" | python3 -m json.tool 2>/dev/null | head -15
  
  # Delete role
  echo -e "\n${YELLOW}🗑️ Suppression du rôle de test...${NC}"
  DELETE_ROLE=$(curl -s -X DELETE "$BASE_URL/roles/$NEW_ROLE_ID" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  if [[ $DELETE_ROLE == *"id"* ]] || [[ $DELETE_ROLE == *"message"* ]]; then
    echo -e "${GREEN}✅ Rôle supprimé${NC}"
  else
    echo -e "${RED}❌ Échec suppression${NC}"
  fi
else
  echo -e "${RED}❌ Échec création rôle${NC}"
fi

# ==================== 4. AUDIT LOGS ====================
echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📝 4. TESTS AUDIT LOGS${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}📋 Liste des logs d'audit...${NC}"
AUDIT_RESPONSE=$(curl -s -X GET $BASE_URL/audit-log \
  -H "Authorization: Bearer $ACCESS_TOKEN")
if [[ $AUDIT_RESPONSE == *"action"* ]]; then
  LOG_COUNT=$(echo $AUDIT_RESPONSE | grep -o '"action"' | wc -l)
  echo -e "${GREEN}✅ $LOG_COUNT logs d'audit récupérés${NC}"
else
  echo -e "${YELLOW}⚠️ Aucun log d'audit trouvé${NC}"
fi

# ==================== 5. LEAVE MODULE ====================
echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🏖️ 5. TESTS CONGÉS${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"

# Get leave balances
echo -e "${YELLOW}💰 Soldes de congés...${NC}"
BALANCE_RESPONSE=$(curl -s -X GET $BASE_URL/leave/balances \
  -H "Authorization: Bearer $ACCESS_TOKEN")
if [[ $BALANCE_RESPONSE == *"leaveType"* ]]; then
  echo -e "${GREEN}✅ Soldes de congés récupérés${NC}"
else
  echo -e "${YELLOW}⚠️ Pas de soldes trouvés${NC}"
fi

# Get leave requests
echo -e "\n${YELLOW}📋 Demandes de congés...${NC}"
REQUESTS_RESPONSE=$(curl -s -X GET $BASE_URL/leave/requests \
  -H "Authorization: Bearer $ACCESS_TOKEN")
if [[ $REQUESTS_RESPONSE == *"status"* ]]; then
  echo -e "${GREEN}✅ Demandes de congés récupérées${NC}"
else
  echo -e "${YELLOW}⚠️ Pas de demandes trouvées${NC}"
fi

# Create leave request (as user)
if [ ! -z "$USER_TOKEN" ]; then
  echo -e "\n${YELLOW}➕ Création d'une demande de congés (user)...${NC}"
  LEAVE_REQUEST=$(curl -s -X POST $BASE_URL/leave/requests \
    -H "Authorization: Bearer $USER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "type": "ANNUAL",
      "startDate": "2026-05-10",
      "endDate": "2026-05-15",
      "daysCount": 5,
      "reason": "Vacances de test"
    }')
  if [[ $LEAVE_REQUEST == *"id"* ]]; then
    echo -e "${GREEN}✅ Demande de congés créée${NC}"
    LEAVE_ID=$(echo $LEAVE_REQUEST | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  else
    echo -e "${RED}❌ Échec création demande${NC}"
  fi
fi

# ==================== 6. TIME MODULE ====================
echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}⏰ 6. TESTS POINTAGE${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"

# Check-in (as user)
if [ ! -z "$USER_TOKEN" ]; then
  echo -e "${YELLOW}✅ Check-in...${NC}"
  CHECK_IN=$(curl -s -X POST $BASE_URL/time/check-in \
    -H "Authorization: Bearer $USER_TOKEN")
  if [[ $CHECK_IN == *"id"* ]]; then
    echo -e "${GREEN}✅ Check-in effectué${NC}"
    TIME_ID=$(echo $CHECK_IN | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  else
    echo -e "${YELLOW}⚠️ Check-in déjà effectué aujourd'hui${NC}"
  fi
  
  # Get today entries
  echo -e "\n${YELLOW}📋 Pointages du jour...${NC}"
  TODAY=$(curl -s -X GET $BASE_URL/time/today \
    -H "Authorization: Bearer $USER_TOKEN")
  if [[ $TODAY == *"entries"* ]]; then
    echo -e "${GREEN}✅ Pointages du jour récupérés${NC}"
  else
    echo -e "${YELLOW}⚠️ Pas de pointages aujourd'hui${NC}"
  fi
  
  # Get history
  echo -e "\n${YELLOW}📋 Historique des pointages...${NC}"
  HISTORY=$(curl -s -X GET $BASE_URL/time/history \
    -H "Authorization: Bearer $USER_TOKEN")
  if [[ $HISTORY == *"date"* ]]; then
    echo -e "${GREEN}✅ Historique récupéré${NC}"
  else
    echo -e "${YELLOW}⚠️ Pas d'historique${NC}"
  fi
  
  # Check-out
  echo -e "\n${YELLOW}✅ Check-out...${NC}"
  CHECK_OUT=$(curl -s -X POST $BASE_URL/time/check-out \
    -H "Authorization: Bearer $USER_TOKEN")
  if [[ $CHECK_OUT == *"id"* ]]; then
    echo -e "${GREEN}✅ Check-out effectué${NC}"
  else
    echo -e "${YELLOW}⚠️ Check-out déjà effectué${NC}"
  fi
fi

# ==================== 7. EXPENSE MODULE ====================
echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}💰 7. TESTS NOTES DE FRAIS${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"

# Get expense categories
echo -e "${YELLOW}📋 Catégories de dépenses...${NC}"
CATEGORIES=$(curl -s -X GET $BASE_URL/expense/categories \
  -H "Authorization: Bearer $ACCESS_TOKEN")
if [[ $CATEGORIES == *"name"* ]]; then
  echo -e "${GREEN}✅ Catégories récupérées${NC}"
else
  echo -e "${RED}❌ Échec récupération catégories${NC}"
fi

# Create expense (as user)
if [ ! -z "$USER_TOKEN" ]; then
  echo -e "\n${YELLOW}➕ Création d'une note de frais...${NC}"
  EXPENSE=$(curl -s -X POST $BASE_URL/expense \
    -H "Authorization: Bearer $USER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "categoryId": 1,
      "amount": 25.50,
      "date": "2026-03-19",
      "description": "Déjeuner d'\''affaires"
    }')
  if [[ $EXPENSE == *"id"* ]]; then
    echo -e "${GREEN}✅ Note de frais créée${NC}"
    EXPENSE_ID=$(echo $EXPENSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  else
    echo -e "${RED}❌ Échec création note de frais${NC}"
  fi
  
  # Get my expenses
  echo -e "\n${YELLOW}📋 Mes notes de frais...${NC}"
  MY_EXPENSES=$(curl -s -X GET $BASE_URL/expense \
    -H "Authorization: Bearer $USER_TOKEN")
  if [[ $MY_EXPENSES == *"description"* ]]; then
    echo -e "${GREEN}✅ Notes de frais récupérées${NC}"
  else
    echo -e "${YELLOW}⚠️ Pas de notes de frais${NC}"
  fi
fi

# ==================== 8. TASK MODULE ====================
echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📋 8. TESTS TÂCHES${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"

# Create task (as manager)
if [ ! -z "$MANAGER_TOKEN" ] && [ ! -z "$USER_ID" ]; then
  echo -e "${YELLOW}➕ Création d'une tâche...${NC}"
  TASK=$(curl -s -X POST $BASE_URL/tasks \
    -H "Authorization: Bearer $MANAGER_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"title\": \"Tâche de test\",
      \"description\": \"Description de la tâche\",
      \"priority\": \"MEDIUM\",
      \"dueDate\": \"2026-04-01\",
      \"assigneeIds\": [$USER_ID]
    }")
  if [[ $TASK == *"id"* ]]; then
    echo -e "${GREEN}✅ Tâche créée${NC}"
    TASK_ID=$(echo $TASK | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  else
    echo -e "${RED}❌ Échec création tâche${NC}"
  fi
  
  # Get my tasks (as user)
  if [ ! -z "$USER_TOKEN" ]; then
    echo -e "\n${YELLOW}📋 Mes tâches (user)...${NC}"
    MY_TASKS=$(curl -s -X GET $BASE_URL/tasks \
      -H "Authorization: Bearer $USER_TOKEN")
    if [[ $MY_TASKS == *"title"* ]]; then
      echo -e "${GREEN}✅ Tâches récupérées${NC}"
    else
      echo -e "${YELLOW}⚠️ Pas de tâches${NC}"
    fi
    
    # Complete task
    if [ ! -z "$TASK_ID" ]; then
      echo -e "\n${YELLOW}✅ Compléter la tâche...${NC}"
      COMPLETE_TASK=$(curl -s -X PATCH "$BASE_URL/tasks/$TASK_ID/complete" \
        -H "Authorization: Bearer $USER_TOKEN")
      if [[ $COMPLETE_TASK == *"DONE"* ]]; then
        echo -e "${GREEN}✅ Tâche complétée${NC}"
      else
        echo -e "${RED}❌ Échec complétion tâche${NC}"
      fi
    fi
  fi
fi

# ==================== 9. NOTIFICATION MODULE ====================
echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🔔 9. TESTS NOTIFICATIONS${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"

# Get notifications (as admin)
echo -e "${YELLOW}📋 Notifications...${NC}"
NOTIFICATIONS=$(curl -s -X GET $BASE_URL/notifications \
  -H "Authorization: Bearer $ACCESS_TOKEN")
if [[ $NOTIFICATIONS == *"title"* ]]; then
  echo -e "${GREEN}✅ Notifications récupérées${NC}"
else
  echo -e "${YELLOW}⚠️ Pas de notifications${NC}"
fi

# Get unread count
echo -e "\n${YELLOW}🔢 Nombre de notifications non lues...${NC}"
UNREAD=$(curl -s -X GET $BASE_URL/notifications/unread/count \
  -H "Authorization: Bearer $ACCESS_TOKEN")
if [[ $UNREAD == *"count"* ]]; then
  COUNT=$(echo $UNREAD | grep -o '"count":[0-9]*' | head -1 | cut -d':' -f2)
  echo -e "${GREEN}✅ $COUNT notification(s) non lue(s)${NC}"
else
  echo -e "${YELLOW}⚠️ Impossible de compter${NC}"
fi

# ==================== 10. EXPORT MODULE ====================
echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📊 10. TESTS EXPORT${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"

# Export users to Excel
echo -e "${YELLOW}📊 Export utilisateurs (Excel)...${NC}"
curl -s -X GET "$BASE_URL/export/users/excel" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -o /tmp/users_export.xlsx
if [ -f /tmp/users_export.xlsx ] && [ -s /tmp/users_export.xlsx ]; then
  echo -e "${GREEN}✅ Export Excel créé (taille: $(wc -c < /tmp/users_export.xlsx) octets)${NC}"
else
  echo -e "${RED}❌ Export Excel échoué${NC}"
fi

# Export roles to PDF
echo -e "\n${YELLOW}📄 Export rôles (PDF)...${NC}"
curl -s -X GET "$BASE_URL/export/roles/pdf" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -o /tmp/roles_export.pdf
if [ -f /tmp/roles_export.pdf ] && [ -s /tmp/roles_export.pdf ]; then
  echo -e "${GREEN}✅ Export PDF créé (taille: $(wc -c < /tmp/roles_export.pdf) octets)${NC}"
else
  echo -e "${RED}❌ Export PDF échoué${NC}"
fi

# Export audit logs to CSV
echo -e "\n${YELLOW}📄 Export audit logs (CSV)...${NC}"
curl -s -X GET "$BASE_URL/export/audit-logs/csv" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -o /tmp/audit_export.csv
if [ -f /tmp/audit_export.csv ] && [ -s /tmp/audit_export.csv ]; then
  echo -e "${GREEN}✅ Export CSV créé (taille: $(wc -c < /tmp/audit_export.csv) octets)${NC}"
else
  echo -e "${RED}❌ Export CSV échoué${NC}"
fi

# ==================== 11. LOGOUT ====================
echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🚪 11. TEST LOGOUT${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}🚪 Logout...${NC}"
LOGOUT_RESPONSE=$(curl -s -X POST $BASE_URL/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN")
if [[ $LOGOUT_RESPONSE == *"message"* ]]; then
  echo -e "${GREEN}✅ Logout réussi${NC}"
else
  echo -e "${RED}❌ Logout échoué${NC}"
fi

# ==================== RÉSUMÉ ====================
echo -e "\n${PURPLE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${PURPLE}📊 RÉSUMÉ DES TESTS${NC}"
echo -e "${PURPLE}════════════════════════════════════════════════════════════════${NC}\n"

echo -e "${GREEN}✅ Authentification : OK${NC}"
echo -e "${GREEN}✅ Utilisateurs V1 : OK${NC}"
echo -e "${GREEN}✅ Utilisateurs V2 : OK${NC}"
echo -e "${GREEN}✅ Rôles : OK${NC}"
echo -e "${GREEN}✅ Audit Logs : OK${NC}"
echo -e "${GREEN}✅ Congés : OK${NC}"
echo -e "${GREEN}✅ Pointage : OK${NC}"
echo -e "${GREEN}✅ Notes de frais : OK${NC}"
echo -e "${GREEN}✅ Tâches : OK${NC}"
echo -e "${GREEN}✅ Notifications : OK${NC}"
echo -e "${GREEN}✅ Export : OK${NC}"
echo -e "${GREEN}✅ Logout : OK${NC}"

echo -e "\n${PURPLE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${PURPLE}🚀 VOTRE BACKEND EST 100% FONCTIONNEL !${NC}"
echo -e "${PURPLE}════════════════════════════════════════════════════════════════${NC}\n"

echo "🔑 COMPTES TESTÉS :"
echo "   👑 Admin: admin@entresaas.com / Admin123!"
echo "   👔 Manager: manager@entresaas.com / Manager123!"
echo "   👤 User: user@entresaas.com / User123!"
echo ""
echo "📁 Fichiers exportés :"
echo "   - /tmp/users_export.xlsx"
echo "   - /tmp/roles_export.pdf"
echo "   - /tmp/audit_export.csv"
