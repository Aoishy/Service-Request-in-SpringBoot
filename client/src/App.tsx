import React from 'react';
import { Layout } from './components/Layout';
import { useRoleStore } from './store/roleStore';
import { OperatorPage } from './pages/OperatorPage';
import { SupervisorPage } from './pages/SupervisorPage';

export const App: React.FC = () => {
  const { role } = useRoleStore();

  return (
    <Layout>
      {role === 'operator' ? <OperatorPage /> : <SupervisorPage />}
    </Layout>
  );
};

export default App;
