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
  email: yup.string().email('Неверный email').required('Email обязателен'),
  password: yup.string().required('Пароль обязателен'),
})

function SignInPage() {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(signInSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
  })
  const [loginUser, { isLoading, isError, reset }] = useLoginMutation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const onSubmit = async (formData) => {
    try {
      const formattedData = { user: { email: formData.email, password: formData.password } }
      const response = await loginUser(formattedData).unwrap()
      if (response.user && response.user.token) {
        dispatch(setUser(response.user))
        localStorage.setItem('token', response.user.token)
        toast.success('Успешный вход!')
        navigate('/')
      } else {
        toast.error('Токен не найден в ответе')
      }
    } catch (error) {
      toast.error('Ошибка входа')
    }
  }

  useEffect(() => {
    if (isError) {
      reset({ email: '', password: '' })
    }
  }, [isError, reset])

  return (
    <div className={styles.formContainer}>
      <h2>Вход в систему</h2>
      <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
        <Form.Item label="Email" validateStatus={errors.email ? 'error' : ''} help={errors.email?.message}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Введите email" autoComplete="email" />}
          />
        </Form.Item>
        <Form.Item label="Пароль" validateStatus={errors.password ? 'error' : ''} help={errors.password?.message}>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input.Password {...field} placeholder="Введите пароль" autoComplete="current-password" />
            )}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block disabled={isLoading || !isValid}>
            {isLoading ? 'Вход...' : 'Войти'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default SignInPage
