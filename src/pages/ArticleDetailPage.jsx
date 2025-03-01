import { useSelector } from 'react-redux'
import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Spin, Alert, Button, Popconfirm } from 'antd'
import { HeartOutlined, HeartFilled } from '@ant-design/icons'
import ReactMarkdown from 'react-markdown'
import { toast } from 'react-toastify'
import {
  useGetArticleQuery,
  useDeleteArticleMutation,
  useFavoriteArticleMutation,
  useUnfavoriteArticleMutation,
} from '../store/articlesApi'
import 'react-toastify/dist/ReactToastify.css'
import styles from '../styles/ArticleDetailPage.module.scss'

function ArticleDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const user = useSelector((state) => state.user.user)
  const { data, articleError, isLoading, refetch } = useGetArticleQuery(slug)
  const [deleteArticle] = useDeleteArticleMutation()
  const [favoriteArticle] = useFavoriteArticleMutation()
  const [unfavoriteArticle] = useUnfavoriteArticleMutation()

  if (isLoading) return <Spin size="large" className={styles.loading} />
  if (articleError) return <Alert message="Ошибка загрузки статьи" type="error" />

  const article = data?.article

  const handleDelete = async () => {
    try {
      await deleteArticle(slug).unwrap()
      toast.success('Статья успешно удалена!')
      navigate('/')
    } catch (err) {
      toast.error('Ошибка удаления статьи')
    }
  }

  const handleLikeClick = async () => {
    if (!user) {
      toast.error('Пожалуйста, войдите в систему, чтобы оценить статью')
      navigate('/sign-in')
      return
    }
    try {
      if (article.favorited) {
        await unfavoriteArticle(slug).unwrap()
      } else {
        await favoriteArticle(slug).unwrap()
      }
      refetch()
    } catch (err) {
      toast.error('Ошибка обновления статуса лайка')
    }
  }

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {article.title}
            <span
              className={styles.likes}
              role="button"
              tabIndex={0}
              onClick={handleLikeClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleLikeClick()
                }
              }}
              style={{ cursor: 'pointer', marginLeft: '10px' }}
            >
              {article.favorited ? <HeartFilled style={{ color: 'red' }} /> : <HeartOutlined />}{' '}
              {article.favoritesCount}
            </span>
          </h1>
          <div className={styles.tags}>
            {article.tagList.map((tag, idx) => (
              <span key={`${slug}-${tag}-${idx}`} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
          {user && user.username === article.author.username && (
            <div className={styles.actions}>
              <Button type="primary" onClick={() => navigate(`/articles/${slug}/edit`)} style={{ marginRight: 8 }}>
                Edit
              </Button>
              <Popconfirm
                title="Вы уверены, что хотите удалить статью?"
                onConfirm={handleDelete}
                okText="Да"
                cancelText="Нет"
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
              const tgt = e.target
              tgt.style.display = 'none'
              if (tgt.parentElement) {
                tgt.parentElement.classList.add(styles.showPlaceholder)
              }
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
