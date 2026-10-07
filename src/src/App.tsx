import { AppContext } from './app/AppContext';
import { useAppController } from './app/useAppController';
import { AppView } from './app/AppView';

export default function App() {
  const app = useAppController();
  return (
    <AppContext.Provider value={app}>
      <AppView />
    </AppContext.Provider>
  );
}
