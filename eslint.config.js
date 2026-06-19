import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      // Node.jsの仕組み（process.env や module.exports）を使ってもエラーにしない設定
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // ここに「この書き方は許す」という自分だけのルールを追加できます
      "no-unused-vars": "warn", // 使っていない変数があってもエラーではなく警告にする
    },
  },
];
