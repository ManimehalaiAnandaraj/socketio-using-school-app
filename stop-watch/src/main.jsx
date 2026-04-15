import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { store } from './redux/store.js'
import { Provider} from  'react-redux'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <Provider store={store}>
         <App />
      </Provider>
    </ThemeProvider> 
  </StrictMode>,
)
