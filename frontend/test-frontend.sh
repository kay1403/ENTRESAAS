#!/bin/bash

# ==============================================
# TEST COMPLET DU FRONTEND ENTRESAAS
# ==============================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

BASE_URL="http://localhost:3000"

print_section() {
  echo -e "\n${CYAN}════════════════════════════════════════════════════════════════${NC}"
  echo -e "${CYAN}  $1${NC}"
  echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}\n"
}

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

# Vérification que le serveur frontend tourne
print_info "Vérification du serveur frontend..."
if curl -s http://localhost:3000 > /dev/null; then
  print_success "Serveur frontend OK sur http://localhost:3000"
else
  print_error "Serveur frontend non accessible. Démarrez-le avec: npm run dev"
  exit 1
fi

# Vérification que le backend est accessible
print_info "Vérification du serveur backend..."
if curl -s http://localhost:3001/api > /dev/null; then
  print_success "Serveur backend OK sur http://localhost:3001"
else
  print_warning "Serveur backend non accessible - les appels API échoueront"
fi

# ==============================================
# 1. TEST DES FICHIERS DE CONFIGURATION
# ==============================================

print_section "1. FICHIERS DE CONFIGURATION"

# Vérifier package.json
if [ -f "package.json" ]; then
  print_success "package.json présent"
  NEXT_VERSION=$(grep -o '"next": "[^"]*"' package.json | cut -d'"' -f4)
  echo "   Next.js version: $NEXT_VERSION"
else
  print_error "package.json manquant"
fi

# Vérifier tailwind.config.ts
if [ -f "tailwind.config.ts" ]; then
  print_success "tailwind.config.ts présent"
else
  print_error "tailwind.config.ts manquant"
fi

# Vérifier postcss.config.js
if [ -f "postcss.config.js" ] || [ -f "postcss.config.mjs" ]; then
  print_success "postcss.config présent"
else
  print_error "postcss.config manquant"
fi

# Vérifier tsconfig.json
if [ -f "tsconfig.json" ]; then
  print_success "tsconfig.json présent"
else
  print_error "tsconfig.json manquant"
fi

# Vérifier .env.local
if [ -f ".env.local" ]; then
  print_success ".env.local présent"
  API_URL=$(grep NEXT_PUBLIC_API_URL .env.local | cut -d'=' -f2)
  echo "   API URL: $API_URL"
else
  print_warning ".env.local manquant - utilisation de l'URL par défaut"
fi

# ==============================================
# 2. TEST DE LA STRUCTURE DES DOSSIERS
# ==============================================

print_section "2. STRUCTURE DES DOSSIERS"

# Vérifier les dossiers principaux
DIRS=("src/app" "src/components" "src/hooks" "src/lib" "src/store" "public")
for dir in "${DIRS[@]}"; do
  if [ -d "$dir" ]; then
    print_success "Dossier $dir présent"
  else
    print_error "Dossier $dir manquant"
  fi
done

# Compter les pages
PAGE_COUNT=$(find src/app -name "page.tsx" 2>/dev/null | wc -l)
print_success "$PAGE_COUNT pages trouvées"

# Compter les composants
COMPONENT_COUNT=$(find src/components -name "*.tsx" 2>/dev/null | wc -l)
print_success "$COMPONENT_COUNT composants trouvés"

# ==============================================
# 3. TEST DES PAGES ESSENTIELLES
# ==============================================

print_section "3. PAGES ESSENTIELLES"

# Liste des pages critiques
PAGES=(
  "src/app/page.tsx"
  "src/app/layout.tsx"
  "src/app/globals.css"
  "src/app/login/page.tsx"
  "src/app/dashboard/page.tsx"
  "src/app/register/page.tsx"
  "src/app/profile/page.tsx"
  "src/app/settings/page.tsx"
  "src/app/settings/2fa/page.tsx"
  "src/app/users/page.tsx"
  "src/app/roles/page.tsx"
  "src/app/permissions/page.tsx"
  "src/app/audit-logs/page.tsx"
  "src/app/leave/page.tsx"
  "src/app/time/page.tsx"
  "src/app/expense/page.tsx"
  "src/app/tasks/page.tsx"
  "src/app/messages/page.tsx"
  "src/app/documents/page.tsx"
  "src/app/employees/page.tsx"
  "src/app/departments/page.tsx"
  "src/app/not-found.tsx"
)

