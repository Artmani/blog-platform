import React, { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Form, Input, Button } from 'antd'
import { toast } from 'react-toastify'
import { setUser } from '../store/userSlice'
import { useLoginMutation } from '../store/articlesApi'
import 'react-toastify/dist/ReactToastify.css'
import styles from '../styles/Form.module.scss'

const signInSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
})

function SignInPage() {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  })
  const [loginUser, { isLoading, error: apiError, isError, reset }] = useLoginMutation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const onSubmit = async (formData) => {
    try {
      const formattedData = { user: { email: formData.email, password: formData.password } }
      const response = await loginUser(formattedData).unwrap()
      if (response.user && response.user.token) {
        dispatch(setUser(response.user))
        localStorage.setItem('token', response.user.token)
        toast.success('Login successful!')
        navigate('/')
      } else {
        throw new Error('Token not found in response')
      }
    } catch (error) {
      console.error('Login error caught:', error)
      if (error.status === 401) {
        toast.error('Invalid email or password. Please check your credentials.')
      } else if (error.status === 422) {
        toast.error('Validation failed on server.')
      } else if (error.status === 400) {
        toast.error('Invalid input data.')
      } else if (error.status === 0 || error.status >= 500) {
        toast.error('Network error or server is unavailable. Please try again later.')
      } else {
        toast.error('An unexpected error occurred. Please contact support.')
      }
    }
  }

  useEffect(() => {
    if (isError) {
      console.log('Error detected, resetting form:', apiError)
      reset({ email: '', password: '' })
    }
  }, [isError, apiError, reset])

  return (
    <div className={styles.formContainer}>
      <h2>Sign In</h2>
      <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
        <Form.Item label="Email" validateStatus={errors.email ? 'error' : ''} help={errors.email?.message}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Email address" autoComplete="email" />}
          />
        </Form.Item>
        <Form.Item label="Password" validateStatus={errors.password ? 'error' : ''} help={errors.password?.message}>
          <Controller
            name="password"
            control={control}
            render={({ field }) => <Input.Password {...field} placeholder="Password" autoComplete="current-password" />}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block disabled={isLoading || !isValid}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default SignInPage
