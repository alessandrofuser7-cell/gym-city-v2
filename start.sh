#!/bin/bash
cd /app
export MONGO_URI="mongodb://localhost:27017/gymcity"
export PORT=3000
npm run dev
