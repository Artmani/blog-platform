import React from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card } from 'antd'
import { toast } from 'react-toastify'
import { useCreateArticleMutation } from '../store/articlesApi'
import 'react-toastify/dist/ReactToastify.css'
import styles from '../styles/Form.module.scss'

const articleSchema = yup.object().shape({
  title: yup.string().required('Title is required').max(5000, 'Title must not exceed 5000 characters'),
  description: yup.string().required('Short description is required'),
  body: yup.string().required('Text is required'),
  tagList: yup.array().of(yup.string().required('Tag is required').min(1)).ensure().compact(),
})

function NewArticlePage() {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(articleSchema),
    defaultValues: { title: '', description: '', body: '', tagList: [''] },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'tagList' })
  const [createArticle, { isLoading }] = useCreateArticleMutation() // Восстановили isLoading
  const navigate = useNavigate()

  const onSubmit = async (formData) => {
    try {
      const response = await createArticle(formData).unwrap()
      toast.success('Article created successfully!')
      navigate(`/articles/${response.article.slug}`)
    } catch (error) {
      console.error('Error creating article:', error)
      if (error.status === 400) {
        toast.error('Invalid input data.')
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

  return (
    <div className={styles.formContainer}>
      <h2>Create new article</h2>
      <Card className={styles.card}>
        <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
          <Form.Item label="Title" validateStatus={errors.title ? 'error' : ''} help={errors.title?.message}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => <Input {...field} placeholder="Title" autoComplete="off" />}
            />
          </Form.Item>
          <Form.Item
            label="Short description"
            validateStatus={errors.description ? 'error' : ''}
            help={errors.description?.message}
          >
            <Controller
              name="description"
              control={control}
              render={({ field }) => <Input {...field} placeholder="Short description" autoComplete="off" />}
            />
          </Form.Item>
          <Form.Item label="Text" validateStatus={errors.body ? 'error' : ''} help={errors.body?.message}>
            <Controller
              name="body"
              control={control}
              render={({ field }) => <Input.TextArea {...field} placeholder="Text" autoComplete="off" rows={4} />}
            />
          </Form.Item>
          <Form.Item label="Tags">
            {fields.map((field, index) => (
              <div key={field.id} className={styles.tagRow}>
                <Form.Item
                  validateStatus={errors.tagList?.[index] ? 'error' : ''}
                  help={errors.tagList?.[index]?.message}
                >
                  <Controller
                    name={`tagList.${index}`}
                    control={control}
                    render={({ field: fieldValue }) => (
                      <Input
                        {...fieldValue}
                        placeholder={`Tag ${index + 1}`}
                        autoComplete="off"
                        style={{ marginRight: 8, width: 200 }}
                      />
                    )}
                  />
                </Form.Item>
                <Button type="danger" onClick={() => remove(index)} style={{ marginRight: 8 }}>
                  Delete
                </Button>
              </div>
            ))}
            <Button type="primary" onClick={() => append('')} style={{ marginTop: 8 }}>
              Add tag
            </Button>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block disabled={isLoading || !isValid}>
              {isLoading ? 'Creating...' : 'Send'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default NewArticlePage
