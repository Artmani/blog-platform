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
  email: yup.string().email('Неверный email').required('Email обязателен'),
  username: yup
    .string()
    .min(3, 'Имя пользователя должно быть не менее 3 символов')
    .max(20, 'Имя пользователя должно быть не более 20 символов')
    .required('Имя пользователя обязательно'),
  password: yup
    .string()
    .min(6, 'Пароль должен быть не менее 6 символов')
    .max(40, 'Пароль должен быть не более 40 символов')
    .required('Пароль обязателен'),
  repeatPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Пароли должны совпадать')
    .required('Повторите пароль'),
  agreement: yup.boolean().oneOf([true], 'Необходимо дать согласие'),
})

function SignUpPage() {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(signUpSchema),
    defaultValues: { email: '', username: '', password: '', repeatPassword: '', agreement: false },
    mode: 'onChange',
  })
  const [registerUser, { isLoading, isError, reset }] = useRegisterMutation()
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
      toast.success('Регистрация прошла успешно!')
      navigate('/')
    } catch (error) {
      toast.error('Ошибка регистрации')
    }
  }

  useEffect(() => {
    if (isError) {
      reset({ email: '', username: '', password: '', repeatPassword: '', agreement: false })
    }
  }, [isError, reset])

  return (
    <div className={styles.formContainer}>
      <h2>Создать новый аккаунт</h2>
      <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
        <Form.Item label="Email" validateStatus={errors.email ? 'error' : ''} help={errors.email?.message}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Введите email" autoComplete="email" />}
          />
        </Form.Item>
        <Form.Item
          label="Имя пользователя"
          validateStatus={errors.username ? 'error' : ''}
          help={errors.username?.message}
        >
          <Controller
            name="username"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Введите имя пользователя" autoComplete="username" />}
          />
        </Form.Item>
        <Form.Item label="Пароль" validateStatus={errors.password ? 'error' : ''} help={errors.password?.message}>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input.Password {...field} placeholder="Введите пароль" autoComplete="new-password" />
            )}
          />
        </Form.Item>
        <Form.Item
          label="Повторите пароль"
          validateStatus={errors.repeatPassword ? 'error' : ''}
          help={errors.repeatPassword?.message}
        >
          <Controller
            name="repeatPassword"
            control={control}
            render={({ field }) => (
              <Input.Password {...field} placeholder="Повторите пароль" autoComplete="new-password" />
            )}
          />
        </Form.Item>
        <Form.Item validateStatus={errors.agreement ? 'error' : ''} help={errors.agreement?.message}>
          <Controller
            name="agreement"
            control={control}
            render={({ field }) => (
              <Checkbox {...field} checked={field.value}>
                Я согласен с обработкой персональных данных
              </Checkbox>
            )}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block disabled={isLoading || !isValid}>
            {isLoading ? 'Регистрация...' : 'Создать аккаунт'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default SignUpPage
