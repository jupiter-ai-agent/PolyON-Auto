![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# PolyON-n8n

**n8n**을 [PolyON Platform](https://github.com/jupiter-ai-agent/PolyON-platform) 모듈로 동작하도록 구성한 저장소입니다.  
업스트림: [n8n-io/n8n](https://github.com/n8n-io/n8n).

**저장소 운영 방식**: [PolyON-Odoo](https://github.com/jupiter-ai-agent/PolyON-Odoo)와 동일하게 **n8n 원본 소스는 포함하지 않습니다**. Dockerfile은 공식 n8n 이미지를 베이스로 하고, 본 저장소에는 PolyON용 래퍼(Dockerfile, entrypoint, polyon-module, scripts)만 두어 원본 터치 없이 업스트림 갱신을 유지합니다.

## PolyON 모듈로서의 구성

- **PRC(Platform Resource Claim)**: database, objectStorage, smtp, auth(Keycloak OIDC)를 선언하고, 해당 리소스를 환경변수로 주입받아 사용합니다.
- **SSO**: Keycloak OIDC 기반 로그인. AD `userPrincipalName` → n8n User.email, `sAMAccountName` → preferred_username 매핑. 상세는 [polyon-module/AD-OIDC-CLAIMS.md](polyon-module/AD-OIDC-CLAIMS.md) 참고.
- **OIDC 설정 주입**: 기동 시 `N8N_OIDC_*` env가 있으면 `scripts/polyon-oidc-init.js`가 Settings DB에 `features.oidc`를 넣어 n8n이 SSO를 사용할 수 있게 합니다.
- **모듈 매니페스트**: [polyon-module/module.yaml](polyon-module/module.yaml). 개발·배포 체크리스트는 [polyon-module/DEV-CHECKLIST.md](polyon-module/DEV-CHECKLIST.md).

### PolyON용 이미지 빌드

```bash
docker build -t polyon-n8n:latest .
```

PolyON Operator가 이 저장소의 `module.yaml`과 위 이미지를 사용해 배포합니다.

---

# n8n - Secure Workflow Automation for Technical Teams

n8n is a workflow automation platform that gives technical teams the flexibility of code with the speed of no-code. With 400+ integrations, native AI capabilities, and a fair-code license, n8n lets you build powerful automations while maintaining full control over your data and deployments.

![n8n.io - Screenshot](https://raw.githubusercontent.com/n8n-io/n8n/master/assets/n8n-screenshot-readme.png)

## Key Capabilities

- **Code When You Need It**: Write JavaScript/Python, add npm packages, or use the visual interface
- **AI-Native Platform**: Build AI agent workflows based on LangChain with your own data and models
- **Full Control**: Self-host with our fair-code license or use our [cloud offering](https://app.n8n.cloud/login)
- **Enterprise-Ready**: Advanced permissions, SSO, and air-gapped deployments
- **Active Community**: 400+ integrations and 900+ ready-to-use [templates](https://n8n.io/workflows)

## Quick Start

Try n8n instantly with [npx](https://docs.n8n.io/hosting/installation/npm/) (requires [Node.js](https://nodejs.org/en/)):

```
npx n8n
```

Or deploy with [Docker](https://docs.n8n.io/hosting/installation/docker/):

```
docker volume create n8n_data
docker run -it --rm --name n8n -p 5678:5678 -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n
```

Access the editor at http://localhost:5678

## Resources

- 📚 [Documentation](https://docs.n8n.io)
- 🔧 [400+ Integrations](https://n8n.io/integrations)
- 💡 [Example Workflows](https://n8n.io/workflows)
- 🤖 [AI & LangChain Guide](https://docs.n8n.io/advanced-ai/)
- 👥 [Community Forum](https://community.n8n.io)
- 📖 [Community Tutorials](https://community.n8n.io/c/tutorials/28)

## Support

Need help? Our community forum is the place to get support and connect with other users:
[community.n8n.io](https://community.n8n.io)

## License

n8n is [fair-code](https://faircode.io) distributed under the [Sustainable Use License](https://github.com/n8n-io/n8n/blob/master/LICENSE.md) and [n8n Enterprise License](https://github.com/n8n-io/n8n/blob/master/LICENSE_EE.md).

- **Source Available**: Always visible source code
- **Self-Hostable**: Deploy anywhere
- **Extensible**: Add your own nodes and functionality

[Enterprise licenses](mailto:license@n8n.io) available for additional features and support.

Additional information about the license model can be found in the [docs](https://docs.n8n.io/sustainable-use-license/).

## Contributing

Found a bug 🐛 or have a feature idea ✨? Check our [Contributing Guide](https://github.com/n8n-io/n8n/blob/master/CONTRIBUTING.md) for a setup guide & best practices.

## Join the Team

Want to shape the future of automation? Check out our [job posts](https://n8n.io/careers) and join our team!

## What does n8n mean?

**Short answer:** It means "nodemation" and is pronounced as n-eight-n.

**Long answer:** "I get that question quite often (more often than I expected) so I decided it is probably best to answer it here. While looking for a good name for the project with a free domain I realized very quickly that all the good ones I could think of were already taken. So, in the end, I chose nodemation. 'node-' in the sense that it uses a Node-View and that it uses Node.js and '-mation' for 'automation' which is what the project is supposed to help with. However, I did not like how long the name was and I could not imagine writing something that long every time in the CLI. That is when I then ended up on 'n8n'." - **Jan Oberhauser, Founder and CEO, n8n.io**
