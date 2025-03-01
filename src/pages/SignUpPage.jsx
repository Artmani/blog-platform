import React, { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Form, Input, Checkbox, Button } from 'antd'
import { toast } from 'react-toastify'
import { setUser } from '../store/userSlice'
import { useRegisterMutation } from '../store/articlesApi'
import 'react-toastify/dist/ReactToastify.css'
import styles from '../styles/Form.module.scss'

const signUpSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  username: yup.string().min(3).max(20).required('Username is required'),
  password: yup.string().min(6).max(40).required('Password is required'),
  repeatPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Repeat password is required'),
  agreement: yup.boolean().oneOf([true], 'You must agree'),
})

function SignUpPage() {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(signUpSchema),
    defaultValues: { email: '', username: '', password: '', repeatPassword: '', agreement: false },
  })
  const [registerUser, { isLoading, error: apiError, isError, reset }] = useRegisterMutation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const onSubmit = async (formData) => {
    try {
      const formattedData = {
        user: { email: formData.email, password: formData.password, username: formData.username },
      }
      const response = await registerUser(formattedData).unwrap()
      dispatch(setUser(response.user))
      localStorage.setItem('token', response.user.token)
      toast.success('Registration successful!')
      navigate('/')
    } catch (error) {
      console.error('Registration error caught:', error)
      if (error.status === 400) {
        if (error.data?.errors) {
          Object.keys(error.data.errors).forEach((key) => {
            toast.error(error.data.errors[key])
          })
        } else {
          toast.error('Invalid input data.')
        }
      } else if (error.status === 422) {
        if (error.data?.errors) {
          Object.keys(error.data.errors).forEach((key) => {
            toast.error(error.data.errors[key])
          })
        } else {
          toast.error('Validation failed on server.')
        }
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
      reset({ email: '', username: '', password: '', repeatPassword: '', agreement: false })
    }
  }, [isError, apiError, reset])

  return (
    <div className={styles.formContainer}>
      <h2>Create new account</h2>
      <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
        <Form.Item label="Email" validateStatus={errors.email ? 'error' : ''} help={errors.email?.message}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Email address" autoComplete="email" />}
          />
        </Form.Item>
        <Form.Item label="Username" validateStatus={errors.username ? 'error' : ''} help={errors.username?.message}>
          <Controller
            name="username"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Username" autoComplete="username" />}
          />
        </Form.Item>
        <Form.Item label="Password" validateStatus={errors.password ? 'error' : ''} help={errors.password?.message}>
          <Controller
            name="password"
            control={control}
            render={({ field }) => <Input.Password {...field} placeholder="Password" autoComplete="new-password" />}
          />
        </Form.Item>
        <Form.Item
          label="Repeat Password"
          validateStatus={errors.repeatPassword ? 'error' : ''}
          help={errors.repeatPassword?.message}
        >
          <Controller
            name="repeatPassword"
            control={control}
            render={({ field }) => (
              <Input.Password {...field} placeholder="Repeat Password" autoComplete="new-password" />
            )}
          />
        </Form.Item>
        <Form.Item validateStatus={errors.agreement ? 'error' : ''} help={errors.agreement?.message}>
          <Controller
            name="agreement"
            control={control}
            render={({ field }) => (
              <Checkbox {...field} checked={field.value}>
                I agree to the processing of my personal information
              </Checkbox>
            )}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block disabled={isLoading || !isValid}>
            {isLoading ? 'Creating...' : 'Create'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default SignUpPage
