# Contribution Guidelines / 開発貢献ガイドライン

Thank you for your interest in contributing to the ryopc org!
ryopc orgのプロジェクトへ関心を持っていただき、ありがとうございます！

---

## 🌐 Our Mission / 私たちのミッション

### [English]

Our mission is to achieve a society where **everyone in the world has access to legitimate support for their digital devices**. We believe that access to technology is a fundamental human right. To sustain this, fair and transparent support is essential. We work together to protect users from fraudulent support practices globally and to build a healthy digital ecosystem.

### [日本語]

私たちは、**「世界中の誰もが、デジタルデバイスの正当なサポートを受けられる社会」**を目指しています。テクノロジーへのアクセスは基本的人権であり、それを維持するためには公平で透明性のあるサポートが不可欠です。世界中の不正なサポート行為からユーザーを保護し、健全なデジタルエコシステムを共に構築していきます。

---

## 🚀 Development Workflow / 開発の流れ (GitHub Flow)

### 1. Check or Create an Issue / Issueの確認・作成

- **EN:** Before starting work, check the [Issues] tab or open a new one to report bugs or propose features.
- **JA:** 作業を始める前に [Issues] タブを確認するか、新しいIssueを作成してバグ報告や機能提案を行ってください。

### 2. Branch Naming / ブランチの作成規則

- **Format:** `[type]/[issue-number]-[short-description]`
  - ✨ Features / Improvements: `feat/123-add-guidance-tool`
  - 🐛 Bug Fixes: `fix/456-patch-login-error`
  - 📝 Documentation: `docs/789-update-readme`

### 3. Commit Messages / コミットメッセージ

- **EN:** Use clear prefixes to maintain transparency for all users.
- **JA:** 変更内容の透明性を保つため、メッセージの先頭に以下のプレフィックスを付与してください。
  - `feat: add digital literacy self-diagnosis feature` (機能追加)
  - `fix: resolve crash issue on older devices` (バグ修正)

### 4. Pull Request (PR) & Merge / PRとマージ

- **EN:** Fill out the PR template. Your PR will be merged after passing automated tests (CI) and receiving at least one approval.
- **JA:** PRテンプレートの項目を埋めて提出してください。自動テスト（CI）を通過し、1名以上の承認を得ることでマージされます。

---

## 🔒 Security and Compliance / セキュリティと遵守事項

1. **No Hardcoded Secrets / 秘密情報のコミット禁止**
   - **EN:** Never commit API keys, passwords, or private keys. Use environment variables and `.gitignore`.
   - **JA:** APIキーやパスワードなどの秘密情報は絶対にコード内に記述せず、`.gitignore` で除外してください。
2. **Zero Tolerance for Malicious Code / 不正コードの排除**
   - **EN:** Any code that threatens user privacy is strictly prohibited and will result in an immediate ban.
   - **JA:** ユーザーのプライバシーを脅かす不正なロジックの混入は厳禁です。発見時は即座にブロック措置を取ります。

---

## 📱 Official Mobile App "ryopc-app" / 公式アプリについて

### [English]

The `ryopc-app` is a core tool of our digital ecosystem, bringing seamless device guidance directly to smartphones. When contributing, please prioritize mobile UI/UX standards and digital accessibility so that anyone can use the app without barriers.

### [日本語]

公式アプリ `ryopc-app` は、当組織のデジタルエコシステムをスマートフォンから利用できる中核ツールです。アプリ関連リポジトリへ貢献する場合は、誰もが障壁なく使えるよう、モバイルUI/UXやアクセシビリティへの配慮を優先してください。

---

## 🤝 Code of Conduct / 行動規範

- **EN:** We welcome a diverse and inclusive community. Please keep all communication respectful and constructive.
- **JA:** 私たちは多様性を歓迎します。他者への敬意を持った建設的なコミュニケーションをお願いいたします。

---

**ryopc org Core Team / 運営チーム**
