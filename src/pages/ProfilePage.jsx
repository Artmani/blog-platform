import React, { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useDispatch, useSelector } from 'react-redux'
import { Form, Input, Button } from 'antd'
import { toast } from 'react-toastify'
import { useUpdateUserMutation } from '../store/articlesApi'
import 'react-toastify/dist/ReactToastify.css'
import styles from '../styles/Form.module.scss'

const profileSchema = yup.object().shape({
  username: yup
    .string()
    .required('Имя пользователя обязательно')
    .min(3, 'Имя пользователя должно быть не менее 3 символов')
    .max(20, 'Имя пользователя должно быть не более 20 символов'),
  email: yup.string().email('Неверный email').required('Email обязателен'),
  password: yup
    .string()
    .min(6, 'Пароль должен быть не менее 6 символов')
    .max(40, 'Пароль должен быть не более 40 символов')
    .required('Пароль обязателен'),
  image: yup.string().url('Некорректный URL').nullable(),
})

function ProfilePage() {
  const user = useSelector((state) => state.user.user)
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      password: '',
      image: user?.image || '',
    },
    mode: 'onChange',
  })
  const [updateUser, { isLoading, isError }] = useUpdateUserMutation()
  const dispatch = useDispatch()

  const onSubmit = async (formData) => {
    try {
      const formattedData = {
        user: {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          image: formData.image || undefined,
        },
      }
      const response = await updateUser(formattedData).unwrap()
      dispatch({ type: 'user/setUser', payload: response.user })
      toast.success('Профиль успешно обновлён!')
    } catch (error) {
      toast.error('Ошибка обновления профиля')
    }
  }

  useEffect(() => {
    if (isError) {
      reset({
        username: user?.username || '',
        email: user?.email || '',
        password: '',
        image: user?.image || '',
      })
    }
  }, [isError, reset, user])

  return (
    <div className={styles.formContainer}>
      <h2>Редактировать профиль</h2>
      <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
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
              <Input.Password {...field} placeholder="Введите новый пароль" autoComplete="new-password" />
            )}
          />
        </Form.Item>
        <Form.Item label="URL аватара" validateStatus={errors.image ? 'error' : ''} help={errors.image?.message}>
          <Controller
            name="image"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Введите URL аватара" />}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block disabled={isLoading || !isValid || !isDirty}>
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default ProfilePage
