// プライバシーポリシー改定履歴
export const privacyPolicyHistory = [
  {
    version: "1.3",
    date: "2025-08-12",
    changes: [
      "お問い合わせデータの保管期間（通常3ヶ月）を明記しました",
      "第三者への紹介について、より分かりやすい表現に変更しました"
    ]
  },
  {
    version: "1.2", 
    date: "2025-08-12",
    changes: [
      "利用目的にアトツギ甲子園地域アンバサダーへの紹介を追加しました",
      "データ保存に関する記載をより明確にしました",
      "サイト名称の表記を統一しました"
    ]
  },
  {
    version: "1.1",
    date: "2025-08-11", 
    changes: [
      "お問い合わせフォームでのファイル添付機能に対応しました"
    ]
  },
  {
    version: "1.0",
    date: "2025-08-10",
    changes: [
      "プライバシーポリシーを制定しました"
    ]
  }
];

export const getCurrentVersion = () => {
  return privacyPolicyHistory[0];
};

export const getAllVersions = () => {
  return privacyPolicyHistory;
};