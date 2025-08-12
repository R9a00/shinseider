// プライバシーポリシー改定履歴
export const privacyPolicyHistory = [
  {
    version: "1.3",
    date: "2025-08-12",
    changes: [
      "データ保管期間を3ヶ月と明記",
      "第三者紹介時の表現をより配慮のある内容に修正"
    ]
  },
  {
    version: "1.2", 
    date: "2025-08-12",
    changes: [
      "利用目的にアトツギ甲子園地域アンバサダーへの紹介を追加",
      "サーバーへのデータ保存を「一切しない」に修正",
      "サイト名称を「当サイト」に統一"
    ]
  },
  {
    version: "1.1",
    date: "2025-08-11", 
    changes: [
      "お問い合わせフォームのファイル添付機能追加に伴う更新"
    ]
  },
  {
    version: "1.0",
    date: "2025-08-10",
    changes: [
      "初版制定"
    ]
  }
];

export const getCurrentVersion = () => {
  return privacyPolicyHistory[0];
};

export const getAllVersions = () => {
  return privacyPolicyHistory;
};