#!/bin/sh
# Initializes the single-node replica set required for Mongoose transactions
# (subscriptions, deal pipeline, identity reveal). Runs once against a fresh volume.
set -e

until mongosh --host mongo --eval "print('waiting for mongo')" >/dev/null 2>&1; do
  sleep 1
done

mongosh --host mongo <<'EOF'
try {
  rs.status();
  print("Replica set already initialized");
} catch (e) {
  rs.initiate({
    _id: "rs0",
    members: [{ _id: 0, host: "mongo:27017" }],
  });
  print("Replica set initialized");
}
EOF
