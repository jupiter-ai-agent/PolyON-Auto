# PolyON n8n — AD / OIDC Claim 매핑

PolyON 계정 원천은 AD DC이며, n8n은 Keycloak OIDC SSO로 로그인한다.  
이 문서는 **LDAP(AD) 속성 → OIDC claim → n8n User 필드** 매핑을 정리한다.

## LDAP(AD) 속성

| AD 속성 | 용도 |
|--------|------|
| **sAMAccountName** | 조직 내 로그인 ID (기준 식별자) |
| **userPrincipalName** | 이메일 속성 (예: `user@domain.com`) — **LDAP에서 email로 사용** |
| displayName | 표시 이름 (선택) |

## OIDC Claim 매핑 (Keycloak)

Keycloak Realm의 User Attribute / Protocol Mapper 설정:

| OIDC claim | LDAP attribute | 비고 |
|------------|----------------|------|
| **email** | **userPrincipalName** | n8n `User.email` 에 매핑 (유니크) |
| **preferred_username** | **sAMAccountName** | 로그인 ID; AuthIdentity 등에 사용 |

n8n User.email 은 유니크 인덱스이므로, **email = userPrincipalName** 으로 일관되게 넣어야 한다.

## n8n 쪽 매핑

- **User.email** ← OIDC `email` ← AD `userPrincipalName`
- **AuthIdentity.providerUserId** ← OIDC `sub` 또는 `preferred_username` (sAMAccountName)
- 이름 필드는 `given_name` / `family_name` 또는 `name` 사용 (선택)

## PolyON Core 동기화

AD 변동(입사/퇴사/메일 변경) 시 PolyON Core가 n8n DB의 User 레코드를 동기화할 때:

- 사용자 식별: **userPrincipalName** (= n8n User.email) 또는 **sAMAccountName** 기준
- 퇴사/비활성화: `User.disabled = true`
