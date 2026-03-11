FROM docker.n8n.io/n8nio/n8n:latest

USER root
WORKDIR /data

# PolyON module manifest 및 문서
COPY polyon-module/ /polyon-module/

# OIDC DB 주입 스크립트 (Node + pg)
COPY scripts/ /data/scripts/
RUN cd /data/scripts && npm install --omit=dev && chmod 755 /data/scripts/polyon-oidc-init.js

# 엔트리포인트 스크립트
COPY --chmod=755 entrypoint.sh /entrypoint.sh

RUN chown -R node:node /data/scripts /polyon-module
USER node

EXPOSE 5678

ENTRYPOINT ["/entrypoint.sh"]
