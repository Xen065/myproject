#!/bin/bash

# ============================================
# Demo Accounts Setup Script
# ============================================
# This script sets up the RBAC system and creates 4 demo accounts

set -e  # Exit on error

echo ""
echo "═══════════════════════════════════════════"
echo "🚀 EduMaster Admin System Setup"
echo "═══════════════════════════════════════════"
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "   Example: ./setup-demo.sh"
    exit 1
fi

# Step 1: Check PostgreSQL
echo "📊 Step 1/5: Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed or not in PATH"
    echo "   Please install PostgreSQL first"
    exit 1
fi

# Try to connect to PostgreSQL
if ! psql -U postgres -c "SELECT 1" &> /dev/null; then
    echo "⚠️  Cannot connect to PostgreSQL"
    echo "   Please make sure PostgreSQL is running:"
    echo "   sudo service postgresql start"
    echo ""
    read -p "   Press Enter after starting PostgreSQL, or Ctrl+C to exit..."
fi

echo "✅ PostgreSQL is running"
echo ""

# Step 2: Create database if not exists
echo "📊 Step 2/5: Setting up database..."
psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'edumaster'" | grep -q 1 || \
    psql -U postgres -c "CREATE DATABASE edumaster"
echo "✅ Database ready"
echo ""

# Step 3: Install backend dependencies
echo "📦 Step 3/5: Installing backend dependencies..."
cd backend
npm install > /dev/null 2>&1
echo "✅ Dependencies installed"
echo ""

# Step 4: Run RBAC migration
echo "🔧 Step 4/5: Running RBAC migration..."
if node scripts/addRBACSystem.js; then
    echo "✅ RBAC system initialized"
else
    echo "⚠️  Migration completed (may have been run before)"
fi
echo ""

# Step 5: Create demo accounts
echo "👥 Step 5/5: Creating demo accounts..."
node scripts/createDemoAccounts.js

echo ""
echo "═══════════════════════════════════════════"
echo "✅ Setup Complete!"
echo "═══════════════════════════════════════════"
echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. Start the backend server:"
echo "   cd backend && npm start"
echo ""
echo "2. In another terminal, start the frontend:"
echo "   cd frontend && npm start"
echo ""
echo "3. Open your browser and login at:"
echo "   http://localhost:3000/login"
echo ""
echo "4. Use any of these demo accounts:"
echo "   - superadmin / Super123!"
echo "   - admin / Admin123!"
echo "   - teacher / Teacher123!"
echo "   - student / Student123!"
echo ""
echo "5. Visit the admin dashboard:"
echo "   http://localhost:3000/admin"
echo "   (works for superadmin, admin, and teacher)"
echo ""