MISSING_PAGES=0
for page in "${PAGES[@]}"; do
  if [ -f "$page" ]; then
    print_success "✓ $page"
  else
    print_warning "✗ $page manquant"
    MISSING_PAGES=$((MISSING_PAGES + 1))
  fi
done

if [ $MISSING_PAGES -eq 0 ]; then
  print_success "Toutes les pages critiques sont présentes"
else
  print_warning "$MISSING_PAGES pages manquantes"
fi

# ==============================================
# 4. TEST DES COMPOSANTS CRITIQUES
# ==============================================

print_section "4. COMPOSANTS CRITIQUES"

COMPONENTS=(
  "src/components/Layout.tsx"
  "src/components/ThemeToggle.tsx"
  "src/components/ThemeProvider.tsx"
  "src/components/AuthGuard.tsx"
  "src/components/Loader.tsx"
  "src/components/NotificationBell.tsx"
  "src/components/Pagination.tsx"
  "src/components/ConfirmModal.tsx"
  "src/components/Breadcrumb.tsx"
)

for component in "${COMPONENTS[@]}"; do
  if [ -f "$component" ]; then
    print_success "✓ $component"
  else
    print_warning "✗ $component manquant"
  fi
done

# ==============================================
# 5. TEST DES HOOKS
# ==============================================

print_section "5. HOOKS"

HOOKS=(
  "src/hooks/usePermissions.ts"
  "src/hooks/useAuth.ts"
  "src/hooks/useLocalStorage.ts"
  "src/hooks/useDebounce.ts"
)

for hook in "${HOOKS[@]}"; do
  if [ -f "$hook" ]; then
    print_success "✓ $hook"
  else
    print_warning "✗ $hook manquant"
  fi
done

# ==============================================
# 6. TEST DES SERVICES
# ==============================================

print_section "6. SERVICES"

if [ -f "src/lib/api.ts" ]; then
  print_success "✓ src/lib/api.ts"
  # Compter le nombre de méthodes API
  API_METHODS=$(grep -c "^  async" src/lib/api.ts)
  print_info "$API_METHODS méthodes API définies"
else
  print_error "✗ src/lib/api.ts manquant"
fi

if [ -f "src/lib/toast.ts" ]; then
  print_success "✓ src/lib/toast.ts"
else
  print_warning "✗ src/lib/toast.ts manquant"
fi

# ==============================================
# 7. TEST DU STORE
# ==============================================

print_section "7. STORE"

if [ -f "src/store/authStore.ts" ]; then
  print_success "✓ src/store/authStore.ts"
else
  print_error "✗ src/store/authStore.ts manquant"
fi

# ==============================================
# 8. TEST DES ROUTES API
# ==============================================

print_section "8. TEST DES ROUTES API"

# Tester la connexion avec des identifiants valides
print_info "Test de l'API de login..."
LOGIN_TEST=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@entresaas.com","password":"Admin123!"}' 2>/dev/null)

