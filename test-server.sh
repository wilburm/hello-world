#!/bin/bash

echo "Starting server in background..."
npm run dev > server-test.log 2>&1 &
SERVER_PID=$!

echo "Server PID: $SERVER_PID"
echo "Waiting for server to start..."
sleep 5

echo -e "\n=== Testing health endpoint ==="
curl -s http://localhost:3000/health | jq . || echo "Failed"

echo -e "\n=== Testing metrics endpoint ==="
curl -s http://localhost:3000/metrics | jq . || echo "Failed"

echo -e "\n=== Testing recent rates endpoint ==="
curl -s "http://localhost:3000/rates/recent?base=CNY&target=USD&limit=5" | jq . || echo "Failed"

echo -e "\n=== Triggering manual collection ==="
curl -s -X POST http://localhost:3000/collect/trigger | jq . || echo "Failed"

echo -e "\n=== Waiting for collection to complete ==="
sleep 2

echo -e "\n=== Checking metrics after collection ==="
curl -s http://localhost:3000/metrics | jq . || echo "Failed"

echo -e "\n=== Stopping server ==="
kill $SERVER_PID
wait $SERVER_PID 2>/dev/null

echo -e "\n=== Server logs ==="
cat server-test.log

echo -e "\n=== Test complete ==="
