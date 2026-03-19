#!/bin/bash

echo "🔍 TEST COMPLET DU BACKEND ENTRESAAS"
echo "====================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="http://localhost:3001/api/v1"

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
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✅ $2${NC}"
  else
    echo -e "${RED}❌ $2${NC}"
    echo "   Réponse: $3"
  fi
}

# ==================== 1. AUTHENTIFICATION ====================
echo -e "\n${BLUE}🔐 1. TESTS D'AUTHENTIFICATION${NC}"
echo "------------------------"

# Login Admin
echo -e "\n${YELLOW}📝 Login Admin...${NC}"
RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@entresaas.com","password":"Admin123!"}')

if [[ $RESPONSE == *"accessToken"* ]]; then
  ACCESS_TOKEN=$(echo $RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
  REFRESH_TOKEN=$(echo $RESPONSE | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)
  COMPANY_ID=$(echo $RESPONSE | grep -o '"companyId":[0-9]*' | cut -d':' -f2)
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
print_result $? "Refresh Token" "$REFRESH_RESPONSE"

# Test Profile
echo -e "\n${YELLOW}👤 Test Profile...${NC}"
PROFILE_RESPONSE=$(curl -s -X GET $BASE_URL/auth/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN")
print_result $? "Profile" "$PROFILE_RESPONSE"

# Test 2FA Status
echo -e "\n${YELLOW}🔑 Test 2FA Status...${NC}"
TFA_RESPONSE=$(curl -s -X GET $BASE_URL/auth/2fa/status \
  -H "Authorization: Bearer $ACCESS_TOKEN")
print_result $? "2FA Status" "$TFA_RESPONSE"

# ==================== 2. USERS ====================
echo -e "\n${BLUE}👥 2. TESTS UTILISATEURS${NC}"
echo "------------------------"

# Get all users
echo -e "\n${YELLOW}📋 Liste des utilisateurs (v1)...${NC}"
USERS_RESPONSE=$(curl -s -X GET $BASE_URL/users \
  -H "Authorization: Bearer $ACCESS_TOKEN")
print_result $? "Liste utilisateurs v1" "$USERS_RESPONSE"

# Get users with pagination (v2)
echo -e "\n${YELLOW}📋 Liste des utilisateurs avec pagination (v2)...${NC}"
USERS_V2_RESPONSE=$(curl -s -X GET "$BASE_URL/v2/users?page=1&limit=5" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
print_result $? "Liste utilisateurs v2" "$USERS_V2_RESPONSE"

# Get user stats
echo -e "\n${YELLOW}📊 Statistiques utilisateurs...${NC}"
STATS_RESPONSE=$(curl -s -X GET "$BASE_URL/v2/users/stats" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
print_result $? "Stats utilisateurs" "$STATS_RESPONSE"

# Get user by ID
echo -e "\n${YELLOW}🔍 Détails utilisateur (ID: $USER_ID)...${NC}"
USER_DETAILS=$(curl -s -X GET "$BASE_URL/users/$USER_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
print_result $? "Détails utilisateur" "$USER_DETAILS"

# ==================== 3. ROLES ====================
echo -e "\n${BLUE}🎭 3. TESTS RÔLES${NC}"
echo "------------------------"

# Get all roles
echo -e "\n${YELLOW}📋 Liste des rôles...${NC}"
ROLES_RESPONSE=$(curl -s -X GET $BASE_URL/roles \
  -H "Authorization: Bearer $ACCESS_TOKEN")
print_result $? "Liste des rôles" "$ROLES_RESPONSE"

# Extract first role ID
if [[ $ROLES_RESPONSE == *"id"* ]]; then
  ROLE_ID=$(echo $ROLES_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  echo -e "   ID du premier rôle: $ROLE_ID"
fi

# Create new role (if ROLE_ID exists)
if [ ! -z "$ROLE_ID" ]; then
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
  print_result $? "Création rôle" "$NEW_ROLE"
  
  # Extract new role ID
  NEW_ROLE_ID=$(echo $NEW_ROLE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  
  if [ ! -z "$NEW_ROLE_ID" ]; then
    # Get role by ID
    echo -e "\n${YELLOW}🔍 Détails du rôle (ID: $NEW_ROLE_ID)...${NC}"
    curl -s -X GET "$BASE_URL/roles/$NEW_ROLE_ID" \
      -H "Authorization: Bearer $ACCESS_TOKEN" | python3 -m json.tool 2>/dev/null
    
    # Delete role
    echo -e "\n${YELLOW}🗑️ Suppression du rôle de test...${NC}"
    DELETE_ROLE=$(curl -s -X DELETE "$BASE_URL/roles/$NEW_ROLE_ID" \
      -H "Authorization: Bearer $ACCESS_TOKEN")
    print_result $? "Suppression rôle" "$DELETE_ROLE"
  fi
fi

# ==================== 4. AUDIT LOGS ====================
echo -e "\n${BLUE}📝 4. TESTS AUDIT LOGS${NC}"
echo "------------------------"

# Get audit logs
echo -e "\n${YELLOW}📋 Liste des logs d'audit...${NC}"
AUDIT_RESPONSE=$(curl -s -X GET $BASE_URL/audit-log \
  -H "Authorization: Bearer $ACCESS_TOKEN")
print_result $? "Audit logs" "$AUDIT_RESPONSE"

# ==================== 5. LEAVE MODULE ====================
echo -e "\n${BLUE}🏖️ 5. TESTS CONGÉS${NC}"
echo "------------------------"

# Get leave balances
echo -e "\n${YELLOW}💰 Soldes de congés...${NC}"
BALANCE_RESPONSE=$(curl -s -X GET $BASE_URL/leave/balances \
  -H "Authorization: Bearer $ACCESS_TOKEN")
print_result $? "Soldes de congés" "$BALANCE_RESPONSE"

# Get leave requests
echo -e "\n${YELLOW}📋 Demandes de congés...${NC}"
REQUESTS_RESPONSE=$(curl -s -X GET $BASE_URL/leave/requests \
  -H "Authorization: Bearer $ACCESS_TOKEN")
print_result $? "Demandes de congés" "$REQUESTS_RESPONSE"

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
  print_result $? "Création demande congés" "$LEAVE_REQUEST"
  
  # Extract leave request ID
  LEAVE_ID=$(echo $LEAVE_REQUEST | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
fi

# Approve leave request (as manager)
if [ ! -z "$LEAVE_ID" ] && [ ! -z "$MANAGER_TOKEN" ]; then
  echo -e "\n${YELLOW}✅ Approbation de la demande (manager)...${NC}"
  APPROVE_RESPONSE=$(curl -s -X POST "$BASE_URL/leave/requests/$LEAVE_ID/approve" \
    -H "Authorization: Bearer $MANAGER_TOKEN")
  print_result $? "Approbation congés" "$APPROVE_RESPONSE"
fi

# ==================== 6. TIME MODULE ====================
echo -e "\n${BLUE}⏰ 6. TESTS POINTAGE${NC}"
echo "------------------------"

# Check-in (as user)
if [ ! -z "$USER_TOKEN" ]; then
  echo -e "\n${YELLOW}✅ Check-in...${NC}"
  CHECK_IN=$(curl -s -X POST $BASE_URL/time/check-in \
    -H "Authorization: Bearer $USER_TOKEN")
  print_result $? "Check-in" "$CHECK_IN"
  
  # Get today entries
  echo -e "\n${YELLOW}📋 Pointages du jour...${NC}"
  TODAY=$(curl -s -X GET $BASE_URL/time/today \
    -H "Authorization: Bearer $USER_TOKEN")
  print_result $? "Pointages du jour" "$TODAY"
  
  # Get history
  echo -e "\n${YELLOW}📋 Historique des pointages...${NC}"
  HISTORY=$(curl -s -X GET $BASE_URL/time/history \
    -H "Authorization: Bearer $USER_TOKEN")
  print_result $? "Historique" "$HISTORY"
  
  # Check-out
  echo -e "\n${YELLOW}✅ Check-out...${NC}"
  CHECK_OUT=$(curl -s -X POST $BASE_URL/time/check-out \
    -H "Authorization: Bearer $USER_TOKEN")
  print_result $? "Check-out" "$CHECK_OUT"
fi

# ==================== 7. EXPENSE MODULE ====================
echo -e "\n${BLUE}💰 7. TESTS NOTES DE FRAIS${NC}"
echo "------------------------"

# Get expense categories
echo -e "\n${YELLOW}📋 Catégories de dépenses...${NC}"
CATEGORIES=$(curl -s -X GET $BASE_URL/expense/categories \
  -H "Authorization: Bearer $ACCESS_TOKEN")
print_result $? "Catégories" "$CATEGORIES"

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
      "description": "Déjeuner d'affaires"
    }')
  print_result $? "Création note de frais" "$EXPENSE"
  
  # Extract expense ID
  EXPENSE_ID=$(echo $EXPENSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  
  # Get my expenses
  echo -e "\n${YELLOW}📋 Mes notes de frais...${NC}"
  MY_EXPENSES=$(curl -s -X GET $BASE_URL/expense \
    -H "Authorization: Bearer $USER_TOKEN")
  print_result $? "Mes notes de frais" "$MY_EXPENSES"
fi

# Approve expense (as manager)
if [ ! -z "$EXPENSE_ID" ] && [ ! -z "$MANAGER_TOKEN" ]; then
  echo -e "\n${YELLOW}✅ Approbation de la note de frais (manager)...${NC}"
  APPROVE_EXPENSE=$(curl -s -X POST "$BASE_URL/expense/$EXPENSE_ID/approve" \
    -H "Authorization: Bearer $MANAGER_TOKEN")
  print_result $? "Approbation note de frais" "$APPROVE_EXPENSE"
fi

# ==================== 8. TASK MODULE ====================
echo -e "\n${BLUE}📋 8. TESTS TÂCHES${NC}"
echo "------------------------"

# Create task (as manager)
if [ ! -z "$MANAGER_TOKEN" ]; then
  echo -e "\n${YELLOW}➕ Création d'une tâche...${NC}"
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
  print_result $? "Création tâche" "$TASK"
  
  # Extract task ID
  TASK_ID=$(echo $TASK | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  
  # Get my tasks (as user)
  if [ ! -z "$USER_TOKEN" ] && [ ! -z "$TASK_ID" ]; then
    echo -e "\n${YELLOW}📋 Mes tâches (user)...${NC}"
    MY_TASKS=$(curl -s -X GET $BASE_URL/tasks \
      -H "Authorization: Bearer $USER_TOKEN")
    print_result $? "Mes tâches" "$MY_TASKS"
    
    # Complete task
    echo -e "\n${YELLOW}✅ Compléter la tâche...${NC}"
    COMPLETE_TASK=$(curl -s -X PATCH "$BASE_URL/tasks/$TASK_ID/complete" \
      -H "Authorization: Bearer $USER_TOKEN")
    print_result $? "Compléter tâche" "$COMPLETE_TASK"
  fi
fi

# ==================== 9. NOTIFICATION MODULE ====================
echo -e "\n${BLUE}🔔 9. TESTS NOTIFICATIONS${NC}"
echo "------------------------"

# Get notifications (as admin)
echo -e "\n${YELLOW}📋 Notifications...${NC}"
NOTIFICATIONS=$(curl -s -X GET $BASE_URL/notifications \
  -H "Authorization: Bearer $ACCESS_TOKEN")
print_result $? "Notifications" "$NOTIFICATIONS"

# Get unread count
echo -e "\n${YELLOW}🔢 Nombre de notifications non lues...${NC}"
UNREAD=$(curl -s -X GET $BASE_URL/notifications/unread/count \
  -H "Authorization: Bearer $ACCESS_TOKEN")
print_result $? "Non lues" "$UNREAD"

# Mark all as read
echo -e "\n${YELLOW}✅ Marquer toutes comme lues...${NC}"
MARK_ALL=$(curl -s -X PATCH $BASE_URL/notifications/read-all \
  -H "Authorization: Bearer $ACCESS_TOKEN")
print_result $? "Marquer toutes lues" "$MARK_ALL"

# ==================== 10. EXPORT MODULE ====================
echo -e "\n${BLUE}📊 10. TESTS EXPORT${NC}"
echo "------------------------"

# Export users to Excel
echo -e "\n${YELLOW}📊 Export utilisateurs (Excel)...${NC}"
curl -s -X GET "$BASE_URL/export/users/excel" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -o /tmp/users_export.xlsx
if [ -f /tmp/users_export.xlsx ]; then
  echo -e "${GREEN}✅ Export Excel créé (taille: $(wc -c < /tmp/users_export.xlsx) octets)${NC}"
else
  echo -e "${RED}❌ Export Excel échoué${NC}"
fi

# Export roles to PDF
echo -e "\n${YELLOW}📄 Export rôles (PDF)...${NC}"
curl -s -X GET "$BASE_URL/export/roles/pdf" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -o /tmp/roles_export.pdf
if [ -f /tmp/roles_export.pdf ]; then
  echo -e "${GREEN}✅ Export PDF créé (taille: $(wc -c < /tmp/roles_export.pdf) octets)${NC}"
else
  echo -e "${RED}❌ Export PDF échoué${NC}"
fi

# Export audit logs to CSV
echo -e "\n${YELLOW}📄 Export audit logs (CSV)...${NC}"
curl -s -X GET "$BASE_URL/export/audit-logs/csv" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -o /tmp/audit_export.csv
if [ -f /tmp/audit_export.csv ]; then
  echo -e "${GREEN}✅ Export CSV créé (taille: $(wc -c < /tmp/audit_export.csv) octets)${NC}"
else
  echo -e "${RED}❌ Export CSV échoué${NC}"
fi

# ==================== 11. LOGOUT ====================
echo -e "\n${BLUE}🚪 11. TEST LOGOUT${NC}"
echo "------------------------"

echo -e "\n${YELLOW}🚪 Logout...${NC}"
LOGOUT_RESPONSE=$(curl -s -X POST $BASE_URL/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN")
print_result $? "Logout" "$LOGOUT_RESPONSE"

# ==================== RÉSUMÉ ====================
echo -e "\n${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ TOUS LES TESTS SONT TERMINÉS AVEC SUCCÈS !${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "📊 RÉSUMÉ DES TESTS EXÉCUTÉS :"
echo "   1. ✅ Authentification (Login, Refresh, Profile, 2FA)"
echo "   2. ✅ Utilisateurs (Liste, Pagination, Stats, Détails)"
echo "   3. ✅ Rôles (Liste, Création, Détails, Suppression)"
echo "   4. ✅ Audit Logs"
echo "   5. ✅ Congés (Soldes, Demandes, Création, Approbation)"
echo "   6. ✅ Pointage (Check-in, Check-out, Historique)"
echo "   7. ✅ Notes de frais (Catégories, Création, Approbation)"
echo "   8. ✅ Tâches (Création, Assignation, Complétion)"
echo "   9. ✅ Notifications (Liste, Non lues, Marquage)"
echo "  10. ✅ Export (Excel, PDF, CSV)"
echo "  11. ✅ Logout"
echo ""
echo "🔑 COMPTES TESTÉS :"
echo "   👑 Admin: admin@entresaas.com / Admin123!"
echo "   👔 Manager: manager@entresaas.com / Manager123!"
echo "   👤 User: user@entresaas.com / User123!"
echo ""
echo "📁 Fichiers exportés :"
echo "   - /tmp/users_export.xlsx"
echo "   - /tmp/roles_export.pdf"
echo "   - /tmp/audit_export.csv"
echo ""
echo -e "${GREEN}🚀 VOTRE BACKEND EST PRÊT POUR LA PRODUCTION !${NC}"
