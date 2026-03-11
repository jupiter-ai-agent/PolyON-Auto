#!/bin/bash
set -e

# PolyON-Auto 엔트리포인트
# - PRC/ENV 기반으로 n8n 설정을 초기화
# - DB 준비를 대기
# - OIDC 설정이 주어졌으면 Settings에 반영 (초기 버전: env 기반, 추후 API/DB 연동 확장 가능)

N8N_BASE_URL="${N8N_BASE_URL:-}"

# DB 포트 TCP 연결 가능할 때까지 대기 (pg_isready 미사용)
wait_for_postgres() {
  if [ -z "$DB_POSTGRESDB_HOST" ] || [ -z "$DB_POSTGRESDB_PORT" ]; then
    return 0
  fi

  echo "PostgreSQL 접속 가능 여부를 확인합니다: ${DB_POSTGRESDB_HOST}:${DB_POSTGRESDB_PORT}"
  attempt_count=0
  max_attempt_count=30
  wait_seconds_between_attempts=2

  until node -e "
    const net = require('net');
    const socket = net.createConnection(process.env.DB_POSTGRESDB_PORT || 5432, process.env.DB_POSTGRESDB_HOST, () => { socket.destroy(); process.exit(0); });
    socket.on('error', () => process.exit(1));
  " 2>/dev/null; do
    attempt_count=$((attempt_count + 1))
    if [ "$attempt_count" -ge "$max_attempt_count" ]; then
      echo "PostgreSQL 준비 대기 시간이 초과되었습니다." >&2
      exit 1
    fi
    echo "PostgreSQL 준비 중... (${attempt_count}/${max_attempt_count})"
    sleep "$wait_seconds_between_attempts"
  done
}

wait_for_postgres

# OIDC env가 있으면 Settings DB에 주입 (PolyON PRC → n8n)
if [ -f /data/scripts/polyon-oidc-init.js ]; then
  node /data/scripts/polyon-oidc-init.js || true
fi

echo "Auto(n8n)를 기동합니다..."
exec n8n

