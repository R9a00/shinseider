import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function SubsidySelection() {
  const [subsidies, setSubsidies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubsidies = async () => {
      try {
        const response = await fetch('http://localhost:8888/subsidies');
        if (!response.ok) {
          throw new Error('補助金リストの取得に失敗しました。');
        }
        const data = await response.json();
        setSubsidies(data.subsidies);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubsidies();
  }, []);

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (error) {
    return <div>エラー: {error}</div>;
  }

  return (
    <div>
      <h2>シンセイ準備</h2>
      <p>サポートを受けたい補助金を選択してください。</p>
      {subsidies.length > 0 ? (
        <ul>
          {subsidies.map((subsidy) => (
            <li key={subsidy.id}>
              <Link to={`/subsidy-application-support/${subsidy.id}`}>
                {subsidy.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>現在、サポート対象の補助金はありません。</p>
      )}
    </div>
  );
}

export default SubsidySelection;
