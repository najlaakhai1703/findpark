#!/bin/bash
cd "$(dirname "$0")"
echo "========================================="
echo "   FindPark - Smart Parking Solutions   "
echo "========================================="
echo "Membuka website di browser MacBook Anda..."

# Open in default browser
open "http://localhost:8080" 2>/dev/null || open "index.html"

# Start local server
ruby server.rb
