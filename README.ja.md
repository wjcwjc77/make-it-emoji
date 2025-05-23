# 絵文字成語マスター (emoji-master)

*[English](README.md) | 日本語 | [中文](README.zh.md)*

## プロジェクト紹介

**絵文字成語マスター**は、仕事と娯楽を組み合わせた革新的なゲームデモプロジェクトです。このゲームでは、プレイヤーは絵文字を使って中国の成語（四字熟語）を表現し、自分の創造的思考力に挑戦します。

このプロジェクトは興味深いアイデアを探求しています：**人々が楽しんでいると思いながら、実は大規模言語モデルによって包装・変換された仕事のタスクを完了するようなゲームをデザインできるのでしょうか？**これにより、人々はゲームを楽しみながらもお金を稼ぐことができ、仕事と娯楽の完璧な融合を実現できます。

## 主な機能

- **創造的チャレンジ**：絵文字の組み合わせを使って中国の成語を表現
- **AI評価**：大規模モデルがあなたの表現の正確さと創造性を評価
- **ポイントシステム**：詳細な評価フィードバックを獲得
- **ソーシャルシェア**：友達に挑戦し、あなたの創造的表現を共有
- **達成システム**：スコアに基づいて異なるレベルの称号を獲得

## 思想探求

このプロジェクトはいくつかの重要な概念を探求しています：

1. **仕事のゲーミフィケーション**：退屈な仕事のタスクを面白いゲームの挑戦に変換
2. **大規模モデル支援変換**：AIを使用して仕事のタスクをパッケージ化し、より楽しくする
3. **Win-Winモデル**：プレイヤーはゲームの喜びと報酬を得ながら、価値ある仕事を完了
4. **ソーシャルインセンティブ**：ソーシャルシェアと競争を通じて参加意欲を高める

## 技術スタック

- Next.js 15.3.0
- React 19.0.0
- Tailwind CSS
- OpenAI API
- Supabase

## インストールと使用方法

```bash
# 依存関係のインストール
npm install

# 開発サーバーの実行
npm run dev

# プロジェクトのビルド
npm run build

# 本番サーバーの起動
npm start
```

## プロジェクト構造

- `/app` - Next.jsアプリケーションのメインディレクトリ
  - `/page.js` - ホームページ
  - `/game` - ゲームページ
  - `/result` - 結果と評価ページ
  - `/api` - APIルート
  - `/components` - 再利用可能なコンポーネント
- `/data` - ゲームデータ（成語と絵文字の対応関係）
- `/public` - 静的リソース

## 将来の展望

このデモプロジェクトは、新しい働き方の可能性を示しています。将来的には以下のように拡張できます：

1. **多様化タスク**：異なるタイプのゲームが異なるタイプの仕事のタスクに対応
2. **報酬システム**：完成された仮想報酬や実際の経済的報酬
3. **コミュニティ構築**：プレイヤー/ワーカーのコミュニティを作成
4. **企業応用**：企業と協力して、実際の仕事のタスクをゲームに組み込む

## 貢献ガイドライン

新しいアイデア、成語データ、または機能改善の貢献を歓迎します！IssueまたはPull Requestを作成してください。

## ライセンス

Apache License 2.0 