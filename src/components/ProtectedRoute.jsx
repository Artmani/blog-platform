import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

function ProtectedRoute({ children }) {
  const user = useSelector((state) => state.user.user)
  const location = useLocation()

  return user ? children : <Navigate to="/sign-in" replace state={{ from: location }} />
}

export default ProtectedRoute
