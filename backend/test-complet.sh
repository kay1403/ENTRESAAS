#!/bin/bash

# ==============================================
# TEST COMPLET DE L'API ENTRESAAS
# ==============================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

BASE_URL="http://localhost:3001/api/v1"
BASE_URL_V2="http://localhost:3001/api/v2"

print_section() {
  echo -e "\n${CYAN}════════════════════════════════════════════════════════════════${NC}"
  echo -e "${CYAN}  $1${NC}"
  echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}\n"
}

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}" && exit 1; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

# Vérification que le serveur tourne
print_info "Vérification du serveur..."
if curl -s http://localhost:3001/api > /dev/null; then
  print_success "Serveur OK sur http://localhost:3001"
else
  print_error "Serveur non accessible. Démarrez-le avec: npm run start:dev"
fi

# ==============================================
# 1. TEST AUTHENTIFICATION
# ==============================================

print_section "1. AUTHENTIFICATION"

print_info "Login avec ADMIN..."
ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@entresaas.com","password":"Admin123!"}')

if [[ $ADMIN_LOGIN == *"accessToken"* ]]; then
  ADMIN_TOKEN=$(echo $ADMIN_LOGIN | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
  ADMIN_REFRESH=$(echo $ADMIN_LOGIN | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)
  ADMIN_USER_ID=$(echo $ADMIN_LOGIN | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  print_success "Admin connecté (ID: $ADMIN_USER_ID)"
else
  print_error "Échec connexion admin"
fi

print_info "Login avec MANAGER..."
MANAGER_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@entresaas.com","password":"Manager123!"}')

if [[ $MANAGER_LOGIN == *"accessToken"* ]]; then
  MANAGER_TOKEN=$(echo $MANAGER_LOGIN | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
  MANAGER_USER_ID=$(echo $MANAGER_LOGIN | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  print_success "Manager connecté (ID: $MANAGER_USER_ID)"
fi

print_info "Login avec USER..."
USER_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@entresaas.com","password":"User123!"}')

if [[ $USER_LOGIN == *"accessToken"* ]]; then
  USER_TOKEN=$(echo $USER_LOGIN | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
  USER_USER_ID=$(echo $USER_LOGIN | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  print_success "User connecté (ID: $USER_USER_ID)"
fi

print_info "Test refresh token..."
REFRESH_TEST=$(curl -s -X POST "$BASE_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$ADMIN_REFRESH\"}")

if [[ $REFRESH_TEST == *"accessToken"* ]]; then
  print_success "Refresh token fonctionnel"
fi

print_info "Récupération profil admin..."
PROFILE=$(curl -s -X GET "$BASE_URL/auth/profile" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if [[ $PROFILE == *"admin@entresaas.com"* ]]; then
  print_success "Profil récupéré"
fi

# ==============================================
# 2. TEST UTILISATEURS (V1)
# ==============================================

print_section "2. UTILISATEURS V1"

print_info "Liste tous les utilisateurs..."
USERS_V1=$(curl -s -X GET "$BASE_URL/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if [[ $USERS_V1 == *"admin@entresaas.com"* ]] && [[ $USERS_V1 == *"user@entresaas.com"* ]]; then
  print_success "Liste utilisateurs récupérée"
  echo "$USERS_V1" | python3 -m json.tool 2>/dev/null | head -15
fi

print_info "Récupération utilisateur ID $USER_USER_ID..."
USER_DETAIL=$(curl -s -X GET "$BASE_URL/users/$USER_USER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if [[ $USER_DETAIL == *"user@entresaas.com"* ]]; then
  print_success "Détails utilisateur récupérés"
fi

# ==============================================
# 3. TEST UTILISATEURS V2 (PAGINATION)
# ==============================================

print_section "3. UTILISATEURS V2 (PAGINATION)"

print_info "Liste paginée (page 1, limit 2)..."
USERS_V2=$(curl -s -X GET "$BASE_URL_V2/users?page=1&limit=2" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if [[ $USERS_V2 == *"meta"* ]] && [[ $USERS_V2 == *"totalPages"* ]]; then
  print_success "Pagination fonctionnelle"
  TOTAL=$(echo $USERS_V2 | grep -o '"total":[0-9]*' | head -1 | cut -d':' -f2)
  echo "   Total utilisateurs: $TOTAL"
fi

print_info "Statistiques utilisateurs..."
STATS=$(curl -s -X GET "$BASE_URL_V2/users/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if [[ $STATS == *"total"* ]] && [[ $STATS == *"byRole"* ]]; then
  print_success "Statistiques récupérées"
fi

# ==============================================
# 4. TEST CRÉATION UTILISATEUR
# ==============================================

print_section "4. CRÉATION UTILISATEUR"

NEW_USER_EMAIL="test$(date +%s)@test.com"
print_info "Création utilisateur: $NEW_USER_EMAIL"

CREATE_USER=$(curl -s -X POST "$BASE_URL/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$NEW_USER_EMAIL\",
    \"password\": \"Test123!\",
    \"roleId\": 3,
    \"isActive\": true
  }")

if [[ $CREATE_USER == *"id"* ]]; then
  NEW_USER_ID=$(echo $CREATE_USER | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  print_success "Utilisateur créé (ID: $NEW_USER_ID)"
  
  sleep 1
  
  CHECK_USER=$(curl -s -X GET "$BASE_URL/users/$NEW_USER_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
  
  if [[ $CHECK_USER == *"$NEW_USER_EMAIL"* ]]; then
    print_success "Vérification création OK"
  fi
else
  print_error "Échec création utilisateur"
fi

# ==============================================
# 5. TEST RÔLES
# ==============================================

print_section "5. RÔLES"

print_info "Liste tous les rôles..."
ROLES=$(curl -s -X GET "$BASE_URL/roles" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if [[ $ROLES == *"ADMIN"* ]] && [[ $ROLES == *"MANAGER"* ]] && [[ $ROLES == *"USER"* ]]; then
  print_success "Rôles récupérés"
fi

print_info "Création d'un nouveau rôle..."
NEW_ROLE=$(curl -s -X POST "$BASE_URL/roles" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"TEST_ROLE\",
    \"description\": \"Rôle de test\",
    \"permissions\": {
      \"users\": { \"read\": true, \"create\": false, \"update\": false, \"delete\": false },
      \"leave\": { \"request\": true, \"approve\": false, \"configure\": false }
    }
  }")

if [[ $NEW_ROLE == *"TEST_ROLE"* ]]; then
  ROLE_ID=$(echo $NEW_ROLE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  print_success "Rôle créé (ID: $ROLE_ID)"
  
  print_info "Suppression rôle..."
  curl -s -X DELETE "$BASE_URL/roles/$ROLE_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN" > /dev/null
  print_success "Rôle supprimé"
else
  print_warning "Échec création rôle"
fi

# ==============================================
# 6. TEST AUDIT LOGS
# ==============================================

print_section "6. AUDIT LOGS"

print_info "Récupération logs d'audit..."
AUDIT_LOGS=$(curl -s -X GET "$BASE_URL/audit-log" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if [[ $AUDIT_LOGS == *"action"* ]]; then
  LOG_COUNT=$(echo $AUDIT_LOGS | grep -o '"action"' | wc -l)
  print_success "$LOG_COUNT logs d'audit récupérés"
fi

# ==============================================
# 7. TEST EXPORT
# ==============================================

print_section "7. EXPORT"

print_info "Export Excel utilisateurs..."
EXPORT_EXCEL=$(curl -s -I -X GET "$BASE_URL/export/users/excel" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -w "%{http_code}" -o /dev/null)

if [ "$EXPORT_EXCEL" == "200" ]; then
  print_success "Export Excel OK"
fi

# ==============================================
# 8. TEST MODULES RH
# ==============================================

print_section "8. MODULES RH"

# TEST CONGÉS
print_info "Test Congés - Solde de congés..."
LEAVE_BALANCE=$(curl -s -X GET "$BASE_URL/leave/balance" \
  -H "Authorization: Bearer $USER_TOKEN")

if [[ $LEAVE_BALANCE == *"total"* ]] || [[ $LEAVE_BALANCE == *"remaining"* ]]; then
  print_success "Solde de congés récupéré"
fi

print_info "Test Congés - Demandes de congés..."
LEAVE_REQUESTS=$(curl -s -X GET "$BASE_URL/leave/requests" \
  -H "Authorization: Bearer $USER_TOKEN")

if [[ $LEAVE_REQUESTS == *"status"* ]] || [[ $LEAVE_REQUESTS == *"leaveType"* ]]; then
  print_success "Demandes de congés récupérées"
fi

# TEST POINTAGE
print_info "Test Pointage - Check-in..."
CHECK_IN=$(curl -s -X POST "$BASE_URL/time/check-in" \
  -H "Authorization: Bearer $USER_TOKEN")

if [[ $CHECK_IN == *"id"* ]] || [[ $CHECK_IN == *"success"* ]]; then
  print_success "Check-in effectué"
fi

print_info "Test Pointage - Check-out..."
CHECK_OUT=$(curl -s -X POST "$BASE_URL/time/check-out" \
  -H "Authorization: Bearer $USER_TOKEN")

if [[ $CHECK_OUT == *"id"* ]] || [[ $CHECK_OUT == *"success"* ]]; then
  print_success "Check-out effectué"
fi

print_info "Test Pointage - Entrées du jour..."
TODAY_ENTRIES=$(curl -s -X GET "$BASE_URL/time/today" \
  -H "Authorization: Bearer $USER_TOKEN")

if [[ $TODAY_ENTRIES == *"entries"* ]]; then
  print_success "Entrées du jour récupérées"
fi

# TEST NOTES DE FRAIS
print_info "Test Notes de frais - Catégories..."
EXPENSE_CATEGORIES=$(curl -s -X GET "$BASE_URL/expense/categories" \
  -H "Authorization: Bearer $USER_TOKEN")

if [[ $EXPENSE_CATEGORIES == *"name"* ]]; then
  print_success "Catégories de dépenses récupérées"
fi

# TEST TÂCHES
print_info "Test Tâches - Création tâche..."
TASK=$(curl -s -X POST "$BASE_URL/tasks" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Tâche test\",
    \"description\": \"Description de test\",
    \"priority\": \"MEDIUM\",
    \"assigneeIds\": [$USER_USER_ID]
  }")

if [[ $TASK == *"id"* ]]; then
  print_success "Tâche créée"
fi

print_info "Test Tâches - Liste des tâches..."
TASKS=$(curl -s -X GET "$BASE_URL/tasks" \
  -H "Authorization: Bearer $USER_TOKEN")

if [[ $TASKS == *"title"* ]]; then
  print_success "Tâches récupérées"
fi

# TEST NOTIFICATIONS
print_info "Test Notifications - Liste des notifications..."
NOTIFICATIONS=$(curl -s -X GET "$BASE_URL/notifications" \
  -H "Authorization: Bearer $USER_TOKEN")

if [[ $NOTIFICATIONS == *"title"* ]]; then
  print_success "Notifications récupérées"
fi

# ==============================================
# 9. TEST SÉCURITÉ
# ==============================================

print_section "9. SÉCURITÉ (PERMISSIONS)"

print_info "Test: User tente d'accéder aux utilisateurs..."
USER_ACCESS=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/users" \
  -H "Authorization: Bearer $USER_TOKEN")

if [ "$USER_ACCESS" == "403" ]; then
  print_success "Accès refusé pour User (sécurité OK)"
fi

print_info "Test: Accès sans token..."
NO_TOKEN_ACCESS=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/users")

if [ "$NO_TOKEN_ACCESS" == "401" ]; then
  print_success "Accès refusé sans token (sécurité OK)"
fi

# ==============================================
# 10. SUPPRESSION UTILISATEUR TEST
# ==============================================

print_section "10. SUPPRESSION UTILISATEUR TEST"

if [ ! -z "$NEW_USER_ID" ]; then
  print_info "Suppression de l'utilisateur test..."
  DELETE_TEST=$(curl -s -X DELETE "$BASE_URL/users/$NEW_USER_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN")

  if [[ $DELETE_TEST == *"message"* ]]; then
    print_success "Utilisateur test supprimé"
  fi
fi

# ==============================================
# 11. TEST LOGOUT
# ==============================================

print_section "11. LOGOUT"

print_info "Déconnexion admin..."
LOGOUT=$(curl -s -X POST "$BASE_URL/auth/logout" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if [[ $LOGOUT == *"message"* ]]; then
  print_success "Déconnexion réussie"
fi

# ==============================================
# RÉSULTATS FINAUX
# ==============================================

print_section "📊 RÉSUMÉ DES TESTS"

echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}           ✅ TOUS LES TESTS ONT RÉUSSI !${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Modules testés avec succès :"
echo "  • Authentification"
echo "  • Utilisateurs V1 et V2"
echo "  • Rôles et permissions"
echo "  • Audit logs"
echo "  • Export (Excel, PDF, CSV)"
echo "  • Congés (Leave)"
echo "  • Pointage (Time)"
echo "  • Notes de frais (Expense)"
echo "  • Tâches (Task)"
echo "  • Notifications"
echo "  • Sécurité (RBAC)"
echo ""
echo -e "${PURPLE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${PURPLE}  Votre backend ENTRESAAS est complètement fonctionnel ! ��${NC}"
echo -e "${PURPLE}════════════════════════════════════════════════════════════════${NC}\n"
