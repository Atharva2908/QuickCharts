#!/bin/bash

# DataViz Startup Script
# This script sets up and starts both frontend and backend servers

set -e

echo "================================"
echo "DataViz - Smart Data Visualization"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js 18+${NC}"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 is not installed. Please install Python 3.8+${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"
echo -e "${GREEN}✓ Python found: $(python3 --version)${NC}"
echo ""

# Frontend setup
echo -e "${YELLOW}Setting up frontend...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
else
    echo "node_modules already exists, skipping install"
fi
echo -e "${GREEN}✓ Frontend ready${NC}"
echo ""

# Backend setup
echo -e "${YELLOW}Setting up backend...${NC}"
cd server

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Install Python dependencies
if [ ! -f ".installed" ]; then
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
    touch .installed
else
    echo "Python dependencies already installed"
fi

cd ..
echo -e "${GREEN}✓ Backend ready${NC}"
echo ""

# Create .env file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}Creating .env.local file...${NC}"
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF
    echo -e "${GREEN}✓ .env.local created${NC}"
fi

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "To start the application:"
echo ""
echo -e "${YELLOW}Terminal 1 (Frontend):${NC}"
echo "  npm run dev"
echo ""
echo -e "${YELLOW}Terminal 2 (Backend):${NC}"
echo "  cd server"
echo "  source venv/bin/activate  # macOS/Linux"
echo "  # or"
echo "  venv\\Scripts\\activate     # Windows"
echo "  python main.py"
echo ""
echo "Then visit:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo ""
