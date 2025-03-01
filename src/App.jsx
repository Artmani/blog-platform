import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useRef } from 'react'
import { Avatar, Button } from 'antd'
import ArticlesListPage from './pages/ArticlesListPage'
import ArticleDetailPage from './pages/ArticleDetailPage'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import ProfilePage from './pages/ProfilePage'
import NewArticlePage from './pages/NewArticlePage'
import EditArticlePage from './pages/EditArticlePage'
import ProtectedRoute from './components/ProtectedRoute'
import { getCurrentUser, logout } from './store/userSlice'
import styles from './styles/App.module.scss'

function AppContent() {
  const user = useSelector((state) => state.user.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const hasCheckedToken = useRef(false)

  useEffect(() => {
    if (hasCheckedToken.current) return
    const checkToken = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        dispatch(logout())
      } else {
        try {
          await dispatch(getCurrentUser()).unwrap()
        } catch (error) {
          dispatch(logout())
        }
      }
      hasCheckedToken.current = true
    }
    checkToken()
  }, [dispatch])

  const handleHeaderClick = (path) => {
    navigate(path)
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <Button
          type="link"
          onClick={() => handleHeaderClick('/')}
          style={{ padding: 0, fontSize: '24px', fontFamily: 'Arial, sans-serif' }}
        >
          Realworld Blog
        </Button>
        {user ? (
          <div className={styles.userSection}>
            <Button type="primary" onClick={() => navigate('/new-article')} style={{ marginRight: 10 }}>
              Create article
            </Button>
            <button
              type="button"
              onClick={() => handleHeaderClick('/profile')}
              className={styles.userName}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {user.username}
            </button>
            <Avatar
              role="button"
              tabIndex={0}
              src={user?.image || 'https://dummyimage.com/50x50/000/fff'}
              onClick={() => handleHeaderClick('/profile')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleHeaderClick('/profile')
                }
              }}
            />
            <Button
              onClick={() => {
                dispatch(logout())
                localStorage.removeItem('token')
              }}
              ghost
            >
              Log Out
            </Button>
          </div>
        ) : (
          <div>
            <Button onClick={() => navigate('/sign-in')} className={styles.signIn}>
              Sign In
            </Button>
            <Button onClick={() => navigate('/sign-up')} type="primary" className={styles.signUp}>
              Sign Up
            </Button>
          </div>
        )}
      </header>
      <main>
        <Routes>
          <Route path="/" element={<ArticlesListPage />} />
          <Route path="/articles" element={<ArticlesListPage />} />
          <Route path="/articles/:slug" element={<ArticleDetailPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new-article"
            element={
              <ProtectedRoute>
                <NewArticlePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/articles/:slug/edit"
            element={
              <ProtectedRoute>
                <EditArticlePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<div className={styles.notFound}>404 Not Found</div>} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}
