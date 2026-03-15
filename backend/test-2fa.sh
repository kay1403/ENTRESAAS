#!/bin/bash

echo "🔐 TEST 2FA (TWO-FACTOR AUTHENTICATION)"
echo "========================================"

# 1. Login admin pour obtenir le token
echo "📝 Login admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

echo "✅ Token obtenu"

# 2. Générer le secret 2FA
echo -e "\n🔑 Génération du secret 2FA..."
SECRET_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/2fa/generate \
  -H "Authorization: Bearer $TOKEN")

echo "📌 Réponse:"
echo $SECRET_RESPONSE | python3 -m json.tool 2>/dev/null || echo $SECRET_RESPONSE

# 3. Vérifier le statut 2FA
echo -e "\n📊 Statut 2FA:"
curl -s -X GET http://localhost:3000/api/auth/2fa/status \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool 2>/dev/null

echo -e "\n⚠️  Pour activer le 2FA:"
echo "1. Scannez le QR code avec Google Authenticator"
echo "2. Exécutez: curl -X POST http://localhost:3000/api/auth/2fa/enable \\"
echo "  -H \"Authorization: Bearer \$TOKEN\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"token\":\"CODE_6_CHIFFRES\"}'"

echo -e "\n3. Pour tester le login avec 2FA:"
echo "curl -X POST http://localhost:3000/api/auth/login/2fa \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"email\":\"admin@example.com\",\"password\":\"Admin123!\",\"token\":\"CODE_6_CHIFFRES\"}'"
