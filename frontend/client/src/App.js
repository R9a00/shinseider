import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Phase1 from './components/Phase1';
import SubsidySelection from './components/SubsidySelection';
import SubsidyApplicationSupport from './components/SubsidyApplicationSupport';
import BusinessPlan from './components/BusinessPlan';

function Home() {
  return (
    <section className="relative isolate overflow-hidden bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-red-700 text-white font-bold">S</span>
            <span>Shinseider</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            補助金申請の準備を支え、かける時間を最小化する。
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            思考の整理から下書き、抜け漏れチェック、提出前チェックリストまで。あなたの申請作業を一直線にします。
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-4">
            <Link to="/subsidy-selection" className="rounded-xl bg-red-700 px-6 py-3 text-white font-semibold shadow-sm hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700">
              シンセイ準備
            </Link>
            <Link to="/phase1" className="text-sm font-semibold leading-6 text-gray-900">
              3分診断 <span aria-hidden="true">→</span>
            </Link>
          </div>
          <p className="mt-8 text-xs text-gray-500">
            あなたの文章やファイルは、このブラウザの中だけで処理されます。サーバーには残りません。
          </p>
        </div>
      </div>
    </section>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/phase1" element={<Phase1 />} />
          <Route path="/subsidy-selection" element={<SubsidySelection />} />
          <Route path="/subsidy-application-support/:subsidyId" element={<SubsidyApplicationSupport />} />
          <Route path="/business-plan" element={<BusinessPlan />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
