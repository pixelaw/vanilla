# Load environment variables from ./.account

set dotenv-load := true

# set dotenv-path := "./.account"
# Repository configuration

repo := "ghcr.io/pixelaw/vanilla"
version := `cat VERSION`

docker_run:
    docker-compose up -d

docker_logs:
    docker-compose logs

docker_logs_follow:
    docker-compose logs -f

docker_shell:
    docker exec -it pixelaw-core /bin/bash

dev:
    #!/usr/bin/env bash
    echo "🐳 Ensuring Docker containers are running..."
    if ! docker-compose ps | grep -q "Up"; then
        echo "Starting Docker containers..."
        docker-compose up -d
    else
        echo "Docker containers already running"
    fi
    echo "🚀 Starting development server..."
    echo "📋 Logs will be saved to dev.log (use 'just dev_logs' to follow)"
    pnpm dev 2>&1 | tee dev.log

dev_logs:
    tail -f dev.log

dev_bg:
    #!/usr/bin/env bash
    echo "🐳 Ensuring Docker containers are running..."
    if ! docker-compose ps | grep -q "Up"; then
        echo "Starting Docker containers..."
        docker-compose up -d
    else
        echo "Docker containers already running"
    fi
    echo "🚀 Starting development server in background..."
    echo "📋 Logs saved to dev.log (use 'just dev_logs' to follow)"
    nohup pnpm dev > dev.log 2>&1 &
    sleep 2
    PID=$(pgrep -f "vite")
    if [ -n "$PID" ]; then
        echo "✅ Dev server started. Process ID: $PID"
    else
        echo "❌ Failed to start dev server"
    fi

dev_stop:
    #!/usr/bin/env bash
    PID=$(pgrep -f "vite")
    if [ -n "$PID" ]; then
        echo "🛑 Stopping dev server (PID: $PID)..."
        kill $PID
        sleep 1
        if ! pgrep -f "vite" > /dev/null; then
            echo "✅ Dev server stopped"
        else
            echo "⚠️  Force killing dev server..."
            pkill -f "vite"
        fi
    else
        echo "ℹ️  No dev server running"
    fi
