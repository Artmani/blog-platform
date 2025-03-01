import { useSelector } from 'react-redux'
import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Spin, Alert, Button, Popconfirm } from 'antd'
import { HeartOutlined } from '@ant-design/icons'
import ReactMarkdown from 'react-markdown'

import { toast } from 'react-toastify'
import { useGetArticleQuery, useDeleteArticleMutation } from '../store/articlesApi'
import 'react-toastify/dist/ReactToastify.css'
import styles from '../styles/ArticleDetailPage.module.scss'

function ArticleDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const user = useSelector((state) => state.user.user)
  const { data, articleError, isLoading } = useGetArticleQuery(slug)
  const [deleteArticle] = useDeleteArticleMutation()

  if (isLoading) return <Spin size="large" className={styles.loading} />
  if (articleError) return <Alert message="Error loading article" type="error" />

  const article = data?.article

  const handleDelete = async () => {
    try {
      await deleteArticle(slug).unwrap()
      toast.success('Article deleted successfully!')
      navigate('/')
    } catch (error) {
      console.error('Error deleting article:', error)
      if (error.status === 401) {
        toast.error('Unauthorized. Please log in again.')
      } else if (error.status === 0 || error.status >= 500) {
        toast.error('Network error or server is unavailable. Please try again later.')
      } else {
        toast.error('An unexpected error occurred. Please contact support.')
      }
    }
  }

  const canEditOrDelete = user && user.username === article.author.username

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {article.title}
            <span className={styles.likes}>
              <HeartOutlined /> {article.favoritesCount}
            </span>
          </h1>
          <div className={styles.tags}>
            {article.tagList.map((tag, index) => (
              <span key={`${slug}-${tag}-${index}`} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
          {canEditOrDelete && (
            <div className={styles.actions}>
              <Button type="primary" onClick={() => navigate(`/articles/${slug}/edit`)} style={{ marginRight: 8 }}>
                Edit
              </Button>
              <Popconfirm
                title="Are you sure to delete this article?"
                onConfirm={handleDelete}
                okText="Yes"
                cancelText="No"
                placement="right"
              >
                <Button type="danger">Delete</Button>
              </Popconfirm>
            </div>
          )}
        </div>
        <div className={styles.content}>
          <ReactMarkdown>{article.body}</ReactMarkdown>
        </div>
        <div className={styles.author}>
          <img
            src={article.author.image || 'https://dummyimage.com/50x50/000/fff'}
            alt={article.author.username}
            className={styles.avatar}
            onError={(e) => {
              const { target } = e
              target.style.display = 'none'
              target.parentElement.classList.add(styles.showPlaceholder)
            }}
          />
          <div>
            <p className={styles.authorName}>{article.author.username}</p>
            <p className={styles.date}>{new Date(article.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ArticleDetailPage
