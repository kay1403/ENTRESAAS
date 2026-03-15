#!/bin/bash

echo "🔍 TEST DU CACHE REDIS"
echo "======================"

# 1. Login admin
echo "📝 Login admin..."
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}' \
  | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

echo "✅ Token obtenu"

# 2. Première requête (devrait aller en DB)
echo -e "\n🔄 Première requête (DB)..."
time curl -s -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN" > /dev/null

# 3. Deuxième requête (devrait venir du cache)
echo -e "\n📦 Deuxième requête (Cache)..."
time curl -s -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN" > /dev/null

# 4. Créer un user (invalide le cache)
echo -e "\n➕ Création d'un user (invalide cache)..."
curl -s -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cachetest@test.com",
    "password": "password123",
    "roleId": 1,
    "isActive": true
  }' > /dev/null

# 5. Requête après création (DB à nouveau)
echo -e "\n🔄 Requête après création (DB)..."
time curl -s -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN" > /dev/null

echo -e "\n✅ Test terminé!"
