# 運用ガイド

## 概要

事業承継・補助金申請サポートシステムの運用ガイドです。

## システム構成

### アーキテクチャ
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (Files)       │
│   Port: 3000    │    │   Port: 8888    │    │   (YAML/JSON)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### セキュリティアーキテクチャ
```
┌─────────────────────────────────────────────────────────────┐
│                    Security Middleware                     │
├─────────────────┬─────────────────┬─────────────────────────┤
│ Rate Limiting   │ Request Size    │ Error Handling          │
│ (100 req/min)   │ (1MB limit)     │ (Production safe)      │
└─────────────────┴─────────────────┴─────────────────────────┘
```

## デプロイ手順

### 1. 環境準備

#### 必要なソフトウェア
- Python 3.9+
- Node.js 16+
- npm 8+

#### システム要件
- CPU: 2コア以上
- メモリ: 4GB以上
- ストレージ: 10GB以上

### 2. バックエンドデプロイ

```bash
# 1. リポジトリクローン
git clone <repository-url>
cd attg

# 2. 仮想環境作成
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

# 3. 依存関係インストール
pip install -r requirements.txt

# 4. 環境変数設定
export ENVIRONMENT=production
export SECRET_KEY=your-secret-key

# 5. アプリケーション起動
uvicorn main:app --host 0.0.0.0 --port 8888
```

### 3. フロントエンドデプロイ

```bash
# 1. 依存関係インストール
cd frontend/client
npm install

# 2. 本番ビルド
npm run build

# 3. 静的ファイル配信
# nginx または Apache で build/ ディレクトリを配信
```

### 4. リバースプロキシ設定

