# PolyON-n8n 개발 전 체크리스트

## 현재 상태

- **설계·문서**: 완료  
  - PRC claims (database, objectStorage, smtp, auth)  
  - AD/OIDC 매핑 (email = userPrincipalName, preferred_username = sAMAccountName)  
  - `module.yaml` env 매핑 (n8n 공식 env 이름 반영)

- **module.yaml 수정 반영**
  - DB: `DB_POSTGRESDB_*`  
  - S3: `N8N_EXTERNAL_STORAGE_S3_*` (host, protocol, bucket, region, accessKey, accessSecret)  
  - Health: `/healthz/readiness` (n8n 기본 readiness probe)  
  - OIDC: n8n은 OIDC 설정을 **DB에 저장**하므로, env만으로는 부족함 → 아래 “OIDC 초기 주입” 필요

---

## 본격 개발 전에 할 일

1. **PRC objectStorage 호환**
   - 플랫폼이 `claims.objectStorage.endpoint` (URL)만 줄 수 있다면, Operator 또는 모듈에서 `host`(호스트명만)를 추출해 `N8N_EXTERNAL_STORAGE_S3_HOST` 에 넣어주는 로직 필요.
   - 또는 플랫폼 스펙에 `host` 필드가 있으면 그대로 사용.

2. **OIDC 초기 설정 주입** ✅ 구현됨
   - `scripts/polyon-oidc-init.js`: `N8N_OIDC_*` + `N8N_ENCRYPTION_KEY` env를 읽어 n8n Cipher와 동일한 방식으로 clientSecret 암호화 후 Settings 테이블 `features.oidc` 에 UPSERT.
   - entrypoint에서 기동 전 해당 스크립트 실행 (env 없으면 스킵).
   - Dockerfile에 scripts/ 및 `npm install pg` 반영.

3. **SMTP env 이름**
   - n8n 공식 SMTP env가 있는지 코드/문서에서 한 번 더 확인 후, 필요하면 `module.yaml` 의 `N8N_SMTP_*` 이름 수정.

4. **실제 배포 한 번**
   - PolyON Operator가 이 `module.yaml` 을 읽어 DB/Secret/Ingress를 만들 수 있는지, 한 번 배포해 보며 검증.

---

## “이제 개발하면 되는가?”

- **설계·매핑·문서**는 준비된 상태이므로, **위 1~4를 진행하면서 개발**하면 됨.
- 우선순위 제안:
  1. **OIDC 초기 주입** (entrypoint 또는 패치) 구현 → SSO 로그인 가능 여부 확인  
  2. **S3( RustFS )** 연결 테스트 (objectStorage claim → n8n binary data)  
  3. PolyON Core와의 **AD 사용자 동기화** (선택, 2단계)

위가 끝나면 “PolyON 모듈로서 n8n 개발”은 본격적으로 진행 가능한 상태라고 보면 됨.
