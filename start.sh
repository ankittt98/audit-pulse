#!/bin/bash
echo "========================================================"
echo "       Starting AuditPulse Full-Stack Platform"
echo "========================================================"
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js 20+ from https://nodejs.org"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "Installing project dependencies..."
    npm install
fi

echo "Launching AuditPulse (Server on :5000, Client on :5173)..."
npm run dev
