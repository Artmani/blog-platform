import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ArticlesListPage from './pages/ArticlesListPage'
import ArticleDetailPage from './pages/ArticleDetailPage'
import styles from './styles/App.module.scss'

const App = () => {
  return (
    <Router>
      <div className={styles.app}>
        <header className={styles.header}>
          <h1>RealWorld Blog</h1>
          <div>
            <button className={styles.signIn}>Sign In</button>
            <button className={styles.signUp}>Sign Up</button>
          </div>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<ArticlesListPage />} />
            <Route path="/articles" element={<ArticlesListPage />} />
            <Route path="/articles/:slug" element={<ArticleDetailPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