#### Nginx設定例
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # フロントエンド
    location / {
        root /path/to/frontend/client/build;
        try_files $uri $uri/ /index.html;
    }

    # バックエンドAPI
    location /api/ {
        proxy_pass http://localhost:8888/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 監視・ログ設定

### 1. ログ設定

#### セキュリティログ
```python
# ログレベル設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler('security.log'),
        logging.StreamHandler()
    ]
)
```

#### ログローテーション
```bash
# logrotate設定例
/path/to/backend/security.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 www-data www-data
}
```

### 2. 監視設定

#### ヘルスチェック
```bash
# バックエンドヘルスチェック
curl -f http://localhost:8888/ || exit 1

# フロントエンドヘルスチェック
curl -f http://localhost:3000/ || exit 1
```

#### メトリクス収集
```python
# Prometheusメトリクス例
from prometheus_client import Counter, Histogram

# リクエスト数
request_count = Counter('http_requests_total', 'Total HTTP requests')
# レスポンス時間
request_duration = Histogram('http_request_duration_seconds', 'HTTP request duration')
```

### 3. アラート設定

#### セキュリティアラート
```bash
# 大量リクエスト検知
grep "Rate limit exceeded" /var/log/security.log | wc -l

# パストラバーサル攻撃検知
grep "Path traversal attempt" /var/log/security.log

# ファイルサイズ超過検知
grep "Large request blocked" /var/log/security.log
```

## セキュリティ運用

### 1. 定期セキュリティチェック

#### 週次チェック項目
- [ ] セキュリティログの確認
- [ ] 異常アクセスの検知
- [ ] ファイル権限の確認
- [ ] 依存関係の脆弱性チェック

#### 月次チェック項目
- [ ] セキュリティアップデートの適用
- [ ] アクセスログの分析
- [ ] バックアップの確認
- [ ] パフォーマンス監視

### 2. インシデント対応

#### セキュリティインシデント対応手順

1. **検知・報告**
   ```bash
   # セキュリティログの確認
   tail -f /var/log/security.log
   ```

2. **初期対応**
   ```bash
   # 攻撃元IPのブロック
   iptables -A INPUT -s <attacker-ip> -j DROP
   
   # サービス再起動
   systemctl restart attg-backend
   ```

3. **影響調査**
   ```bash
   # ログ分析
   grep <timestamp> /var/log/security.log
   
   # ファイル整合性チェック
   find /path/to/app -type f -exec md5sum {} \;
   ```

4. **復旧作業**
   ```bash
   # バックアップからの復旧
   cp /backup/app.tar.gz /path/to/app/
   tar -xzf app.tar.gz
   ```

### 3. バックアップ戦略

#### 自動バックアップ設定
```bash
#!/bin/bash
# daily_backup.sh

DATE=$(date +%Y%m%d)
BACKUP_DIR="/backup/attg"

# アプリケーションファイルのバックアップ
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /path/to/app/

# データベースのバックアップ
cp /path/to/app/backend/subsidies.yaml $BACKUP_DIR/subsidies_$DATE.yaml

# 古いバックアップの削除（30日以上）
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.yaml" -mtime +30 -delete
```

## パフォーマンス監視

### 1. レスポンス時間監視

#### 期待値
- 平均レスポンス時間: 200ms以下
- 95パーセンタイル: 500ms以下
- 99パーセンタイル: 1秒以下

#### 監視コマンド
```bash
# レスポンス時間測定
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:8888/subsidies"
```

### 2. リソース使用量監視

#### メモリ使用量
```bash
# メモリ使用量確認
ps aux | grep uvicorn
free -h
```

#### CPU使用量
```bash
# CPU使用量確認
top -p $(pgrep uvicorn)
```

### 3. エラー率監視

#### 期待値
- エラー率: 1%以下
- 可用性: 99.9%以上

#### 監視スクリプト
```bash
#!/bin/bash
# error_rate_check.sh

ERROR_COUNT=$(grep "ERROR" /var/log/app.log | wc -l)
TOTAL_REQUESTS=$(grep "INFO" /var/log/app.log | wc -l)
ERROR_RATE=$(echo "scale=2; $ERROR_COUNT * 100 / $TOTAL_REQUESTS" | bc)

if (( $(echo "$ERROR_RATE > 1" | bc -l) )); then
    echo "High error rate detected: $ERROR_RATE%"
    # アラート送信
fi
```

## メンテナンス

### 1. 定期メンテナンス

#### 週次メンテナンス
- ログファイルのローテーション
- 一時ファイルのクリーンアップ
- セキュリティアップデートの確認

#### 月次メンテナンス
- 依存関係の更新
- パフォーマンスチューニング
- バックアップの検証

### 2. アップデート手順

```bash
# 1. バックアップ作成
./backup.sh

# 2. 新しいコードのデプロイ
git pull origin main

# 3. 依存関係の更新
pip install -r requirements.txt --upgrade

# 4. アプリケーション再起動
systemctl restart attg-backend

# 5. 動作確認
curl http://localhost:8888/
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. アプリケーションが起動しない
```bash
# ログ確認
tail -f /var/log/app.log

# ポート確認
netstat -tlnp | grep 8888

# プロセス確認
ps aux | grep uvicorn
```

#### 2. セキュリティエラーが発生
```bash
# セキュリティログ確認
tail -f /var/log/security.log

# ファイル権限確認
ls -la /path/to/app/

# 環境変数確認
echo $ENVIRONMENT
echo $SECRET_KEY
```

#### 3. パフォーマンスが悪い
```bash
# リソース使用量確認
htop

# スロークエリログ確認
tail -f /var/log/slow.log

# ネットワーク確認
netstat -i
```

## サポート・連絡先

### 緊急時連絡先
- システム管理者: admin@example.com
- セキュリティ担当: security@example.com
- 技術サポート: support@example.com

### ドキュメント
- API仕様書: `API_SPECIFICATION.md`
- セキュリティ要件: `SECURITY_REQUIREMENTS.md`
- 実装計画: `IMPLEMENTATION_PLAN.md`

---

**最終更新**: 2024年12月
**バージョン**: 1.0.0 