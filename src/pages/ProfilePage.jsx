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
  username: yup.string().required('Username is required').min(3).max(20),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6).max(40).required('Password is required'),
  image: yup.string().url('Invalid URL').nullable(),
})

function ProfilePage() {
  const user = useSelector((state) => state.user.user)
  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      password: '',
      image: user?.image || '',
    },
  })
  const [updateUser, { isLoading, error: apiError, isError, reset }] = useUpdateUserMutation()
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
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Profile update error caught:', error)
      if (error.status === 400) {
        if (error.data?.errors) {
          Object.keys(error.data.errors).forEach((key) => {
            toast.error(error.data.errors[key])
          })
        } else {
          toast.error('Invalid input data.')
        }
      } else if (error.status === 401) {
        toast.error('Unauthorized. Please log in again.')
      } else if (error.status === 422) {
        if (error.data?.errors) {
          Object.keys(error.data.errors).forEach((key) => {
            toast.error(error.data.errors[key])
          })
        } else {
          toast.error('Validation failed on server.')
        }
      } else if (error.status === 500) {
        toast.error('Server error. Please try again later or contact support.')
      } else if (error.status === 0 || error.status >= 501) {
        toast.error('Network error. Please check your connection and try again.')
      } else {
        toast.error('An unexpected error occurred. Please contact support.')
      }
    }
  }

  useEffect(() => {
    if (isError) {
      console.log('Error detected, resetting form:', apiError)
      reset({ username: user?.username || '', email: user?.email || '', password: '', image: user?.image || '' })
    }
  }, [isError, apiError, reset, user])

  return (
    <div className={styles.formContainer}>
      <h2>Edit Profile</h2>
      <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
        <Form.Item label="Username" validateStatus={errors.username ? 'error' : ''} help={errors.username?.message}>
          <Controller
            name="username"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Username" autoComplete="username" />}
          />
        </Form.Item>
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
            render={({ field }) => <Input.Password {...field} placeholder="New password" autoComplete="new-password" />}
          />
        </Form.Item>
        <Form.Item label="Avatar Image (URL)" validateStatus={errors.image ? 'error' : ''} help={errors.image?.message}>
          <Controller
            name="image"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Avatar image" />}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block disabled={isLoading || !isValid || !isDirty}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default ProfilePage
