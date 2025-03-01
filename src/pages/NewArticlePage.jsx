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
  title: yup.string().required('Заголовок обязателен').max(5000, 'Заголовок не должен превышать 5000 символов'),
  description: yup.string().required('Краткое описание обязательно'),
  body: yup.string().required('Текст обязателен'),
  tagList: yup
    .array()
    .of(yup.string().required('Тег обязателен').min(1, 'Тег должен содержать минимум 1 символ'))
    .ensure()
    .compact(),
})

function NewArticlePage() {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(articleSchema),
    defaultValues: { title: '', description: '', body: '', tagList: [''] },
    mode: 'onChange',
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'tagList' })
  const [createArticle, { isLoading }] = useCreateArticleMutation()
  const navigate = useNavigate()

  const onSubmit = async (formData) => {
    try {
      const response = await createArticle(formData).unwrap()
      toast.success('Статья успешно создана!')
      navigate(`/articles/${response.article.slug}`)
    } catch (error) {
      toast.error('Ошибка создания статьи')
    }
  }

  return (
    <div className={styles.formContainer}>
      <h2>Создать новую статью</h2>
      <Card className={styles.card}>
        <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
          <Form.Item label="Заголовок" validateStatus={errors.title ? 'error' : ''} help={errors.title?.message}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => <Input {...field} placeholder="Введите заголовок" autoComplete="off" />}
            />
          </Form.Item>
          <Form.Item
            label="Краткое описание"
            validateStatus={errors.description ? 'error' : ''}
            help={errors.description?.message}
          >
            <Controller
              name="description"
              control={control}
              render={({ field }) => <Input {...field} placeholder="Введите краткое описание" autoComplete="off" />}
            />
          </Form.Item>
          <Form.Item label="Текст" validateStatus={errors.body ? 'error' : ''} help={errors.body?.message}>
            <Controller
              name="body"
              control={control}
              render={({ field }) => (
                <Input.TextArea {...field} placeholder="Введите текст статьи" autoComplete="off" rows={4} />
              )}
            />
          </Form.Item>
          <Form.Item label="Теги">
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
                        placeholder={`Тег ${index + 1}`}
                        autoComplete="off"
                        style={{ marginRight: 8, width: 200 }}
                      />
                    )}
                  />
                </Form.Item>
                <Button type="danger" onClick={() => remove(index)} style={{ marginRight: 8 }}>
                  Удалить
                </Button>
              </div>
            ))}
            <Button type="primary" onClick={() => append('')} style={{ marginTop: 8 }}>
              Добавить тег
            </Button>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block disabled={isLoading || !isValid}>
              {isLoading ? 'Создание...' : 'Создать'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default NewArticlePage
