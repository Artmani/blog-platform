import React from 'react'
import { useParams } from 'react-router-dom'
import { useGetArticleQuery } from '../store/articlesApi'
import { Card, Spin, Alert } from 'antd'
import { HeartOutlined } from '@ant-design/icons'
import ReactMarkdown from 'react-markdown'
import styles from '../styles/ArticleDetailPage.module.scss'

const ArticleDetailPage = () => {
  const { slug } = useParams()
  const { data, error, isLoading } = useGetArticleQuery(slug)

  if (isLoading) return <Spin size="large" className={styles.loading} />
  if (error) return <Alert message="Error loading article" type="error" />

  const article = data?.article

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
            {article.tagList.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className={styles.content}>
          <ReactMarkdown>{article.body}</ReactMarkdown>
        </div>
        <div className={styles.author}>
          <img
            src={article.author.image || 'https://via.placeholder.com/50'}
            alt={article.author.username}
            className={styles.avatar}
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