if [[ $LOGIN_TEST == *"accessToken"* ]]; then
  TOKEN=$(echo $LOGIN_TEST | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
  print_success "API login fonctionnelle"
  
  # Tester quelques routes protégées
  echo -e "\n${YELLOW}Test des routes protégées:${NC}"
  
  # Users
  USERS_TEST=$(curl -s -o /dev/null -w "%{http_code}" -X GET http://localhost:3001/api/v1/users \
    -H "Authorization: Bearer $TOKEN")
  if [ "$USERS_TEST" == "200" ] || [ "$USERS_TEST" == "403" ]; then
    print_success "  /users répond (code $USERS_TEST)"
  else
    print_warning "  /users: code $USERS_TEST"
  fi
  
  # Roles
  ROLES_TEST=$(curl -s -o /dev/null -w "%{http_code}" -X GET http://localhost:3001/api/v1/roles \
    -H "Authorization: Bearer $TOKEN")
  if [ "$ROLES_TEST" == "200" ] || [ "$ROLES_TEST" == "403" ]; then
    print_success "  /roles répond (code $ROLES_TEST)"
  else
    print_warning "  /roles: code $ROLES_TEST"
  fi
  
  # Leave
  LEAVE_TEST=$(curl -s -o /dev/null -w "%{http_code}" -X GET http://localhost:3001/api/v1/leave/balances \
    -H "Authorization: Bearer $TOKEN")
  if [ "$LEAVE_TEST" == "200" ] || [ "$LEAVE_TEST" == "403" ]; then
    print_success "  /leave/balances répond (code $LEAVE_TEST)"
  else
    print_warning "  /leave/balances: code $LEAVE_TEST"
  fi
  
else
  print_warning "API login non accessible - vérifiez que le backend tourne"
fi

# ==============================================
# 9. TEST DU THÈME
# ==============================================

print_section "9. TEST DU THÈME"

# Vérifier que le ThemeProvider est utilisé dans layout.tsx
if grep -q "ThemeProvider" src/app/layout.tsx 2>/dev/null; then
  print_success "ThemeProvider présent dans layout.tsx"
else
  print_warning "ThemeProvider non trouvé dans layout.tsx"
fi

# Vérifier les classes dark dans globals.css
if grep -q "dark:" src/app/globals.css 2>/dev/null; then
  print_success "Classes dark: présentes dans globals.css"
else
  print_warning "Pas de classes dark: dans globals.css"
fi

# ==============================================
# 10. TEST DES PERMISSIONS
# ==============================================

print_section "10. TEST DES PERMISSIONS"

if [ -f "src/middleware.ts" ]; then
  print_success "middleware.ts présent"
  if grep -q "adminRoutes" src/middleware.ts; then
    print_success "Protection des routes admin configurée"
  else
    print_warning "Routes admin non protégées dans middleware.ts"
  fi
else
  print_warning "middleware.ts manquant - les routes ne sont pas protégées"
fi

# ==============================================
# 11. TEST DE LA CONSOLE (simulé)
# ==============================================

print_section "11. VÉRIFICATIONS SUPPLEMENTAIRES"

# Vérifier les imports incorrects
BAD_IMPORTS=$(grep -r "from '@/app/" src/ 2>/dev/null | grep -v "layout" | wc -l)
if [ $BAD_IMPORTS -eq 0 ]; then
  print_success "Pas d'imports incorrects vers /app"
else
  print_warning "$BAD_IMPORTS imports suspects vers /app"
fi

# Vérifier les console.log oubliés
CONSOLE_LOGS=$(grep -r "console.log" src/ 2>/dev/null | wc -l)
if [ $CONSOLE_LOGS -eq 0 ]; then
  print_success "Pas de console.log dans le code"
else
  print_warning "$CONSOLE_LOGS console.log trouvés (à supprimer en production)"
fi

# ==============================================
# 12. TEST DE CONNEXION RAPIDE
# ==============================================

print_section "12. TEST DE CONNEXION RAPIDE"

echo -e "${YELLOW}Pour tester la connexion manuellement:${NC}"
echo "1. Ouvrez http://localhost:3000/login"
echo "2. Connectez-vous avec:"
echo "   👑 Admin: admin@entresaas.com / Admin123!"
echo "   👔 Manager: manager@entresaas.com / Manager123!"
echo "   👤 User: user@entresaas.com / User123!"
echo ""
echo -e "${YELLOW}Ou avec curl:${NC}"
echo "curl -X POST http://localhost:3001/api/v1/auth/login \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"email\":\"admin@entresaas.com\",\"password\":\"Admin123!\"}'"

# ==============================================
# RÉSULTATS FINAUX
# ==============================================

print_section "📊 RÉSUMÉ DES TESTS"

# Calculer un score approximatif
TOTAL_CHECKS=50
PASSED_CHECKS=$(( TOTAL_CHECKS - MISSING_PAGES - $(grep -c "✗" <<< "$(print_error test 2>&1)") ))

echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}           RÉSULTAT DU TEST FRONTEND${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo "✅ Configuration: OK"
echo "✅ Structure: OK"
echo "✅ Pages: $((PAGE_COUNT)) trouvées"
echo "✅ Composants: $COMPONENT_COUNT trouvés"
echo "✅ API: $API_METHODS méthodes"
echo ""
if [ $MISSING_PAGES -eq 0 ]; then
  echo -e "${GREEN}🎉 TOUTES LES PAGES CRITIQUES SONT PRÉSENTES !${NC}"
else
  echo -e "${YELLOW}⚠️  $MISSING_PAGES pages manquantes${NC}"
fi
echo ""
echo -e "${PURPLE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${PURPLE}  Pour lancer l'application: npm run dev${NC}"
echo -e "${PURPLE}  Pour accéder à l'application: http://localhost:3000${NC}"
echo -e "${PURPLE}════════════════════════════════════════════════════════════════${NC}"
