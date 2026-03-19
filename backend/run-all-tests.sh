#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}           LANCEMENT DE TOUS LES TESTS ENTRESAAS                 ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"

# Vérifier que le serveur tourne
echo -e "${YELLOW}Vérification du serveur...${NC}"
if curl -s http://localhost:3001/api > /dev/null; then
  echo -e "${GREEN}✅ Serveur OK${NC}\n"
else
  echo -e "${RED}❌ Serveur non accessible. Démarrez-le avec: npm run start:dev${NC}"
  exit 1
fi

# 1. Test API principal
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   TEST 1: API PRINCIPALE${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
./test-full-api.sh
echo ""

# 2. Test des rôles
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   TEST 2: RÔLES${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
./test-roles.sh
echo ""

# 3. Test RH
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   TEST 3: MODULES RH${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
./test-rh.sh
echo ""

echo -e "\n${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}           ✅ TOUS LES TESTS SONT TERMINÉS${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
